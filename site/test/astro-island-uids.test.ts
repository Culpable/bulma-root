import assert from 'node:assert/strict'
import test from 'node:test'

import { normaliseAstroIslandUids } from '../scripts/normalise-astro-island-uids.mjs'


test('normalises Astro island UIDs without changing other markup', () => {
  const source = [
    '<main>',
    '<astro-island uid="checkout-specific-a" component-url="/_astro/a.js"></astro-island>',
    '<p>Keep this content byte-identical.</p>',
    '<astro-island component-url="/_astro/b.js" uid="checkout-specific-b"></astro-island>',
    '</main>',
  ].join('')

  const result = normaliseAstroIslandUids(source)

  assert.equal(result.islandCount, 2)
  assert.equal(
    result.html,
    [
      '<main>',
      '<astro-island uid="bulma-island-1" component-url="/_astro/a.js"></astro-island>',
      '<p>Keep this content byte-identical.</p>',
      '<astro-island component-url="/_astro/b.js" uid="bulma-island-2"></astro-island>',
      '</main>',
    ].join(''),
  )
})


test('returns byte-identical output when a document has no Astro islands', () => {
  const source = '<!doctype html><html><body><p>Static page</p></body></html>'

  assert.deepEqual(normaliseAstroIslandUids(source), {
    html: source,
    islandCount: 0,
  })
})


test('rejects an Astro island without a UID', () => {
  assert.throws(
    () => normaliseAstroIslandUids('<astro-island client="load"></astro-island>'),
    /astro-island 1 has no uid attribute/,
  )
})
