/**
 * Sitemap Generation Script for bulma.com.au
 *
 * This script automatically generates a sitemap.xml file by scanning the project's
 * file structure to identify all pages based on Next.js App Router conventions.
 *
 * Output: public/sitemap.xml
 */

/**
 * Generate the sitemap by scanning the app directory structure
 * and creating a standardized sitemap.xml file
 */
async function generateSitemap() {
  const fsModule = await import('fs')
  const pathModule = await import('path')
  const globbyModule = await import('fast-glob')
  const sitemapModule = await import('../lib/sitemap.js')

  const fs = fsModule.default ?? fsModule
  const path = pathModule.default ?? pathModule
  const globby = globbyModule.default ?? globbyModule

  // Import configuration from sitemap.js
  const { SITE_URL, CORE_ROUTES, EXCLUDED_ROUTES } = sitemapModule.default ?? sitemapModule
  console.log('Generating sitemap...')

  // Generate core URLs (always included)
  const coreUrls = CORE_ROUTES.map((route) => ({
    url: route === '/' ? SITE_URL : `${SITE_URL}${route.replace(/^\//, '')}`,
  }))

  // Discover dynamic URLs from the project file structure
  const pages = await globby([
    'src/app/**/page.jsx',
    'src/app/**/page.js',
    'src/app/**/page.tsx',
    'src/app/**/page.ts',
    // Exclude patterns
    '!src/app/api/**/*',
    '!src/app/_*/**/*',
    '!**/_*.*',
    '!**/*.test.*',
    '!**/node_modules/**/*',
    '!**/not-found.*',
    '!**/loading.*',
    '!**/error.*',
    '!**/layout.*',
    '!**/template.*',
    '!src/app/404/**/*',
  ])

  // Process file paths into URLs
  const dynamicUrls = pages
    .map((page) => {
      const route = page
        .replace('src/app', '')
        .replace(/\/(page)\.(jsx|js|tsx|ts)$/, '')
        .replace(/\/(index)$/, '')
        .replace(/\/$/, '')

      const normalizedRoute = route === '' ? '/' : route.startsWith('/') ? route : `/${route}`
      const formattedRoute = normalizedRoute === '/' ? '/' : `${normalizedRoute}/`

      if (EXCLUDED_ROUTES.includes(formattedRoute) || CORE_ROUTES.includes(formattedRoute)) {
        return null
      }

      return {
        url: formattedRoute === '/' ? SITE_URL : `${SITE_URL}${formattedRoute.replace(/^\//, '')}`,
      }
    })
    .filter(Boolean)

  const allUrls = [...coreUrls, ...dynamicUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url }) => `  <url>
    <loc>${url}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>`

  const publicDir = path.join(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)

  console.log(`Sitemap generated with ${allUrls.length} URLs`)
  console.log('Sitemap saved to public/sitemap.xml')
}

// Execute the function
generateSitemap().catch((error) => {
  console.error('Error generating sitemap:', error)
  process.exit(1)
})
