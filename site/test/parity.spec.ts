import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test, type Page, type TestInfo } from '@playwright/test'
import pixelmatch from 'pixelmatch'
import sharp from 'sharp'

import { blockExternalRequests, waitForStableDocument } from './agent-accessibility.routes'

interface BaselineRoute {
  id: string
  requestPath: string
  links: string[]
  visibleTextBytes: number
  visibleTextSha256: string
}

const repositoryDirectory = resolve(import.meta.dirname, '../..')
const baselineDirectory = resolve(repositoryDirectory, 'documents/guides/parity/screenshots/production')
const baselineManifest = JSON.parse(
  readFileSync(resolve(repositoryDirectory, 'documents/guides/parity/production-baseline.json'), 'utf8'),
) as { routes: BaselineRoute[] }

const pageRoutes = baselineManifest.routes.filter((route) =>
  ['home', 'about', 'pricing', 'contact', 'privacy-policy', '404'].includes(route.id),
)

async function revealScrollContent(page: Page): Promise<void> {
  const islands = page.locator('astro-island')
  const islandCount = await islands.count()

  // Hydrate each visibility-triggered island in document order. The page grows as
  // sections hydrate, so a scroll-height snapshot can miss later islands.
  for (let index = 0; index < islandCount; index += 1) {
    const island = islands.nth(index)
    const canScroll = await island.evaluate((element) => {
      const target = element.firstElementChild
      const rectangle = target?.getBoundingClientRect()
      if (!target || !rectangle || rectangle.width === 0 || rectangle.height === 0) return false
      target.scrollIntoView({ block: 'center' })
      return true
    })
    if (canScroll) {
      await expect(island).not.toHaveAttribute('ssr', '', { timeout: 10_000 })
      await island.evaluate((element) => element.firstElementChild?.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(200)
    }
  }

  // Traverse the fully hydrated document once more so nested observers inside
  // tall islands receive a real viewport intersection before capture.
  let top = 0
  while (top < await page.evaluate(() => document.documentElement.scrollHeight)) {
    await page.evaluate((nextTop) => window.scrollTo(0, nextTop), top)
    await page.waitForTimeout(100)
    top += 400
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForFunction(() => document.querySelector('astro-island[ssr]') === null)
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0))
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  const longestTransitionMilliseconds = await page.evaluate(async () => {
    await new Promise<void>((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame())))
    const parseTimes = (value: string) => value.split(',').map((part) => {
      const trimmed = part.trim()
      return Number.parseFloat(trimmed) * (trimmed.endsWith('ms') ? 1 : 1_000)
    })
    return Math.max(0, ...[...document.querySelectorAll('*')].flatMap((element) => {
      const styles = getComputedStyle(element)
      const durations = parseTimes(styles.transitionDuration)
      const delays = parseTimes(styles.transitionDelay)
      return durations.map((duration, index) => duration + (delays[index % delays.length] ?? 0))
    }))
  })
  await page.waitForTimeout(longestTransitionMilliseconds + 100)
}

async function readProductionContentEvidence(page: Page, routeId: string): Promise<{ hrefs: string[]; visibleText: string }> {
  return page.evaluate((currentRouteId) => {
    // Match the production capture viewport. Its pricing comparison contributes
    // to body.innerText while the later FAQ section remains content-virtualised.
    const style = currentRouteId === 'pricing' ? document.createElement('style') : null
    if (style) {
      style.textContent = '#plan-comparison { content-visibility: visible !important; }'
      document.head.appendChild(style)
    }
    const visibleText = document.body.innerText.replace(/\s+/g, ' ').trim()
    style?.remove()

    return {
      hrefs: [...new Set([...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map((link) => link.getAttribute('href') ?? ''))],
      visibleText,
    }
  }, routeId)
}

async function captureBody(page: Page): Promise<Buffer> {
  // Match the production capture state at every viewport. Keep virtualised
  // content painted, finish finite animation state, and retain canvas layout
  // while excluding its non-deterministic pixels from the comparison.
  await page.addStyleTag({
    content: '[class*="content-visibility-"] { content-visibility: visible !important; } *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; } canvas { visibility: hidden !important; }',
  })
  const dimensions = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    width: document.documentElement.clientWidth,
  }))
  const maximumCaptureHeight = 4_000
  const captures: Array<{ input: Buffer; top: number; left: number }> = []
  const devtools = await page.context().newCDPSession(page)

  // Let Playwright finish finite animations and cancel infinite animations in
  // a viewport-sized capture before the raw document clips are collected.
  await page.screenshot({ animations: 'disabled' })

  // Capture document-coordinate clips below Chromium's maximum texture size,
  // scrolling each segment into the raster viewport before capture. Chromium
  // otherwise returns blank pixels for distant content even after it hydrated.
  for (let top = 0; top < dimensions.height; top += maximumCaptureHeight) {
    await page.evaluate((nextTop) => window.scrollTo({ top: nextTop, behavior: 'instant' }), top)
    await page.evaluate(async () => {
      await new Promise<void>((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame())))
    })
    if (top > 0) {
      await page.addStyleTag({ content: 'header { visibility: hidden !important; }' })
    }
    const height = Math.min(maximumCaptureHeight, dimensions.height - top)
    const screenshot = await devtools.send('Page.captureScreenshot', {
      captureBeyondViewport: true,
      clip: { x: 0, y: top, width: dimensions.width, height, scale: 1 },
      format: 'png',
      fromSurface: true,
    })
    captures.push({
      input: Buffer.from(screenshot.data, 'base64'),
      left: 0,
      top,
    })
  }
  await devtools.detach()

  return sharp({
    create: {
      width: dimensions.width,
      height: dimensions.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite(captures).png().toBuffer()
}

async function compareWithBaseline(actualBuffer: Buffer, baselineName: string, testInfo: TestInfo): Promise<number> {
  const baselinePath = resolve(baselineDirectory, `${baselineName}.webp`)
  const expected = await sharp(baselinePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const actualMetadata = await sharp(actualBuffer).metadata()
  expect(actualMetadata.height, `${baselineName} height changed`).toBe(expected.info.height)
  expect(actualMetadata.width, `${baselineName} viewport became narrower than its content box`).toBeGreaterThanOrEqual(expected.info.width)
  const actual = await sharp(actualBuffer)
    .extract({ left: 0, top: 0, width: expected.info.width, height: expected.info.height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  expect(actualMetadata.width - expected.info.width, `${baselineName} scrollbar gutter changed`).toBeLessThanOrEqual(11)

  const diffBuffer = Buffer.alloc(actual.info.width * actual.info.height * 4)
  const differingPixels = pixelmatch(
    expected.data,
    actual.data,
    diffBuffer,
    actual.info.width,
    actual.info.height,
    { threshold: 0.1 },
  )
  const difference = differingPixels / (actual.info.width * actual.info.height)
  console.info(`PARITY ${baselineName} ${(difference * 100).toFixed(4)}%`)

  if (difference > 0.01) {
    const outputDirectory = testInfo.outputDir
    mkdirSync(outputDirectory, { recursive: true })
    writeFileSync(resolve(outputDirectory, `${baselineName}-actual.png`), actualBuffer)
    writeFileSync(
      resolve(outputDirectory, `${baselineName}-diff.png`),
      await sharp(diffBuffer, {
        raw: { width: actual.info.width, height: actual.info.height, channels: 4 },
      }).png().toBuffer(),
    )
  }

  expect(difference, `${baselineName} differs by ${(difference * 100).toFixed(3)}%`).toBeLessThanOrEqual(0.01)
  return difference
}

async function fillContactForm(page: Page): Promise<void> {
  await page.getByLabel('Name').fill('Alex Broker')
  await page.getByLabel('Work email').fill('alex@brokerage.com.au')
  await page.getByLabel('How can we help?').fill('Please help with lender policy workflows.')
}

for (const route of pageRoutes) {
  test(`${route.id} preserves production content and visual parity`, async ({ page }, testInfo) => {
    await blockExternalRequests(page)
    const requestedPath = route.id === '404' ? '/parity-missing-route/' : route.requestPath
    const response = await page.goto(requestedPath, { waitUntil: 'load' })
    expect(response?.status()).toBe(route.id === '404' ? 404 : 200)
    await waitForStableDocument(page)
    const evidence = await readProductionContentEvidence(page, route.id)
    for (const href of route.links) expect(evidence.hrefs, `${route.id} lost href ${href}`).toContain(href)
    // The production manifest was captured at the canonical desktop viewport.
    // Mobile intentionally hides the desktop navigation links until the menu opens.
    if (testInfo.project.name === 'desktop') {
      expect(Buffer.byteLength(evidence.visibleText), `${route.id} visible text became insubstantial`).toBeGreaterThanOrEqual(
        Math.floor(route.visibleTextBytes * 0.95),
      )
      expect(createHash('sha256').update(evidence.visibleText).digest('hex')).toBe(route.visibleTextSha256)
    }

    await revealScrollContent(page)
    const baselineName = `${route.id}-${testInfo.project.name}`
    await compareWithBaseline(await captureBody(page), baselineName, testInfo)
  })
}

test.describe('declared production states', () => {
  test('mobile menu open', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile')
    await blockExternalRequests(page)
    await page.goto('/', { waitUntil: 'load' })
    await revealScrollContent(page)
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.locator('#mobile-menu[open]').waitFor({ state: 'visible' })
    await compareWithBaseline(await captureBody(page), 'home-mobile-menu-open', testInfo)
  })

  test('homepage lenders FAQ open by direct hash', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop')
    await blockExternalRequests(page)
    await page.goto('/#lenders', { waitUntil: 'load' })
    await page.waitForFunction(() => document.querySelector('#lenders button')?.getAttribute('aria-expanded') === 'true')
    await revealScrollContent(page)
    await compareWithBaseline(await captureBody(page), 'home-faq-open', testInfo)
  })

  test('yearly pricing', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop')
    await blockExternalRequests(page)
    await page.goto('/pricing/', { waitUntil: 'load' })
    const yearlyTab = page.getByRole('tab', { name: 'Yearly' }).first()
    await expect(yearlyTab.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr', '')
    await yearlyTab.click()
    await expect(yearlyTab).toHaveAttribute('aria-selected', 'true')
    await revealScrollContent(page)
    await compareWithBaseline(await captureBody(page), 'pricing-yearly', testInfo)
  })

  for (const outcome of ['error', 'success'] as const) {
    test(`contact ${outcome}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop')
      await blockExternalRequests(page)
      await page.route('https://formspree.io/**', async (route) => {
        await route.fulfill({
          status: outcome === 'success' ? 200 : 422,
          contentType: 'application/json',
          body: outcome === 'success' ? '{}' : '{"error":"Validation failed"}',
        })
      })
      await page.goto('/contact/', { waitUntil: 'load' })
      await fillContactForm(page)
      await page.getByRole('button', { name: 'Send message' }).click()
      await expect(page.getByRole(outcome === 'success' ? 'status' : 'alert')).toBeVisible()
      await compareWithBaseline(await captureBody(page), `contact-${outcome}`, testInfo)
    })
  }

  test('plan tabs support keyboard movement', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile')
    await blockExternalRequests(page)
    await page.goto('/pricing/', { waitUntil: 'load' })
    await revealScrollContent(page)
    const tabs = page.getByRole('tablist', { name: 'Choose a plan' }).getByRole('tab')
    await tabs.first().scrollIntoViewIfNeeded()
    await tabs.first().focus()
    await tabs.first().press('ArrowRight')
    await expect(tabs.nth(1)).toBeFocused()
    await tabs.nth(1).press('Home')
    await expect(tabs.first()).toBeFocused()
  })
})
