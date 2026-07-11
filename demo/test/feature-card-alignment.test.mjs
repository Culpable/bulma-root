import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const componentPath = path.resolve(
  testDirectory,
  '../src/components/sections/features-two-column-with-demos.tsx'
)


/**
 * Read the homepage two-column feature component source.
 *
 * This structural regression test is appropriate because the project does not
 * include a DOM renderer or browser-test framework. Tailwind height utilities
 * provide the complete layout contract responsible for equal-height cards.
 */
function readFeatureComponent() {
  return fs.readFileSync(componentPath, 'utf8')
}


test('homepage two-column feature cards preserve equal heights through animation wrappers', () => {
  const source = readFeatureComponent()

  assert.match(
    source,
    /className=\{clsx\('(?:[^']*\s)?h-full(?:\s[^']*)?'/,
    'Feature cards must fill the height supplied by their grid item.'
  )
  assert.match(
    source,
    /'(?=[^']*\bh-full\b)(?=[^']*\btransition-all\b)(?=[^']*\bduration-700\b)[^']*'/,
    'Animation wrappers must pass the stretched grid height to each feature card.'
  )
  assert.match(
    source,
    /className="(?=[^"]*\bgrid\b)(?=[^"]*\bitems-stretch\b)(?=[^"]*\blg:grid-cols-2\b)[^"]*"/,
    'The two-column grid must explicitly stretch feature items.'
  )
})
