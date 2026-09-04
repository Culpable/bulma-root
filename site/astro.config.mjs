// @ts-check
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://bulma.com.au',
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Keep project scripts external so the later header-only CSP can allow
      // them through `script-src 'self'` without `unsafe-inline`.
      // This also changes Astro's automatic stylesheet threshold, so the
      // explicit `inlineStylesheets` setting below must stay paired with it.
      assetsInlineLimit: 0,
    },
  },
  build: {
    // Keep stylesheets external to preserve the current site's cacheable CSS
    // delivery. This is explicitly paired with `assetsInlineLimit: 0` above.
    inlineStylesheets: 'never',
  },
  prefetch: {
    // Prefetch every internal link only when a pointer hovers it. This keeps
    // initial loading static-first while reducing repeat-navigation latency.
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  fonts: [
    {
      // Resolve the same Google-hosted variable face as the existing Next build,
      // including the width axis, then self-host Astro's downloaded latin asset.
      provider: fontProviders.google(),
      name: 'Mona Sans',
      cssVariable: '--font-mona-sans',
      weights: ['200 900'],
      styles: ['normal'],
      subsets: ['latin'],
      formats: ['woff2'],
      display: 'swap',
      stretch: '75% 125%',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        experimental: {
          variableAxis: {
            wdth: [['75', '125']],
          },
        },
      },
    },
    {
      // Resolve the Google-hosted Inter variable face used by the existing Next build,
      // then self-host Astro's downloaded latin asset for exact glyph parity.
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['Arial', 'sans-serif'],
    },
  ],
  server: { port: 4331 },
});
