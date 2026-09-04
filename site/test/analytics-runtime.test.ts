import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const siteDirectory = path.resolve(testDirectory, '..')

function readSiteFile(relativePath: string): string {
  return fs.readFileSync(path.join(siteDirectory, relativePath), 'utf8')
}

test('Mixpanel runtime retains replay, heatmap, identity, event, and readiness contracts', () => {
  const client = readSiteFile('src/lib/mixpanel-client.ts')
  const provider = readSiteFile('src/scripts/analytics-boot.ts')
  const analytics = readSiteFile('src/lib/analytics.ts')

  for (const contract of [
    /record_sessions_percent: 20/,
    /record_heatmap_data: true/,
    /record_block_selector: ''/,
    /record_mask_text_selector: '\.sensitive-data'/,
    /record_collect_fonts: true/,
    /record_idle_timeout_ms: 600000/,
    /record_min_ms: 3000/,
    /persistence: 'cookie'/,
    /cross_subdomain_cookie: true/,
    /bulma:mixpanel-ready/,
    /bulma:mixpanel-disabled/,
  ]) assert.match(client, contract)

  assert.match(provider, /mixpanel\.track\('Page View'/)
  assert.match(provider, /url: pathname/)
  assert.match(provider, /page: pathname/)
  assert.match(analytics, /'Form Submitted'/)
  assert.match(analytics, /'Button Clicked'/)
  assert.match(analytics, /'Video Play'/)
  assert.match(analytics, /mixpanel\.identify\(email\)/)
  assert.match(analytics, /mixpanel\.people\.set/)
})

test('referral tracker queues until readiness and preserves first-touch operations', () => {
  const source = readSiteFile('public/scripts/referral-tracking.js')
  const calls: unknown[][] = []
  const listeners = new Map<string, () => void>()
  const mixpanel = {
    track: (...args: unknown[]) => calls.push(['track', ...args]),
    get_distinct_id: () => 'anonymous-id',
    identify: (...args: unknown[]) => calls.push(['identify', ...args]),
    people: { set_once: (...args: unknown[]) => calls.push(['set_once', ...args]) },
    register_once: (...args: unknown[]) => calls.push(['register_once', ...args]),
  }
  const context = {
    URL,
    URLSearchParams,
    navigator: { userAgent: 'test-browser' },
    document: { referrer: 'https://www.google.com/search' },
    window: {
      location: { search: '?utm_source=google_ads&utm_page=pricing&campaign=42', href: 'https://bulma.com.au/' },
      mixpanelLoaded: false,
      mixpanel,
      addEventListener: (name: string, callback: () => void) => listeners.set(name, callback),
    },
  }
  vm.runInNewContext(source, context)
  assert.equal(calls.length, 0)
  context.window.mixpanelLoaded = true
  listeners.get('bulma:mixpanel-ready')?.()
  assert.deepEqual(calls.map(([name]) => name), ['track', 'identify', 'set_once', 'register_once'])
  assert.equal(calls[0]?.[1], 'Referral Source Identified')
  assert.equal((calls[0]?.[2] as Record<string, unknown>)['Referral Source'], 'Google Ads')
  assert.equal((calls[2]?.[1] as Record<string, unknown>)['Initial Referral Source'], 'Google Ads')
  assert.equal((calls[2]?.[1] as Record<string, unknown>)['Initial Referral Page'], 'pricing')
})
