import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const siteDirectory = path.resolve(testDirectory, '..')

function readSiteFile(relativePath: string): string {
  return fs.readFileSync(path.join(siteDirectory, relativePath), 'utf8')
}

test('above-fold about and contact LCP content never starts transparent', () => {
  const aboutHero = readSiteFile('src/components/sections/hero-left-aligned-with-photo.tsx')
  const contactHero = readSiteFile('src/components/pages/contact-page-content.tsx')
  const globalStyles = readSiteFile('src/styles/global.css')
  const aboveFoldKeyframes = globalStyles.slice(
    globalStyles.indexOf('@keyframes above-fold-slide-up'),
    globalStyles.indexOf('.above-fold-slide-up'),
  )

  assert.doesNotMatch(aboutHero, /useScrollAnimation|opacity-0/)
  assert.doesNotMatch(contactHero, /useScrollAnimation|opacity-0/)
  assert.match(aboutHero, /above-fold-slide-up/)
  assert.match(contactHero, /above-fold-slide-up/)
  assert.match(aboveFoldKeyframes, /transform: translateY\(32px\)[\s\S]*?transform: translateY\(0\)/)
  assert.doesNotMatch(aboveFoldKeyframes, /opacity:/)
})

test('Astro routes keep hydration bounded to the production interaction map', () => {
  const expectedIslandCounts: Record<string, number> = {
    'src/pages/index.astro': 8,
    'src/pages/pricing/index.astro': 5,
    'src/pages/about/index.astro': 6,
    'src/pages/contact/index.astro': 2,
    'src/pages/privacy-policy/index.astro': 1,
    'src/pages/404.astro': 1,
  }

  // These counts preserve active production sections. They intentionally omit dormant pricing blocks.
  for (const [routeSource, expectedCount] of Object.entries(expectedIslandCounts)) {
    const source = readSiteFile(routeSource)
    assert.equal(source.match(/client:(?:load|idle|visible)/g)?.length, expectedCount, routeSource)
  }
})

test('Cloudflare Workers caches only content-hashed Astro assets as immutable', () => {
  const headers = readSiteFile('public/_headers')

  assert.match(headers, /^\/_astro\/\*$/m)
  assert.match(headers, /^  Cache-Control: public, max-age=31536000, immutable$/m)
  assert.equal(headers.match(/Cache-Control:/g)?.length, 1)
})

test('performance budgets cover every route and preserve deterministic baselines', () => {
  const budgets = JSON.parse(readSiteFile('performance-budgets.json')) as {
    routes: Record<string, Record<string, unknown>>
    minimumUnusedJavaScriptReductionKiB: number
    mixpanelCoreGzipCeilingBytes: number
    aboutImages: Record<string, number>
  }

  assert.deepEqual(Object.keys(budgets.routes), ['/', '/about/', '/pricing/', '/contact/', '/privacy-policy/'])
  assert.equal(budgets.minimumUnusedJavaScriptReductionKiB, 40)
  assert.equal(budgets.mixpanelCoreGzipCeilingBytes, 40 * 1024)
  assert.equal(budgets.aboutImages.hero640CeilingBytes, 21 * 1024)
  assert.equal(budgets.aboutImages.testimonial640CeilingBytes, 11 * 1024)
  for (const route of Object.values(budgets.routes)) {
    assert.equal(typeof route.baselineInitialJavaScriptGzipBytes, 'number')
    assert.equal(typeof route.unusedJavaScriptCeilingKiB, 'number')
  }
})

test('owned runtime reductions keep analytics timing and active routes free of Tailwind Plus', () => {
  const mixpanel = readSiteFile('src/lib/mixpanel-client.ts')
  const provider = readSiteFile('src/scripts/analytics-boot.ts')
  const faqController = readSiteFile('src/components/sections/faq-disclosure-controller.tsx')
  const homepageFaq = readSiteFile('src/components/sections/faqs-two-column-accordion.tsx')
  const pricingFaq = readSiteFile('src/components/sections/faqs-accordion.tsx')
  const planTabs = readSiteFile('src/components/sections/plan-comparison-table.tsx')
  const button = readSiteFile('src/components/elements/button.tsx')

  assert.match(mixpanel, /loader-module-with-async-recorder/)
  assert.doesNotMatch(mixpanel, /from 'mixpanel-browser'/)
  assert.match(provider, /const ANALYTICS_IDLE_DELAY = 1200/)
  assert.match(provider, /requestIdleCallback\(callback, \{ timeout: 3000 \}\)/)
  for (const source of [faqController, homepageFaq, pricingFaq, planTabs]) {
    assert.doesNotMatch(source, /@tailwindplus\/elements/)
  }
  assert.match(planTabs, /role="tablist"/)
  assert.match(planTabs, /event\.key === 'ArrowRight'/)
  assert.match(planTabs, /event\.key === 'Home'/)
  assert.doesNotMatch(button, /preloadOnHover|preloadAnimationComponents|^'use client'/m)
  assert.equal(fs.existsSync(path.join(siteDirectory, 'src/lib/preload-animation-components.ts')), false)
})

test('performance budget reporter rejects a synthetic route-byte regression', () => {
  const fixtureDirectory = fs.mkdtempSync('/tmp/bulma-performance-budget-')
  const outDirectory = path.join(fixtureDirectory, 'out')
  const chunkDirectory = path.join(outDirectory, '_astro')
  fs.mkdirSync(chunkDirectory, { recursive: true })
  fs.writeFileSync(path.join(chunkDirectory, 'oversized.js'), 'x'.repeat(4096))

  const routes = {
    '/': 'index.html',
    '/about/': 'about/index.html',
    '/pricing/': 'pricing/index.html',
    '/contact/': 'contact/index.html',
    '/privacy-policy/': 'privacy-policy/index.html',
  }
  for (const output of Object.values(routes)) {
    const outputPath = path.join(outDirectory, output)
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, '<script src="/_astro/oversized.js"></script>')
  }

  const fixtureBudget = {
    schemaVersion: 1,
    units: { javascript: 'gzip-bytes', lighthouseUnusedJavaScript: 'kibibytes', images: 'bytes' },
    minimumUnusedJavaScriptReductionKiB: 40,
    mixpanelCoreGzipCeilingBytes: 40960,
    aboutImages: { hero640CeilingBytes: 21504, testimonial640CeilingBytes: 11264, lighthouseWasteCeilingKiB: 20 },
    routes: Object.fromEntries(
      Object.entries(routes).map(([route, output]) => [
        route,
        {
          output,
          unusedJavaScriptCeilingKiB: 1,
          baselineUnusedJavaScriptKiB: { cloudflare: 100, github: 100 },
          baselineInitialJavaScriptGzipBytes: 1,
        },
      ]),
    ),
  }
  const budgetPath = path.join(fixtureDirectory, 'budgets.json')
  fs.writeFileSync(budgetPath, JSON.stringify(fixtureBudget))

  const result = spawnSync(
    process.execPath,
    [path.join(siteDirectory, 'scripts/report-performance-budgets.mjs'), '--out', outDirectory, '--budget', budgetPath],
    { encoding: 'utf8' },
  )

  assert.notEqual(result.status, 0)
  assert.match(result.stdout, /exceeds baseline/)
})

test('About responsive images keep exact dimensions, priorities, and byte ceilings', () => {
  const budgets = JSON.parse(readSiteFile('performance-budgets.json')) as { aboutImages: Record<string, number> }
  const about = readSiteFile('src/components/pages/about-sections.tsx')
  const heroPath = path.join(siteDirectory, 'public/img/photos/1-640.webp')
  const testimonialPath = path.join(siteDirectory, 'public/img/avatars/16-h-458-w-640.webp')

  assert.ok(fs.statSync(heroPath).size <= budgets.aboutImages.hero640CeilingBytes)
  assert.ok(fs.statSync(testimonialPath).size <= budgets.aboutImages.testimonial640CeilingBytes)
  assert.match(about, /1-640\.webp 640w/)
  assert.match(about, /16-h-458-w-640\.webp 640w/)
  assert.match(about, /loading="eager"[\s\S]*fetchPriority="high"[\s\S]*decoding="async"/)
  assert.match(about, /loading="lazy"[\s\S]*decoding="async"/)
  assert.match(about, /Bulma team photo/)
  assert.match(about, /Liam O'Connor/)
})
