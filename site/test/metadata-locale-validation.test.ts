import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assertProductionMetadataReady,
  resolvePageMetadata,
  type SiteMetadataConfig,
} from '../src/lib/metadata.ts'

const metadata = resolvePageMetadata(
  {
    title: 'Locale validation',
    description: 'Verify the separate HTML and Open Graph locale syntax contracts.',
  },
  {
    name: 'Bulma',
    titleSeparator: ' | ',
    titlePrefixSeparator: ' - ',
  },
)

function config(language: string, openGraphLocale?: string): SiteMetadataConfig {
  return {
    name: 'Bulma',
    titleSeparator: ' | ',
    titlePrefixSeparator: ' - ',
    language,
    ...(openGraphLocale === undefined ? {} : { openGraphLocale }),
    readiness: 'draft',
  }
}

test('accepts language_TERRITORY syntax for the Open Graph locale', () => {
  assert.doesNotThrow(() =>
    assertProductionMetadataReady(metadata, config('en-AU', 'en_AU')),
  )
})

test('rejects BCP 47 syntax for the Open Graph locale', () => {
  assert.throws(
    () => assertProductionMetadataReady(metadata, config('en-AU', 'en-AU')),
    /Open Graph locale must use language_TERRITORY syntax\./,
  )
})

test('accepts BCP 47 syntax for the HTML language', () => {
  assert.doesNotThrow(() => assertProductionMetadataReady(metadata, config('en-AU')))
})

test('rejects Open Graph syntax for the HTML language', () => {
  assert.throws(
    () => assertProductionMetadataReady(metadata, config('en_AU')),
    /Site language must be a valid BCP 47 language tag\./,
  )
})
