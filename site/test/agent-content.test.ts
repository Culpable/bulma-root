import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'


function markdown(route: string): string {
  return readFileSync(resolve(import.meta.dirname, `../dist/_agent-markdown/${route === 'index' ? 'index' : `${route}/index`}.md`), 'utf8')
}


test('built Markdown preserves customer-facing prices, lender counts and answers', () => {
  for (const route of ['index', 'pricing']) {
    const body = markdown(route)
    assert.match(body, /\$49\s*\/month/, route)
    assert.match(body, /\$99\s*\/month/, route)
    assert.doesNotMatch(body, /&#(?:x[\da-f]+|\d+);/i, route)
  }
  for (const route of ['index', 'about']) {
    assert.match(markdown(route), /36\s+Major Australian lenders covered/, route)
    assert.doesNotMatch(markdown(route), /\b0\s+Major Australian lenders covered/, route)
  }
  const pricing = markdown('pricing')
  assert.match(pricing, /Yes, all plans come with a 14-day free trial\. No credit card required/)
  assert.match(pricing, /If you upgrade, you'll be charged the prorated difference/)
  assert.match(pricing, /\|[^\n]*Solo[^\n]*Team[^\n]*Enterprise[^\n]*\|/)
  assert.match(pricing, /\|[^\n]*Included[^\n]*Included[^\n]*Included[^\n]*\|/)
  assert.match(pricing, /Not included/)
})


test('built privacy policy removes only the approved example disclaimer', () => {
  const html = readFileSync(resolve(import.meta.dirname, '../dist/privacy-policy/index.html'), 'utf8')
  assert.doesNotMatch(html, /general example only/)
  assert.doesNotMatch(markdown('privacy-policy'), /general example only/)
  assert.match(markdown('privacy-policy'), /Bulma Pty Ltd/)
})
