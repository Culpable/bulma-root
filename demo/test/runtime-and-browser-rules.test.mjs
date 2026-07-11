import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const demoDirectory = path.resolve(testDirectory, '..')
const repositoryDirectory = path.resolve(demoDirectory, '..')


/**
 * Read a UTF-8 repository file relative to the repository root.
 *
 * @param {string} relativePath - Repository-relative file path.
 * @returns {string} File contents.
 */
function readRepositoryFile(relativePath) {
  return fs.readFileSync(path.join(repositoryDirectory, relativePath), 'utf8')
}


/**
 * Parse a JSON file relative to the runnable demo directory.
 *
 * @param {string} relativePath - Demo-relative JSON file path.
 * @returns {Record<string, unknown>} Parsed JSON object.
 */
function readDemoJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(demoDirectory, relativePath), 'utf8'))
}


test('runtime metadata pins the verified Node 22 LTS version', () => {
  const packageJson = readDemoJson('package.json')
  const packageLock = readDemoJson('package-lock.json')
  const workflow = readRepositoryFile('.github/workflows/deploy.yml')
  const readme = readRepositoryFile('README.md')
  const setupGuide = readRepositoryFile('github-pages-setup.md')

  assert.equal(readRepositoryFile('.nvmrc'), '22.23.1\n')
  assert.equal(packageJson.engines.node, '>=22.23.1 <23')
  assert.equal(packageLock.packages[''].engines.node, '>=22.23.1 <23')
  assert.match(workflow, /node-version: "22\.23\.1"/)
  assert.match(readme, /Node(?:\.js)? 22\.23\.1 LTS/)
  assert.match(setupGuide, /Node\.js 22\.23\.1 LTS/)
})


test('runtime documentation records the Next minimum and warning owner', () => {
  const nextPackage = readDemoJson('node_modules/next/package.json')
  const readme = readRepositoryFile('README.md')
  const setupGuide = readRepositoryFile('github-pages-setup.md')

  assert.equal(nextPackage.version, '16.1.5')
  assert.equal(nextPackage.engines.node, '>=20.9.0')
  assert.match(readme, /Next\.js 16\.1\.5 declares Node\.js `>=20\.9\.0`/)
  assert.match(readme, /@tailwindcss\/node@4\.1\.18/)
  assert.match(setupGuide, /@tailwindcss\/node@4\.1\.18/)
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
