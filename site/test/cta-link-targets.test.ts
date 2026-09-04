import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const siteDirectory = path.resolve(testDirectory, '..')


/**
 * Read a UTF-8 file relative to the runnable demo directory.
 *
 * @param {string} relativePath - Demo-relative file path.
 * @returns {string} File contents.
 */
function readSiteFile(relativePath: string): string {
  return fs.readFileSync(path.join(siteDirectory, relativePath), 'utf8')
}


test('standalone Link CTAs enforce mobile and desktop target heights', () => {
  const link = readSiteFile('src/components/elements/link.tsx')
  const homepage = readSiteFile('src/components/pages/home-sections.tsx')
  const notFoundPage = readSiteFile('src/components/pages/not-found-page.tsx')

  assert.match(link, /size\?: 'inline' \| 'cta'/)
  assert.match(link, /min-h-11/)
  assert.match(link, /lg:min-h-10/)
  assert.equal(homepage.match(/<Link[^>]*size="cta"/g)?.length, 2)
  assert.equal(notFoundPage.match(/<Link[^>]*size="cta"/g)?.length, 1)
})
