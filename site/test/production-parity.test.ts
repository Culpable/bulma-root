import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

/**
 * Guard the migration's byte-level and head-level parity contract against the
 * captured production baseline.
 *
 * The migration plan requires `/robots.txt` and `/llms.txt` to be byte-identical
 * to the documents the previous host published, and requires the emitted head to
 * keep every production Open Graph and viewport value except `og:locale`. The
 * previous Next.js site emits the inherited `en-AU` value, but Open Graph locale
 * syntax requires `language_TERRITORY`. The user approved `en_AU` as an explicit
 * migration drift while the separate BCP 47 HTML `lang` value stays unchanged.
 * The hosted proof compares staging against `dist`, so only these assertions
 * compare `dist` against production itself.
 *
 * `/sitemap.xml` is deliberately excluded from the byte comparison. The shared
 * sitemap renderer sorts URLs and terminates the document with a newline, which
 * puts the home page first and every other route in a stable order. Reproducing
 * the previous host's hand-written order would need site-specific ordering code
 * for no crawler benefit, so this file asserts the intended shape instead.
 */

const siteDirectory = path.resolve(import.meta.dirname, '..')
const repositoryDirectory = path.resolve(siteDirectory, '..')
const outputDirectory = path.join(siteDirectory, 'dist')
const baselinePath = path.join(
  repositoryDirectory,
  'documents/guides/parity/production-baseline.json',
)

interface BaselineDiscoveryEntry {
  id: string
  bodyBytes: number
  bodySha256: string
}

interface ProductionBaseline {
  discovery: BaselineDiscoveryEntry[]
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as ProductionBaseline

/** Map each captured discovery document to its emitted build artefact. */
const discoveryArtefacts: Record<string, string> = {
  'robots.txt': 'robots.txt',
  'llms.txt': 'llms.txt',
}

/** The canonical URL set the sitemap must publish, home page first. */
const expectedSitemapUrls = [
  'https://bulma.com.au/',
  'https://bulma.com.au/about/',
  'https://bulma.com.au/contact/',
  'https://bulma.com.au/pricing/',
  'https://bulma.com.au/privacy-policy/',
]

/** Routes whose head must carry the production social and viewport values. */
const builtDocuments = [
  'index.html',
  'about/index.html',
  'pricing/index.html',
  'contact/index.html',
  'privacy-policy/index.html',
  '404.html',
]

function requireBuiltOutput(): void {
  assert.ok(
    fs.existsSync(outputDirectory),
    'site/dist is missing. Run pnpm build before pnpm test.',
  )
}

function readOutput(relativePath: string): string {
  requireBuiltOutput()
  return fs.readFileSync(path.join(outputDirectory, relativePath), 'utf8')
}

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

function readMetaContent(html: string, attribute: 'name' | 'property', key: string): string[] {
  const pattern = new RegExp(
    `<meta[^>]*\\b${attribute}="${key}"[^>]*\\bcontent="([^"]*)"[^>]*>`,
    'g',
  )
  return [...html.matchAll(pattern)].map((match) => match[1])
}

for (const [baselineId, artefact] of Object.entries(discoveryArtefacts)) {
  test(`${artefact} is byte-identical to the production baseline`, () => {
    requireBuiltOutput()
    const entry = baseline.discovery.find((item) => item.id === baselineId)
    assert.ok(entry, `The production baseline has no ${baselineId} entry.`)

    const built = fs.readFileSync(path.join(outputDirectory, artefact))
    assert.equal(
      built.byteLength,
      entry.bodyBytes,
      `${artefact} byte length drifted from production.`,
    )
    assert.equal(sha256(built), entry.bodySha256, `${artefact} bytes drifted from production.`)
  })
}

test('sitemap.xml publishes the production URL set with the home page first', () => {
  const xml = readOutput('sitemap.xml')
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

  // Order beyond the leading home page is the renderer's stable sort, not a
  // parity contract. The URL set itself must still match production exactly.
  assert.equal(locations[0], 'https://bulma.com.au/', 'The home page must be the first sitemap URL.')
  assert.deepEqual([...locations].sort(), [...expectedSitemapUrls].sort())
  assert.equal(new Set(locations).size, locations.length, 'The sitemap must not repeat a URL.')
  assert.ok(!xml.includes('<lastmod>'), 'Production publishes no lastmod values.')
})

test('internal link targets keep the production trailing slash', () => {
  // The previous Next.js build rewrote every internal href because it set
  // `trailingSlash: true`. Astro emits JSX hrefs verbatim, so without the
  // shared normaliser each nav click costs a 307 round trip to the slashed URL.
  for (const document of builtDocuments) {
    const html = readOutput(document)
    const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1])
    const unslashed = hrefs.filter(
      (href) =>
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.endsWith('/') &&
        !href.includes('#') &&
        !href.includes('?') &&
        !href.slice(href.lastIndexOf('/') + 1).includes('.'),
    )

    assert.deepEqual(
      [...new Set(unslashed)],
      [],
      `${document} links to route paths without the trailing slash.`,
    )
  }
})

test('public scripts stay byte-identical to their production source', () => {
  // `demo/` is the port source until the decommission step removes it.
  const demoScript = path.join(repositoryDirectory, 'demo/public/scripts/referral-tracking.js')
  if (!fs.existsSync(demoScript)) return

  const ported = fs.readFileSync(path.join(siteDirectory, 'public/scripts/referral-tracking.js'))
  assert.equal(sha256(ported), sha256(fs.readFileSync(demoScript)))
})

test('every document declares the production viewport', () => {
  for (const document of builtDocuments) {
    const viewport = readMetaContent(readOutput(document), 'name', 'viewport')
    assert.deepEqual(
      viewport,
      ['width=device-width, initial-scale=1'],
      `${document} must declare the production viewport exactly once.`,
    )
  }
})

test('every document declares the production Open Graph identity', () => {
  for (const document of builtDocuments) {
    const html = readOutput(document)
    assert.deepEqual(
      readMetaContent(html, 'property', 'og:site_name'),
      ['Bulma'],
      `${document} must declare og:site_name exactly once.`,
    )
    assert.deepEqual(
      readMetaContent(html, 'property', 'og:locale'),
      ['en_AU'],
      `${document} must declare the approved Open Graph locale exactly once.`,
    )
    assert.deepEqual(
      readMetaContent(html, 'property', 'og:image:alt'),
      ['Bulma: AI Assistant for Australian Mortgage Brokers'],
      `${document} must keep the production social image alternative text.`,
    )
  }
})
