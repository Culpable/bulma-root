import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';

import {
  INTERNAL_MARKDOWN_PREFIX,
  routeToInternalMarkdownPath,
} from '../src/lib/agent-readable-http/internal-path.ts';
import { markdownNotFound } from '../src/lib/agent-readable-http/document-response.ts';

async function walkHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkHtml(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
  }
  return files.sort();
}

function decodeEntities(value) {
  return value.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'");
}

function text(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function inlineMarkdown(value) {
  return decodeEntities(value
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, href, body) => `[${text(body)}](${href})`)
    .replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi, (_match, alt, src) => `![${alt}](${src})`)
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_match, code) => `\`${decodeEntities(code)}\``)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function tableHtmlToMarkdown(tableHtml) {
  const rows = [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) => [...row[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((cell) => inlineMarkdown(cell[2]).replace(/(^|[^\\])\|/g, '$1\\|')))
    .filter((row) => row.length > 0);
  if (rows.length === 0) return null;

  const columnCount = Math.max(...rows.map((row) => row.length));
  const renderRow = (row) => `| ${Array.from({ length: columnCount }, (_, index) => row[index] ?? '').join(' | ')} |`;
  const caption = tableHtml.match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/i);
  const markdown = [
    renderRow(rows[0]),
    renderRow(Array.from({ length: columnCount }, () => '---')),
    ...rows.slice(1).map(renderRow),
  ].join('\n');
  return caption ? `${inlineMarkdown(caption[1])}\n\n${markdown}` : markdown;
}

function listHtmlToMarkdown(tag, attributes, body) {
  let nextNumber = Number(attributes.match(/\bstart\s*=\s*["']?(-?\d+)/i)?.[1] ?? 1);
  const items = [...body.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi)].map((item) => {
    if (tag.toLowerCase() === 'ul') return `- ${inlineMarkdown(item[2])}`;
    const explicitValue = item[1].match(/\bvalue\s*=\s*["']?(-?\d+)/i)?.[1];
    if (explicitValue !== undefined) nextNumber = Number(explicitValue);
    const rendered = `${nextNumber}. ${inlineMarkdown(item[2])}`;
    nextNumber += 1;
    return rendered;
  });
  return items.length > 0 ? `\n${items.join('\n')}\n` : body;
}

function singleMatch(html, pattern, label) {
  const matches = [...html.matchAll(pattern)].map((match) => match[1]);
  if (matches.length !== 1 || !matches[0]?.trim()) throw new Error(`Expected exactly one ${label}.`);
  return matches[0].trim();
}

function removeElement(html, pattern) {
  let current = html;
  let previous;
  do {
    previous = current;
    current = current.replace(pattern, '\n');
  } while (current !== previous);
  return current;
}

function codeFenceFor(code) {
  const marker = code.includes('```') ? '~' : '`';
  let longestRun = 0;
  let currentRun = 0;
  for (const character of code) {
    currentRun = character === marker ? currentRun + 1 : 0;
    longestRun = Math.max(longestRun, currentRun);
  }
  const minimumLength = marker === '~' ? 4 : 3;
  return marker.repeat(Math.max(minimumLength, longestRun + 1));
}

export function assertBalancedMarkdownFences(source) {
  let open = null;
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!match) continue;
    const marker = match[1][0];
    const length = match[1].length;
    if (open === null) {
      open = { marker, length, line: index + 1 };
      continue;
    }
    if (marker === open.marker && length >= open.length && match[2].trim() === '') open = null;
  }
  if (open) throw new Error(`Unclosed ${open.marker.repeat(open.length)} fence from line ${open.line}.`);
}

export function mainHtmlToMarkdown(mainHtml) {
  let value = mainHtml;
  for (const pattern of [
    /<(script|style|template|noscript|nav|header|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi,
    /<([a-z][\w:-]*)\b(?=[^>]*\bdata-agent-ignore(?=\s|=|>))[^>]*>[\s\S]*?<\/\1>/gi,
    /<([a-z][\w:-]*)\b[^>]*(?:\shidden(?:\s|=|>)|aria-hidden=["']true["']|style=["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)[^"']*["'])[^>]*>[\s\S]*?<\/\1>/gi,
  ]) value = removeElement(value, pattern);

  const codeBlocks = [];
  value = value.replace(/<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_match, code) => {
    const token = `@@CODE_BLOCK_${codeBlocks.length}@@`;
    const decoded = decodeEntities(code).replace(/^\n|\n$/g, '');
    const marker = codeFenceFor(decoded);
    codeBlocks.push(`${marker}\n${decoded}\n${marker}`);
    return `\n\n${token}\n\n`;
  });
  const tableBlocks = [];
  value = value.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (match, table) => {
    const markdown = tableHtmlToMarkdown(table);
    if (markdown === null) return match;
    const token = `@@TABLE_BLOCK_${tableBlocks.length}@@`;
    tableBlocks.push(markdown);
    return `\n\n${token}\n\n`;
  });
  value = value
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level, body) => `\n\n${'#'.repeat(Number(level))} ${text(body)}\n\n`)
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, href, body) => `[${text(body)}](${href})`)
    .replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi, (_match, alt, src) => `![${alt}](${src})`)
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_match, code) => `\`${decodeEntities(code)}\``)
    .replace(/<(ol|ul)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attributes, body) => listHtmlToMarkdown(tag, attributes, body))
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_match, body) => `\n- ${text(body)}`)
    .replace(/<(p|blockquote|figcaption|dt|dd)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_match, tag, body) => `\n\n${tag.toLowerCase() === 'blockquote' ? '> ' : ''}${text(body)}\n\n`)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  value = decodeEntities(value).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  tableBlocks.forEach((table, index) => { value = value.replace(`@@TABLE_BLOCK_${index}@@`, table); });
  codeBlocks.forEach((block, index) => { value = value.replace(`@@CODE_BLOCK_${index}@@`, block); });
  return value;
}

function routeFromFile(file, outputDirectory) {
  const path = relative(outputDirectory, file).split(sep).join('/');
  if (path === 'index.html') return '/';
  if (path.endsWith('/index.html')) return `/${path.slice(0, -'index.html'.length)}`;
  if (path === '404.html') return null;
  return `/${path}`;
}

function metadataForHtml(html, expectedOrigin) {
  const title = text(singleMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/gi, 'document title'));
  const descriptionTag = singleMatch(html, /(<meta\b[^>]*name=["']description["'][^>]*>)/gi, 'description meta');
  const description = descriptionTag.match(/content=["']([^"']+)["']/i)?.[1]?.trim();
  if (!description) throw new Error('Description meta must have content.');
  const canonicalTag = singleMatch(html, /(<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>)/gi, 'canonical');
  const canonical = canonicalTag.match(/href=["']([^"']+)["']/i)?.[1];
  if (!canonical) throw new Error('Canonical link must have href.');
  const url = new URL(canonical);
  if (url.origin !== expectedOrigin) throw new Error(`Canonical ${url} is outside ${expectedOrigin}.`);
  const main = singleMatch(html, /<main\b[^>]*>([\s\S]*?)<\/main>/gi, 'main region');
  return { title, description, canonical: url.toString(), main };
}

function frontmatter({ title, description, canonical }) {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\ncanonical: ${JSON.stringify(canonical)}\n---\n`;
}

function renderVercelRoutesModule(documents) {
  const routes = documents.map(({ route }) => route).sort();
  return [
    '// Generated by generate-agent-markdown.mjs. Do not edit by hand.',
    'export const GENERATED_MARKDOWN_ROUTES: ReadonlySet<string> = new Set([',
    ...routes.map((route) => `  ${JSON.stringify(route)},`),
    ']);',
    '',
  ].join('\n');
}

export async function generateAgentMarkdown({ outputDirectory, origin, vercelRoutesModule }) {
  const absoluteOutput = resolve(outputDirectory);
  const expectedOrigin = new URL(origin).origin;
  const documents = [];
  const canonicalOwners = new Map();
  for (const file of await walkHtml(absoluteOutput)) {
    if (file.includes(`${sep}${INTERNAL_MARKDOWN_PREFIX.slice(1).replaceAll('/', sep)}`)) continue;
    const route = routeFromFile(file, absoluteOutput);
    if (route === null) continue;
    const html = await readFile(file, 'utf8');
    if (/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
    const metadata = metadataForHtml(html, expectedOrigin);
    if (canonicalOwners.has(metadata.canonical)) {
      throw new Error(`Duplicate canonical ${metadata.canonical} in ${file} and ${canonicalOwners.get(metadata.canonical)}.`);
    }
    canonicalOwners.set(metadata.canonical, file);
    const markdown = mainHtmlToMarkdown(metadata.main);
    if (!markdown) throw new Error(`Generated Markdown is empty for ${route}.`);
    const internalPath = routeToInternalMarkdownPath(route);
    const destination = resolve(absoluteOutput, `.${internalPath}`);
    if (!destination.startsWith(resolve(absoluteOutput, `.${INTERNAL_MARKDOWN_PREFIX}`))) {
      throw new Error(`Generated path escaped the internal prefix: ${destination}`);
    }
    const document = `${frontmatter(metadata)}\n${markdown}\n`;
    assertBalancedMarkdownFences(document);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, document, 'utf8');
    documents.push({ route, canonical: metadata.canonical, destination });
  }
  if (documents.length === 0) throw new Error('No indexable HTML documents were converted.');
  const recoveryPath = resolve(absoluteOutput, `.${INTERNAL_MARKDOWN_PREFIX}`, '404.md');
  const recoveryDocument = markdownNotFound(expectedOrigin);
  assertBalancedMarkdownFences(recoveryDocument);
  await mkdir(dirname(recoveryPath), { recursive: true });
  await writeFile(recoveryPath, recoveryDocument, 'utf8');
  const sortedDocuments = documents.sort((left, right) => left.route.localeCompare(right.route));
  if (vercelRoutesModule) {
    const absoluteModule = resolve(vercelRoutesModule);
    await mkdir(dirname(absoluteModule), { recursive: true });
    await writeFile(absoluteModule, renderVercelRoutesModule(sortedDocuments), 'utf8');
  }
  return sortedDocuments;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outputDirectory = process.argv[2];
  const origin = process.argv[3];
  if (!outputDirectory || !origin) {
    throw new Error('Usage: node --experimental-strip-types generate-agent-markdown.mjs <dist> <origin>');
  }
  await generateAgentMarkdown({
    outputDirectory,
    origin,
    vercelRoutesModule: undefined,
  });
}
