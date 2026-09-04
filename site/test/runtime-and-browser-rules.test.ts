import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const siteDirectory = path.resolve(testDirectory, '..')
const repositoryDirectory = path.resolve(siteDirectory, '..')


/**
 * Read a UTF-8 repository file relative to the repository root.
 *
 * @param {string} relativePath - Repository-relative file path.
 * @returns {string} File contents.
 */
function readRepositoryFile(relativePath: string): string {
  return fs.readFileSync(path.join(repositoryDirectory, relativePath), 'utf8')
}


/**
 * Parse a JSON file relative to the runnable demo directory.
 *
 * @param {string} relativePath - Demo-relative JSON file path.
 * @returns {Record<string, unknown>} Parsed JSON object.
 */
function readSiteJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(siteDirectory, relativePath), 'utf8')) as Record<string, unknown>
}


test('runtime metadata pins the verified Node 22 LTS version', () => {
  const packageJson = readSiteJson('package.json')

  assert.equal(readRepositoryFile('.nvmrc'), '22.23.1\n')
  assert.equal((packageJson.engines as Record<string, unknown>).node, '>=22.23.1 <23')
  assert.equal(packageJson.packageManager, 'pnpm@11.22.0')
})


test('runtime metadata pins the verified Astro, React, Three.js, and Mixpanel versions', () => {
  const packageJson = readSiteJson('package.json')
  const dependencies = packageJson.dependencies as Record<string, unknown>
  assert.equal(dependencies.astro, '7.3.1')
  assert.equal(dependencies.react, '19.2.4')
  assert.equal(dependencies.three, '0.170.0')
  assert.equal(dependencies['mixpanel-browser'], '2.73.0')
})


test('browser rule covers canonical URLs and viewport-dependent evidence', () => {
  const browserRule = readRepositoryFile('.cursor/rules/dev-browser.mdc')

  assert.match(browserRule, /normalising one optional trailing slash/)
  assert.match(browserRule, /\/pricing` at `\/pricing\//)
  assert.match(browserRule, /query string or hash required by the scenario/)
  assert.match(browserRule, /IntersectionObserver, `content-visibility`, scroll-reveal, or sticky targets/)
  assert.match(browserRule, /Capture targeted viewport or element evidence after scrolling/)
  assert.match(browserRule, /return to the intended starting scroll position/)
})
