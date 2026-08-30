const SITE_ORIGIN = 'https://bulma.com.au'

function oneLine(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function renderLlmsTxt(document) {
  const name = oneLine(document.name)
  const summary = oneLine(document.summary)
  if (!name || !summary) throw new Error('llms.txt requires a site name and summary.')

  const lines = [`# ${name}`, '', `> ${summary}`]
  const seen = new Set()

  for (const detail of document.details ?? []) {
    const value = oneLine(detail)
    if (/^#{1,6}\s/.test(value)) throw new Error('llms.txt guidance must not contain headings.')
    if (value) lines.push('', value)
  }

  for (const section of document.sections ?? []) {
    const heading = oneLine(section.heading).replace(/^#+\s*/, '')
    if (!heading || !section.links?.length) throw new Error('Each llms.txt section requires a heading and links.')
    lines.push('', `## ${heading}`, '')

    for (const link of section.links) {
      const label = oneLine(link.label)
      const description = oneLine(link.description)
      const url = new URL(oneLine(link.href))
      if (!label || !description) throw new Error('Each llms.txt link requires a label and description.')
      if (url.protocol !== 'https:' || url.origin !== SITE_ORIGIN || !url.pathname.endsWith('/')) {
        throw new Error(`Invalid llms.txt URL: ${url.href}`)
      }
      if (seen.has(url.href)) throw new Error(`Duplicate llms.txt URL: ${url.href}`)
      seen.add(url.href)
      lines.push(`- [${label}](${url.href}): ${description}`)
    }
  }

  return `${lines.join('\n')}\n`
}

async function generateLlmsTxt() {
  const fsModule = await import('node:fs')
  const pathModule = await import('node:path')
  const llmsModule = await import('../lib/llms.js')
  const fs = fsModule.default ?? fsModule
  const path = pathModule.default ?? pathModule
  const { llmsDocument } = llmsModule.default ?? llmsModule

  const outputPath = path.join(process.cwd(), 'public', 'llms.txt')
  fs.writeFileSync(outputPath, renderLlmsTxt(llmsDocument), 'utf8')
  console.log('llms.txt saved to public/llms.txt')
}

generateLlmsTxt().catch((error) => {
  console.error('Error generating llms.txt:', error)
  process.exit(1)
})
