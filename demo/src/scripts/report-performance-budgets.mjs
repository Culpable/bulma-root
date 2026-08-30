import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const scriptDirectory = new URL('.', import.meta.url).pathname
const demoDirectory = resolve(scriptDirectory, '../..')

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : process.argv[index + 1]
}

function walk(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function median(values) {
  const ordered = [...values].sort((left, right) => left - right)
  const middle = Math.floor(ordered.length / 2)
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2
}

function routeFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    return pathname === '/' ? '/' : `${pathname.replace(/\/$/, '')}/`
  } catch {
    return null
  }
}

const outDirectory = resolve(readArgument('--out', join(demoDirectory, 'out')))
const budgetPath = resolve(readArgument('--budget', join(demoDirectory, 'performance-budgets.json')))
const lighthouseDirectory = readArgument('--lighthouse', null)
const budgets = JSON.parse(readFileSync(budgetPath, 'utf8'))
const failures = []
const chunkDirectory = join(outDirectory, '_next/static/chunks')
const chunkFiles = walk(chunkDirectory).filter((file) => file.endsWith('.js'))
const chunkByPublicPath = new Map(
  chunkFiles.map((file) => [`/${relative(outDirectory, file).replaceAll('\\', '/')}`, file]),
)

const chunkContributions = {
  mixpanel: [],
  three: [],
  tailwindPlus: [],
}

for (const file of chunkFiles) {
  const source = readFileSync(file, 'utf8')
  const contribution = { file: basename(file), gzipBytes: gzipSync(source).length }
  if (source.includes('record_sessions_percent') || source.includes('bulma:mixpanel-ready')) {
    chunkContributions.mixpanel.push(contribution)
  }
  if (source.includes('WebGLRenderer') || source.includes('WebGLProgram')) {
    chunkContributions.three.push(contribution)
  }
  if (source.includes('tailwindplus') || source.includes('ElDisclosure')) {
    chunkContributions.tailwindPlus.push(contribution)
  }
}

const routes = {}
for (const [route, budget] of Object.entries(budgets.routes)) {
  const htmlPath = join(outDirectory, budget.output)
  if (!existsSync(htmlPath)) {
    failures.push(`${route}: missing ${budget.output}`)
    continue
  }

  const html = readFileSync(htmlPath, 'utf8')
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1])
  const gzipBytes = scripts.reduce((total, publicPath) => {
    const file = chunkByPublicPath.get(publicPath)
    if (!file) {
      failures.push(`${route}: missing emitted chunk ${publicPath}`)
      return total
    }
    return total + gzipSync(readFileSync(file)).length
  }, 0)

  routes[route] = { initialScripts: scripts.length, initialJavaScriptGzipBytes: gzipBytes }
  if (gzipBytes > budget.baselineInitialJavaScriptGzipBytes) {
    failures.push(
      `${route}: initial JavaScript ${gzipBytes} exceeds baseline ${budget.baselineInitialJavaScriptGzipBytes}`,
    )
  }
}

const mixpanelCoreBytes = Math.max(0, ...chunkContributions.mixpanel.map((entry) => entry.gzipBytes))
if (mixpanelCoreBytes > budgets.mixpanelCoreGzipCeilingBytes) {
  failures.push(`Mixpanel core ${mixpanelCoreBytes} exceeds ${budgets.mixpanelCoreGzipCeilingBytes}`)
}
if (chunkContributions.tailwindPlus.length > 0) {
  failures.push(`Tailwind Plus entered the active build: ${chunkContributions.tailwindPlus.map((entry) => entry.file).join(', ')}`)
}

const lighthouse = {}
if (lighthouseDirectory) {
  for (const file of walk(resolve(lighthouseDirectory)).filter((entry) => entry.endsWith('.json'))) {
    let report
    try {
      report = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      continue
    }
    const route = routeFromUrl(report.finalUrl ?? report.requestedUrl)
    const savingsBytes = report.audits?.['unused-javascript']?.details?.overallSavingsBytes
    if (!(route in budgets.routes) || typeof savingsBytes !== 'number') continue
    lighthouse[route] ??= []
    lighthouse[route].push(savingsBytes / 1024)
  }

  for (const [route, budget] of Object.entries(budgets.routes)) {
    if (!lighthouse[route]?.length) {
      failures.push(`${route}: no Lighthouse unused-JavaScript reports found`)
      continue
    }
    const routeMedian = median(lighthouse[route])
    lighthouse[route] = { runs: lighthouse[route].length, medianUnusedJavaScriptKiB: routeMedian }
    if (routeMedian > budget.unusedJavaScriptCeilingKiB) {
      failures.push(`${route}: unused JavaScript median ${routeMedian.toFixed(1)} KiB exceeds ${budget.unusedJavaScriptCeilingKiB} KiB`)
    }
    for (const [host, baseline] of Object.entries(budget.baselineUnusedJavaScriptKiB)) {
      if (baseline - routeMedian < budgets.minimumUnusedJavaScriptReductionKiB) {
        failures.push(`${route}: ${host} reduction is less than ${budgets.minimumUnusedJavaScriptReductionKiB} KiB`)
      }
    }
  }
}

const baselineRange = Object.values(budgets.routes).flatMap((route) => Object.values(route.baselineUnusedJavaScriptKiB))
const summary = {
  baselineUnusedJavaScriptRangeKiB: [Math.min(...baselineRange), Math.max(...baselineRange)],
  routes,
  chunkContributions,
  lighthouse,
  failures,
}

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
if (failures.length > 0) process.exitCode = 1
