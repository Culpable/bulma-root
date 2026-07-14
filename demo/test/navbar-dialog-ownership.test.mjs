import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const navbarPath = path.resolve(
  testDirectory,
  '../src/components/sections/navbar-with-logo-actions-and-left-aligned-links.tsx',
)


test('secondary navbar gives React exclusive ownership of mobile dialog commands', () => {
  const navbar = fs.readFileSync(navbarPath, 'utf8')

  assert.match(navbar, /onClick=\{openMobileMenu\}/)
  assert.match(navbar, /onClick=\{closeMobileMenu\}/)
  assert.doesNotMatch(navbar, /command="(?:show-modal|close)"/)
  assert.doesNotMatch(navbar, /commandfor="mobile-menu"/)
  assert.match(navbar, /if \(dialog\.open\) \{[\s\S]*?return[\s\S]*?\}/)
})
