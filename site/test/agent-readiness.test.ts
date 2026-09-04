import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const siteDirectory = path.resolve(import.meta.dirname, '..')
const repositoryDirectory = path.resolve(siteDirectory, '..')
const outputDirectory = path.join(siteDirectory, 'dist')

const indexableRoutes = [
  ['index.html', 'https://bulma.com.au/'],
  ['about/index.html', 'https://bulma.com.au/about/'],
  ['pricing/index.html', 'https://bulma.com.au/pricing/'],
  ['contact/index.html', 'https://bulma.com.au/contact/'],
  ['privacy-policy/index.html', 'https://bulma.com.au/privacy-policy/'],
]

function requireBuiltOutput() {
  assert.ok(fs.existsSync(outputDirectory), 'site/dist is missing. Run pnpm build before pnpm test.')
}

function readOutput(relativePath: string): string {
  requireBuiltOutput()
  return fs.readFileSync(path.join(outputDirectory, relativePath), 'utf8')
}

function extractJsonLd(html: string): Array<Record<string, unknown>> {
  return [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((match) => {
    const value = JSON.parse(match[1]) as Record<string, unknown>
    return Array.isArray(value['@graph']) ? value['@graph'] as Array<Record<string, unknown>> : [value]
  })
}

function flattenTypes(value: unknown, types = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) flattenTypes(item, types)
  } else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record['@type'] === 'string') types.add(record['@type'])
    for (const item of Object.values(record)) flattenTypes(item, types)
  }
  return types
}

test('indexable output exposes canonical identity and discovery metadata', () => {
  for (const [file, canonical] of indexableRoutes) {
    const html = readOutput(file)
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)]
    assert.equal(canonicals.length, 1, `${file} must contain one canonical`)
    assert.equal(canonicals[0][1], canonical)
    assert.match(html, /<link rel="describedby" href="https:\/\/bulma\.com\.au\/llms\.txt"/)
    assert.doesNotMatch(html, /<link[^>]+rel="preload"[^>]+as="font"/)

    const graphs = extractJsonLd(html)
    assert.ok(graphs.length > 0, `${file} must contain static JSON-LD`)
    const nodes = graphs.flat()
    const page = nodes.find((node) => node['@type'] === 'WebPage')
    assert.equal(page?.url, canonical)
    assert.equal((page?.isPartOf as Record<string, unknown> | undefined)?.['@id'], 'https://bulma.com.au/#website')
  }
})

test('homepage static graph keeps every supported identity type', () => {
  const types = flattenTypes(extractJsonLd(readOutput('index.html')))
  for (const type of ['Organization', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage']) {
    assert.ok(types.has(type), `homepage JSON-LD must contain ${type}`)
  }
})

test('404 output exposes one noindex directive without blocking recovery links', () => {
  for (const file of ['404.html']) {
    const html = readOutput(file)
    const directives = [...html.matchAll(/<meta name="robots" content="([^"]+)"/g)].map((match) => match[1])
    assert.deepEqual(directives, ['noindex'], `${file} must contain one noindex-only robots directive`)
    assert.doesNotMatch(html, /<link rel="canonical"/)
  }
})

test('llms.txt is valid UTF-8 with ordered unique canonical links', () => {
  const bytes = fs.readFileSync(path.join(outputDirectory, 'llms.txt'))
  const body = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  const lines = body.split(/\r?\n/).filter(Boolean)
  assert.equal(lines[0], '# Bulma')
  assert.ok(lines[1].startsWith('> '))
  assert.equal(lines.filter((line) => /^# /.test(line)).length, 1)
  assert.doesNotMatch(body, /â€™|Ã|Â|�|example\.com|^---$/m)

  const urls = [...body.matchAll(/^- \[[^\]]+\]\((https:\/\/[^)]*)\): .+$/gm)].map((match) => match[1])
  assert.equal(urls.length, 6)
  assert.equal(new Set(urls).size, urls.length)
  // Marketing pages keep the trailing-slash policy; the product application owns its own paths.
  const origins = new Set(urls.map((url) => new URL(url).origin))
  assert.deepEqual([...origins].sort(), ['https://app.bulma.com.au', 'https://bulma.com.au'])
  assert.ok(
    urls
      .filter((url) => new URL(url).origin === 'https://bulma.com.au')
      .every((url) => new URL(url).pathname.endsWith('/')),
  )
})

test('llms.txt operating block describes Bulma rather than this website', () => {
  const body = readOutput('llms.txt')
  const line = (label: string): string => body.split('\n').find((candidate) => candidate.startsWith(`**${label}:**`)) ?? ''

  for (const label of ['When to use', 'When not to use', 'How to get started']) {
    const value = line(label)
    assert.ok(value, `${label} must be rendered`)
    // The subject must be the product. `Use these pages to ...` indexes the site instead.
    assert.doesNotMatch(value, /\b(?:these|this|the)\s+(?:pages?|site|website|resources?|links?)\b/i)
    assert.match(value, /Bulma/)
  }

  // `When to use` carries the capability inventory, not a summary of the navigation.
  assert.ok(line('When to use').split(';').length >= 4)
  // Canonical action URLs belong inside the instruction, never in a trailing list.
  assert.match(line('How to get started'), /https:\/\/app\.bulma\.com\.au\/register/)
  assert.match(line('How to get started'), /https:\/\/bulma\.com\.au\/contact\//)
  assert.doesNotMatch(body, /Actions: https/)
})

test('sitemap and source preserve the file-only readiness profile', () => {
  const sitemap = readOutput('sitemap.xml')
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.deepEqual(locations.toSorted(), indexableRoutes.map(([, canonical]) => canonical).toSorted())
  assert.doesNotMatch(sitemap, /<(?:lastmod|changefreq|priority)>/)

  const sourceFiles = fs
    .readdirSync(path.join(siteDirectory, 'src'), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
  for (const file of sourceFiles) {
    const source = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /role="image"/, file)
    assert.doesNotMatch(source, /prefers-color-scheme|prefers-reduced-motion/, file)
  }

  const publicMarkdownOutput = fs
    .readdirSync(outputDirectory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && !entry.parentPath.includes('_agent-markdown'))
  assert.equal(publicMarkdownOutput.length, 0)
  assert.equal(fs.existsSync(path.join(outputDirectory, '_agent-markdown', 'index.md')), true)
  assert.doesNotMatch(readOutput('index.html'), /rel="alternate"[^>]+type="text\/markdown"/)
  assert.equal(fs.existsSync(path.join(repositoryDirectory, '_headers')), false)
  assert.equal(fs.existsSync(path.join(repositoryDirectory, 'vercel.json')), false)
})

test('structured-data serialiser escapes script-breaking characters', () => {
  const source = fs.readFileSync(path.join(siteDirectory, 'src/lib/structured-data.ts'), 'utf8')
  for (const escape of ['\\\\u003c', '\\\\u003e', '\\\\u0026', '\\\\u2028', '\\\\u2029']) {
    assert.ok(source.includes(escape), `serialiser must emit ${escape}`)
  }
})
