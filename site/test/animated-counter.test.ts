import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'


test('animated counter exposes its final value separately from its animated text', () => {
  const source = fs.readFileSync(
    path.resolve(import.meta.dirname, '../src/components/elements/animated-counter.tsx'),
    'utf8'
  )

  assert.match(source, /const accessibleValue = `\$\{prefix\}\$\{value\.toFixed\(decimals\)\}\$\{suffix\}`/)
  assert.match(source, /role="text"\s+aria-label=\{accessibleValue\}/)
  assert.match(source, /<span aria-hidden="true">\s*\{prefix\}\s*\{formattedValue\}\s*\{suffix\}\s*<\/span>/)
})
