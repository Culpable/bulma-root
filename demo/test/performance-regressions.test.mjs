import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
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
