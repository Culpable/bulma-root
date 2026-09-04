import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'


const ASTRO_ISLAND_TAG_PATTERN = /<astro-island\b[^>]*>/g
const ASTRO_ISLAND_UID_PATTERN = /\suid="[^"]*"/


/**
 * Replace Astro's checkout-path-dependent island UIDs with stable document-local values.
 *
 * Keep the attribute for forward compatibility. Astro 7.3.1 does not read it during
 * production hydration, but a stable value makes separate local and CI builds byte-identical.
 */
export function normaliseAstroIslandUids(html, fileLabel = 'HTML document') {
  let islandIndex = 0

  const normalisedHtml = html.replace(ASTRO_ISLAND_TAG_PATTERN, (tag) => {
    if (!ASTRO_ISLAND_UID_PATTERN.test(tag)) {
      throw new Error(`${fileLabel}: astro-island ${islandIndex + 1} has no uid attribute`)
    }

    islandIndex += 1
    return tag.replace(ASTRO_ISLAND_UID_PATTERN, ` uid="bulma-island-${islandIndex}"`)
  })

  return { html: normalisedHtml, islandCount: islandIndex }
}


/** Return every generated HTML file in stable path order. */
async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...await listHtmlFiles(entryPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entryPath)
    }
  }

  return files.sort()
}


/** Normalise every generated HTML document without changing non-island markup. */
export async function normaliseAstroIslandUidsInDirectory(directory) {
  const htmlFiles = await listHtmlFiles(directory)
  let islandCount = 0

  for (const htmlFile of htmlFiles) {
    const source = await readFile(htmlFile, 'utf8')
    const result = normaliseAstroIslandUids(source, htmlFile)

    if (result.html !== source) {
      await writeFile(htmlFile, result.html)
    }

    islandCount += result.islandCount
  }

  return { fileCount: htmlFiles.length, islandCount }
}


async function main() {
  const directory = path.resolve(process.argv[2] ?? 'dist')
  const result = await normaliseAstroIslandUidsInDirectory(directory)

  console.log(
    `Normalised ${result.islandCount} Astro island UIDs across ${result.fileCount} HTML files.`,
  )
}


const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  await main()
}
