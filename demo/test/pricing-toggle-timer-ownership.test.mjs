import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const pricingHeroPath = path.resolve(
  testDirectory,
  '../src/components/sections/pricing-hero-multi-tier.tsx',
)


test('pricing toggle gives the latest animation exclusive timer ownership', () => {
  const source = fs.readFileSync(pricingHeroPath, 'utf8')

  assert.match(source, /animationResetTimerRef = useRef<ReturnType<typeof setTimeout> \| null>\(null\)/)
  assert.match(source, /clearTimeout\(animationResetTimerRef\.current\)/)
  assert.match(source, /animationResetTimerRef\.current = setTimeout/)
  assert.match(source, /return \(\) => clearAnimationResetTimer\(\)/)
})
