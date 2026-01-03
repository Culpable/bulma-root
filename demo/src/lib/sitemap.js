/**
 * Sitemap Configuration
 *
 * This file contains settings for the sitemap generation process.
 * Update these values when new routes need to be added or removed.
 */

/**
 * Base URL for the website
 * Used as prefix for all URLs in the sitemap
 */
const SITE_URL = 'https://bulma.com.au';

/**
 * Core routes that are always included in the sitemap
 * These routes should include trailing slashes (except homepage which is just /)
 */
const CORE_ROUTES = [
  '/',
  '/about/',
  '/pricing/',
  '/contact/',
  '/privacy-policy/',
];

/**
 * Routes that should be excluded from the sitemap
 * These should also include trailing slashes for consistency
 */
const EXCLUDED_ROUTES = [
  '/404/',
];

/**
 * Change frequency settings for different types of pages
 */
const CHANGE_FREQUENCY = {
  homepage: 'daily',
  default: 'monthly',
};

/**
 * Priority settings for different types of pages (0.0 to 1.0)
 */
const PRIORITIES = {
  homepage: 1.0,
  default: 0.8,
};

// CommonJS exports for use in Node.js scripts
module.exports = {
  SITE_URL,
  CORE_ROUTES,
  EXCLUDED_ROUTES,
  CHANGE_FREQUENCY,
  PRIORITIES,
};
