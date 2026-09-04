import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import pixelmatch from 'pixelmatch'
import sharp from 'sharp'

const repositoryDirectory = resolve(import.meta.dirname, '../..')
const baselineDirectory = resolve(repositoryDirectory, 'documents/guides/parity/screenshots/production')
const shouldUpdate = process.argv.includes('--update')
const candidateDirectory = process.argv.find((argument) => argument.startsWith('--candidate-directory='))?.split('=', 2)[1]
const requestedNames = process.argv.filter((argument) => !argument.startsWith('--')).slice(2)

const captureDefinitions = {
  'home-desktop': { path: '/', viewport: { width: 1440, height: 900 } },
  'home-faq-open': { path: '/#lenders', viewport: { width: 1440, height: 900 } },
  'about-desktop': { path: '/about/', viewport: { width: 1440, height: 900 } },
  'about-mobile': { path: '/about/', viewport: { width: 390, height: 900 } },
  'home-mobile': { path: '/', viewport: { width: 390, height: 900 } },
  'home-mobile-menu-open': { path: '/', viewport: { width: 390, height: 900 }, state: 'mobile-menu' },
  'pricing-mobile': { path: '/pricing/', viewport: { width: 390, height: 900 } },
  'privacy-policy-mobile': { path: '/privacy-policy/', viewport: { width: 390, height: 900 } },
}

const selectedNames = requestedNames.length > 0 ? requestedNames : Object.keys(captureDefinitions)
for (const name of selectedNames) {
  if (!(name in captureDefinitions)) throw new Error(`Unknown production parity capture: ${name}`)
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function revealProductionPage(page, routePath) {
  let top = 0
  while (top < await page.evaluate(() => document.documentElement.scrollHeight)) {
    await page.evaluate((nextTop) => window.scrollTo(0, nextTop), top)
    await page.waitForTimeout(100)
    top += 300
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForFunction(() => document.querySelector('astro-island[ssr]') === null)

  if (routePath === '/about/') {
    const testimonial = page.locator('figure').filter({ hasText: 'Liam' })
    await testimonial.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => {
      const element = [...document.querySelectorAll('figure')].find((candidate) => candidate.textContent?.includes('Liam'))
      return element ? getComputedStyle(element).opacity === '1' : false
    })

    const teamSection = page.locator('#team')
    await teamSection.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => {
      const element = document.querySelector('#team')
      return Boolean(element) && ![...element.querySelectorAll('.opacity-0')].some((candidate) => {
        const rectangle = candidate.getBoundingClientRect()
        return rectangle.width > 0 && rectangle.height > 0
      })
    })
    await page.locator('#call-to-action').scrollIntoViewIfNeeded()
  }

  await page.waitForFunction(() => [...document.images].every((image) => {
    const url = new URL(image.currentSrc || image.src, window.location.href)
    return url.origin !== window.location.origin || (image.complete && image.naturalWidth > 0)
  }))
  // Bring every explicit reveal owner into view until its observer reaches the
  // final state. A fast whole-page sweep can skip a target between frames.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const pending = page.locator('[data-animating="false"], [data-visible="false"]')
    if (await pending.count() === 0) break
    await pending.first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
  }
  await page.waitForFunction(() => document.querySelector('[data-animating="false"], [data-visible="false"]') === null)
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      const iterations = animation.effect?.getComputedTiming().iterations
      if (iterations !== Infinity) {
        try {
          animation.finish()
        } catch {
          // Ignore animations without a finite active interval.
        }
      }
    }
  })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  const longestTransitionMilliseconds = await page.evaluate(async () => {
    await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame())))
    const parseTimes = (value) => value.split(',').map((part) => {
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

async function captureStitchedPage(page, outputWidth) {
  await page.addStyleTag({
    content: '[class*="content-visibility-"] { content-visibility: visible !important; } *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; } canvas { visibility: hidden !important; }',
  })
  const dimensions = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    width: document.documentElement.clientWidth,
  }))
  const devtools = await page.context().newCDPSession(page)
  await page.screenshot({ animations: 'disabled' })
  const captures = []

  for (let top = 0; top < dimensions.height; top += 4_000) {
    await page.evaluate((nextTop) => window.scrollTo({ top: nextTop, behavior: 'instant' }), top)
    await page.evaluate(async () => {
      await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(() => resolveFrame())))
    })
    if (top > 0) {
      await page.addStyleTag({ content: 'header { visibility: hidden !important; }' })
    }
    const height = Math.min(4_000, dimensions.height - top)
    const screenshot = await devtools.send('Page.captureScreenshot', {
      captureBeyondViewport: true,
      clip: { x: 0, y: top, width: dimensions.width, height, scale: 1 },
      format: 'png',
      fromSurface: true,
    })
    captures.push({ input: Buffer.from(screenshot.data, 'base64'), left: 0, top })
  }
  await devtools.detach()

  const stitched = await sharp({
    create: {
      width: dimensions.width,
      height: dimensions.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite(captures).png().toBuffer()

  return sharp(stitched).extract({ left: 0, top: 0, width: outputWidth, height: dimensions.height }).webp({ lossless: true }).toBuffer()
}

async function describeDifference(previousBuffer, currentBuffer) {
  const previous = await sharp(previousBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const current = await sharp(currentBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const sameDimensions = previous.info.width === current.info.width && previous.info.height === current.info.height
  if (!sameDimensions) return null
  const diff = Buffer.alloc(current.info.width * current.info.height * 4)
  const differingPixels = pixelmatch(
    previous.data,
    current.data,
    diff,
    current.info.width,
    current.info.height,
    { threshold: 0.1 },
  )
  let left = current.info.width
  let top = current.info.height
  let right = -1
  let bottom = -1
  for (let y = 0; y < current.info.height; y += 1) {
    for (let x = 0; x < current.info.width; x += 1) {
      const offset = (y * current.info.width + x) * 4
      if (diff[offset] === 255 && diff[offset + 1] === 0 && diff[offset + 2] === 0) {
        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x)
        bottom = Math.max(bottom, y)
      }
    }
  }
  return {
    ratio: differingPixels / (current.info.width * current.info.height),
    boundingBox: right >= 0 ? { left, top, right, bottom } : null,
  }
}

const browser = await chromium.launch({
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--use-gl=angle'],
})

try {
  for (const name of selectedNames) {
    const definition = captureDefinitions[name]
    const baselinePath = resolve(baselineDirectory, `${name}.webp`)
    const previousBuffer = readFileSync(baselinePath)
    const previousMetadata = await sharp(previousBuffer).metadata()
    if (!previousMetadata.width) throw new Error(`${name} has no readable baseline width`)

    const page = await browser.newPage({
      colorScheme: 'light',
      viewport: definition.viewport,
    })
    await page.goto(`https://bulma.com.au${definition.path}`, { waitUntil: 'load' })
    await page.evaluate(async () => document.fonts.ready)
    await revealProductionPage(page, definition.path)
    if (definition.state === 'mobile-menu') {
      await page.getByRole('button', { name: 'Open menu' }).click()
      await page.locator('#mobile-menu[open]').waitFor({ state: 'visible' })
    }

    const currentBuffer = await captureStitchedPage(page, previousMetadata.width)
    const currentMetadata = await sharp(currentBuffer).metadata()
    const evidence = {
      name,
      previous: {
        sha256: sha256(previousBuffer),
        width: previousMetadata.width,
        height: previousMetadata.height,
      },
      currentProduction: {
        sha256: sha256(currentBuffer),
        width: currentMetadata.width,
        height: currentMetadata.height,
      },
      difference: await describeDifference(previousBuffer, currentBuffer),
      updated: shouldUpdate,
    }
    process.stdout.write(`${JSON.stringify(evidence)}\n`)
    if (candidateDirectory) {
      mkdirSync(candidateDirectory, { recursive: true })
      writeFileSync(resolve(candidateDirectory, `${name}.webp`), currentBuffer)
    }
    if (shouldUpdate) writeFileSync(baselinePath, currentBuffer)
    await page.close()
  }
} finally {
  await browser.close()
}
