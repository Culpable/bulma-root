import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const demoDirectory = path.resolve(testDirectory, '..')

function readDemoFile(relativePath) {
  return fs.readFileSync(path.join(demoDirectory, relativePath), 'utf8')
}

test('above-fold about and contact LCP content never starts transparent', () => {
  const aboutHero = readDemoFile('src/components/sections/hero-left-aligned-with-photo.tsx')
  const contactHero = readDemoFile('src/app/contact/contact-page-content.tsx')
  const globalStyles = readDemoFile('src/app/globals.css')
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

test('global navigation hydrates only links and its imperative controller', () => {
  const navbar = readDemoFile('src/components/sections/navbar-with-links-actions-and-centered-logo.tsx')
  const links = readDemoFile('src/components/sections/navbar-links.tsx')
  const controller = readDemoFile('src/components/sections/navbar-controller.tsx')

  assert.doesNotMatch(navbar, /^'use client'/)
  assert.match(links, /^'use client'/)
  assert.match(controller, /^'use client'/)
  assert.doesNotMatch(navbar, /@tailwindplus\/elements/)
})

test('Cloudflare Pages caches only content-hashed Next.js assets as immutable', () => {
  const headers = readDemoFile('public/_headers')

  assert.match(headers, /^\/_next\/static\/\*$/m)
  assert.match(headers, /^  Cache-Control: public, max-age=31556952, immutable$/m)
  assert.equal(headers.match(/Cache-Control:/g)?.length, 1)
})

test('performance budgets cover every route and preserve deterministic baselines', () => {
  const budgets = JSON.parse(readDemoFile('performance-budgets.json'))

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
  const mixpanel = readDemoFile('src/lib/mixpanelClient.js')
  const provider = readDemoFile('src/components/MixpanelProvider.jsx')
  const faqController = readDemoFile('src/components/sections/faq-disclosure-controller.tsx')
  const homepageFaq = readDemoFile('src/components/sections/faqs-two-column-accordion.tsx')
  const pricingFaq = readDemoFile('src/components/sections/faqs-accordion.tsx')
  const planTabs = readDemoFile('src/components/sections/plan-comparison-table.tsx')
  const button = readDemoFile('src/components/elements/button.tsx')

  assert.match(mixpanel, /loader-module-with-async-recorder/)
  assert.doesNotMatch(mixpanel, /from 'mixpanel-browser'/)
  assert.match(provider, /const analyticsIdleDelay = 1200/)
  assert.match(provider, /requestIdleCallback\(callback, \{ timeout: 3000 \}\)/)
  for (const source of [faqController, homepageFaq, pricingFaq, planTabs]) {
    assert.doesNotMatch(source, /@tailwindplus\/elements/)
  }
  assert.match(planTabs, /role="tablist"/)
  assert.match(planTabs, /event\.key === 'ArrowRight'/)
  assert.match(planTabs, /event\.key === 'Home'/)
  assert.doesNotMatch(button, /preloadOnHover|preloadAnimationComponents|^'use client'/m)
  assert.equal(fs.existsSync(path.join(demoDirectory, 'src/lib/preload-animation-components.ts')), false)
})

test('performance budget reporter rejects a synthetic route-byte regression', () => {
  const fixtureDirectory = fs.mkdtempSync('/tmp/bulma-performance-budget-')
  const outDirectory = path.join(fixtureDirectory, 'out')
  const chunkDirectory = path.join(outDirectory, '_next/static/chunks')
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
    fs.writeFileSync(outputPath, '<script src="/_next/static/chunks/oversized.js"></script>')
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
    [path.join(demoDirectory, 'src/scripts/report-performance-budgets.mjs'), '--out', outDirectory, '--budget', budgetPath],
    { encoding: 'utf8' },
  )

  assert.notEqual(result.status, 0)
  assert.match(result.stdout, /exceeds baseline/)
})

test('About responsive images keep exact dimensions, priorities, and byte ceilings', () => {
  const budgets = JSON.parse(readDemoFile('performance-budgets.json'))
  const about = readDemoFile('src/app/about/page.tsx')
  const heroPath = path.join(demoDirectory, 'public/img/photos/1-640.webp')
  const testimonialPath = path.join(demoDirectory, 'public/img/avatars/16-h-458-w-640.webp')

  assert.ok(fs.statSync(heroPath).size <= budgets.aboutImages.hero640CeilingBytes)
  assert.ok(fs.statSync(testimonialPath).size <= budgets.aboutImages.testimonial640CeilingBytes)
  assert.match(about, /1-640\.webp 640w/)
  assert.match(about, /16-h-458-w-640\.webp 640w/)
  assert.match(about, /loading="eager"[\s\S]*fetchPriority="high"[\s\S]*decoding="async"/)
  assert.match(about, /loading="lazy"[\s\S]*decoding="async"/)
  assert.match(about, /Bulma team photo/)
  assert.match(about, /Liam O'Connor/)
})
