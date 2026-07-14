import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const demoDirectory = path.resolve(import.meta.dirname, '..')

function readDemoFile(relativePath) {
  return fs.readFileSync(path.join(demoDirectory, relativePath), 'utf8')
}


test('homepage and pricing page toggles share every interactive visual token', () => {
  const sharedStyles = readDemoFile('src/components/sections/pricing-toggle-shared.ts')
  const homepagePricing = readDemoFile('src/components/sections/pricing-multi-tier.tsx')
  const pricingPage = readDemoFile('src/components/sections/pricing-hero-multi-tier.tsx')
  const globalStyles = readDemoFile('src/app/globals.css')

  assert.match(sharedStyles, /dark:bg-white/)
  assert.match(sharedStyles, /dark:text-mist-950/)
  assert.match(sharedStyles, /dark:hover:bg-white\/10/)
  assert.match(sharedStyles, /dark:focus-visible:outline-white/)

  for (const component of [homepagePricing, pricingPage]) {
    assert.match(component, /PRICING_TOGGLE_TRACK/)
    assert.match(component, /PRICING_TOGGLE_BUTTON/)
    assert.match(component, /PRICING_TOGGLE_SELECTED_SURFACE/)
    assert.match(component, /PRICING_TOGGLE_SELECTED_TEXT/)
    assert.match(component, /PRICING_TOGGLE_UNSELECTED/)
  }

  assert.doesNotMatch(pricingPage, /pricing-toggle-pill[^\n]*\n\s*'bg-mist-950 shadow-sm dark:bg-white\/10'/)
  assert.doesNotMatch(pricingPage, /selectedIndex === index[\s\S]{0,80}\? 'text-white dark:text-white'/)
  assert.match(pricingPage, /\[transition:left_0\.4s_cubic-bezier\(0\.34,1\.56,0\.64,1\),width_0\.3s_ease-out\]/)
  assert.doesNotMatch(globalStyles, /\.pricing-toggle-pill\s*\{[\s\S]*?transition:/)
})
