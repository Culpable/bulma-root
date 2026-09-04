# Astro on Cloudflare Workers Migration Plan 🔄 **IN PROGRESS**

<critical_warning>
> **CRITICAL WARNING:** Production cutover changes DNS for `bulma.com.au` and `www.bulma.com.au` only. Immediately before that write, record the complete live state of every record in zone `0534ecfcfde9d322566af12ec11c1bef`, every Workers custom domain, every zone ruleset, and the GitHub Pages site state in `documents/guides/_hosting.md`, then commit it. Only the three apex `A` records and the one `www` `A` record may change. The `app.bulma.com.au` CNAME to Vercel, every MX, TXT, DKIM, DMARC, autodiscover, and `send.auth` record must remain byte-identical. GitHub Pages stays live and undisabled until the Worker passes every production check so the four recorded `A` records can restore the previous host within minutes.
</critical_warning>

<important_note>
> **IMPORTANT NOTE:** This plan supersedes `documents/todo/cloudflare_pages_migration_plan.md`. That plan kept Next.js and targeted Cloudflare Pages; it stalled at its Step 5G performance gate and is archived by Step 10 of this plan. Its Pages project `bulma-root`, preview deployments, `Pages Write` token, and GitHub secret are obsolete and are removed after cutover. Every Cloudflare and GitHub action in this plan is agent-run through the macOS Keychain credential, the Cloudflare API, Wrangler, and `gh`. The GitHub App grant is already done: `Culpable/bulma-root` was granted to the Cloudflare Workers and Pages GitHub App on 2026-09-04 and the repository is visible in the Cloudflare dashboard's **Import a repository** list. Cloudflare published the Workers Builds repository-connection API on 2026-08-13, so the executor can now create the connection and triggers without a dashboard step. Exactly one action needs the user: the explicit approval to cut over after reviewing `https://staging.bulma.com.au/`.
</important_note>

<autonomy>
> **AUTONOMY (Steps 1-8):** Execute Steps 1 through 8 end to end without asking for permission. This is standing authorisation for every action those steps describe, including: creating, editing, moving, and deleting files under `site/`; installing dependencies with pnpm; writing `documents/guides/_hosting.md`; creating the Cloudflare API token and storing it in Keychain; deploying `bulma-root` and `bulma-root-preview` with Wrangler; uploading preview versions; attaching the `staging.bulma.com.au` custom domain; running Playwright, axe, and Lighthouse; and committing **and pushing** the `site/` work to `main` under `<git_rules>`. Do not pause for confirmation, do not present intermediate options, and do not stop to report progress at step boundaries.
>
> Stop and ask the user in exactly three cases:
> 1. **Step 7 Builds connection** - only if the repository connection and triggers cannot be created through the Cloudflare API. Attempt the API first (see Step 7). If it is genuinely dashboard-only, ask the user with the native question tool, supply the exact field values to enter, wait, then continue autonomously.
> 2. **Step 8 cutover approval** - the mandatory gate. Present both URLs, the parity numbers, the Lighthouse medians, the header result, and the rollback packet, then stop. Never begin Step 9 without a recorded explicit approval.
> 3. **A documented fallback chain is exhausted** - the font, CSP, islands, Worker-name, or custom-domain fallbacks in Section 3.2 all fail. Report the exact failure and the residual risk; do not improvise a substitute architecture.
>
> Nothing in Steps 1-8 changes production. `bulma.com.au` stays on GitHub Pages, `.github/workflows/deploy.yml` keeps building only `demo/`, and the only DNS write before Step 9 is the record Cloudflare creates for `staging`.
</autonomy>

## 1. Goal

Rebuild the Bulma marketing site as a static-first, agent-ready Astro site per the `build-astro-websites` skill, host it on Cloudflare Workers Static Assets in account `213ab3604485056376263d22fa242742`, prove it on `https://staging.bulma.com.au/` with full visual and functional parity against the live Next.js site, and only then move `bulma.com.au` and `www.bulma.com.au` to the Worker and decommission GitHub Pages, the Next.js app, and the obsolete Cloudflare Pages project.

Why: GitHub Pages fixes `Cache-Control: max-age=600`, cannot set response headers, cannot negotiate `Accept: text/markdown`, and the Next.js runtime ships roughly 70 KiB gzip of framework code on every route. The previous Pages migration could not justify a host-only move on performance evidence. Astro removes the framework runtime from static pages, keeps React only inside hydrated islands, and Cloudflare Workers Static Assets supplies immutable asset caching, custom headers, a Content Security Policy, and the negotiated Markdown selector that the sibling `taxgenie-root` site already runs in this account.

The migration is complete when:

- `site/` contains an Astro `7.x` static site (pnpm, strict TypeScript, `output: 'static'`, `trailingSlash: 'always'`, `site: 'https://bulma.com.au'`) that renders the five public routes, the 404 page, `robots.txt`, `sitemap.xml`, and `llms.txt`.
- Every visible surface, animation, interaction, colour, font, copy string, link target, and structured-data node matches the current production site at `https://bulma.com.au/` within the parity gates in Section 6, at `1440x900` and `390x900`, dark-only, with `prefers-color-scheme: light` emulated.
- The React components that own interaction and animation are ported one-to-one as Astro React islands; no animation is removed, simplified, or gated by reduced-motion or colour-scheme conditionals.
- The Worker serves prerendered HTML, negotiated Markdown at the same URL, the skill's security-header baseline with a tested CSP, immutable `/_astro/*` caching, and a real `404.html`.
- Cloudflare Workers Builds deploys `bulma-root` from `main` and uploads non-promoted versions of every other branch to `bulma-root-preview`.
- The user reviewed `https://staging.bulma.com.au/` with the parity and Lighthouse report and explicitly approved cutover.
- `https://bulma.com.au/` is served by the Worker, `https://www.bulma.com.au/<path>?<query>` returns one `308` to the matching apex URL, and every discovery file still names only `https://bulma.com.au`.
- GitHub Pages is disabled, `demo/`, the Pages workflow, CNAME files, the Cloudflare Pages project, its token, and its GitHub secret are removed, and `AGENTS.md`, `DESIGN.md`, `README.md`, `documents/guides/_animations.md`, and `documents/guides/_hosting.md` describe the Astro site as the only runnable app.

---

## 2. Current State Analysis

### 2.1 Current Implementation Overview

- Repository `Culpable/bulma-root`, default branch `main`, `HEAD` at `f31143c`, production revision deployed to GitHub Pages `4a005a64b8b44b91d168602049cbef38867f79be`. Commits go directly to `main`.
- Runnable app: `demo/` only. Next.js `16.1.5`, React `19.2.4`, Tailwind CSS `4.1.18` through `@tailwindcss/postcss`, `three@^0.170.0`, `mixpanel-browser@^2.73.0`, `clsx`, npm lockfile v3, Node `22.23.1` pinned in `.nvmrc` and `demo/package.json` (`>=22.23.1 <23`).
- Build: `node src/scripts/generate-sitemap.js && node src/scripts/generate-llms-txt.js && next build` with `output: 'export'`, `trailingSlash: true`, `basePath: ''`, unoptimised images; emits `demo/out` (179 served files, 8 HTML documents, largest file the 488 KiB Three.js chunk).
- Routes: `/`, `/about/`, `/pricing/`, `/contact/`, `/privacy-policy/`, `/404/` plus `not-found.tsx`; static `404.html` at the export root.
- Shell: `demo/src/app/layout.tsx` sets `<html lang="en" class="dark">`, `viewport.colorScheme = 'dark'`, `themeColor #0a0d0e`, self-hosts Mona Sans (variable, `wdth` axis, latin, `display: swap`, no preload) and Inter (latin, swap, no preload) through `next/font/google`, renders the skip link, `referral-tracking.js` with `strategy="lazyOnload"`, `MixpanelProvider`, the server-rendered navbar shell with hydrated `NavbarController` and route-aware `NavbarLink`s, `Main`, and the newsletter footer.
- Metadata: `demo/src/lib/metadata.ts` (`siteMetadata`, `pageMetadata`), `template: '%s | Bulma'`, absolute homepage title, canonical `./`, Open Graph image `/img/og/bulma-og-image.png`, `og:locale en-AU`, `<link rel="describedby" href="https://bulma.com.au/llms.txt">`, dns-prefetch for `app.bulma.com.au` and `api-js.mixpanel.com`.
- Structured data: `demo/src/schemas/organization-schema.ts` emits `Organization` (`#organization`, PO Box 155 Northlands WA 6905, `solutions@bulma.com.au` sales contact, `sameAs` app URL), `WebSite`, `SoftwareApplication`, per-route `WebPage`, and homepage `FAQPage`; `structured-data.tsx` serialises with `<`, `>`, `&`, U+2028, U+2029 escaping.
- Discovery: `demo/public/robots.txt` (allow all, sitemap URL), `demo/public/sitemap.xml` (five canonical URLs, no `lastmod`), `demo/public/llms.txt` rendered from `demo/src/lib/llms.js` by `generate-llms-txt.js`, which enforces the Bulma-not-website subject rule, promotional-term ban, and minimum operating-line lengths.
- Analytics: `demo/src/lib/mixpanelClient.js` imports `mixpanel-browser/src/loaders/loader-module-with-async-recorder`, token `d6d41f4f948512ee3e388559f7b1686e`, `track_pageview: false`, cookie persistence, cross-subdomain cookie, `record_sessions_percent: 20`, heatmaps, `.sensitive-data` masking, font collection, `record_idle_timeout_ms 600000`, `record_min_ms 3000`; dispatches `bulma:mixpanel-ready` and `bulma:mixpanel-disabled`. `MixpanelProvider.jsx` initialises after `load` plus `requestIdleCallback` (`timeout: 3000`, 1200 ms fallback) and tracks one `Page View {url, page}` per pathname. `demo/public/scripts/referral-tracking.js` waits for readiness and tracks `Referral Source Identified` with first-touch `set_once`/`register_once`. Development mode disables analytics.
- Contact form: `demo/src/app/contact/contact-form.tsx` posts `FormData` with `Accept: application/json` to `https://formspree.io/f/xojvwybl`; fields exactly hidden `form_source=contact_page`, `name`, `email`, `message`; `role="alert"` error panel with mailto fallback, `role="status"` success and pending panels, `aria-busy` submit button with animated checkmark; tracks `Form Submitted` with identification and `Form Error`.
- Interactive layer: 57 files carry `'use client'` (listed in Section 4.3). Homepage hero `hero-dot-pool.tsx` hosts the Three.js Dot Pool (`dot-pool-background.tsx`, loaded through `next/dynamic` with `ssr: false` after `load` + idle) and the scroll-pinned "take the stage" screenshot; `hue-shift-provider.tsx` wraps the homepage and writes `--accent-hue-shift`; FAQ disclosures, pricing toggle with morphing prices, plan comparison tabs, scroll reveals, cursor spotlight, magnetic wrappers, luminance sweep, logo marquee, animated counters, border beam, testimonial glass cards, and View Transition navigation through `transition-link.tsx` with `document.startViewTransition` and 300 ms root keyframes in `globals.css` lines 3110-3160.
- Styling: `demo/src/app/globals.css` (3,484 lines) declares `@import 'tailwindcss'`, `@custom-variant dark (&:where(.dark, .dark *))`, the `@theme` block with the mist oklch ramp, `--font-display: var(--font-mona-sans)` with `--font-display--font-variation-settings: 'wdth' 112.5`, `--font-sans: var(--font-inter)`, every keyframe and animation utility, and the view-transition rules.
- Tests: 33 Node tests in `demo/test/*.test.mjs` (`node --test`) covering agent readiness, analytics runtime, UI contracts, CTA targets, feature-card alignment, navbar dialog ownership, performance regressions and budgets, pricing toggle parity and timers, runtime and browser rules. No Playwright suite. `demo/performance-budgets.json` records per-route unused-JavaScript ceilings and gzip baselines (`/` 197,318 B, `/about/` 185,344 B, `/pricing/` 185,927 B, `/contact/` 179,506 B, `/privacy-policy/` 176,182 B).
- Deployment: `.github/workflows/deploy.yml` builds `demo/` on push to `main` with Node `22.23.1` and publishes `demo/out` through `actions/deploy-pages@v4`. GitHub Pages reports `build_type: workflow`, `cname: bulma.com.au`, HTTPS enforced. `demo/public/CNAME` and root `CNAME` contain `bulma.com.au`. `demo/public/_headers` holds one Pages rule (`/_next/static/*` immutable) that GitHub Pages ignores.
- Documentation contracts: `AGENTS.md` (validation commands, dev server on port 3001, dark-only rules, `#lenders` hash rule, contact form field contract, pricing parity, animation standards, `<host_limits>`), `DESIGN.md` (visual contract), `documents/guides/_animations.md` (55 sections, every animation primitive), `documents/guides/_demo-video.md` (Remotion, unaffected), `documents/guides/_hosting.md` (Pages migration evidence, DNS snapshot, rollback payloads), `.cursor/rules/dev-browser.mdc`.

### 2.2 Current Flow

```mermaid
flowchart LR
    PUSH["Push to main"] --> GHA["GitHub Actions deploy.yml"]
    GHA --> BUILD["npm ci + npm run build in demo/"]
    BUILD --> OUT["demo/out static export"]
    OUT --> GHP["GitHub Pages"]
    DNS["4 unproxied A records"] --> GHP
    GHP --> APEX["https://bulma.com.au/ (max-age=600, no custom headers)"]
    PAGES["Cloudflare Pages project bulma-root (preview only, obsolete)"] -.-> NONE["No production traffic"]
```

### 2.3 The Core Problem

- The host cannot express the site's delivery contract: no immutable caching for hashed assets, no security headers, no charset control for `llms.txt`, no `Accept` negotiation, no `X-Robots-Tag` for previews. `AGENTS.md` `<host_limits>` documents these as permanent limits.
- Every route ships the Next.js and React runtime (about 70 KiB gzip transfer, 23-29 KiB representative unused code) even for the static privacy policy; the framework cannot render a page without hydrating the whole tree.
- The Pages migration plan required a host-only performance win from a byte-identical artifact; the GitHub side failed its own non-inferiority gate on measurement variance and the Sydney browser gate stayed blocked, so no cutover happened.
- The workspace already has the target architecture running: `/Users/sacino/taxgenie-root` is an Astro `7.2.6` static site on Workers Static Assets in the same Cloudflare account (`taxgenie-root` production Worker with custom domain, `taxgenie-root-preview` on `webpop.workers.dev`, Workers Builds on push, negotiated Markdown selector, `_headers` CSP, Playwright plus axe suite). Its live responses show HTML `cache-control: public, max-age=0, must-revalidate` with `cf-cache-status: HIT`, `/_astro/*` fonts `max-age=31536000, immutable`, `/llms.txt` `text/plain; charset=utf-8`, and `www` `308` to the apex with path and query preserved, all with zone Browser Cache TTL left at `14400`.

### 2.4 Affected User Scenarios

| Scenario | Today | After |
| --- | --- | --- |
| Broker opens any route on a cold cache | HTML from GitHub Pages plus about 176-197 KiB gzip of route JavaScript | Prerendered HTML from the Cloudflare edge; React only for hydrated islands; per-route JavaScript at or below the recorded Next baseline |
| Repeat navigation | Next router prefetch and same-document view transition | Real page load with native cross-document view transition, Astro hover prefetch, edge-cached HTML, immutable assets |
| Agent requests `Accept: text/markdown` at a canonical URL | HTML only | Generated Markdown from the same URL with `Vary: Accept`; HTML byte-identical when HTML is selected |
| Crawler reads `/llms.txt` | `text/plain` without charset | `text/plain; charset=utf-8` |
| Pre-cutover review | `cloudflare-comparison.bulma-root.pages.dev` (noindexed Pages preview, obsolete) | `https://staging.bulma.com.au/` on the production Worker, noindexed by a host-scoped header rule |
| Contact enquiry | Formspree POST from the browser with in-page states | Identical form, endpoint, fields, and states inside a React island |
| Cutover failure | Restore four `A` records | Same restore, plus delete the Worker custom domains and revert the `www` record and redirect rule |

### 2.5 Technical Constraints

- **Binding project contracts (`AGENTS.md`, `DESIGN.md`):** dark-only rendering with a permanent `dark` class and `color-scheme: dark`; no `prefers-color-scheme` or `prefers-reduced-motion` branches anywhere; no animation removed, simplified, or rewritten beyond what the framework port requires, with every documented timing, trigger, state, cleanup, and WebGL fallback preserved; `#lenders` opens the lender FAQ on direct load and same-page click, `#supported-lenders` targets the hero field; contact form fields exactly `form_source`, `name`, `email`, `message`; homepage and pricing modules stay identical with the annual callout `Get 2 months free on a yearly plan.`; equal-height pricing cards through `h-full` wrappers; Glass Press primary for `Try Bulma free` and `Get started`.
- **Skill authority order:** user instructions, then `AGENTS.md`, then `build-astro-websites` and `deploy-cloudflare-workers-sites` references, then `wrangler` and `workers-best-practices`. This plan rewrites `<host_limits>`, `<validation_commands>`, `<dev_server_policy>`, and the folder structure in `AGENTS.md` in Step 11; until then the old text describes `demo/` only.
- **Astro facts (verified during planning; re-verify before version-sensitive work):** `astro@7.3.1` requires Node `>=22.12.0` (22.23.1 is supported); `@astrojs/react@6.0.5` supports React 19; the Fonts API is stable (`fonts` config, `fontProviders.local()` / `fontsource()` / `google()`, `display` defaults to `swap`, `formats` `['woff2']`, `optimizedFallbacks: true`); Tailwind v4 integrates through `@tailwindcss/vite`; `build.format` defaults to `directory`; `src/pages/404.astro` emits `/404.html`; hashed assets go to `/_astro/*`; prerendered endpoints persist only their body, never headers; processed `<script>` tags under `vite.build.assetsInlineLimit` are inlined and Astro's island hydration stubs are always inline; `@astrojs/sitemap` emits `sitemap-index.xml`, so a custom `src/pages/sitemap.xml.ts` is required for a single `/sitemap.xml`; `@astrojs/cloudflare` is needed only for on-demand routes.
- **Cloudflare facts (verified during planning; re-verify before version-sensitive work):** assets-only Workers need no `main`; `_headers` and `_redirects` are supported in the assets directory, `*` spans `/`, host-scoped rules such as `https://staging.bulma.com.au/*` and `https://:version.:subdomain.workers.dev/*` are valid, domain-level `_redirects` are not; default asset `Cache-Control` is `public, max-age=0, must-revalidate` with an `ETag`; Workers add no `X-Robots-Tag` to previews; custom domains attach through `routes: [{ pattern, custom_domain: true }]` or `PUT /accounts/{account_id}/workers/domains`, Cloudflare creates the proxied record and certificate, and an existing conflicting record is overridden only through the changeset path (`override_existing_dns_record: true`); `workers_dev` and `preview_urls` control `*.workers.dev` exposure; Workers Builds requires the Cloudflare GitHub App installed for the repository before `PUT /accounts/{account_id}/builds/repos/connections` and `POST /accounts/{account_id}/builds/triggers` (fields `external_script_id`, `repo_connection_uuid`, `build_token_uuid`, `trigger_name`, `build_command`, `deploy_command`, `root_directory`, `branch_includes`, `branch_excludes`, `path_includes`, `path_excludes`) and `PATCH .../triggers/{uuid}/environment_variables`; `wrangler versions upload` returns a `workers.dev` preview URL and never promotes traffic; Bulk Redirects and zone redirect rules require a proxied record on the source hostname.
- **Cloudflare account state (read during planning; re-query before every write):** account `213ab3604485056376263d22fa242742`, member `jake.sacino@gmail.com` Super Administrator; workers.dev subdomain `webpop`; existing Workers `hfmlegal`, `musclehacking-astro-preview`, `taxgenie-root`, `taxgenie-root-preview`; one Workers custom domain (`taxgenie.com.au`); zone `bulma.com.au` (`0534ecfcfde9d322566af12ec11c1bef`) has no Worker routes, no custom rulesets, `browser_cache_ttl 14400`, Brotli/HTTP/3/TLS 1.3/IPv6 on, Early Hints/Speed Brain/0-RTT/Rocket Loader off, `always_use_https off`; Pages project `bulma-root` (preview only, latest deployment `3712aa0a-8883-4c46-bf42-3dc1e46be404`); one account token `bulma-root-cloudflare-pages-deploy` (`9dd6d8eb748379192f4d2d9b7fb4fc3b`, `Pages Write`); Zero Trust Access is not enabled (`access.api.error.not_enabled`). GitHub repository secret `CLOUDFLARE_PAGES_API_TOKEN` and variable `CLOUDFLARE_ACCOUNT_ID` exist. The `gh` token cannot list GitHub App installations (`403`, and Cloudflare exposes no installation-listing endpoint either), so the grant was verified visually instead: on 2026-09-04 `Culpable/bulma-root` appeared in the Cloudflare dashboard's **Import a repository** list, confirming the Cloudflare Workers and Pages GitHub App is installed for `Culpable` and now covers this repository.
- **Credential rules:** the Global API Key lives only in Keychain service `cloudflare-global-api-key` (account `jake.sacino@gmail.com`) and is loaded per command as `CLOUDFLARE_API_KEY` with `CLOUDFLARE_EMAIL=jake.sacino@gmail.com`; never print, log, or persist it. New tokens follow the sibling convention: Keychain services `bulma-root-cloudflare-build-api-token`, `-id`, and `-uuid`.
- **Git rules:** no push without explicit authorisation, no `git add -A`, no branch changes without consent, `trash` instead of `rm`, absolute paths for every write, and the mixed-file majority rule for dirty files (`documents/guides/_hosting.md` and `documents/todo/cloudflare_pages_migration_plan.md` are already dirty from the previous task).
- **Dev server rules:** `demo/` keeps port `3001`; the Astro site uses port `4331` (ports 4321-4326, 4330, and 4399 belong to other checkouts). Do not run `npm run build` in `demo/` while its dev server runs.
- **Reference-only trees:** root `components/`, `pages/`, and `tailwind.css` are unrouted Tailwind Plus template sources; leave them untouched. `video/bulma-demo/` is the Remotion project; leave it untouched.

### 2.6 Existing Infrastructure That Can Be Reused

- `/Users/sacino/taxgenie-root`: `astro.config.mjs` (Fonts API, `inlineStylesheets`, `assetsInlineLimit: 0`, `trailingSlash`, port pin), `wrangler.jsonc` (`run_worker_first` exclusions, `not_found_handling: '404-page'`), `public/_headers` (CSP baseline, `/llms.txt` charset, `/_astro/*` immutable), `src/worker.ts`, `src/lib/agent-readable-http/`, `scripts/generate-agent-markdown.mjs`, `scripts/validate-build.mjs`, `scripts/preview-server.mjs`, `playwright.config.ts` (desktop and mobile projects, SwiftShader WebGL flags, `reuseExistingServer: false`), `test/agent-accessibility.*`, `test/discovery.test.ts`, `documents/AGENTS/*`, `README.md` Deployment section, and its plan's Step 10 record of the Workers Builds and custom-domain procedure.
- `build-astro-websites` skill assets: `assets/metadata/src/*` (site config, metadata resolver, `PageMetadata.astro`, `StructuredData.astro`, `BaseLayout.astro`), `assets/llms-txt/src/*`, `assets/sitemap/*`, `assets/agent-readable-http/*` (Cloudflare Workers `worker.ts` and `wrangler.jsonc` templates, `generate-agent-markdown.mjs`, `accept.ts`, `document-response.ts`, `headers.ts`, `internal-path.ts`), `assets/agent-accessibility/*`, `assets/agent-readiness/*`, `assets/third-party-scripts/*`, `assets/project-instructions/*`.
- `deploy-cloudflare-workers-sites/scripts/verify-http-contract.mjs` for repeatable local, staging, and production HTTP contract runs.
- Every component, hook, icon, style, image, script, and copy string under `demo/src` and `demo/public` is the port source. Images, fonts' source families, `robots.txt`, `llms.js` content, `sitemap.js` route list, `supported-lenders.ts`, `mist-palette.ts`, and `organization-schema.ts` carry over verbatim.
- `demo/test/*.test.mjs` are the contract source for the ported Node tests; `demo/performance-budgets.json` supplies the per-route JavaScript baselines.
- `documents/guides/_hosting.md` already holds the DNS baseline, rollback payloads, credential map, and Lighthouse method; this plan extends it.
- Lighthouse `13.4.1`, Chrome `151`, curl `8.7.1`, `dev-browser`, `gh`, `jq`, `security`, and `npx wrangler` are available on the execution machine.

---

## 3. Desired State

### 3.1 Desired State Requirements

- **REQ-1 (MUST):** Create the Astro site at `/Users/sacino/bulma-root/site` with pnpm `11.22.0`, Node `22.23.1`, `astro@7.3.x`, `@astrojs/react@6.x`, `react@19.2.x`, `@tailwindcss/vite@4.x` with `tailwindcss@4.x`, `three` pinned to the exact version resolved in `demo/package-lock.json`, `mixpanel-browser@2.73.0` exact, `clsx`, `wrangler@4.129.x` exact, `@astrojs/check`, `typescript`, `@playwright/test`, `@axe-core/playwright`, and no `@tailwindplus/elements`, `next`, `@astrojs/cloudflare`, or `@astrojs/sitemap`.
- **REQ-2 (MUST):** `astro.config.mjs` sets `site: 'https://bulma.com.au'`, `output: 'static'`, `trailingSlash: 'always'`, `integrations: [react()]`, `vite.plugins: [tailwindcss()]`, `vite.build.assetsInlineLimit: 0`, `build.inlineStylesheets: 'never'` (both commented as a coupled pair), `prefetch: { prefetchAll: true, defaultStrategy: 'hover' }`, `server.port: 4331`, and the Fonts API entries for Mona Sans and Inter.
- **REQ-3 (MUST):** Every public route is prerendered. The only request-time code is the negotiated Markdown selector Worker (`site/src/worker.ts` copied from the skill's `providers/cloudflare-workers/worker.ts`) with the `ASSETS` binding and the skill's `run_worker_first` patterns. No adapter, no Astro endpoint runs on demand, no other binding, no `nodejs_compat`.
- **REQ-4 (MUST):** Interactive and animated behaviour is ported as React islands (`@astrojs/react`) from the existing `demo/src` components with their logic, timings, easings, class strings, ARIA, cleanup, and fallbacks unchanged. Next-specific APIs are replaced per the table in Section 4.3. Static content renders from React components without a `client:*` directive or from `.astro` files.
- **REQ-5 (MUST):** Each hydrated island is the smallest coherent section; the Astro page composes sections and passes only serialisable props. JSX-as-props composition (for example `HeroDotPool` headline, subheadline, CTA, demo, footer slots) lives inside per-page React section components under `site/src/components/pages/`, never across the Astro-to-React boundary.
- **REQ-6 (MUST):** Hydration directives: navbar controller and homepage hero `client:load`; homepage and pricing FAQ sections and the hue-shift controller `client:idle`; every other animated section `client:visible` with a `rootMargin` of at least `200px`; the Dot Pool background remains a lazy client-only module mounted after `load` plus `requestIdleCallback` (`timeout: 2000`, 200 ms fallback) exactly as `hero-dot-pool.tsx` does today. No visible control may be inert when a user can reach it.
- **REQ-7 (MUST):** Navigation uses plain anchors. Native cross-document view transitions (`@view-transition { navigation: auto; }`) reuse the current `::view-transition-old(root)` and `::view-transition-new(root)` rules and keyframes (300 ms, `cubic-bezier(0.22, 1, 0.36, 1)`, 8 px out, 12 px settle). `<ClientRouter />` is not used.
- **REQ-8 (MUST):** Dark-only rendering is preserved: `<html lang="en" class="dark">`, `<meta name="color-scheme" content="dark">`, `<meta name="theme-color" content="#0a0d0e">`, `@custom-variant dark (&:where(.dark, .dark *))`, no `prefers-color-scheme` in CSS, `<source>` media, or scripts.
- **REQ-9 (MUST):** Metadata parity per route: identical `<title>` strings, descriptions, self-referencing canonicals, Open Graph and Twitter values, `og:locale en-AU`, absolute `og:image`, `rel="describedby"` llms link, and dns-prefetch links, emitted once by `PageMetadata.astro` from `site/src/config/site.ts`, `site/src/lib/metadata.ts`, and per-page inputs.
- **REQ-10 (MUST):** Structured data parity: the same `Organization`, `WebSite`, `SoftwareApplication`, `WebPage`, and homepage `FAQPage` nodes with identical `@id`s, values, and escaping, rendered once through `StructuredData.astro`; parsed JSON must deep-equal the production graph per route after key ordering normalisation.
- **REQ-11 (MUST):** Discovery parity: `/robots.txt` byte-identical to production; `/sitemap.xml` byte-identical to production (five URLs, no `lastmod`); `/llms.txt` byte-identical to production, generated from a TypeScript port of `demo/src/lib/llms.js` by `site/src/pages/llms.txt.ts` with the generator's validation rules kept as a Node test.
- **REQ-12 (MUST):** Assets parity: every file under `demo/public/img/**`, `demo/public/favicon.ico`, and `demo/public/scripts/referral-tracking.js` is copied byte-identical into `site/public/` at the same public path; `<img>` markup keeps the same `src`, `srcSet`, `sizes`, `width`, `height`, `alt`, `loading`, `fetchPriority`, and `decoding` attributes.
- **REQ-13 (MUST):** Fonts: Mona Sans and Inter are self-hosted through the Astro Fonts API with `display: 'swap'`, the latin subset, no preload, and Mona Sans exposing the `wdth` axis so `font-variation-settings: 'wdth' 112.5` renders the same widened display face; text-block widths of the homepage H1 and a pricing H2 must match production within 2 px at `1440x900`.
- **REQ-14 (MUST):** Analytics parity: Mixpanel `2.73.0` async-recorder entry, the same token and every `init` option, initialisation after `load` plus idle (1200 ms fallback, 3000 ms timeout), exactly one `Page View {url, page}` per page load, `bulma:mixpanel-ready` and `bulma:mixpanel-disabled` events, `window.mixpanel` and `window.mixpanelLoaded` globals, `referral-tracking.js` loaded unchanged after `load`, analytics disabled under `import.meta.env.DEV`, sampled sessions loading the recorder and unsampled sessions not.
- **REQ-15 (MUST):** Contact form parity: React island posting to `https://formspree.io/f/xojvwybl` with the four fields, the same states, roles, copy, button labels, checkmark animation, `Form Submitted`, identification, and `Form Error` events. Tests intercept and abort the request; no real enquiry is sent.
- **REQ-16 (MUST):** `site/public/_headers` provides: `/*` security baseline (`Content-Security-Policy` with build-generated `sha256` hashes for Astro's inline island scripts, `script-src 'self'` plus the Mixpanel recorder origin, `connect-src 'self'` plus Mixpanel and Formspree origins, `form-action 'self' https://formspree.io`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `font-src 'self'`, `frame-ancestors 'none'`, `base-uri 'self'`, `object-src 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` as in `taxgenie-root`), `/llms.txt` charset, `/_astro/*` `Cache-Control: public, max-age=31536000, immutable`, `https://staging.bulma.com.au/*` and `https://:version.:subdomain.workers.dev/*` `X-Robots-Tag: noindex`. No HSTS. Exact third-party origins come from intercepted network traffic, not memory.
- **REQ-17 (MUST):** The Worker's document responses carry the `_headers` values (CSP, nosniff, frame, referrer, permissions), `Vary: Accept`, the source status, and a byte-identical HTML body when HTML is selected; Markdown responses use `text/markdown; charset=utf-8`; direct `/_agent-markdown/` requests are blocked; unknown paths return the real `404.html` for HTML and the short Markdown recovery document for Markdown; `406` when neither is acceptable.
- **REQ-18 (MUST):** Wrangler configuration `site/wrangler.jsonc`: `name: 'bulma-root'`, `account_id`, `compatibility_date` set to the execution date, `main: 'src/worker.ts'`, `assets: { binding: 'ASSETS', directory: './dist', not_found_handling: '404-page', run_worker_first: the skill template's document patterns and asset-extension exclusions }`, `workers_dev: false`, `preview_urls: false`, `routes` holding the staging custom domain before cutover and the apex after; environment `preview` with `name: 'bulma-root-preview'`, `workers_dev: true`, `preview_urls: true`, `routes: []`. If a Worker named `bulma-root` cannot be created because the Pages project `bulma-root` reserves the name, delete the preview-only Pages project first and record it; if the name is still unavailable, use `bulma-site` and `bulma-site-preview` everywhere.
- **REQ-19 (MUST):** Cloudflare Workers Builds is the sole release controller: repository `Culpable/bulma-root`, root directory `site`, build `pnpm build`, production trigger `main` with deploy `pnpm deploy`, preview trigger every other branch with deploy `pnpm deploy:preview` (`wrangler versions upload --env preview`), `path_includes: ['site/*']`, build variables `NODE_VERSION=22.23.1` and `PNPM_VERSION=11.22.0`, and a dedicated account API token stored only in Keychain and the Builds token registry. No GitHub Actions deployment for the Astro site. The connection is created by API if a route exists; otherwise by the single user-performed dashboard step in Step 7 (see D-3).
- **REQ-20 (MUST):** Before any custom domain, both Workers are bootstrapped from the local machine with `wrangler deploy` (production, with `routes` temporarily empty and `workers_dev: false`) and `wrangler deploy --env preview`, then verified through a `wrangler versions upload --env preview` preview URL. No custom domain is attached during bootstrap.
- **REQ-21 (MUST):** `staging.bulma.com.au` is attached as a Workers custom domain on `bulma-root` only after the local verification gate passes. Cloudflare creates its DNS record; no manual record is created. The hostname returns `X-Robots-Tag: noindex` on every response and does not appear in any canonical, sitemap, llms, JSON-LD, or Open Graph value.
- **REQ-22 (MUST):** Parity gates against production before requesting approval: identical visible text per route, identical link targets and CTA hrefs, identical structured data, identical discovery files, byte-identical images, both-viewport screenshot comparison with the Dot Pool canvas masked at or below `1.0%` differing pixels (pixelmatch threshold `0.1`) per route and state after animations settle, zero console errors, zero page errors, zero CSP violations, zero failed first-party requests, zero horizontal overflow, the dark class present under light-scheme emulation, and every interaction scenario in Section 6.3 passing on `https://staging.bulma.com.au/`.
- **REQ-23 (MUST):** Performance is reported, not gated: 10 alternating mobile and 5 alternating desktop Lighthouse `13.4.1` runs per route for `https://bulma.com.au/` and `https://staging.bulma.com.au/`, medians, ranges, and deltas recorded in `documents/guides/_hosting.md`; per-route gzip JavaScript at or below the `baselineInitialJavaScriptGzipBytes` values in `demo/performance-budgets.json`; the Three.js chunk requested only after `loadEventEnd`.
- **REQ-24 (MUST):** Cutover happens only after the user views `https://staging.bulma.com.au/` and the report and explicitly approves. The apex attaches as a Workers custom domain (Cloudflare replaces the three GitHub `A` records with its proxied record), `www` becomes a proxied placeholder `A 192.0.2.0` with a zone redirect rule `308` to `concat("https://bulma.com.au", http.request.uri.path)` preserving the query string, GitHub Pages stays live, and the rollback restores the four recorded `A` records, deletes the custom domains, and disables the redirect rule.
- **REQ-25 (MUST):** After production checks pass: the staging custom domain and its certificate pack are removed, the staging `_headers` rule is removed, GitHub Pages is disabled through `gh api`, `demo/`, `.github/workflows/deploy.yml`, root `CNAME`, `demo/public/CNAME`, and `github-pages-setup.md` are moved to Trash, the Pages project `bulma-root` is deleted, token `9dd6d8eb748379192f4d2d9b7fb4fc3b` is revoked, GitHub secret `CLOUDFLARE_PAGES_API_TOKEN` and variable `CLOUDFLARE_ACCOUNT_ID` are deleted, and `documents/todo/cloudflare_pages_migration_plan.md` is archived under `documents/learnings/todo_archive/` with a superseded note.
- **REQ-26 (MUST):** Documentation is synchronised in the same work: `AGENTS.md`, `DESIGN.md`, `README.md`, `documents/guides/_animations.md`, `documents/guides/_hosting.md`, `.cursor/rules/dev-browser.mdc`, `.vscode/launch.json`, `.gitignore`, `.nvmrc`, and new `documents/AGENTS/*` guides describe the Astro site, Workers hosting, pnpm commands, port `4331`, the Playwright gate, the negotiated profile, and the header policy; no active file claims Next.js, `demo/`, GitHub Pages, or Cloudflare Pages is current.
- **REQ-27 (MUST NOT):** Do not add `prefers-reduced-motion` or `prefers-color-scheme` conditionals, remove or retime any animation, change any copy, change the contact form fields, change pricing copy, change the `#lenders` behaviour, add a light theme, add HSTS, add Cloudflare Access, change zone settings (`browser_cache_ttl` stays `14400` unless Step 8 measures a header override), add Cache Rules, push, create branches, or change DNS before the approval in REQ-24.
- **REQ-28 (SHOULD):** Keep every ported component's file name and export name so `documents/guides/_animations.md` needs path changes only; keep the `demo/test` assertions as ported Node tests where the source structure still exists, and replace source-structure assertions that no longer apply with output assertions.

### 3.2 Defaults and Fallbacks

- **Defaults:** Astro site directory `site/`; Worker `bulma-root`, preview Worker `bulma-root-preview`; staging hostname `staging.bulma.com.au`; production custom domain `bulma.com.au`; `www` redirect via zone Single Redirect rule named `Redirect www to the Bulma apex`; canonical origin `https://bulma.com.au`; dev and preview-server port `4331`; pnpm; Node `22.23.1`; Workers Builds; negotiated Markdown profile; header-only CSP with build-generated script hashes; Formspree contact form; native cross-document view transitions; Playwright plus axe; React islands.
- **Worker name fallback:** `bulma-root` -> delete obsolete Pages project `bulma-root` if it blocks the name -> `bulma-site` / `bulma-site-preview`.
- **Font fallback order:** Astro `fontProviders.google()` with `subsets: ['latin']`, Mona Sans weights `200 900`, stretch `75 125`, and the experimental `wdth` variable axis -> `fontProviders.local()` with a verified production-equivalent woff2 if the provider fetch fails -> stop and report if the exact production font hashes and `'wdth' 112.5` rendering cannot both be reproduced. Inter uses the same Google provider with its latin variable file.
- **CSP fallback order:** header CSP with hashes generated from `dist/**/*.html` inline scripts by `site/scripts/generate-headers.mjs` -> Astro `security.csp` for `script-src` and `style-src` with the header carrying only non-script directives -> stop and report if island hydration still produces a CSP violation. Never `'unsafe-inline'` in `script-src`.
- **Islands fallback:** if a section cannot hydrate as one island because two React roots must share state, lift the state to the nearest shared parent island; if that parent becomes page-sized, split the section by DOM-owned coordination (data attributes and CSS variables) instead. Never use React context across islands.
- **Workers Builds fallback:** the GitHub App grant is already complete, so the only remaining gap is the connection itself. If the connection cannot be created by API, ask the user for the one dashboard step described in Step 7 and continue. If the user is unavailable, finish every local and bootstrap step, deploy `bulma-root` and attach `staging.bulma.com.au` with Wrangler from the agent's machine, run the full Step 8 proof against staging, and report that the Git-connected release path is the only outstanding item. Never substitute GitHub Actions for Workers Builds without the user's decision; D-3 option (b) stays rejected.
- **Custom-domain conflict fallback:** if the apex attach reports a conflicting record and offers no override, delete only the three snapshotted apex `A` records by ID, re-attach, and verify within the same minute; if attach still fails, restore the records from the recorded payloads and stop.
- **Compatibility:** `demo/` keeps working unchanged until Step 10; its port `3001` dev server and its GitHub Pages workflow are untouched; `.github/workflows/deploy.yml` builds only `demo/`, so adding `site/` cannot break production.

### 3.3 Verification Checklist

**Functional:**
- [x] All five routes, `/404.html`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` exist in `site/dist` and match the parity gates.
- [x] Every Section 6.3 interaction passes locally and on staging at `1440x900` and `390x900` with light-scheme emulation.
- [x] `#lenders` direct load and same-page click open the FAQ; `#supported-lenders` scrolls to the field.
- [x] Contact form intercepted POST targets Formspree with exactly four fields; error, pending, and success states render.
- [x] Mixpanel init, one Page View per load, referral event, sampled and unsampled recorder behaviour observed with traffic intercepted.

**Defaults/Fallbacks:**
- [x] Worker names, staging hostname, ports, and package manager match Section 3.2 or the recorded fallback.
- [x] Font `wdth` gate and CSP gate pass with the primary option or the recorded fallback.

**Compatibility:**
- [x] `demo/` lint, build, and tests still pass until Step 10 removes it.
- [x] `https://bulma.com.au/` stays on GitHub Pages until the approved cutover.
- [ ] MX, TXT, DKIM, DMARC, autodiscover, `send.auth`, and `app` records are unchanged after cutover (byte comparison with the snapshot).

**Ops/Docs:**
- [x] `documents/guides/_hosting.md` holds the Workers inventory, token map, DNS before-state, cutover packet, rollback payloads, Lighthouse tables, and release evidence.
- [ ] `AGENTS.md`, `DESIGN.md`, `README.md`, `_animations.md`, `dev-browser.mdc`, `launch.json`, and `documents/AGENTS/*` describe the Astro site only.

---

## 4. Additional Context

### 4.1 User-Provided Context

- "We want to migrate this site to an Astro site as per /build-astro-websites. And use Cloudflare workers for it." The `build-astro-websites` and `deploy-cloudflare-workers-sites` skills are the implementation authorities beneath `AGENTS.md`.
- "Note we already have `documents/todo/cloudflare_pages_migration_plan.md` which is related." That plan's evidence, DNS snapshot, credential map, and Lighthouse method are reused; its Next.js-on-Pages goal is superseded.
- "Noting that we want visual parity." Parity is the release gate: the Astro site must look and behave like the current production site, not a redesign.
- "Outline the best way to go about this, checking a workers live site on a valid subdomain before the final switchover on a cloudflare previous." The pre-cutover review happens on a real zone hostname, `staging.bulma.com.au`, served by the production Worker.
- "Everything pre cutover should be handled by the agent, who has access." All Cloudflare and GitHub work is agent-run through existing credentials. The GitHub App repository grant is already done. Steps 1-8 run under the standing authorisation in the `<autonomy>` block at the top of this plan; the user is involved only for the cutover approval, plus the Workers Builds dashboard step in Step 7 if Cloudflare still exposes no API for it.
- "Do a BSP and create a plan." A blindspot pass ran before this plan; every decision below was answered by the user.
- On D9 the user asked: "Make it clear which is faster loading time in your response + benefits to AEO/SEO; we care about speed + robots/agents readability." The answer and the resulting decision are recorded in D-9.

### 4.2 Decision record

#### D-1: Location of the Astro site
- **Context:** The repository has `demo/` (runnable Next.js), root template trees `components/` and `pages/`, and `tailwind.css`; sibling Astro repos run Astro at their root.
- **Options:** (a) new `site/` directory beside `demo/`; (b) Astro at the repository root; (c) a separate repository.
- **Decision:** (a). User accepted the recommendation.
- **Why:** `demo/` and the GitHub Pages workflow keep serving production untouched until cutover, rollback is trivial, and root template trees stay untouched. Workers Builds supports `root_directory: site`.
- **Why not (b), (c):** (b) collides with root template trees and touches the live root while `demo/` still deploys; (c) splits history, `DESIGN.md`, and `AGENTS.md` contracts across repositories.
- **Assumptions:** `site/` remains the permanent location after `demo/` is removed; no hoist to root.
- **Reconsider when:** the user asks to align with sibling root layouts after decommissioning.

#### D-2: Interactive layer
- **Context:** 57 `'use client'` files implement documented animations and interactions that `AGENTS.md` forbids rewriting.
- **Options:** (a) React islands via `@astrojs/react`; (b) hybrid React plus vanilla rewrites; (c) no React.
- **Decision:** (a). User accepted the recommendation.
- **Why:** One-to-one port keeps every animation contract; React ships once (about 45 KiB gzip for `react-dom`) and only hydrated sections load their code.
- **Why not (b), (c):** both rewrite documented animations and double verification; (c) conflicts with the animation standard.
- **Assumptions:** the React runtime plus islands stays at or below the Next per-route baseline; later vanilla conversions are separate work.
- **Reconsider when:** a measured route exceeds its gzip baseline after the port.

#### D-3: Release controller
- **Context:** `taxgenie-root` uses Workers Builds; the previous Pages plan used GitHub Actions with a scoped token.
- **Options:** (a) Cloudflare Workers Builds from GitHub; (b) GitHub Actions plus `wrangler` with a new token.
- **Decision:** (a). User accepted the recommendation.
- **Why:** Proven in this account, gives automatic branch previews to an isolated Worker, and is the skill's default stack.
- **Why not (b):** second deploy path to maintain and no automatic previews.
- **Status (2026-09-04):** The grant is complete. `Culpable/bulma-root` was granted to the Cloudflare Workers and Pages GitHub App and confirmed visible in the dashboard's **Import a repository** list. No further GitHub-side action is required.
- **API status:** Cloudflare published `PUT /accounts/{account_id}/builds/repos/connections` on 2026-08-13. It accepts the GitHub provider account and repository IDs directly. The Builds token, trigger, environment-variable, manual-build, and build-status endpoints are also public. The dashboard fallback is retained only for an unexpected API failure after the documented request is attempted.
- **Consequence:** Step 7 is fully autonomous through the Cloudflare API.
- **Reconsider when:** Cloudflare changes or removes the public Workers Builds API.

#### D-4: Staging hostname
- **Options:** (a) `staging.bulma.com.au`; (b) `preview.bulma.com.au`; (c) `new.bulma.com.au`.
- **Decision:** (a). User accepted the recommendation.
- **Why:** Conventional, obviously non-production, attached to the production Worker so the reviewed deployment is the one that later receives the apex.
- **Assumptions:** the hostname is removed after cutover.

#### D-5: Staging index guard
- **Options:** (a) host-scoped `_headers` `X-Robots-Tag: noindex` rules for `https://staging.bulma.com.au/*` and `https://:version.:subdomain.workers.dev/*`; (b) Cloudflare Access one-time PIN; (c) none.
- **Decision:** (a). User accepted the recommendation.
- **Why:** Repository-owned, cannot affect the apex, needs no account feature; Access is not enabled on the account and would add a login to every automated run.
- **Reconsider when:** staging must hold content that must not be publicly reachable.

#### D-6: Agent-readable HTTP profile
- **Context:** `AGENTS.md` `<host_limits>` mandates the file-only profile because the old hosts could not negotiate; `taxgenie-root` runs the negotiated selector.
- **Options:** (a) negotiated Markdown selector (Worker entry plus `ASSETS`); (b) file-only assets-only Worker.
- **Decision:** (a). User accepted the recommendation.
- **Why:** Skill default for a Workers site, matches the sibling AI-native site, keeps pages prerendered, one Worker invocation per document request.
- **Why not (b):** agents cannot request Markdown at the canonical URL.
- **Assumptions:** `<host_limits>` is rewritten in Step 11; `_headers` values must be carried onto Worker document responses (Section 4.3 records that the live `taxgenie-root` HTML response lacks the CSP its `_headers` declares, so this is a verified gate here, not an assumption).

#### D-7: Security headers
- **Options:** (a) full skill baseline via `_headers` including CSP, no HSTS; (b) cache and charset headers only.
- **Decision:** (a). User accepted the recommendation.
- **Why:** The host now supports headers; the skill requires a tested baseline; `taxgenie-root` ships one.
- **Assumptions:** HSTS stays out until the user approves it separately; CSP origins are discovered from intercepted traffic.
- **Reconsider when:** a third-party script change needs a new origin.

#### D-8: Contact form backend
- **Options:** (a) keep the Formspree browser POST; (b) Worker endpoint with Resend and Turnstile.
- **Decision:** (a). User accepted the recommendation.
- **Why:** Exact behavioural parity, no adapter, no secrets, no new provider; `<contact_form_rules>` unchanged.
- **Why not (b):** changes the visible flow and needs a sending domain.

#### D-9: Navigation transitions
- **Context:** User asked which option loads faster and which serves SEO, AEO, and agent readability.
- **Options:** (a) native cross-document view transitions plus Astro hover prefetch; (b) Astro `<ClientRouter />`.
- **Decision:** (a). User accepted the recommendation after the comparison.
- **Why:** Fastest first load (no router bundle), every navigation counts as a page load in Core Web Vitals, cleanest surface for crawlers and agents (no client head swapping, real status codes, `Vary: Accept` on every request), CSP-compatible, no `astro:page-load` re-initialisation. Astro `prefetch` recovers most repeat-navigation latency.
- **Why not (b):** repeat-navigation gain is in-browser only and invisible to CrUX; adds a runtime on every page, re-init and persistence rules, CSP hashing incompatibility, and the largest class of after-navigation bugs.
- **Assumptions:** Firefox shows an instant navigation, as it does today with the same-document API.

#### D-10: Cutover gate
- **Options:** (a) parity evidence plus user review and explicit approval, performance reported; (b) hard performance non-inferiority gate.
- **Decision:** (a). User accepted the recommendation.
- **Why:** The previous fixed gate blocked on measurement noise; the user's review of staging is the decision.
- **Assumptions:** Lighthouse medians are still recorded (REQ-23) so the user decides with numbers.

#### D-11: Decommissioning timing
- **Options:** (a) in this plan right after production checks pass; (b) defer.
- **Decision:** (a). User accepted the recommendation.
- **Why:** Avoids two build systems and stale contracts; GitHub Pages and the `A` records stay recorded for rollback until the final step.

#### D-12: Test stack
- **Options:** (a) Playwright plus axe plus Node tests; (b) Node tests and dev-browser only.
- **Decision:** (a). User accepted the recommendation.
- **Why:** The skill's 33-rule agent-accessibility scan and CLS checks become repeatable; matches `taxgenie-root`.
- **Assumptions:** `AGENTS.md` `<testing_rules>` and `<dev_server_policy>` are rewritten to include Playwright.

#### D-13: Package manager
- **Options:** (a) pnpm; (b) npm.
- **Decision:** (a). User accepted the recommendation.
- **Why:** Matches sibling Astro repos and proven Workers Builds triggers (`pnpm build`, `pnpm deploy`).
- **Assumptions:** `demo/` keeps npm until removed.

#### D-14: Worker naming and preview Worker
- **Context:** Sibling convention is `<repo>` and `<repo>-preview`; a Pages project named `bulma-root` exists.
- **Decision:** Plan writer. `bulma-root` and `bulma-root-preview`, with the fallback chain in Section 3.2.
- **Why:** Consistency with `taxgenie-root`; the Pages project is obsolete and scheduled for deletion anyway.
- **Reconsider when:** the name conflict fallback triggers.

#### D-15: `www` redirect mechanism
- **Options:** (a) proxied placeholder `A 192.0.2.0` plus zone Single Redirect rule `308`; (b) account Bulk Redirect list as the Pages plan designed; (c) `www` as a second custom domain served by the Worker.
- **Decision:** Plan writer, (a).
- **Why:** Exactly what `taxgenie.com.au` runs today (`www` `308` with path and query preserved), zone-scoped, no account-level list.
- **Why not (b), (c):** (b) is account-level shared state; (c) serves duplicate content.

#### D-16: CSP implementation
- **Context:** Astro always inlines island hydration stubs, so a header `script-src 'self'` would block hydration.
- **Options:** (a) header-only CSP with `sha256` hashes generated from `dist` inline scripts at build time; (b) Astro `security.csp` meta for script and style hashes with the header carrying the rest.
- **Decision:** Plan writer, (a) with (b) as fallback.
- **Why:** One owner for every directive, verifiable from `dist`, matches the skill's option 3; `assetsInlineLimit: 0` keeps project scripts external so only Astro's fixed stubs need hashes.
- **Why not (b):** splits ownership and is documented as incompatible with `'unsafe-inline'`, which SSR `style` attributes need.
- **Reconsider when:** hash generation changes on every build (non-deterministic stubs).

#### D-17: Fonts
- **Decision:** Implemented with the Astro Fonts API and `fontProviders.google()` for both faces. Mona Sans uses weights `200 900`, stretch `75 125`, the `wdth` variable axis, `display: 'swap'`, the latin subset, and no preload; Inter uses its latin variable file with `display: 'swap'` and no preload.
- **Evidence:** The emitted Mona Sans and Inter woff2 files are byte-identical to the corresponding production Next.js font files. This preserves both font metrics and the widened Mona Sans display setting.
- **Why:** The Google provider's `wdth` support is unverified; the local provider guarantees the axis file is the one served.
- **Reconsider when:** the H1 width gate fails.

#### D-18: Branch strategy
- **Decision:** Plan writer. Develop `site/` on `main` as the repository does today; the production trigger deploys every `main` push to `bulma-root` (serving only staging until cutover) while GitHub Pages keeps deploying `demo/`; non-`main` branches upload to `bulma-root-preview`.
- **Why:** Staging is the real production Worker, so cutover adds domains without a new build.

#### D-19: Zone Browser Cache TTL
- **Decision:** Plan writer. Leave `browser_cache_ttl` at `14400` unless Step 8 shows HTML on `staging.bulma.com.au` returning a `max-age` above `0`; only then change it to `0` with the recorded rollback payload.
- **Why:** `taxgenie.com.au` serves `max-age=0, must-revalidate` HTML with the same zone value, so Workers Static Assets responses are not overridden in practice.

### 4.3 Background

**Next-specific API replacement table (every file with a `next/*` import is listed in Section 2.1 or below):**

| Next API | Files | Replacement |
| --- | --- | --- |
| `next/link` (13 files: `button.tsx`, `glass-press-button-link.tsx`, `link.tsx`, `announcement-badge.tsx`, `precision-porcelain-button-link.tsx`, `transition-link.tsx`, three footer sections, `navbar-links.tsx`, two navbar variants, `stats-animated-graph.tsx`, `pricing/page.tsx`, `privacy-policy/page.tsx`) | Plain `<a>` with identical class strings; `TransitionLink` becomes a plain anchor wrapper that keeps `disableTransition`, `onBeforeNavigate`, and external-URL handling but performs no client navigation |
| `next/navigation` `usePathname` (`MixpanelProvider.jsx`, `navbar-links.tsx`, `hero-dot-pool.tsx`, `use-view-transition.ts`) | Build-time `currentPath` prop from `Astro.url.pathname` passed into the navbar island; Page View uses `window.location.pathname`; `use-view-transition.ts` is deleted |
| `next/dynamic` with `ssr: false` (`hero-dot-pool.tsx`, `page.tsx`, one more) | `React.lazy(() => import('../elements/dot-pool-background'))` rendered inside `<Suspense fallback={null}>` only when the existing `poolReady` gate is true; Vite code-splits the Three.js chunk |
| `next/image` (`page.tsx`, `about/page.tsx`) | Plain `<img>` with the same attributes (`unoptimized` today, so no behaviour changes) |
| `next/script` `lazyOnload` (`layout.tsx`) | Processed script in `BaseLayout.astro` that appends `<script src="/scripts/referral-tracking.js">` after `window` `load` |
| `next/font/google` (`layout.tsx`) | Astro Fonts API (`D-17`) with `<Font cssVariable="--font-mona-sans" />` and `<Font cssVariable="--font-inter" />`, keeping the `@theme` variable names |
| `process.env.NODE_ENV` (`MixpanelProvider.jsx`, `mixpanelClient.js`, `analytics.js`) | `import.meta.env.DEV` |
| `process.env.NEXT_PUBLIC_SITE_URL` (`metadata.ts`) | Removed; `site.origin` in `site/src/config/site.ts` is the single origin owner |
| Next `Metadata` exports | Page metadata inputs (`title`, `description`, `path`) passed to `BaseLayout` and resolved by `site/src/lib/metadata.ts` |

**`'use client'` inventory to port as islands or island children:** `contact-form.tsx`, `contact-page-grid.tsx`, `MixpanelProvider.jsx` (becomes a layout script, not an island), `animated-counter.tsx`, `animated-reveal.tsx`, `aurora-background.tsx`, `blur-transition-text.tsx`, `border-beam.tsx`, `card-spotlight.tsx`, `cursor-spotlight.tsx`, `dot-matrix.tsx`, `dot-pool-background.tsx`, `gradient-border-wrapper.tsx` (dormant), `hue-shift-provider.tsx` (becomes a markup-less island `HueShiftController`), `icon-path-motion.tsx`, `logo-grid.tsx`, `logo-marquee.tsx`, `luminance-sweep.tsx`, `magnetic-wrapper.tsx`, `morphing-price.tsx`, `page-transition.tsx` (deleted; native transitions), `screenshot.tsx`, `scroll-highlight.tsx`, `section-divider.tsx`, `section-horizon.tsx`, `sticky-eyebrow.tsx`, `supported-lenders-field.tsx`, `transition-link.tsx`, `animated-checkmark-icon.tsx`, `call-to-action-simple-centered.tsx`, `call-to-action-simple.tsx`, `faq-disclosure-controller.tsx`, `faqs-accordion.tsx`, `faqs-two-column-accordion.tsx`, `features-two-column-with-demos.tsx`, `footer-wordmark.tsx`, `hero-dot-pool.tsx`, `hero-left-aligned-with-demo.tsx` (unrouted), `navbar-controller.tsx`, `navbar-links.tsx`, two unrouted navbar variants, `plan-comparison-table.tsx`, `pricing-hero-multi-tier.tsx`, `pricing-multi-tier.tsx`, `stats-animated-graph.tsx`, `team-four-column-grid.tsx`, `testimonial-two-column-with-large-photo.tsx`, `testimonials-glassmorphism.tsx`, hooks `use-dark-mode.ts` (unused; do not port), `use-hero-parallax.ts`, `use-hue-shift.ts`, `use-scroll-animation.ts`, `use-scroll-highlight.ts`, `use-scroll-velocity.ts`, `use-sticky-section.ts`, `use-view-transition.ts` (deleted). Unrouted reference components (`hero-left-aligned-with-demo.tsx`, the two other navbar variants, the other footer variants, `precision-porcelain-button-link.tsx`, `gradient-border-wrapper.tsx`) are ported only if a routed page imports them; otherwise they are omitted and `DESIGN.md` "Retained but unreferenced" is updated.

**Route to island map (initial hydration plan; the executor records the final directives in `documents/guides/_animations.md`):**

| Route | Astro page | React section components (`site/src/components/pages/`) and directive |
| --- | --- | --- |
| `/` | `index.astro` | `ShellController` `client:load`; `HomePage` hero (including hue-shift control, `HeroDotPool`, `BlurTransitionText`, CTAs, `HeroScreenshot`, and `SupportedLendersField`) `client:load`; features, stats, testimonials, pricing, and CTA sections `client:visible`; FAQ `client:idle` |
| `/pricing/` | `pricing/index.astro` | `ShellController` `client:load`; `PricingPage` hero (toggle, morphing prices, plans) `client:load`; comparison and CTA sections `client:visible`; FAQ `client:idle` |
| `/about/` | `about/index.astro` | `AboutHero` `client:load`; `AboutStats`, `AboutTeam`, `AboutTestimonial`, `AboutCta` `client:visible` |
| `/contact/` | `contact/index.astro` | `ContactGrid` (`ContactForm`, `ContactDetails`, scroll animation) `client:load`; heading copy static |
| `/privacy-policy/` | `privacy-policy/index.astro` | `DocumentCentered` rendered statically (no directive) unless it imports a hook |
| 404 | `404.astro` | `HeroSimpleCentered` static |
| Shell | `BaseLayout.astro` | Navbar markup static with `NavbarController` and `NavbarLinks` island `client:load` receiving `currentPath`; footer static with the newsletter form island `client:visible` if it has state |

**Cloudflare evidence gathered for this plan:** `taxgenie.com.au` HTML response headers `content-type: text/html`, `cf-cache-status: HIT`, `cache-control: public, max-age=0, must-revalidate`, `vary: Accept`, `referrer-policy: strict-origin-when-cross-origin`, and no `content-security-policy`, `x-content-type-options`, or `x-frame-options`, although its `public/_headers` declares them for `/*`. Its `/_astro/fonts/*.woff2` returns `max-age=31536000, immutable`; `/llms.txt` returns `text/plain; charset=utf-8`; `https://www.taxgenie.com.au/how-it-works/?x=1` redirects to `https://taxgenie.com.au/how-it-works/?x=1`; an unknown path returns `404`. Zone records: `AAAA taxgenie.com.au 100::` proxied (created by the custom domain), `A www.taxgenie.com.au 192.0.2.0` proxied with comment `Proxied placeholder for canonical www redirect`; redirect rule expression `(http.host eq "www.taxgenie.com.au")`, `308`, `preserve_query_string: true`, target `concat("https://taxgenie.com.au", http.request.uri.path)`. `taxgenie-root` Worker: `workers_dev` disabled, previews disabled, bindings `ASSETS`; `taxgenie-root-preview`: workers.dev and previews enabled.

**Full current DNS inventory for zone `bulma.com.au` (read during planning; refresh before every write):** `A bulma.com.au` `185.199.111.153` (`f4126d8a14cbaef48bdb01475469868a`), `185.199.110.153` (`5c2d843829044e88737e52479e6059f4`), `185.199.108.153` (`31b4ad370c84b9fd0c443af8af34f096`); `A www.bulma.com.au 185.199.109.153` (`c8e82fc2b97b87587bca888d574a8869`); `CNAME app.bulma.com.au d6e8538622622cb8.vercel-dns-017.com` (`75cf4f7e6ce408098cf70affe7a3b054`); `CNAME autodiscover` (`797da0a47de88cafe72d4a3783b5693c`); `CNAME selector1._domainkey` (`c7a1e091840c41852b2831a1221c92bf`); `CNAME selector2._domainkey` (`b35398f3563319d481198eed6e444902`); `MX bulma.com.au` (`00832e9d4a08edb5072892b6cba436a1`); `MX send.auth` (`7e0cf81ae4b9613723923122169b87a7`); `TXT` SPF (`b6ff3371f8fefbd584bf8c6a30afe7d7`), `MS=` (`c27e9cb54e6e6a0a93132dbf71c34da3`), Google site verification (`0b3b817b0b6f152c44ba7a5018dd5e7c`), `_dmarc` (`5295629a0f6f885fbde3718271e35016`), `resend._domainkey.auth` (`13b9d4e8d09dfa4d13358277bd4542da`), `send.auth` SPF (`e510f8d48578acedb6db82d7b4803fac`). All records are unproxied. Only the four web `A` records are migration targets.

**Skill references the executor must read in full before the step that needs them:** `build-astro-websites/SKILL.md`, `references/cloudflare-workers-builds-github.md`, `project-structure.md`, `site-configuration.md`, `structured-data-and-trust.md`, `metadata.md`, `accessibility-for-agents.md`, `agent-readiness.md`, `agent-readable-http.md`, `sitemap.md`, `robots-txt.md`, `llms-txt.md`, `fonts.md`, `third-party-scripts.md`, `client-islands.md`, `components-and-styles.md`, `images.md`, `security-headers.md`, `performance-and-caching.md`; `deploy-cloudflare-workers-sites/SKILL.md` and all nine references; `wrangler/SKILL.md`; `workers-best-practices/SKILL.md`; `.cursor/rules/dev-browser.mdc`; `documents/guides/_animations.md`; `DESIGN.md`.

---

## 5. Implementation Plan

### ~~Step 1: Revalidate authority, snapshot the baseline, and stage the hosting guide~~ ✅ **COMPLETED**
**Objective:** Fix the exact inputs before any write and give later steps a single evidence document.

#### 1.1 High-Level Approach
- Read `AGENTS.md`, `DESIGN.md`, `documents/guides/_animations.md`, `documents/guides/_hosting.md`, this plan, and every skill file listed in Section 4.3.
- Run read-only Git checks with `git -C /Users/sacino/bulma-root`; record `HEAD`, dirty files, and index state; preserve the pre-existing dirty changes in `_hosting.md` and the old plan.
- Query, without changing anything: Cloudflare account, membership, zone, all DNS records, zone settings, rulesets, Workers scripts, `workers.dev` subdomain, Workers domains, account tokens, Pages projects, and the Builds token registry (`GET /accounts/{account_id}/builds/tokens`); GitHub Pages state, secrets, variables.
- Capture the production baseline: for each route, `/404.html` via an unknown path, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and every `demo/public/img/**` path, record status, content type, headers, and SHA-256 of the decoded body from `https://bulma.com.au/`; save extracted visible text, link hrefs, and parsed JSON-LD per route into a disposable `mktemp -d` directory and a committed manifest `documents/guides/parity/production-baseline.json` (hashes, text digests, link lists; no full bodies).
- Take full-page reference screenshots of every route and interaction state at `1440x900` and `390x900` with `dev-browser`, light scheme emulated, after scrolling through the page and returning to top; store under `documents/guides/parity/screenshots/production/` as WebP.
- Run `demo/` validation once (`npm run lint`, `npm run build` only if no dev server is on port 3001, `npm test`) and record the per-route gzip JavaScript from `npm run performance:budgets`.
- Add a `## Workers Migration` section to `documents/guides/_hosting.md` with the inventory above, the token naming convention, and the parity manifest location.

**Success Criteria:**
- `documents/guides/parity/production-baseline.json` contains one entry per route and discovery file with status, content type, body SHA-256, visible-text SHA-256, sorted link list, and normalised JSON-LD; verify with `jq` that all 5 routes, 404, and 3 discovery files are present.
- 12 production reference screenshots exist (6 routes including 404 at 2 viewports) plus state screenshots for mobile menu open, pricing Yearly, FAQ open, contact error and success.
- `documents/guides/_hosting.md` records the Cloudflare inventory with account, zone, every DNS record ID, Workers list, `workers.dev` subdomain `webpop`, Pages project, tokens, and Builds token registry response.
- `demo/` lint and tests exit 0; the recorded gzip baselines match `demo/performance-budgets.json`.
- No Cloudflare resource, GitHub setting, branch, DNS record, or `demo/` source file changes.

### ~~Step 2: Scaffold the Astro project in `site/`~~ ✅ **COMPLETED**
**Objective:** Create the static-first project skeleton with the skill's mandatory structure and the pinned toolchain.

#### 2.1 High-Level Approach
- Create `site/` with pnpm: `package.json` (`"packageManager": "pnpm@11.22.0"`, `"engines": { "node": ">=22.23.1 <23" }`, scripts `dev`, `check`, `build` (`astro check && astro build && node scripts/generate-agent-markdown.mjs dist https://bulma.com.au && node scripts/generate-headers.mjs`), `preview`, `preview:static`, `test` (`pnpm test:unit && pnpm test:build-output && playwright test`), `test:unit`, `test:build-output`, `test:e2e`, `test:agent-a11y`, `worker:dev`, `worker:types`, `deploy` (`wrangler deploy`), `deploy:preview` (`wrangler versions upload --env preview`)), `pnpm-lock.yaml`, `tsconfig.json` extending `astro/tsconfigs/strict` with `"jsx": "react-jsx"`, `"jsxImportSource": "react"`, and `@/*` path alias to `src/*`.
- Install exact dependencies per REQ-1; copy `demo/LICENSE.md` to `site/LICENSE.md`.
- Write `astro.config.mjs` per REQ-2 with comments explaining `assetsInlineLimit: 0` and `inlineStylesheets: 'never'` as a coupled pair and the `prefetch` choice.
- Copy the skill's `assets/metadata/src/*`, `assets/llms-txt/src/*`, `assets/sitemap/sitemap.ts` and `sitemap.xml.ts`, `assets/third-party-scripts/*` into `site/src` and replace every template token with Bulma values; create `site/src/config/site.ts` from `siteMetadata` (name `Bulma`, `titleSeparator: ' | '`, language `en`, origin, default social image `/img/og/bulma-og-image.png` marked verified, email `solutions@bulma.com.au`, address, app URLs).
- Copy `assets/project-instructions/documents/AGENTS/*` to `documents/AGENTS/` (root `documents/`, not `site/`), adapt tokens, and leave root `AGENTS.md` for Step 11.
- Create `site/public/` with byte-identical copies of `demo/public/img/**`, `favicon.ico`, `scripts/referral-tracking.js`, `robots.txt`, and an initial `_headers` placeholder generated by Step 5.
- Add `site/` entries to the root `.gitignore` (`site/node_modules`, `site/dist`, `site/.astro`, `site/.wrangler`, `site/test-results`, `site/playwright-report`, `site/.dev.vars*`, `site/worker-configuration.d.ts` only if generated).

**Success Criteria:**
- `pnpm --dir /Users/sacino/bulma-root/site install --frozen-lockfile` exits 0 and `pnpm list --depth 0` shows `astro 7.3.x`, `@astrojs/react 6.x`, `react 19.2.x`, `three` equal to the version in `demo/package-lock.json`, `mixpanel-browser 2.73.0`, `wrangler 4.129.x`, and no `next`, `@tailwindplus/elements`, `@astrojs/cloudflare`, or `@astrojs/sitemap`.
- `pnpm --dir site check` and `pnpm --dir site build` exit 0 on the scaffold with a placeholder `index.astro`, producing `site/dist/index.html`, `site/dist/404.html`, `site/dist/robots.txt`, `site/dist/sitemap.xml`, and `site/dist/llms.txt`.
- `find site/public/img -type f | wc -l` equals the `demo/public/img` count and `shasum -a 256` manifests match file for file.
- `documents/AGENTS/` contains the six guides with zero `{{` tokens (`rg -n "\{\{" documents/AGENTS` returns nothing).
- `git -C /Users/sacino/bulma-root status --short` shows only `site/`, `documents/AGENTS/`, `.gitignore`, and files this plan owns.

### ~~Step 3: Port the design system, shell, fonts, metadata, structured data, analytics, and discovery files~~ ✅ **COMPLETED**
**Objective:** Make every page share one head, one layout, one stylesheet, and one analytics boot with production-identical output.

#### 3.1 High-Level Approach
- Move `demo/src/app/globals.css` to `site/src/styles/global.css` unchanged except: the `@theme` font variables point at the Fonts API variables (`--font-display: var(--font-mona-sans), sans-serif`, `--font-sans: var(--font-inter), system-ui, sans-serif`; keep `--font-display--font-variation-settings: 'wdth' 112.5`), and a `@view-transition { navigation: auto; }` rule is added beside the existing `::view-transition-old(root)` and `::view-transition-new(root)` rules and keyframes.
- Configure fonts per D-17 in `astro.config.mjs`; render `<Font cssVariable="--font-mona-sans" />` and `<Font cssVariable="--font-inter" />` in `BaseLayout.astro` head without `preload`.
- Build `site/src/layouts/BaseLayout.astro`: `<html lang="en" class="dark">`, `<meta name="color-scheme" content="dark">`, `<meta name="theme-color" content="#0a0d0e">`, dns-prefetch links, `rel="describedby"`, `PageMetadata.astro` once, `StructuredData.astro` once with the per-page graph, `SitewideHead`, skip link, navbar, `<main id="main-content" tabindex="-1" class="isolate overflow-clip">`, footer, `SitewideBodyEnd`, and the page script slots.
- Port `demo/src/lib/metadata.ts` route inputs to page-level `title`/`description` props; the resolver composes `X | Bulma` and the absolute homepage title exactly as Next did.
- Port `demo/src/schemas/organization-schema.ts` and `structured-data.tsx` into `site/src/lib/structured-data.ts` keeping every node, `@id`, field, and the serialiser's escaping; `StructuredData.astro` renders the array once per page.
- Port the navbar shell to `site/src/components/shell/Navbar.astro` (server markup identical to `navbar-with-links-actions-and-centered-logo.tsx`, including the inline `<style>` for `--scroll-padding-top`) and hydrate `NavbarController` plus `NavbarLinks` as one island with `currentPath` from `Astro.url.pathname`; port the footer to `Footer.astro` with the newsletter form island.
- Analytics: `site/src/lib/mixpanel-client.ts` (same config), `site/src/lib/analytics.ts`, and `site/src/scripts/analytics-boot.ts` (processed script imported by `BaseLayout.astro`) that reproduces `requestAnalyticsIdle`, initialises Mixpanel, tracks one `Page View` with `window.location.pathname`, and appends `referral-tracking.js` after `load`; development mode dispatches `bulma:mixpanel-disabled`.
- Discovery: `site/src/pages/robots.txt.ts` returning the production text verbatim; `site/src/pages/sitemap.xml.ts` producing the exact five-URL document with the production formatting; `site/src/pages/llms.txt.ts` rendering `site/src/config/llms.ts` (ported from `llms.js`) through the skill renderer, with `generate-llms-txt.js` validation rules ported into `site/test/discovery.test.ts`.

**Success Criteria:**
- `pnpm --dir site build` emits `dist/robots.txt`, `dist/sitemap.xml`, and `dist/llms.txt` whose SHA-256 equal the production hashes in `documents/guides/parity/production-baseline.json`.
- For every route, the built `<head>` contains exactly one `<title>`, one canonical, one `og:image`, one `application/ld+json` script; the title strings and descriptions equal the production values; parsed JSON-LD deep-equals the production graph after sorting keys.
- The built HTML contains `<html lang="en" class="dark"`, `color-scheme` `dark`, `theme-color` `#0a0d0e`, `rel="describedby"` pointing at `https://bulma.com.au/llms.txt`, and no `prefers-color-scheme` string (`rg -n "prefers-color-scheme" site/src site/dist` returns nothing).
- `dist/_astro/fonts/` contains only latin woff2 files for Mona Sans and Inter; no `<link rel="preload" as="font">` exists; the emitted `@font-face` for Mona Sans declares a `font-stretch` range and a variable weight range.
- With `dev-browser` at `1440x900`, the homepage H1 and the pricing H2 bounding-box widths match the production screenshots' element widths within 2 px.
- With Mixpanel, recorder, and Formspree hosts intercepted, one page load produces exactly one `Page View` with `url` and `page` equal to the pathname, `window.mixpanelLoaded === true`, a `bulma:mixpanel-ready` event, and one `Referral Source Identified` event; `import.meta.env.DEV` mode produces none and dispatches `bulma:mixpanel-disabled`.

### ~~Step 4: Port the pages and React islands~~ ✅ **COMPLETED**
**Objective:** Reproduce every route and interaction with the existing components as islands.

#### 4.1 High-Level Approach
- Copy `demo/src/components/{elements,icons,sections}`, `demo/src/hooks`, and `demo/src/lib/{mist-palette.ts,supported-lenders.ts}` into `site/src/components` and `site/src/lib`, removing `'use client'` directives and applying the replacement table in Section 4.3. Keep file names, export names, class strings, timings, and comments.
- Replace `HueShiftProvider` with `HueShiftController.tsx` (calls `useHueShift`, renders `null`) and mount it once on the homepage as an island.
- Create the per-page React section components listed in the route map under `site/src/components/pages/`, moving each `page.tsx` composition (FAQ entries, plans, features, stats, testimonials, team, copy) into them unchanged; keep `Plan`, `Faq`, `Feature`, `StatAnimated` data as plain objects where they were already data.
- Write `site/src/pages/index.astro`, `pricing/index.astro`, `about/index.astro`, `contact/index.astro`, `privacy-policy/index.astro`, and `404.astro` composing `BaseLayout` with metadata inputs, the structured-data graph, and the section islands with the directives in the route map.
- In `HeroDotPool`, replace `next/dynamic` with `React.lazy` plus `Suspense` gated by the existing `poolReady` state; keep `STAGE_CONFIG`, the scroll controller, and cleanup unchanged.
- Delete `page-transition.tsx`, `use-view-transition.ts`, and `use-dark-mode.ts`; `TransitionLink` becomes a plain anchor component with the same props and external-link logic.
- Verify each page in `dev-browser` against the production screenshots and the interaction list in Section 6.3; fix any hydration warning, layout shift, or timing difference before moving on.

**Success Criteria:**
- `pnpm --dir site check` reports 0 errors and 0 warnings; `pnpm --dir site build` exits 0.
- `rg -n "next/|'use client'|process.env" site/src` returns nothing.
- For every route, extracted visible text (whitespace-normalised) and the sorted list of `href` values equal the production manifest in `documents/guides/parity/production-baseline.json`.
- `site/dist` contains exactly one `<astro-island>` per planned island on each route (8 on `/`, 5 on `/pricing/`, 6 on `/about/`, 2 on `/contact/`, 1 on `/privacy-policy/`, 1 on the 404 page), each with the planned `client` directive; the counts are asserted in the build-output tests. The count includes the shared shell controller on every route.
- The Three.js chunk is a separate `dist/_astro/*.js` file that is not referenced by any `<script>` or `modulepreload` in `index.html` and is fetched after `loadEventEnd` in `dev-browser` (performance entries prove the order).
- Every scenario in Section 6.3 passes locally at `1440x900` and `390x900` with light scheme emulated: zero console errors, zero page errors, `document.documentElement.scrollWidth <= clientWidth`, `document.documentElement.classList.contains('dark') === true`.
- Full-page screenshots of every route at both viewports differ from the production references by at most 1.0% of pixels with the Dot Pool canvas region masked; the diff images are stored under `documents/guides/parity/screenshots/diff/` and named in `_hosting.md`.

### ~~Step 5: Add the Worker, negotiated Markdown, headers, and Wrangler configuration~~ ✅ **COMPLETED**
**Objective:** Deliver the Workers runtime contract locally before any hosted resource exists.

#### 5.1 High-Level Approach
- Copy `assets/agent-readable-http/src/lib/*`, `providers/cloudflare-workers/worker.ts`, `providers/shared.ts`, and `scripts/generate-agent-markdown.mjs` into `site/src/lib/agent-readable-http/`, `site/src/worker.ts`, and `site/scripts/`; run the generator after `astro build`.
- Write `site/wrangler.jsonc` per REQ-18 starting from the skill's Workers template and `taxgenie-root/wrangler.jsonc` (`$schema`, `run_worker_first` exclusions for every emitted asset extension present in `dist`), with `routes: []` until Step 8, and the `preview` environment block.
- Write `site/scripts/generate-headers.mjs`: reads `dist/**/*.html`, collects every inline `<script>` body, computes `sha256` hashes, and writes `dist/_headers` from `site/public/_headers.template` (the executor keeps the template under `site/public/` as `_headers` only if Astro copies it before the script rewrites it; otherwise the script owns `dist/_headers`). Directives per REQ-16; third-party origins are taken from the Step 3 interception log.
- Confirm the Worker copies `_headers` values onto document responses: if `document-response.ts` builds a new `Response` with a subset of headers, change it to clone every header from the `env.ASSETS.fetch` response before setting `Content-Type`, `Vary`, and validators.
- Run `wrangler types`, `wrangler deploy --dry-run --outdir /tmp/bulma-dry`, and `wrangler dev` against `dist`; run `deploy-cloudflare-workers-sites/scripts/verify-http-contract.mjs` with a project-owned manifest `site/test/http-contract.json` covering canonical pages, `/pricing` (no slash) redirect, unknown path, `/robots.txt`, `/sitemap.xml`, `/llms.txt` (UTF-8 marker), a `/_astro/*` asset, `Accept: text/markdown` on every route, `HEAD`, `406`, direct `/_agent-markdown/` block, and both cache orders.
- Read `workers-best-practices` and review `worker.ts` against it (no floating promises, no module state, explicit errors).

**Success Criteria:**
- `wrangler deploy --dry-run` exits 0 with `main` `src/worker.ts`, one `ASSETS` binding, no other binding, `compatibility_date` equal to the execution date, `workers_dev: false`, `preview_urls: false`; `--env preview` dry-run shows name `bulma-root-preview`, `workers_dev: true`, `preview_urls: true`, no routes.
- Under `wrangler dev`, every case in `site/test/http-contract.json` passes: `GET /` returns `200 text/html; charset=utf-8` with `Vary: Accept`, CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a body byte-identical to `dist/index.html`; `GET / Accept: text/markdown` returns `200 text/markdown; charset=utf-8` with `Vary: Accept` and the generated Markdown; `GET /pricing` returns `307` to `/pricing/`; `GET /__missing/` returns `404` with `dist/404.html` bytes for HTML and the Markdown recovery document for Markdown; `Accept: image/png` on a document returns `406`; `GET /_agent-markdown/index.md` returns `404`; `/llms.txt` returns `text/plain; charset=utf-8` and the `’` character intact; `/_astro/<hash>.css` returns `public, max-age=31536000, immutable`.
- `generate-headers.mjs` is deterministic: two consecutive builds produce identical `dist/_headers`; the file has at most 100 rules and every line is under 2,000 characters.
- In `dev-browser` against `wrangler dev`, every route and interaction runs with zero `securitypolicyviolation` events and zero console errors; the CSP report is recorded in `_hosting.md`.
- No production credential is used; `.dev.vars` is absent because the Worker needs no secret.

### ~~Step 6: Port the tests, add Playwright plus axe, and pass the local gate~~ ✅ **COMPLETED**
**Objective:** Make the parity, readiness, accessibility, and runtime contracts repeatable before anything is hosted.

#### 6.1 High-Level Approach
- Port `demo/test/*.test.mjs` into `site/test/*.test.ts` (Node runner via `node --experimental-strip-types --test`), rewriting source-structure assertions into `site/src` or `dist` assertions: agent readiness, analytics runtime with fake `window`, UI contracts (transition properties, target sizes, FAQ contracts, mobile dialog exit), CTA link targets, feature-card `h-full` wrappers, pricing toggle parity and timer ownership, performance regressions (LCP content never transparent, only content-hashed `/_astro/*` immutable, gzip per route at or below the `demo/performance-budgets.json` baselines, Mixpanel core at most 40 KiB gzip, Three.js chunk not referenced by initial HTML), About responsive images, and runtime pins.
- Add `site/scripts/validate-build.mjs`, `site/scripts/preview-server.mjs` (foreground static server on port `4331`), `site/playwright.config.ts` (desktop `1440x900` and mobile `390x900` projects, SwiftShader WebGL flags, `reuseExistingServer: false`, `colorScheme: 'light'`), the skill's `agent-accessibility.rules.ts`, `agent-accessibility.routes.ts`, `agent-accessibility.spec.ts`, `agent-readiness.config.ts`, `agent-readiness.spec.ts`, `content-checks.ts`, `robots-policy.ts`, and `verify-trust-pages.mjs`.
- Write `site/test/parity.spec.ts`: per route, per viewport, mask the Dot Pool canvas, scroll through, return to top, wait for animations, capture, and compare with `documents/guides/parity/screenshots/production/*` using pixelmatch threshold `0.1`, failing above 1.0% differing pixels; assert visible text and hrefs against the manifest; declare states (mobile menu open, Yearly, FAQ open, `#lenders` direct load, contact error and success with intercepted Formspree, plan tab keyboard movement).
- Run the full local gate: `pnpm --dir site check`, `pnpm --dir site build`, `pnpm --dir site test`, plus the `wrangler dev` HTTP contract from Step 5.
- Verify in `dev-browser` per `.cursor/rules/dev-browser.mdc` with side-by-side comparison against `demo/` on port `3001` for every route and state; record screenshot analysis in `_hosting.md`.

**Success Criteria:**
- `pnpm --dir site test` exits 0; the Node suite reports at least 33 passing tests; the Playwright run reports the agent-accessibility spec passing the canonical 33 axe rules on every built route and declared state in both projects with zero violations and no `exclude()` or `disableRules()`.
- `agent-readiness.spec.ts` passes CORE-03, CORE-13, CORE-14, CORE-16, CORE-17, and CORE-22 locally; `verify-trust-pages.mjs` reports About, Contact, and Privacy each above 500 page-specific characters.
- `parity.spec.ts` passes for all 6 routes at both viewports and every declared state; the maximum recorded pixel difference is written to `_hosting.md`.
- CLS measured by Playwright on every route is at most `0.005`.
- The per-route gzip JavaScript report shows every route at or below its `baselineInitialJavaScriptGzipBytes` and the values are recorded in `_hosting.md`.
- `demo/` tests still pass (`npm --prefix /Users/sacino/bulma-root/demo test` exits 0).

### ~~Step 7: Provision the Workers, the build token, and Workers Builds~~ ✅ **COMPLETED**
**Objective:** Create the minimum Cloudflare resources and the Git-connected release path without any custom domain.

#### 7.1 High-Level Approach
- Load the Global API Key per command from Keychain. Verify account `213ab3604485056376263d22fa242742` and the Super Administrator membership again.
- Create account API token `bulma-root-cloudflare-build-api-token` with the permission groups Workers Builds needs to deploy (query groups by name: `Workers Scripts Write`, `Workers Routes Write`, `Account Settings Read`, and any group the current `builds/tokens` API requires), scoped to the account; store the value, token ID, and Builds token UUID only in Keychain services `bulma-root-cloudflare-build-api-token`, `-id`, `-uuid`; verify with the token verify endpoint; record names only in `_hosting.md`.
- Bootstrap: from `site/`, `pnpm build`, then `wrangler deploy --env preview` (creates `bulma-root-preview` on `webpop.workers.dev`), then `wrangler deploy` with `routes: []` and `workers_dev: false` (creates `bulma-root` with no public hostname). If the production name is rejected because of the Pages project, delete Pages project `bulma-root` through the Pages API after recording its state, then retry; if still rejected, apply the `bulma-site` fallback across config, docs, and this plan.
- Upload a version: `wrangler versions upload --env preview --preview-alias migration` and run the HTTP contract plus the hosted browser matrix against the returned `workers.dev` preview URL.
- Skip the GitHub App grant: it was completed on 2026-09-04 and `Culpable/bulma-root` is visible in the Cloudflare dashboard's **Import a repository** list. Do not reopen `https://github.com/settings/installations` and do not ask the user to repeat it.
- Create the repository connection and two triggers per REQ-19 with environment variables `NODE_VERSION=22.23.1` and `PNPM_VERSION=11.22.0`. Attempt this by API first, in this order, recording the exact request and response for each attempt in `_hosting.md`: (1) re-probe the `builds` namespace for a connection-creation route, since D-3 records every path that returned `12000 Not found` on 2026-09-04 and Cloudflare may have shipped one since; (2) `wrangler` - check `wrangler --version` against the current release and run `wrangler help` for any Builds or Git subcommand; (3) the `config_autofill` route once a provider-account ID is obtainable. If every attempt fails, this is the one authorised pause in Steps 1-8: ask the user with the native question tool to create the connection at `https://dash.cloudflare.com/213ab3604485056376263d22fa242742/workers-and-pages` -> `bulma-root` -> **Settings** -> **Builds** -> **Connect**, supplying the exact values to enter (repository `Culpable/bulma-root`; production branch `main`; root directory `site`; build command `pnpm build`; deploy command `pnpm deploy`; preview deploy command `pnpm deploy:preview`; path includes `site/*`; variables `NODE_VERSION=22.23.1`, `PNPM_VERSION=11.22.0`). Wait for confirmation, verify the result through the read-only Builds endpoints, then continue Steps 7 and 8 autonomously without further questions.
- Trigger a production build for the current `main`. A preview build needs a throwaway branch; create and push one under the standing Steps 1-8 authorisation, verify the preview trigger fires, then delete the branch and record it in `_hosting.md`. If the preview trigger cannot be exercised this way, verify it by configuration read-back and note the residual risk.
- Write the deployment section of `_hosting.md`: Worker IDs, script tags, connection UUID, trigger UUIDs, token names, first build ID, version IDs, preview URL.

**Success Criteria:**
- Token verify returns `success: true`, `status: active`; the token policy lists only the recorded permission groups and only the target account; `security find-generic-password -s bulma-root-cloudflare-build-api-token -a jake.sacino@gmail.com` succeeds without printing the value in any log.
- `GET /accounts/{account_id}/workers/scripts` lists `bulma-root` (`has_assets: true`, `handlers: [fetch]`) and `bulma-root-preview`; `GET .../workers/scripts/bulma-root/subdomain` returns `enabled: false, previews_enabled: false`; the preview Worker returns `enabled: true, previews_enabled: true`.
- `GET /accounts/{account_id}/workers/domains` contains no `bulma.com.au` hostname.
- The `workers.dev` preview URL returns `X-Robots-Tag: noindex` on `/`, passes every `site/test/http-contract.json` case, and passes the Section 6.3 browser matrix at both viewports.
- Builds API shows one repository connection for `Culpable/bulma-root`, one production trigger (`branch_includes: ['main']`, `root_directory: 'site'`, `build_command: 'pnpm build'`, `deploy_command: 'pnpm deploy'`, `path_includes: ['site/*']`) and one preview trigger (`branch_excludes: ['main']`, `deploy_command: 'pnpm deploy:preview'`); the first production build reports `success` and its deployment version equals the version served by `bulma-root`.
- No DNS record, GitHub Pages setting, Pages production deployment, or custom domain changed; if the Pages project was deleted, `_hosting.md` records the deletion and its last deployment ID.

### Step 8: Attach `staging.bulma.com.au`, run the hosted proof, and request approval 🔄 **IN PROGRESS**
**Objective:** Put the production Worker on a real zone hostname and give the user everything needed to decide.

#### 8.1 High-Level Approach
- Commit the `site/` work and documentation changes on `main` under `<git_rules>` and push. The `<autonomy>` block authorises this push; do not stop to request it. Wait for the Workers Builds production build to succeed and confirm the deployed version.
- Refresh the DNS inventory in `_hosting.md`, then set `routes: [{ "pattern": "staging.bulma.com.au", "custom_domain": true }]` in `wrangler.jsonc` and deploy (or attach through `PUT /accounts/{account_id}/workers/domains` with `zone_id 0534ecfcfde9d322566af12ec11c1bef`); record the returned domain ID, certificate ID, and the DNS record Cloudflare created.
- Wait for certificate activation; verify authoritative NS answers and two public resolvers.
- Run the hosted proof against `https://staging.bulma.com.au/`: HTTP contract (all cases plus `X-Robots-Tag: noindex` on every document, asset, and discovery response), body parity (decoded bodies equal `dist`), IPv4 and IPv6, Brotli, HTTP/2 or HTTP/3, `cf-cache-status` warm and cold, HTML `cache-control` (`max-age=0, must-revalidate`; if a higher `max-age` appears, apply D-19), the Section 6.3 browser matrix with light-scheme emulation, analytics interception (sampled and unsampled), CSP violation count, parity screenshots against the production references, and `agent-readiness` hosted parity with `AGENT_READINESS_PREVIEW_URL=https://staging.bulma.com.au`.
- Run the Lighthouse matrix per REQ-23 (alternating host order, fresh profiles, `--only-categories=performance`, mobile and desktop presets) for production and staging; add one Accessibility, Best Practices, SEO, and Agentic Browsing run per route on staging; summarise medians, ranges, deltas, and the per-route gzip JavaScript table in `_hosting.md`.
- Present the user with `https://bulma.com.au/`, `https://staging.bulma.com.au/`, the parity result, the Lighthouse table, the CSP and header result, and the cutover packet (Section 6.3 item 9), then request explicit approval with the native question tool. Stop if approval is withheld; leave staging live.

**Success Criteria:**
- `GET /accounts/{account_id}/workers/domains` lists `staging.bulma.com.au` with `service: bulma-root`, `environment: production`, `zone_id 0534ecfcfde9d322566af12ec11c1bef`, and an active certificate; the only new DNS record is the one Cloudflare created for `staging`, and every pre-existing record matches the refreshed snapshot.
- `curl -I https://staging.bulma.com.au/` returns `200`, `server: cloudflare`, `X-Robots-Tag: noindex`, the CSP and security headers, `Vary: Accept`, `cache-control: public, max-age=0, must-revalidate`; `/_astro/*` returns the immutable policy; `/llms.txt` returns `text/plain; charset=utf-8`; `Accept: text/markdown` returns Markdown; an unknown path returns `404`.
- No response body, canonical, sitemap, llms, JSON-LD, or Open Graph value contains `staging.bulma.com.au` or `workers.dev` (`rg` over decoded bodies returns nothing).
- All 6 routes pass the parity gate on staging at both viewports (pixel diff at most 1.0%, identical text and hrefs), zero console errors, zero page errors, zero CSP violations, zero failed first-party requests, zero horizontal overflow, dark class present.
- Lighthouse: 150 standard reports complete (2 hosts x 5 routes x 10 mobile plus 2 hosts x 5 routes x 5 desktop); staging SEO scores are excluded from comparison because of the intentional noindex; every table row has median, min, max, delta, and delta %.
- Analytics interception on staging: one `Page View` per route load, referral event present, unsampled session requests no recorder, sampled session reaches the recorder load, no request completes to Mixpanel or Formspree.
- The approval request names both URLs, the parity numbers, the Lighthouse medians, and the rollback packet; the recorded answer is explicit before Step 9 starts.

### Step 9: Cut over `bulma.com.au` and `www.bulma.com.au`
**Objective:** Move production to the verified Worker version with an exact, tested rollback.

#### 9.1 High-Level Approach
- Begin only with the recorded approval. Re-query and commit the complete pre-cutover snapshot: every DNS record (all fields), zone settings, every ruleset phase entrypoint, Workers domains, the `bulma-root` active deployment and version ID, and the GitHub Pages state; write the cutover packet (source commit, Worker, version ID, staging URL, HTTP contract result, DNS before-state, intended after-state, code rollback, DNS rollback) to `_hosting.md` and commit it.
- Prepare rollback payloads: the four `A` record create bodies (from `_hosting.md`), the `www` record restore body, the redirect-rule disable call, and the custom-domain delete calls.
- Apex: add `{ "pattern": "bulma.com.au", "custom_domain": true }` to `routes` and deploy the already-verified version (or call the domains API); when Cloudflare reports conflicting records, accept the override through the changeset path so the three apex `A` records are replaced by Cloudflare's proxied record in one operation; if no override path is offered, apply the Section 3.2 conflict fallback.
- `www`: update record `c8e82fc2b97b87587bca888d574a8869` to `content 192.0.2.0`, `proxied: true`, comment `Proxied placeholder for canonical www redirect`; create the zone `http_request_dynamic_redirect` rule `Redirect www to the Bulma apex` with expression `(http.host eq "www.bulma.com.au")`, `308`, `preserve_query_string: true`, target `concat("https://bulma.com.au", http.request.uri.path)`.
- Verify production per Section 6.3 item 10, including Search Console-relevant checks (same canonical origin, `google-site-verification` TXT unchanged), IPv4 and IPv6, TLS certificate coverage for apex, and a three-run mobile Lighthouse sanity pass per route.
- If any gate fails: delete the apex custom domain and its auto-created record, recreate the three apex `A` records, restore the `www` record, disable the redirect rule, verify `https://bulma.com.au/` reports `server: GitHub.com`, and stop.
- After success: remove the staging custom domain (`DELETE /accounts/{account_id}/workers/domains/{id}`), delete its DNS record and certificate pack if Cloudflare left them, remove the `staging` `_headers` rule and the staging route from `wrangler.jsonc`, commit, push when authorised, and confirm the Builds deployment.

**Success Criteria:**
- The committed pre-cutover snapshot contains every record ID and field needed to recreate the four `A` records and the `www` record exactly, plus the redirect-rule and custom-domain rollback calls.
- `GET /accounts/{account_id}/workers/domains` lists `bulma.com.au` on `bulma-root` with an active certificate; DNS shows exactly one Cloudflare-created proxied apex record and no `185.199.*` apex record; `www` is `A 192.0.2.0` proxied; all other 12 records are byte-identical to the snapshot.
- `curl -I https://bulma.com.au/` returns `200`, `server: cloudflare`, no `X-Robots-Tag`, the CSP and security headers, `Vary: Accept`, `cache-control: public, max-age=0, must-revalidate`; `curl -I "https://www.bulma.com.au/pricing/?source=host-check"` returns one `308` with `location: https://bulma.com.au/pricing/?source=host-check`; unknown path `404`; `/_astro/*` immutable; `/llms.txt` charset; Markdown negotiation works on the apex.
- IPv4 and IPv6 both return `200` with identical decoded bodies; Brotli is negotiated for HTML, CSS, and JavaScript; HTTP/3 is available on a repeated request.
- The full browser matrix passes on the apex at both viewports; three mobile Lighthouse runs per route complete and are recorded.
- After staging removal, `GET .../workers/domains` no longer lists `staging.bulma.com.au`, `https://staging.bulma.com.au/` no longer resolves to the Worker, and `dist/_headers` on the deployed version has no staging rule.
- GitHub Pages is still enabled at the end of this step and the rollback payloads remain valid.

### Step 10: Decommission GitHub Pages, `demo/`, and the Cloudflare Pages resources
**Objective:** Leave one runnable app, one host, and one release path.

#### 10.1 High-Level Approach
- Disable GitHub Pages: `gh api -X DELETE repos/Culpable/bulma-root/pages`.
- Move to Trash with `trash`: `/Users/sacino/bulma-root/demo`, `/Users/sacino/bulma-root/.github/workflows/deploy.yml`, `/Users/sacino/bulma-root/CNAME`, `/Users/sacino/bulma-root/github-pages-setup.md`. Keep root `LICENSE.md`, `components/`, `pages/`, `tailwind.css`, `video/`, `files-to-change.md`, `CHANGELOG.md`.
- Delete Cloudflare Pages project `bulma-root` if Step 7 did not; revoke token `9dd6d8eb748379192f4d2d9b7fb4fc3b`; delete GitHub secret `CLOUDFLARE_PAGES_API_TOKEN` and variable `CLOUDFLARE_ACCOUNT_ID`.
- Move `documents/todo/cloudflare_pages_migration_plan.md` to `documents/learnings/todo_archive/` and prepend a note that this plan superseded it; mark this plan's status per the repository's plan conventions.
- Update `.vscode/launch.json` to the Astro dev command on port `4331`; update `.nvmrc` only if the pin changes (it does not).
- Run the full `site/` gate again and commit under `<git_rules>`; push only when authorised; wait for the Builds deployment and verify the apex serves that commit.

**Success Criteria:**
- `gh api repos/Culpable/bulma-root/pages` returns `404`; `https://bulma.com.au/` still returns `200` from Cloudflare.
- `ls /Users/sacino/bulma-root` shows no `demo`, `CNAME`, or `github-pages-setup.md`; `.github/workflows/` has no `deploy.yml`.
- `GET /accounts/{account_id}/pages/projects` returns no `bulma-root`; `GET /accounts/{account_id}/tokens` no longer lists `9dd6d8eb748379192f4d2d9b7fb4fc3b`; `gh secret list` and `gh variable list` show neither name.
- `documents/learnings/todo_archive/cloudflare_pages_migration_plan.md` exists with the superseded note; `documents/todo/cloudflare_pages_migration_plan.md` does not.
- `rg -n "GitHub Pages|github-pages|demo/|pages.dev|Cloudflare Pages" --glob '!documents/learnings/**' --glob '!documents/guides/_hosting.md'` returns only intentional historical mentions in this plan.
- The final Builds deployment SHA equals `git -C /Users/sacino/bulma-root rev-parse origin/main`.

### Step 11: Synchronise project documentation and rules
**Objective:** Make every binding document describe the Astro site, the Workers host, and the new commands.

#### 11.1 High-Level Approach
- `AGENTS.md`: replace the folder structure with `site/` (src/pages, layouts, components/{elements,icons,sections,pages,shell,head,scripts}, config, lib, scripts, styles, worker.ts, public, test, scripts, wrangler.jsonc, astro.config.mjs, playwright.config.ts); rewrite `<validation_commands>` (`cd site && pnpm check`, `pnpm build`, `pnpm test`, Wrangler HTTP contract), `<dev_server_policy>` (`cd site && pnpm dev` on `http://localhost:4331`, Playwright preview server rules, never `astro preview` for the suite), `<ui_verification>` (Playwright plus dev-browser), `<host_limits>` (Workers Static Assets with `_headers`, CSP, negotiated Markdown, immutable `/_astro/*`, no HSTS until approved), `<colour_scheme_rules>` and `<pricing_module_parity_rules>` paths (`site/src/styles/global.css`, `site/src/layouts/BaseLayout.astro`, `site/src/components/pages/*`), `<environments>` (Workers Builds, `bulma-root`, `bulma-root-preview`, `webpop.workers.dev`), and the architecture table (add `_hosting.md` and `documents/AGENTS/*`); add the `<worker_architecture>` and `<code_standards>` routes from the skill's `AGENTS.template.md`; remove the GitHub Pages fix command.
- `DESIGN.md`: Foundations (Astro 7 static, React islands, Tailwind v4 via Vite, Fonts API, Workers), Source map paths, Navigation (native view transitions), Retained but unreferenced list, Design Verification commands.
- `documents/guides/_animations.md`: file-structure paths, section 29 (native cross-document transitions, `@view-transition`, no `TransitionLink` navigation logic), section 55 (`React.lazy` mount, island directive), a new short section on island boundaries and hydration timing per route, and every `demo/src` path.
- `documents/guides/_hosting.md`: rename the title to `Hosting and Cloudflare Workers`, keep the Pages sections under a `Historical` heading, and hold the final release evidence per the deploy skill's completion contract.
- `README.md`: repo layout, `site/` commands, pnpm, Node, Workers Builds deployment, preview Worker, Playwright.
- `.cursor/rules/dev-browser.mdc`: local server policy for `site/` on port `4331` and the preview-server command.
- Run `post-change-documentation-sync` and reconcile any drift it reports.

**Success Criteria:**
- `rg -n "demo/|next|Next.js|npm run|3001|GitHub Pages|Cloudflare Pages|pages.dev" AGENTS.md DESIGN.md README.md .cursor/rules/dev-browser.mdc .vscode/launch.json documents/guides/_animations.md` returns nothing except explicit historical notes.
- `AGENTS.md` names `site/` as the only runnable app, `pnpm check && pnpm build && pnpm test` as the gate, port `4331`, Workers Builds as the deploy authority, the negotiated profile, the header policy, and links `documents/AGENTS/*` and `documents/guides/_hosting.md`.
- `documents/guides/_animations.md` references only paths that exist (`rg -o "site/src/[A-Za-z0-9_./-]+" documents/guides/_animations.md | sort -u | xargs -I{} test -e {}` reports no missing file).
- `post-change-documentation-sync` reports no unresolved drift.
- The final commit contains only files this plan owns; unrelated worktree changes remain intact.

---

## 6. Testing Plan

### 6.1 Source-of-Truth Regression Artefacts

| Artefact | Why it matters | Expected behaviour | Scope |
| --- | --- | --- | --- |
| `https://bulma.com.au/` at production revision `4a005a64b8b44b91d168602049cbef38867f79be` (five routes, 404, `robots.txt`, `sitemap.xml`, `llms.txt`, all images) | The visual and content parity target | Staging and later the apex match its text, hrefs, JSON-LD, discovery bytes, image bytes, and screenshots within the Section 3 gates | Full artefact, captured into `documents/guides/parity/production-baseline.json` and `screenshots/production/` in Step 1 |
| `demo/src/**` and `demo/public/**` at `HEAD` `f31143c` | Port source for every component, hook, style, script, copy string, and asset | Ported files keep names, exports, class strings, timings, and behaviour | Full tree until Step 10 removes it |
| `demo/test/*.test.mjs` (33 tests) | Existing behavioural contracts | Each assertion is ported or replaced by an equivalent output assertion; none is silently dropped | Full files |
| `demo/performance-budgets.json` | Per-route gzip JavaScript baselines and Mixpanel ceiling | `site` routes stay at or below each baseline | Route-level assertions |
| `documents/guides/_animations.md` and `DESIGN.md` | Animation and visual contracts | Every documented timing, trigger, state, cleanup, and fallback is observed on the ported site | Full documents |
| `documents/guides/_hosting.md` DNS snapshot and rollback payloads | Exact rollback source | Refreshed before every DNS write; payloads recreate the four `A` records exactly | Every record for apex and `www` |
| Cloudflare zone `0534ecfcfde9d322566af12ec11c1bef` live records, settings, rulesets, Workers domains | Cutover safety boundary | Only the four web `A` records change; all other records byte-identical | Full inventory |
| `/Users/sacino/taxgenie-root` (`astro.config.mjs`, `wrangler.jsonc`, `public/_headers`, `src/worker.ts`, `playwright.config.ts`, `scripts/*`, plan Step 10 record) and live `https://taxgenie.com.au/` headers | Proven pattern in the same account | Configuration shape and hosted behaviour are reproduced, and its missing HTML CSP is not repeated | Pattern reference only |
| `demo/public/llms.txt`, `robots.txt`, `sitemap.xml` | Discovery byte targets | Byte-identical output from Astro endpoints | Full files |
| `demo/src/app/contact/contact-form.tsx` | Contact contract | Same endpoint, four fields, states, and events; tests never send a real request | Full contract |
| `demo/src/lib/mixpanelClient.js`, `MixpanelProvider.jsx`, `analytics.js`, `public/scripts/referral-tracking.js` | Analytics contract | Same options, timing, events, globals, and sampling | Full runtime contract |

<critical_warning>
> **CRITICAL WARNING:** The production site, the `demo/` source tree, the live DNS records, and the recorded rollback payloads are the parity and rollback sources of truth. Do not replace them with a rebuilt Next export, a redesigned reference, hand-typed DNS values, or assumptions from this plan. The screenshot references must be captured from `https://bulma.com.au/` in Step 1 and never regenerated from the Astro site.
</critical_warning>

### 6.2 Unit Tests

| Test Case | Component | Expected Result |
| --- | --- | --- |
| `site/test/discovery.test.ts` (Node) | `llms.txt`, `robots.txt`, `sitemap.xml` endpoints | Bytes equal the production hashes; llms rules (subject, promotional terms, minimum lengths, canonical link order, UTF-8) pass |
| `site/test/metadata.test.ts` (Node) | `metadata.ts`, `structured-data.ts` | Titles, descriptions, canonicals, and JSON-LD per route equal production; serialiser escapes `<`, `</script>`, U+2028, U+2029 |
| `site/test/analytics-runtime.test.ts` (Node, fake `window`) | `mixpanel-client.ts`, `analytics-boot.ts`, `referral-tracking.js` | Init options unchanged, load-then-idle schedule, one Page View, readiness events, first-touch operations, no real request |
| `site/test/ui-contracts.test.ts` (Node) | Ported components | No `prefers-reduced-motion` or `prefers-color-scheme`, target sizes, press feedback, FAQ enter/leave contracts, mobile dialog exit, longhand transitions |
| `site/test/build-output.test.ts` (Node, after build) | `dist` | Route files, `404.html`, island counts and directives per route, Three.js chunk not initially referenced, `_headers` rules and hashes, `/_astro/*` only immutable, no `staging`/`workers.dev` strings in discovery output, gzip per route at or below baseline, Mixpanel core at most 40 KiB gzip |
| `site/test/images.test.ts` (Node) | `public/img` and About markup | Byte-identical files, About 640-px candidates and attributes unchanged |
| `site/test/pricing-toggle.test.ts` (Node) | Pricing toggle shared tokens and timers | Homepage and pricing toggles share every token; latest animation owns the timer |
| `site/test/http-contract.json` via `verify-http-contract.mjs` | Worker under `wrangler dev`, staging, apex | Every case in Step 5 passes at each environment |
| `site/test/agent-accessibility.spec.ts` (Playwright + axe) | Every built route and declared state, desktop and mobile | Zero violations across the 33 canonical rules |
| `site/test/agent-readiness.spec.ts` (Playwright) | Every indexable route | Direct 200 HTML without JavaScript, one H1, one `main`, self-canonical, no redirect stubs, agent user-agent parity, hidden-content scan reviewed |
| `site/test/parity.spec.ts` (Playwright) | Every route and state at both viewports | Text and href equality, screenshot diff at most 1.0% with canvas masked, CLS at most 0.005, dark class under light emulation |

### 6.3 Integration Tests

1. **Local Worker contract**
   - Action: `pnpm build`, `wrangler dev`, run `verify-http-contract.mjs` with `site/test/http-contract.json`.
   - Expected: All cases in Step 5 pass, including Markdown negotiation, `406`, `HEAD`, both 404 forms, internal-prefix block, `Vary: Accept`, CSP on documents.
   - Verify: Runner output stored in `_hosting.md`.

2. **Dark-only responsive rendering**
   - Action: Open every route at `1440x900` and `390x900` with `prefers-color-scheme: light` emulated, locally, on the `workers.dev` preview, on staging, and on the apex.
   - Expected: Dark class present, no overflow, no console or page errors, no CSP violations, no failed first-party requests.
   - Verify: `dev-browser` DOM checks and Playwright assertions; screenshots with absolute paths.

3. **Navigation and hash contracts**
   - Action: Click navbar links, footer links, CTAs; load `/#lenders` directly; click a same-page `#lenders` link; click `#supported-lenders`; use the mobile menu open, link, close, and Escape paths.
   - Expected: Native view transition runs on supporting browsers; `#lenders` expands `#lenders-question` and unhides `#lenders-answer` in both paths; mobile dialog transitions through its exit state before closing; `aria-current="page"` on the active link.
   - Verify: URL, ARIA state, `hidden` attribute, and transition timing checks.

4. **Homepage animations**
   - Action: Load `/`, wait for `load`, observe the Dot Pool mount, pointer ripples, the pinned screenshot growing from 72% to full width, still water under the frame, fade at the lenders field, blur-transition headline cycling without layout shift, hue-shift variable changes between sections, counters, luminance sweep, spotlight, magnetic wrappers, testimonial glass hover, FAQ glow trail, rapid FAQ reversal.
   - Expected: Behaviour matches `documents/guides/_animations.md` sections 4 through 55; Three.js chunk requested after `loadEventEnd`; WebGL-blocked run keeps the hero usable; canvas disposed on navigation away.
   - Verify: Performance entries, `data-dot-pool-ready`, computed styles, and screenshots after settle.

5. **Pricing states**
   - Action: Toggle Monthly and Yearly on `/` and `/pricing/`; use ArrowLeft, ArrowRight, Home, End on the mobile plan tabs; open pricing FAQs.
   - Expected: `aria-selected` toggles, Solo shows `$490 /year` and `Save $98 compared with monthly`, exact annual callout copy, equal-height desktop cards after animation settles, one active mobile panel.
   - Verify: Text, ARIA, bounding-box heights.

6. **Contact form**
   - Action: Intercept `https://formspree.io/f/xojvwybl`; submit valid data with a mocked `500` then a mocked `200`.
   - Expected: POST with exactly `form_source`, `name`, `email`, `message`; error panel with mailto fallback (`role="alert"`), pending status, success status with animated checkmark and `aria-label` `Message sent`; `Form Error` and `Form Submitted` events observed; no request completes.
   - Verify: Intercepted request metadata and DOM state.

7. **Analytics**
   - Action: Intercept Mixpanel, recorder, and Formspree hosts; load each route; force sampled and unsampled sessions; load with a Google Ads referral query.
   - Expected: One Page View per load with pathname, `Referral Source Identified` with campaign fields, `set_once`/`register_once` calls, recorder loaded only when sampled, development mode disables everything.
   - Verify: Intercepted payloads and globals.

8. **Hosted preview and staging**
   - Action: Repeat items 1 through 7 on the `workers.dev` preview URL and on `https://staging.bulma.com.au/`; run the Lighthouse matrix; run hosted agent-readiness parity.
   - Expected: `X-Robots-Tag: noindex` on every staging and preview response; no preview host in discovery output; parity gates pass; Lighthouse tables complete.
   - Verify: `curl`, Playwright with the hosted base URL, Lighthouse JSON.

9. **Cutover packet and rollback rehearsal**
   - Action: Before DNS changes, validate the recorded `A` record payloads against the live snapshot, dry-run the custom-domain attach, and confirm the redirect-rule and domain-delete calls resolve to existing IDs.
   - Expected: Payloads match field for field; every rollback call has a concrete target.
   - Verify: JSON comparison; command help output recorded.

10. **Production verification**
    - Action: After cutover, request apex, `www` with path and query, unknown path, discovery files, an `/_astro/*` asset, Markdown negotiation, IPv4 and IPv6, Brotli, HTTP/3; run the browser matrix and three mobile Lighthouse runs per route.
    - Expected: Every Step 9 criterion holds; GitHub Pages still enabled until Step 10.
    - Verify: `curl`, Cloudflare APIs, Playwright, Lighthouse.

11. **Decommission verification**
    - Action: After Step 10, query GitHub Pages, Pages projects, tokens, secrets, and the repository tree; run the full `site/` gate.
    - Expected: All removals confirmed; apex unaffected; final Builds deployment equals `origin/main`.
    - Verify: `gh api`, Cloudflare API, `ls`, `rg`, and the Builds API.
