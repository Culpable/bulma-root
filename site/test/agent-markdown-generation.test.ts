import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'

import { generateAgentMarkdown, mainHtmlToMarkdown } from '../scripts/generate-agent-markdown.mjs'

const testDirectory = mkdtempSync(join(tmpdir(), 'bulma-agent-markdown-test-'))

after(() => {
  const result = spawnSync('trash', [testDirectory], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

test('agent Markdown preserves accessible pricing, comparison values, and collapsed answers', () => {
  const markdown = mainHtmlToMarkdown(`
    <section>
      <h2>Pricing</h2>
      <p>
        <span role="text" aria-label="$49">
          <span aria-hidden="true">$</span>
          <span aria-hidden="true"><span>4</span><span>9</span></span>
        </span>
        <span>/month</span>
      </p>
      <table>
        <thead><tr><th>Feature</th><th>Solo</th></tr></thead>
        <tbody><tr><th>Policy questions</th><td><svg aria-label="Included"><path /></svg></td></tr></tbody>
      </table>
      <div hidden data-agent-include>
        <p>The free trial lasts 14 days and does not require a credit card.</p>
      </div>
      <div data-agent-ignore>
        <table><tr><th>Mobile duplicate</th><td>Solo only</td></tr></table>
      </div>
    </section>
  `)

  assert.match(markdown, /\$49 \/month/)
  assert.match(markdown, /\| Policy questions \| Included \|/)
  assert.match(markdown, /The free trial lasts 14 days and does not require a credit card\./)
  assert.doesNotMatch(markdown, /Mobile duplicate|Solo only/)
})

test('agent Markdown decodes named, decimal, and hexadecimal entities in metadata and body text', async () => {
  writeFileSync(join(testDirectory, 'index.html'), `
    <!doctype html>
    <html>
      <head>
        <title>Bulma&#x27;s policy assistant</title>
        <meta name="description" content="We&#x27;re ready &amp; you&#39;d agree.">
        <link rel="canonical" href="https://bulma.com.au/">
      </head>
      <body>
        <main><p>We&#x27;re ready, you&#39;d agree, and Liam O&#x27;Connor uses Bulma &#38; its tools.</p></main>
      </body>
    </html>
  `)

  await generateAgentMarkdown({
    outputDirectory: testDirectory,
    origin: 'https://bulma.com.au',
    vercelRoutesModule: undefined,
  })

  const generated = readFileSync(join(testDirectory, '_agent-markdown/index.md'), 'utf8')
  assert.match(generated, /title: "Bulma's policy assistant"/)
  assert.match(generated, /description: "We're ready & you'd agree\."/)
  assert.match(generated, /We're ready, you'd agree, and Liam O'Connor uses Bulma & its tools\./)
  assert.doesNotMatch(generated, /&(?:amp|#(?:\d+|x[\da-f]+));/i)
})
