const SITE_ORIGIN = 'https://bulma.com.au'

// The product application is a separate origin. Allow it so an action link can
// point at the real entry point, and keep every other origin out of the file.
const PRODUCT_ORIGIN = 'https://app.bulma.com.au'
const ALLOWED_ORIGINS = new Set([SITE_ORIGIN, PRODUCT_ORIGIN])

// Openers that describe the website instead of the product it markets.
const SITE_SUBJECT_PATTERN =
  /\b(?:these|this|the)\s+(?:pages?|site|website|marketing site|resources?|links?|documents?|file)\b/i

// Promotional terms an agent cannot verify on a linked page.
const PROMOTIONAL_TERMS = [
  'powerful',
  'seamless',
  'seamlessly',
  'revolutionary',
  'best-in-class',
  'cutting-edge',
  'game-changing',
  'world-class',
  'effortless',
  'effortlessly',
  'unlock',
  'supercharge',
  'unparalleled',
  'unrivalled',
  'state-of-the-art',
  'next-generation',
  'industry-leading',
  'market-leading',
]

// Minimum substance per operating line. `whenToUse` must hold a job list.
const MINIMUM_LENGTHS = { whenToUse: 120, whenNotToUse: 60, howToStart: 80 }

function oneLine(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Reject a promotional adjective the site cannot evidence.
function assertObjectiveRegister(value, field) {
  const term = PROMOTIONAL_TERMS.find((candidate) =>
    new RegExp(`\\b${candidate.replaceAll('-', '[- ]')}\\b`, 'i').test(value),
  )
  if (term) throw new Error(`${field} must state a verifiable fact, not the promotional term "${term}".`)
}

/**
 * Enforce the agent-operating block: three lines whose subject is Bulma, a job
 * list in `whenToUse`, and every canonical action URL inline in `howToStart`.
 */
function renderOperatingBlock(document, name) {
  const entries = [
    ['whenToUse', 'When to use', oneLine(document.whenToUse)],
    ['whenNotToUse', 'When not to use', oneLine(document.whenNotToUse)],
    ['howToStart', 'How to get started', oneLine(document.howToStart)],
  ]

  for (const [field, , value] of entries) {
    // The subject must be the product. `Use these pages to ...` indexes the site instead.
    if (SITE_SUBJECT_PATTERN.test(value)) {
      throw new Error(`${field} must describe ${name}, not the website or its pages.`)
    }
    if (value.length < MINIMUM_LENGTHS[field]) {
      throw new Error(`${field} must state specific jobs, limits, or actions in at least ${MINIMUM_LENGTHS[field]} characters.`)
    }
    // Strip URLs first so a hostname cannot stand in for naming the product.
    const prose = value.replace(/https?:\/\/\S+/g, ' ')
    if (!prose.toLowerCase().includes(name.toLowerCase())) {
      throw new Error(`${field} must name ${name} so the line stands alone when quoted.`)
    }
    assertObjectiveRegister(value, field)
  }

  // `whenToUse` carries the capability inventory, so require at least three job clauses.
  const jobClauses = oneLine(document.whenToUse)
    .split(/;|,\s/)
    .map((clause) => clause.trim())
    .filter(Boolean)
  if (jobClauses.length < 3) {
    throw new Error('whenToUse must enumerate at least three distinct jobs separated by semicolons.')
  }

  const actionUrls = document.actionUrls ?? []
  if (actionUrls.length === 0) throw new Error('howToStart requires at least one canonical action URL.')
  for (const actionUrl of actionUrls) {
    const url = new URL(oneLine(actionUrl))
    if (!ALLOWED_ORIGINS.has(url.origin)) throw new Error(`Invalid llms.txt action URL: ${url.href}`)
    // The URL belongs in the instruction that hands it over, not in a trailing list.
    if (!oneLine(document.howToStart).includes(url.href) && !oneLine(document.howToStart).includes(oneLine(actionUrl))) {
      throw new Error(`howToStart must contain the canonical action URL ${url.href} inline.`)
    }
  }

  return entries.map(([, label, value]) => `**${label}:** ${value}`)
}

function renderLlmsTxt(document) {
  const name = oneLine(document.name)
  const summary = oneLine(document.summary)
  if (!name || !summary) throw new Error('llms.txt requires a site name and summary.')
  assertObjectiveRegister(summary, 'summary')

  const lines = [`# ${name}`, '', `> ${summary}`]
  const seen = new Set()

  for (const detail of document.details ?? []) {
    const value = oneLine(detail)
    if (/^#{1,6}\s/.test(value)) throw new Error('llms.txt guidance must not contain headings.')
    assertObjectiveRegister(value, 'details')
    // `details` adds an operating fact; it must not restate the summary.
    if (value.toLowerCase() === summary.toLowerCase()) {
      throw new Error('details must add a fact the summary does not already state.')
    }
    if (value) lines.push('', value)
  }

  for (const line of renderOperatingBlock(document, name)) lines.push('', line)

  for (const section of document.sections ?? []) {
    const heading = oneLine(section.heading).replace(/^#+\s*/, '')
    if (!heading || !section.links?.length) throw new Error('Each llms.txt section requires a heading and links.')
    lines.push('', `## ${heading}`, '')

    for (const link of section.links) {
      const label = oneLine(link.label)
      const description = oneLine(link.description)
      const url = new URL(oneLine(link.href))
      if (!label || !description) throw new Error('Each llms.txt link requires a label and description.')
      // A description restating the label tells an agent nothing about the destination.
      if (description.toLowerCase().replace(/\.$/, '') === label.toLowerCase()) {
        throw new Error(`${label} description must say what the page provides, not repeat the label.`)
      }
      if (url.protocol !== 'https:' || !ALLOWED_ORIGINS.has(url.origin)) {
        throw new Error(`Invalid llms.txt URL: ${url.href}`)
      }
      // Marketing pages keep the trailing-slash policy; product routes keep their own paths.
      if (url.origin === SITE_ORIGIN && !url.pathname.endsWith('/')) {
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
