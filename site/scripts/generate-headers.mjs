import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SCRIPT_HASH_TOKEN = '{{SCRIPT_HASHES}}';
const outputDirectory = resolve('dist');
const templatePath = resolve('public/_headers');
const outputPath = resolve(outputDirectory, '_headers');

/**
 * Return every HTML file below the built output directory in stable order.
 */
async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await listHtmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) paths.push(path);
  }

  return paths.sort();
}

/**
 * Compute the CSP source expression for one inline script body.
 */
function hashInlineScript(body) {
  const digest = createHash('sha256').update(body, 'utf8').digest('base64');
  return `'sha256-${digest}'`;
}

/**
 * Collect each unique inline script body exactly as the browser receives it.
 */
function collectInlineScriptHashes(html) {
  const hashes = [];
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);

  for (const script of scripts) {
    const attributes = script[1];
    const body = script[2];
    if (/\bsrc\s*=/i.test(attributes)) continue;
    hashes.push(hashInlineScript(body));
  }

  return hashes;
}

/**
 * Count Cloudflare header rules by their unindented path or URL selectors.
 */
function countRules(source) {
  return source.split(/\r?\n/).filter((line) => line.length > 0 && !/^\s/.test(line)).length;
}

const hashes = new Set();
for (const htmlPath of await listHtmlFiles(outputDirectory)) {
  const html = await readFile(htmlPath, 'utf8');
  for (const hash of collectInlineScriptHashes(html)) hashes.add(hash);
}

const template = await readFile(templatePath, 'utf8');
const tokenMatches = template.match(/\{\{SCRIPT_HASHES\}\}/g) ?? [];
if (tokenMatches.length !== 1) {
  throw new Error(`Expected exactly one ${SCRIPT_HASH_TOKEN} token in ${templatePath}.`);
}

const scriptSources = [...hashes].sort().join(' ');
const rendered = template.replace(SCRIPT_HASH_TOKEN, scriptSources).replace(/[ \t]+$/gm, '');
const longestLine = Math.max(...rendered.split(/\r?\n/).map((line) => line.length));
if (longestLine >= 2_000) {
  throw new Error(`Generated _headers line is ${longestLine} characters; every line must remain under 2,000.`);
}

const ruleCount = countRules(rendered);
if (ruleCount > 100) {
  throw new Error(`Generated _headers contains ${ruleCount} rules; Cloudflare permits at most 100.`);
}

await writeFile(outputPath, rendered.endsWith('\n') ? rendered : `${rendered}\n`, 'utf8');
