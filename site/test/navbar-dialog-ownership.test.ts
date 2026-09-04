import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const navbarPath = path.resolve(
  testDirectory,
  '../src/components/sections/navbar-with-links-actions-and-centered-logo.tsx',
)


test('navbar controller gives React exclusive ownership of mobile dialog commands', () => {
  const navbar = fs.readFileSync(navbarPath, 'utf8')

  assert.match(navbar, /data-open-mobile-menu/)
  assert.match(navbar, /data-close-mobile-menu/)
  assert.doesNotMatch(navbar, /command="(?:show-modal|close)"/)
  assert.doesNotMatch(navbar, /commandfor="mobile-menu"/)
  const controller = fs.readFileSync(path.resolve(testDirectory, '../src/components/sections/navbar-controller.tsx'), 'utf8')
  assert.match(controller, /if \(dialog\.open\)/)
})
