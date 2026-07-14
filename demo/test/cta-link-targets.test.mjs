import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const demoDirectory = path.resolve(testDirectory, '..')


/**
 * Read a UTF-8 file relative to the runnable demo directory.
 *
 * @param {string} relativePath - Demo-relative file path.
 * @returns {string} File contents.
 */
function readDemoFile(relativePath) {
  return fs.readFileSync(path.join(demoDirectory, relativePath), 'utf8')
}


test('standalone Link CTAs enforce mobile and desktop target heights', () => {
  const link = readDemoFile('src/components/elements/link.tsx')
  const homepage = readDemoFile('src/app/page.tsx')
  const explicitNotFoundPage = readDemoFile('src/app/404/page.tsx')
  const routeNotFoundPage = readDemoFile('src/app/not-found.tsx')

  assert.match(link, /size\?: 'inline' \| 'cta'/)
  assert.match(link, /min-h-11/)
  assert.match(link, /lg:min-h-10/)
  assert.equal(homepage.match(/<Link[^>]*size="cta"/g)?.length, 2)
  assert.equal(explicitNotFoundPage.match(/<Link[^>]*size="cta"/g)?.length, 1)
  assert.equal(routeNotFoundPage.match(/<Link[^>]*size="cta"/g)?.length, 1)
})
