import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, beforeEach, test } from 'node:test'

import {
  LIGHTHOUSE_VERSION,
  createReportIdentity,
  readCompletedReport,
  recordCompletedReport,
  releaseFingerprint,
  reportManifestPath,
} from '../scripts/lighthouse-report-cache.mjs'

const testDirectory = mkdtempSync(join(tmpdir(), 'bulma-lighthouse-cache-test-'))
const reportPath = join(testDirectory, 'report.json')
const expectedIdentity = createReportIdentity({
  url: 'https://staging.bulma.com.au/pricing/',
  categories: ['performance'],
  extraArguments: ['--preset=desktop'],
  releaseId: 'worker-version-current',
})

beforeEach(() => {
  writeFileSync(reportPath, JSON.stringify({
    lighthouseVersion: LIGHTHOUSE_VERSION,
    requestedUrl: expectedIdentity.url,
    categories: { performance: { score: 1 } },
  }))
  writeFileSync(reportManifestPath(reportPath), JSON.stringify(expectedIdentity))
})

after(() => {
  const result = spawnSync('trash', [testDirectory], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

test('reuses a cached report only when every run input matches', () => {
  assert.ok(readCompletedReport(reportPath, expectedIdentity))

  for (const changedInput of [
    { url: 'https://staging.bulma.com.au/about/' },
    { categories: ['accessibility'] },
    { extraArguments: [] },
    { releaseId: 'worker-version-next' },
  ]) {
    const changedIdentity = createReportIdentity({ ...expectedIdentity, ...changedInput })
    assert.equal(readCompletedReport(reportPath, changedIdentity), null)
  }
})

test('rejects old reports without a release manifest and honours force-fresh runs', () => {
  writeFileSync(reportManifestPath(reportPath), '{invalid-json')
  assert.equal(readCompletedReport(reportPath, expectedIdentity), null)

  writeFileSync(reportManifestPath(reportPath), JSON.stringify(expectedIdentity))
  assert.equal(readCompletedReport(reportPath, expectedIdentity, true), null)
})

test('rejects a report whose own URL or categories contradict its manifest', () => {
  writeFileSync(reportPath, JSON.stringify({
    lighthouseVersion: LIGHTHOUSE_VERSION,
    requestedUrl: 'https://staging.bulma.com.au/old-route/',
    categories: { performance: { score: 1 } },
  }))
  assert.equal(readCompletedReport(reportPath, expectedIdentity), null)

  writeFileSync(reportPath, JSON.stringify({
    lighthouseVersion: LIGHTHOUSE_VERSION,
    requestedUrl: expectedIdentity.url,
    categories: { accessibility: { score: 1 } },
  }))
  assert.equal(readCompletedReport(reportPath, expectedIdentity), null)
})

test('records a validated report manifest and rejects invalid fresh output', () => {
  writeFileSync(reportManifestPath(reportPath), '{invalid-json')
  assert.deepEqual(recordCompletedReport(reportPath, expectedIdentity).categories, {
    performance: { score: 1 },
  })
  assert.ok(readCompletedReport(reportPath, expectedIdentity))

  writeFileSync(reportPath, JSON.stringify({
    lighthouseVersion: LIGHTHOUSE_VERSION,
    requestedUrl: 'https://staging.bulma.com.au/wrong/',
    categories: { performance: { score: 1 } },
  }))
  assert.throws(
    () => recordCompletedReport(reportPath, expectedIdentity),
    /does not match/,
  )
})

test('creates stable distinct filesystem keys for release identifiers', () => {
  assert.equal(releaseFingerprint('release-a'), releaseFingerprint('release-a'))
  assert.notEqual(releaseFingerprint('release-a'), releaseFingerprint('release-b'))
  assert.match(releaseFingerprint('release/with unsafe characters'), /^[a-f0-9]{12}$/)
})
