/**
 * Sitemap Generation Script for bulma.com.au
 *
 * This script automatically generates a sitemap.xml file by scanning the project's
 * file structure to identify all pages based on Next.js App Router conventions.
 *
 * Output: public/sitemap.xml
 */

const fs = require('fs');
const path = require('path');
const globby = require('fast-glob');

// Import configuration from sitemap.js
const {
  SITE_URL,
  CORE_ROUTES,
  EXCLUDED_ROUTES,
  CHANGE_FREQUENCY,
  PRIORITIES,
} = require('../lib/sitemap');

/**
 * Generate the sitemap by scanning the app directory structure
 * and creating a standardized sitemap.xml file
 */
async function generateSitemap() {
  console.log('Generating sitemap...');

  const lastModified = new Date().toISOString();

  // Generate core URLs (always included)
  const coreUrls = CORE_ROUTES.map((route) => {
    const isHomepage = route === '/';

    return {
      url: isHomepage ? SITE_URL : `${SITE_URL}${route}`,
      lastmod: lastModified,
      changefreq: isHomepage ? CHANGE_FREQUENCY.homepage : CHANGE_FREQUENCY.default,
      priority: isHomepage ? PRIORITIES.homepage : PRIORITIES.default,
    };
  });

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
  ]);

  // Process file paths into URLs
  const dynamicUrls = pages
    .map((page) => {
      const route = page
        .replace('src/app', '')
        .replace(/\/(page)\.(jsx|js|tsx|ts)$/, '')
        .replace(/\/(index)$/, '')
        .replace(/\/$/, '');

      const normalizedRoute = route === '' ? '/' : route.startsWith('/') ? route : `/${route}`;
      const formattedRoute = normalizedRoute === '/' ? '/' : `${normalizedRoute}/`;

      if (EXCLUDED_ROUTES.includes(formattedRoute) || CORE_ROUTES.includes(formattedRoute)) {
        return null;
      }

      return {
        url: formattedRoute === '/' ? SITE_URL : `${SITE_URL}${formattedRoute}`,
        lastmod: lastModified,
        changefreq: CHANGE_FREQUENCY.default,
        priority: PRIORITIES.default,
      };
    })
    .filter(Boolean);

  const allUrls = [...coreUrls, ...dynamicUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

  console.log(`Sitemap generated with ${allUrls.length} URLs`);
  console.log('Sitemap saved to public/sitemap.xml');
}

// Execute the function
generateSitemap().catch((error) => {
  console.error('Error generating sitemap:', error);
  process.exit(1);
});
