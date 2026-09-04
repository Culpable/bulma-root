import { createSitemapPlan } from '../lib/sitemap.ts';

const siteRoot = new URL(import.meta.env.BASE_URL, import.meta.env.SITE).toString();

/**
 * List the five canonical public routes from the migration parity contract.
 */
export const sitemapPlan = createSitemapPlan({
  siteRoot,
  entries: [
    { path: '/' },
    { path: '/about/' },
    { path: '/contact/' },
    { path: '/pricing/' },
    { path: '/privacy-policy/' },
  ],
});
