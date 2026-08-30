# Cloudflare Pages Migration Plan 🔄 **IN PROGRESS**

<critical_warning>
> **CRITICAL WARNING:** Connecting `bulma.com.au` to Cloudflare Pages changes production DNS and activates zone delivery settings. Immediately before that change, the executor must record the complete live state of every `bulma.com.au` and `www.bulma.com.au` DNS record, every named delivery setting, and every ruleset in `documents/guides/_hosting.md`. Only the recorded web-serving A records and `browser_cache_ttl` may change. MX, TXT, mail, verification, nameserver, unrelated settings, and unrelated Cloudflare resources must not change. GitHub Pages must remain live until the Cloudflare custom domain passes every hosted check so the recorded A records and `browser_cache_ttl: 14400` can restore the prior state immediately.
</critical_warning>

<important_note>
> **IMPORTANT NOTE:** Use Cloudflare Pages Direct Upload with GitHub Actions. This is the only path supported by the currently verified machine connections without a Cloudflare dashboard or GitHub App authorisation step. Cloudflare does not allow a Direct Upload Pages project to be converted to native Git integration later; changing that deployment model would require a new Pages project. All technical work remains agent-run, but the agent must pause after publishing the comparison URL and obtain the user's approval before connecting the production domain.
</important_note>

## 1. Goal

Move the existing Bulma marketing site from GitHub Pages to Cloudflare Pages without changing the framework, rendered site, URL policy, canonical origin, or client behaviour.

The migration must first publish the same committed static export to a noindexed Cloudflare preview hostname. The user must be able to open the GitHub Pages production URL and Cloudflare preview URL side by side and receive a repeatable speed comparison before any production DNS change. After approval, the agent must connect `bulma.com.au`, preserve `www.bulma.com.au` as a one-hop redirect to the apex, make Cloudflare Pages the only continuous deployment target, and retire GitHub Pages.

The user subsequently authorised a second noindexed comparison deployment containing the complete local implementation from `documents/todo/agent_readiness_and_page_speed_plan.md`. That intermediate preview was an application-and-host comparison against the older GitHub Pages build. The readiness and performance work is now committed as `854b85f576910a5a5c3576bdf9fef62a6da4df81`, deployed successfully to GitHub Pages, and published as a clean Cloudflare preview from the same commit. The final Step 5 comparison therefore uses matched source and rendered behaviour; only provider-controlled delivery headers and independently generated Next.js build identifiers differ.

The migration is complete when:

- The app remains Next.js `16.1.5` with `output: 'export'`; no Astro conversion occurs.
- The exact same commit and static output are verified on GitHub Pages and a Cloudflare preview before cutover.
- A comparison report names both URLs and records reproducible median Lighthouse and network timings.
- The remaining representative unused-JavaScript opportunity falls from `103-170 KiB` to the route budgets in REQ-19 on both hosts without delaying code merely to hide it from Lighthouse.
- The About image-delivery opportunity, shared JavaScript, render-blocking diagnosis, and Cloudflare delivery settings all pass their regression gates before the cutover decision is reopened.
- No custom domain, DNS record, or production Pages deployment changes before the user approves cutover.
- `https://bulma.com.au/` is served by Cloudflare Pages with the existing route, trailing-slash, canonical, sitemap, robots, 404, form, analytics, and dark-only contracts intact.
- `https://www.bulma.com.au/<path>?<query>` returns one permanent redirect to the matching apex path and query.
- The Cloudflare `pages.dev` production and preview hostnames redirect to the canonical apex after cutover.
- GitHub Actions deploys `demo/out` to Cloudflare Pages from `main`, and GitHub Pages is disabled only after the live Cloudflare deployment passes all checks.
- Every Cloudflare and GitHub action is performed through the existing Keychain credential, Cloudflare API, Wrangler, and `gh`; no dashboard or manual DNS work is required.

---

## 2. Current State Analysis

### 2.1 Current Application and Build

- Repository: `Culpable/bulma-root`, GitHub repository ID `R_kgDOQyhlxg`.
- Default branch: `main`.
- Runnable app: `/Users/sacino/bulma-root/demo`.
- Framework: Next.js `16.1.5`, React `19.2.4`, npm lockfile version `3`.
- Runtime: Node.js `22.23.1`, pinned in `.nvmrc`, `demo/package.json`, and `.github/workflows/deploy.yml`.
- Static configuration: `demo/next.config.ts` sets `output: 'export'`, empty `basePath`, unoptimised images, and `trailingSlash: true`.
- Build command: `npm run build`, which creates `demo/out` and then regenerates `demo/public/sitemap.xml`.
- `demo/src/scripts/generate-sitemap.js` stamps build time into sitemap entries. Two independent builds of the same commit are therefore not guaranteed to produce byte-identical output. The comparison must reuse the exact `github-pages` artifact from one successful workflow run rather than rebuilding once per host.
- Current inspected export: 183 files, 6,770,784 uncompressed bytes, largest file 488,911 bytes. Cloudflare parses `_headers` rather than serving it, so the hosted export exposes 182 files. This remains below Wrangler Direct Upload's 20,000-file and 25 MiB-per-file limits.
- Runtime services remain browser-side: the contact form posts to Formspree form `xojvwybl`, and Mixpanel uses the existing public project token. There is no application server, database, API route, middleware, Pages Function, or Worker.
- Canonical and discovery output use `https://bulma.com.au`; `demo/public/robots.txt` points to `https://bulma.com.au/sitemap.xml`.
- `NEXT_PUBLIC_SITE_URL` is not set in the current local environment; production code falls back to `https://bulma.com.au`.

### 2.2 Current GitHub Pages Flow

```mermaid
flowchart LR
    PUSH["Push to main"] --> GHA["GitHub Actions deploy.yml"]
    GHA --> BUILD["npm ci and npm run build in demo"]
    BUILD --> OUT["demo/out static export"]
    OUT --> GHP["GitHub Pages"]
    DNS["A records for apex and www"] --> GHP
    GHP --> APEX["https://bulma.com.au/"]
    GHP --> WWW["www redirects to apex"]
```

- `.github/workflows/deploy.yml` builds on pushes to `main` and uploads `demo/out` with `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`.
- The GitHub Pages API reports `build_type: workflow`, `status: built`, `cname: bulma.com.au`, and enforced HTTPS.
- `demo/public/CNAME` and the root `CNAME` both contain `bulma.com.au`.
- Live HTML responses report `server: GitHub.com` and `Cache-Control: max-age=600`.
- `https://www.bulma.com.au/` currently redirects once to `https://bulma.com.au/`.
- Unknown paths return the built custom `404.html` with HTTP 404.

### 2.3 Verified Cloudflare Control Plane

Use these identifiers as validation targets, but query them again before every write:

| Resource | Verified value |
| --- | --- |
| Cloudflare account | `Jake.sacino@gmail.com's Account` |
| Account ID | `213ab3604485056376263d22fa242742` |
| Zone | `bulma.com.au` |
| Zone ID | `0534ecfcfde9d322566af12ec11c1bef` |
| Zone status | Active, full setup, not paused |
| Nameservers | `vita.ns.cloudflare.com`, `will.ns.cloudflare.com` |
| Cloudflare credential | macOS Keychain service `cloudflare-global-api-key`, account `jake.sacino@gmail.com` |
| Cloudflare member role | Super Administrator - All Privileges |
| Pages project | `bulma-root`, project ID `d427c772-9189-45c4-ab72-e83683e233ea` |
| Pages project state | Direct Upload, `source: null`, production branch `main`, `uses_functions: false` |
| Pages domains | `bulma-root.pages.dev` only; no custom domain |
| Current clean comparison deployment | `62181028-c315-4134-b11b-7c61971bc9f6`, branch `cloudflare-comparison`, commit `854b85f576910a5a5c3576bdf9fef62a6da4df81` |
| Pages production deployment | None |
| Existing account-owned deploy token | `bulma-root-cloudflare-pages-deploy`, token ID `9dd6d8eb748379192f4d2d9b7fb4fc3b` |
| Existing account redirect lists | None |
| Existing account `http_request_redirect` ruleset | None |
| Existing active zone Page Rules | None |
| Existing custom zone rulesets | None; only Cloudflare-managed normalisation, WAF, and DDoS rulesets exist |
| Existing proxied DNS records | None |

The selected Pages project name is `bulma-root`, and the current noindexed comparison alias is `https://cloudflare-comparison.bulma-root.pages.dev/`. Query the project API before every deployment and use the returned `name`, `subdomain`, and deployment identifiers instead of assuming this recorded state is still current.

The target account exposes the `Pages Write` permission group with ID `8d28297797f24fb8a0c332fe0866ec89` and the `Account API Tokens Write` permission group with ID `5bc3f8b21c554832afc660159ab75fa4`. The existing deploy token has only `Pages Write` on the target account. The executor must query permission groups and the token policy again by name instead of assuming the recorded IDs or scope remain unchanged.

#### Current Cloudflare Delivery Settings

These zone settings do not affect the current DNS-only GitHub Pages records or the `pages.dev` preview. They become relevant when `bulma.com.au` is proxied to Pages:

| Setting | Current value | Planned treatment |
| --- | --- | --- |
| Plan | Free Website | Preserve |
| Brotli | On | Preserve; verify `br` on compressible custom-domain responses |
| HTTP/2 | On, not editable | Preserve |
| HTTP/3 | On | Preserve; verify browser negotiation after custom-domain activation |
| TLS 1.3 | On | Preserve |
| IPv6 | On | Preserve; re-run IPv4 and IPv6 checks |
| Cache level | Aggressive | Preserve; Pages already supplies its own static-asset and Tiered Cache behaviour |
| Browser Cache TTL | 14,400 seconds | Before the apex becomes proxied, change the zone value to `0` (`Respect Existing Headers`) so Pages HTML keeps revalidation and hashed assets keep their longer `_headers` value; restore 14,400 on rollback |
| Development Mode | Off | Preserve |
| Early Hints zone toggle | Off | Preserve; Pages enables Early Hints automatically on `pages.dev` and custom domains |
| Speed Brain | Off | Preserve during migration; Next.js already prefetches internal links, and a zone-wide speculative-fetch change lacks a no-regression result |
| 0-RTT | Off | Preserve; it is zone-wide and is not required to solve the measured cold-render gap |
| Rocket Loader | Off | Preserve; script rewriting would risk Next.js hydration, analytics ordering, and animation timing |
| Polish and Mirage | Off, not editable on this plan | Preserve; use repository-owned responsive image variants instead |

The zone currently has no proxied DNS records, custom Cache Rules, compression rules, configuration rules, redirect rules, or active Page Rules. Record the complete live settings and rulesets again before changing Browser Cache TTL.

### 2.4 Current DNS Baseline

This is the inspected baseline, not a substitute for the mandatory pre-cutover refresh:

| Record ID | Type | Name | Content | Proxied | TTL | Comment |
| --- | --- | --- | --- | --- | --- | --- |
| `f4126d8a14cbaef48bdb01475469868a` | A | `bulma.com.au` | `185.199.111.153` | No | Auto | None |
| `5c2d843829044e88737e52479e6059f4` | A | `bulma.com.au` | `185.199.110.153` | No | Auto | None |
| `31b4ad370c84b9fd0c443af8af34f096` | A | `bulma.com.au` | `185.199.108.153` | No | Auto | None |
| `00832e9d4a08edb5072892b6cba436a1` | MX | `bulma.com.au` | `bulma-com-au.mail.protection.outlook.com` | No | 3600 | None |
| `b6ff3371f8fefbd584bf8c6a30afe7d7` | TXT | `bulma.com.au` | `v=spf1 include:spf.protection.outlook.com ~all` | No | 3600 | None |
| `c27e9cb54e6e6a0a93132dbf71c34da3` | TXT | `bulma.com.au` | `MS=ms59823863` | No | 3600 | None |
| `0b3b817b0b6f152c44ba7a5018dd5e7c` | TXT | `bulma.com.au` | `google-site-verification=0tckke5_vKtAzc4213cMKkKfJCBOwhYwTdA3Pe9hE0o` | No | Auto | Existing Google Search Console comment; capture exact live text during the pre-cutover refresh |
| `c8e82fc2b97b87587bca888d574a8869` | A | `www.bulma.com.au` | `185.199.109.153` | No | Auto | None |

Only the four A records are web-host migration targets. The missing fourth GitHub apex address and the single `www` address are current facts, not errors to correct during this migration.

### 2.5 Files and Documentation Tied to GitHub Pages

- `.github/workflows/deploy.yml` owns the current deployment.
- `demo/public/CNAME` and root `CNAME` are GitHub Pages host files.
- `demo/next.config.ts` contains GitHub Pages-specific comments, while its static-export settings remain valid for Cloudflare Pages.
- `README.md`, `github-pages-setup.md`, and the environment/folder descriptions in `AGENTS.md` identify GitHub Pages as production.
- `demo/test/runtime-and-browser-rules.test.mjs` reads `github-pages-setup.md` and asserts the Node pin in the current workflow.
- `documents/todo/agent_readiness_and_page_speed_plan.md` is implemented in commit `854b85f576910a5a5c3576bdf9fef62a6da4df81`, which both hosts now serve. The remaining speed work in this plan must start from that committed state and must not include unrelated working-tree changes.

### 2.6 Core Migration Risks

- Direct Upload is a durable project-type decision; native Git integration would require a replacement project later.
- The production `pages.dev` alias is not the comparison host. The initial deployment must use the non-production branch alias `cloudflare-comparison.<project>.pages.dev`, which Cloudflare marks with `X-Robots-Tag: noindex`.
- A speed comparison is invalid if the hosts serve different commits or bodies. The comparison must use one verified commit and matching response-body hashes.
- A later user-authorised readiness comparison may intentionally serve different bodies. Label every such result as a combined application-and-host delta, keep the original matched-artifact benchmark as the host-only baseline, and never use the combined delta alone to justify production cutover.
- A separately rebuilt export is not an equivalent comparison artifact because the current sitemap includes build-time values. Download the exact unexpired `github-pages` Actions artifact that GitHub deployed and upload its extracted contents to Cloudflare.
- Pages domain association and conflicting GitHub A records can change DNS. The association must be created first, then only the snapshotted A records may be replaced if Cloudflare has not created the required proxied CNAME records.
- Bulk Redirects are account-level resources. Any existing lists or account rules that appear before execution must be preserved byte-for-byte when adding Bulma's canonical-host redirects.
- Formspree submissions communicate externally. Hosted verification must intercept the request and inspect it without sending a real enquiry.

### 2.7 Remaining Speed Baseline and Investigation

The current commit-matched baseline contains 30 Lighthouse `13.4.1` mobile reports, three runs per host and route. The values below are route-and-host medians from the saved JSON, not single-run estimates:

| Route | CF unused JS | GH unused JS | CF document | GH document | CF render-blocking FCP estimate | GH render-blocking FCP estimate | CF main thread | GH main thread | Image waste |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 159 KiB | 170 KiB | 443 ms | 131 ms | 750 ms | 250 ms | 2,100 ms | 2,140 ms | 0 KiB |
| `/about/` | 111 KiB | 120 KiB | 407 ms | 66 ms | 850 ms | 100 ms | 1,271 ms | 1,318 ms | 46 KiB |
| `/pricing/` | 132 KiB | 142 KiB | 408 ms | 79 ms | 0 ms | 250 ms | 2,034 ms | 2,381 ms | 0 KiB |
| `/contact/` | 111 KiB | 121 KiB | 417 ms | 54 ms | 850 ms | 250 ms | 1,085 ms | 974 ms | 0 KiB |
| `/privacy-policy/` | 103 KiB | 124 KiB | 416 ms | 61 ms | 850 ms | 250 ms | 1,153 ms | 820 ms | 0 KiB |

The saved reports and a current Turbopack production analysis identify these causes and boundaries:

| Finding | Evidence | Planning decision |
| --- | --- | --- |
| Mixpanel is the dominant shared removable payload | `mixpanel-browser/dist/mixpanel.module.js` contributes about 95,277 compressed bytes to every route; Lighthouse attributes about 66-76 KiB of unused bytes to its current chunk | Import Mixpanel's official async-recorder entry point so the core remains on every session and the recorder loads only for the existing 20% sample. Keep the current load/idle schedule and every analytics option |
| The official async-recorder entry point is materially smaller | A disposable esbuild spike measured the installed `2.73.0` default entry at 100,243 gzip bytes and `loader-module-with-async-recorder` at 31,513 gzip bytes | Use the official async entry point first. Reject any result whose built core chunk exceeds 40 KiB gzip or changes event/replay behaviour |
| Three.js is the homepage-specific floor | Lighthouse attributes about 52 KiB of unused bytes to the deferred Dot Pool chunk | Preserve the animation and current package entry. A disposable named-import build measured 119,938 gzip bytes; deep `three/src` imports measured 123,691 gzip bytes, so deep imports are a measured regression rather than a remedy |
| Tailwind Plus is removable from active client routes | `@tailwindplus/elements/dist/index.js` contributes about 22,825 compressed bytes on Home and Pricing | Replace only the active FAQ and mobile plan-tab controllers with local equivalents that preserve the exact animation, hash, ARIA, keyboard, focus, and rapid-reversal contracts. Leave inactive reference components alone unless they enter a shipped route |
| Shared button code contains a dead client boundary | `preloadOnHover` and `preloadAnimationComponents` have no caller, while `button.tsx` is marked client-only to support them | Remove the unused prop, callbacks, imports, helper module, and duplicate homepage export; keep the rendered classes and interaction states byte-for-byte equivalent |
| Framework/router code is not a local optimisation target | The shared React/Next chunk contributes about 70 KiB transfer and 23-29 KiB representative unused code | Do not fork or replace framework internals. Reassess only after the owned modules above are removed |

The two render-blocking stylesheets are 162,721 and 3,422 uncompressed bytes and transfer at about 25.5 KiB and 1.3 KiB. Lighthouse reports zero removable CSS bytes. Inlining them would duplicate shared CSS into every document and remove cross-page cache reuse. Preserve the current stylesheet model unless a disposable critical-CSS experiment passes the Step 5F non-inferiority gate on both hosts.

The About mobile audit identifies the 1,400x1,000 testimonial portrait and 720x378 hero photo. They transfer 32,020 and 23,032 bytes while rendering at 348x249 and 364x191 CSS pixels in the mobile profile. Disposable 640-pixel-wide quality-80 WebP candidates measured 10,240 and 20,224 bytes. Use those only after source-image and screenshot comparison proves no visible regression; preserve the existing larger candidates for wider or higher-density displays.

The local IPv4 and IPv6 checks returned HTTP 200 on both hosts and did not reproduce the approximately 400 ms Cloudflare document time observed by Lighthouse. The remaining regional evidence gap is browser rendering, not Melbourne/Sydney transport: Globalping already supplies fixed-probe HTTP measurements in both cities, while Cloudflare's Speed API currently exposes 50 page tests and a Sydney browser region (`australia-southeast1`) but no Melbourne browser region. Step 5G therefore uses the Speed API for Sydney render metrics and keeps Melbourne explicitly transport-only.

---

## 3. Desired State

### 3.1 Desired State Requirements

- **REQ-1 (MUST):** Keep Next.js static export with Node.js `22.23.1`, npm, `demo/out`, empty `basePath`, and `trailingSlash: true`.
- **REQ-2 (MUST NOT):** Do not convert to Astro or add `@astrojs/cloudflare`, `@opennextjs/cloudflare`, a Worker, Pages Functions, `functions/`, `_worker.js`, `_routes.json`, runtime bindings, compatibility flags, or server-rendered routes.
- **REQ-3 (MUST):** Create a Cloudflare Pages Direct Upload project in account `213ab3604485056376263d22fa242742` with production branch `main`.
- **REQ-4 (MUST):** Build and deploy one committed revision to the preview branch alias `cloudflare-comparison.<project>.pages.dev` before creating a production Pages deployment or custom domain.
- **REQ-5 (MUST):** Keep canonicals, Open Graph URLs, sitemap URLs, JSON-LD URLs, and `robots.txt` fixed to `https://bulma.com.au`; no `pages.dev`, branch, local, or deployment-specific hostname may enter built discovery output.
- **REQ-6 (MUST):** Verify `X-Robots-Tag: noindex` on the comparison alias and deployment-specific preview URL before sharing either URL.
- **REQ-7 (MUST):** Produce a repeatable comparison of GitHub Pages and Cloudflare Pages from the same machine, commit, routes, viewports, Lighthouse version, and run count.
- **REQ-8 (MUST):** Present the user with both direct URLs and the comparison result, then wait for explicit approval before the first custom-domain, production DNS, or GitHub Pages decommissioning action.
- **REQ-9 (MUST):** Perform all Cloudflare work through the Keychain credential, Cloudflare API, and Wrangler; perform all GitHub work through Git and `gh`. Do not require dashboard clicks, manual DNS changes, copied secrets, or a manually installed GitHub App.
- **REQ-10 (MUST):** Create an account-owned token scoped only to `Pages Write` for GitHub Actions. Never print its value, write it to disk, commit it, or store the Global API Key in GitHub.
- **REQ-11 (MUST):** Preserve all current routes, assets, trailing slashes, HTTP statuses, content types, custom 404 behaviour, contact form field contract, client analytics, and dark-only rendering.
- **REQ-12 (MUST):** Keep GitHub Pages active during custom-domain verification and automatically restore the recorded four A records if a cutover gate fails.
- **REQ-13 (MUST):** After successful cutover, redirect `www.bulma.com.au` and all project `pages.dev` aliases to `https://bulma.com.au` while preserving path and query string.
- **REQ-14 (MUST):** Make `.github/workflows/deploy.yml` deploy only to Cloudflare Pages from `main`, then disable the GitHub Pages site and remove GitHub-only CNAME files and instructions.
- **REQ-15 (MUST):** Update project documentation and regression assertions so no active file identifies GitHub Pages as the production host.
- **REQ-16 (SHOULD):** Use Cloudflare Pages defaults for edge caching, ETags, compression, Tiered Cache, `nosniff`, and referrer policy during the matched-artifact host comparison. After that comparison is complete, an explicitly authorised performance-remediation preview may use `demo/public/_headers` only for a one-year immutable browser TTL on content-hashed `/_next/static/*` assets. Do not add custom Cache Rules, CSP, HSTS, `X-Robots-Tag`, `Vary`, same-URL content negotiation, middleware, Workers, or unrelated headers.
- **REQ-17 (MUST):** For the user-authorised readiness refresh, build the complete current `demo/` source in an isolated directory, identify it as `HEAD` plus dirty working-tree changes, deploy it only to the existing `cloudflare-comparison` preview branch, and preserve the original host-only benchmark separately.
- **REQ-18 (MUST):** Re-run lint, production build, every current test, static-output assertions, five-route browser checks at `1440x900` and `390x900`, interaction checks, deployed response checks, Lighthouse, curl timings, and deployed-file parity against the selected export.
- **REQ-19 (MUST):** Reduce the representative unused-JavaScript median on both hosts by at least 40 KiB on every route and meet these route ceilings: Home at or below 105 KiB, Pricing at or below 80 KiB, and About, Contact, and Privacy Policy at or below 70 KiB. Do not extend an idle timeout, delay a request beyond the measurement window, block Lighthouse, or remove a user-facing feature to meet the budgets.
- **REQ-20 (MUST):** Keep Mixpanel `2.73.0`, its token, cookie persistence, cross-subdomain identity, manual Page View events, custom event payloads, referral first-touch properties, global readiness/disabled events, 20% session replay sampling, heatmaps, masking, font collection, and recorder timing contracts intact. The recorder must load for sampled sessions and remain absent from unsampled sessions.
- **REQ-21 (MUST):** Preserve every current animation's appearance, timing, trigger, focus/hover/active state, rapid-reversal behaviour, cleanup, and WebGL fallback. Do not remove or rewrite the Dot Pool, and do not add reduced-motion or system-colour branches.
- **REQ-22 (MUST):** Reduce the About route's mobile image-delivery estimate from 46 KiB to at most 20 KiB while preserving existing aspect ratios, alt text, eager/high-priority hero loading, lazy testimonial loading, desktop sharpness, and visually equivalent output at both required viewports.
- **REQ-23 (MUST):** Keep the current shared stylesheets unless a disposable critical-CSS prototype reduces median FCP on both hosts without increasing any route's compressed document-plus-CSS bytes, repeat-navigation transfer, CLS, unstyled-frame duration, or dark-theme failure count. A failed prototype is discarded and recorded, not shipped.
- **REQ-24 (MUST):** Snapshot every current Cloudflare delivery setting, proxied hostname, Cache Rule, compression rule, configuration rule, and rollback payload before a setting write. Preserve Brotli, HTTP/2, HTTP/3, TLS 1.3, IPv6, Pages Early Hints, Development Mode off, Rocket Loader off, Speed Brain off, and 0-RTT off unless this plan names a tested change.
- **REQ-25 (MUST):** Immediately before the apex becomes proxied, change zone setting `browser_cache_ttl` from `14400` to `0` (`Respect Existing Headers`) after recording a rollback payload. Do not change edge caching. Restore `14400` if cutover rolls back. Pages HTML must then return `public, max-age=0, must-revalidate`, while content-hashed `/_next/static/*` assets retain their one-year immutable response.
- **REQ-26 (MUST):** Compare one committed, byte-matched GitHub Pages artifact on both hosts after remediation. Use all five routes, fixed tools, alternating host order, fresh profiles, the current Melbourne/Sydney Globalping probe set, and the Sydney Cloudflare Speed API region. Label Melbourne render performance unresolved because no authorised browser runner exists there.
- **REQ-27 (MUST):** Treat performance as non-inferior only when each host and route stays within measurement noise of its own pre-change baseline: no median FCP, LCP, Speed Index, or TBT regression larger than 100 ms or 5%, whichever is greater; no performance-score loss larger than two points; no CLS increase larger than 0.005; and no deterministic compressed route-JavaScript increase. Any failure blocks release until fixed or reverted.

### 3.2 Defaults and Fallbacks

- **Deployment model:** Direct Upload via Wrangler and GitHub Actions.
- **Preferred project name:** `bulma-root`.
- **Project-name fallback:** If and only if the Pages API returns a name-conflict response, use `bulma-com-au`. Record and use the API-returned `name` and `subdomain` everywhere thereafter.
- **Preview branch:** `cloudflare-comparison`. This is a Wrangler deployment label, not a Git branch; do not create or switch repository branches.
- **Production branch:** `main`.
- **Canonical origin:** `https://bulma.com.au`.
- **Canonical host policy:** apex serves content; `www` permanently redirects to apex.
- **Post-cutover Pages policy:** the root and subdomain aliases under the returned project `pages.dev` hostname permanently redirect to the apex through a dedicated account Bulk Redirect list and rule.
- **Comparison gate:** user approval after evidence, not an automatic winner threshold.
- **Custom-domain safety fallback:** Associate the hostname with the Pages project first. If the API returns `pending` and the old A records remain, replace only those snapshotted A records with proxied CNAME records targeting the API-returned Pages subdomain. If the API returns any other error, make no DNS change.
- **Cutover rollback:** Before GitHub Pages is disabled, restore the exact recorded A records, disable the Bulma redirect rule, verify GitHub Pages serves the apex again, and only then detach the Pages custom domains.
- **Credential fallback:** There is no manual-dashboard fallback. If the existing Global API Key cannot create and verify the least-privilege account token, stop before repository, Pages-project, or DNS writes and report the missing machine-usable permission.
- **Compatibility:** Keep `demo/public/CNAME` and root `CNAME` through the parallel-host phase; Cloudflare ignores them. Remove them only after Cloudflare custom-domain and continuous-deployment checks pass.
- **Analytics implementation:** Use `mixpanel-browser/src/loaders/loader-module-with-async-recorder` with the current provider schedule and configuration. If the built core chunk exceeds 40 KiB gzip or any analytics contract test fails, do not ship the change and do not substitute a reduced-feature analytics client.
- **Three.js implementation:** Keep the current named imports from `three`. Do not use measured-larger deep `three/src` imports and do not rewrite the Dot Pool renderer.
- **Tailwind Plus implementation:** Remove the package only from shipped FAQ and plan-tab client graphs. Preserve inactive reference components unless they enter a routed build.
- **CSS implementation:** Preserve external shared stylesheets by default. Treat critical CSS as a disposable experiment governed by REQ-23, not a required source change.
- **Cloudflare setting implementation:** Keep every current performance toggle unchanged except `browser_cache_ttl`, which changes from `14400` to `0` at cutover under REQ-25. Reassess Speed Brain and 0-RTT only as a later, separately baselined production experiment because both are zone-wide and neither solves the current first-load evidence gap.
- **Regional browser evidence:** Use the current free Cloudflare Speed API quota for five Sydney tests per host and route. Each test returns desktop and mobile reports, consuming all 50 available tests without creating a recurring schedule. Keep Melbourne measurements transport-only through the fixed Globalping probes.

### 3.3 Verification Checklist

**Parallel-host proof:**

- [ ] GitHub Pages and Cloudflare preview identify the same commit SHA.
- [ ] Comparison alias and deployment-specific preview URL return `X-Robots-Tag: noindex`.
- [ ] Five public routes and representative assets have matching response-body hashes.
- [ ] Every route meets the REQ-19 unused-JavaScript ceiling on both hosts, and its deterministic compressed JavaScript is smaller than the commit-matched baseline.
- [ ] Mixpanel event, identity, referral, heatmap, and sampled/unsampled replay checks pass without changing the current load/idle schedule.
- [ ] The About image-delivery estimate is at most 20 KiB, and both responsive viewports pass visual comparison.
- [ ] Every host-and-route metric passes the REQ-27 non-inferiority gate against its own baseline.
- [ ] Both direct URLs and the measured comparison are delivered before approval is requested.

**Production host:**

- [ ] Apex returns HTTP 200 from Cloudflare with no redirect.
- [ ] Apex HTML returns `Cache-Control: public, max-age=0, must-revalidate`; hashed `/_next/static/*` responses return the one-year immutable policy.
- [ ] Brotli, HTTP/3, IPv6, Pages Early Hints, and `browser_cache_ttl: 0` match the recorded intended state; Rocket Loader, Speed Brain, and 0-RTT remain off.
- [ ] `www` returns one HTTP 301 to the same apex path and query.
- [ ] Unknown paths return the built custom page with HTTP 404.
- [ ] Canonicals, sitemap, robots, metadata, and structured data still name `https://bulma.com.au`.

**Safety and operations:**

- [ ] The refreshed DNS snapshot is committed to `documents/guides/_hosting.md` before DNS changes.
- [ ] MX and TXT records are unchanged by ID, type, name, content, TTL, comments, and tags.
- [ ] The GitHub secret contains only the account-owned Pages token; the Global API Key remains only in Keychain.
- [ ] The final workflow deploys only to Cloudflare Pages and its hosted deployment SHA equals `origin/main`.
- [ ] The GitHub Pages API no longer reports an active Pages site after final decommissioning.

---

## 4. Additional Context

### 4.1 User-Provided Context

- The user wants an end-to-end plan to move the existing site from GitHub Pages to Cloudflare Pages.
- The site must remain Next.js; the Build Astro Websites skill is used only for its Cloudflare Pages-specific static-host guidance.
- The user wants GitHub Pages and a Cloudflare subdomain available side by side before connecting the production domain so speed can be compared.
- All technical work must be agentic and use existing Cloudflare connections.
- The user now wants every remaining speed-report gap planned and remediated across all five routes before the hosting recommendation is repeated.
- The user explicitly requires the `103-170 KiB` representative unused-JavaScript finding and current Cloudflare settings to be included, with no regression on either host.
- The native question tool returned no selections. This plan applies the recommended defaults: Direct Upload CI, a user approval gate after the comparison, and a canonical redirect for `pages.dev` after cutover.

### 4.2 Architecture Decisions

- Direct Upload was selected because the existing Global API Key, exact account, zone, and Super Administrator membership are verified. The Cloudflare account has no Pages projects, and native Cloudflare GitHub App access to `Culpable/bulma-root` cannot be verified through the available APIs without attempting an external setup.
- Direct Upload keeps the existing deterministic GitHub Actions build model. GitHub builds `demo/out`; Wrangler uploads only those prebuilt assets. Cloudflare performs no framework build and needs no project root, build command, build image, environment variables, adapter, or runtime configuration.
- The preview uses a Wrangler non-production branch alias so Cloudflare supplies its platform noindex header. The committed `_headers` file changes only the browser TTL of content-hashed `/_next/static/*` assets and does not provide the noindex policy.
- The original host comparison used unmodified host defaults. The completed remediation comparison then added the approved immutable hashed-asset policy. Remaining code work must be tested on both hosts from one GitHub Pages artifact so application and delivery effects stay attributable.
- The canonical origin does not change, so no metadata, sitemap, robots, JSON-LD, analytics URL, or application-link rewrite is required.
- GitHub Pages remains active until the custom domain passes live checks. This makes DNS rollback a restoration of four recorded A records rather than a reconstruction of a deleted host.
- The current CSS is small after compression and Lighthouse reports no removable CSS. The plan attacks owned JavaScript and responsive image waste first, then ships a critical-CSS change only if a disposable two-host experiment clears REQ-23.
- Cloudflare's four-hour zone Browser Cache TTL would override Pages' lower HTML browser TTL after the apex becomes proxied. Changing that setting to `0` at cutover makes Cloudflare respect Pages and `_headers` response values without adding a Cache Rule or an edge-cache override. The rollback restores `14400`.
- Pages enables Early Hints automatically. The zone toggle remains off, and the static-host contract does not permit generated `Link` headers, middleware, or a Worker.

### 4.3 Current Authoritative Provider Guidance

- [Cloudflare Pages static Next.js export](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) confirms that Pages supports a Next.js static `out` directory.
- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) defines project creation, preview branch aliases, the 20,000-file limit, the 25 MiB file limit, and the non-convertible project type.
- [Direct Upload with continuous integration](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) defines the least-privilege `Pages Write` token and GitHub Actions deployment model.
- [Cloudflare Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/) defines the default `X-Robots-Tag: noindex` response.
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) requires Pages domain association before relying on a CNAME and requires the apex zone to be in the same account.
- [Cloudflare Pages serving behaviour](https://developers.cloudflare.com/pages/configuration/serving-pages/) defines route matching, custom 404 behaviour, caching defaults, ETags, compression, default headers, and Tiered Cache.
- [Cloudflare Pages custom headers](https://developers.cloudflare.com/pages/configuration/headers/) defines the one-year immutable policy for fingerprinted assets.
- [Cloudflare Pages Early Hints](https://developers.cloudflare.com/pages/configuration/early-hints/) confirms that Early Hints is automatic on `pages.dev` and custom domains.
- [Cloudflare Browser Cache TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/) confirms that a numeric zone TTL overrides a lower response `max-age`, while `Respect Existing Headers` leaves the response policy intact.
- [Cloudflare Speed API](https://developers.cloudflare.com/api/resources/speed/subresources/pages/subresources/tests/methods/create/) provides non-recurring Lighthouse tests in the Sydney `australia-southeast1` region.
- [Cloudflare Speed Brain](https://developers.cloudflare.com/speed/optimization/content/speed-brain/) and [0-RTT](https://developers.cloudflare.com/speed/optimization/protocol/0-rtt-connection-resumption/) define the zone-wide candidates that remain off under the no-regression requirement.
- [Mixpanel's official browser SDK](https://github.com/mixpanel/mixpanel-js) documents the async-recorder loader that preserves session replay while excluding the recorder from unsampled sessions.
- [Cloudflare Pages API](https://developers.cloudflare.com/api/resources/pages/) provides agentic project, deployment, custom-domain, and rollback operations.
- [Cloudflare Bulk Redirects API](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-api/) provides the account-level canonical redirects for `www` and `pages.dev`.

---

## 5. Implementation Plan

### ~~Step 1: Revalidate Authority, Repository State, and the Comparison Revision~~ ✅ **COMPLETED**

**Objective:** Establish exact, current inputs before any local or external write.

#### 1.1 High-Level Approach

- Read `/Users/sacino/bulma-root/AGENTS.md`, this plan, `.cursor/rules/dev-browser.mdc`, and the current official Cloudflare Pages Direct Upload, preview, custom-domain, serving, API, and Bulk Redirect documentation.
- Run read-only Git checks with `git -C /Users/sacino/bulma-root`. Record the full worktree and index state. Preserve unrelated and pre-existing changes, including `documents/todo/agent_readiness_and_page_speed_plan.md`.
- Fetch `origin` and verify `HEAD`, `origin/main`, and the latest successful GitHub Pages workflow/deployment SHA. If the live deployment differs from `origin/main`, trigger the existing GitHub Pages workflow for `origin/main`, wait for success, and select that run's unexpired `github-pages` artifact. Never use a separately built directory as the host-comparison payload.
- Re-query the Cloudflare account, zone, member role, Pages project inventory, token permission groups, account redirect lists/rulesets, zone redirect rulesets, Page Rules, and DNS records.
- Create `documents/guides/_hosting.md` as the hosting source of truth. Record the selected revision, provider identifiers, current GitHub Pages configuration, current Cloudflare inventory, initial DNS snapshot, rollback commands, and a redacted credential map that names Keychain service and GitHub secret names but contains no secret values.
- Stop before writes if `bulma.com.au` is not active in account `213ab3604485056376263d22fa242742`, the authenticated member is not a Super Administrator, or any unexpected existing Pages project or redirect resource overlaps the intended names.

**Success Criteria:**

- `git rev-parse HEAD` and `git rev-parse origin/main` return the same SHA, or `documents/guides/_hosting.md` records the exact `origin/main` SHA selected instead of the dirty checkout.
- The latest successful GitHub Pages workflow and deployment report that same SHA before benchmarking, and its `github-pages` artifact reports `expired: false`; verify through the GitHub Actions, artifacts, and deployments APIs.
- Cloudflare API responses identify account `213ab3604485056376263d22fa242742`, zone `0534ecfcfde9d322566af12ec11c1bef`, and an accepted Super Administrator membership.
- `documents/guides/_hosting.md` contains every live apex and `www` DNS record field required for exact recreation: ID, type, name, content, proxied, TTL, settings, comment, and tags.
- The hosting guide contains no Global API Key, account-token value, GitHub token, environment-file contents, or other secret; verify with `git diff` and the repository's secret scanner if one exists.
- No repository file, Cloudflare resource, GitHub setting, branch, DNS record, or deployment changes during this step.

### ~~Step 2: Provision a Least-Privilege Deploy Token and Direct Upload Project~~ ✅ **COMPLETED**

**Objective:** Create the minimum Cloudflare resources required for a preview without dashboard work or a broad CI credential.

#### 2.1 High-Level Approach

- Load the Global API Key per command from macOS Keychain as `CLOUDFLARE_API_KEY` with `CLOUDFLARE_EMAIL=jake.sacino@gmail.com`. Do not echo the key or place it in a command argument that can be logged.
- Query the account token permission groups by name and create one account-owned token with only `Pages Write`, scoped to account `213ab3604485056376263d22fa242742`. Name it `bulma-root-cloudflare-pages-deploy`.
- Pipe the one-time token value directly into GitHub Actions secret `CLOUDFLARE_PAGES_API_TOKEN` for `Culpable/bulma-root`; do not write it to a file or chat output. Set repository Actions variable `CLOUDFLARE_ACCOUNT_ID` to `213ab3604485056376263d22fa242742`.
- Verify the new token through Cloudflare's token verification endpoint. Record only its token ID, name, scope, status, and GitHub secret name in `documents/guides/_hosting.md`.
- Create a Direct Upload Pages project with production branch `main` and preferred name `bulma-root`. Use `bulma-com-au` only after a verified name-conflict response. Do not include a `source` object, build configuration, deployment bindings, Functions configuration, or custom domains.
- Query the created project and use its returned `name` and `subdomain` for every later command.

**Success Criteria:**

- Cloudflare token verification returns `success: true` and `status: active` for the new account-owned token.
- The token policy contains exactly one allow policy, exactly one permission group named `Pages Write`, and only account `213ab3604485056376263d22fa242742` in `resources`; verify with the account token API without retrieving or printing its value.
- `gh secret list --repo Culpable/bulma-root` contains `CLOUDFLARE_PAGES_API_TOKEN`, and `gh variable get CLOUDFLARE_ACCOUNT_ID --repo Culpable/bulma-root` returns `213ab3604485056376263d22fa242742`.
- The Pages project API returns the selected name, `production_branch: main`, no custom domains, `source: null`, and `uses_functions: false`.
- The project has no production or preview deployment at the end of project creation; verify through the Pages deployments API.
- The Global API Key remains only in Keychain and is not stored in GitHub Actions.

### ~~Step 3: Build the Committed Export and Publish the Noindexed Preview~~ ✅ **COMPLETED**

**Objective:** Publish the exact GitHub Pages artifact to Cloudflare without a custom domain, production deployment, repository branch, or source change.

#### 3.1 High-Level Approach

- Create one disposable parent directory with `mktemp -d` and two explicit child paths: `published-out` for the downloaded deployment artifact and `validation-source` for independent source validation. Do not create a Git worktree.
- Download the selected successful Actions run's artifact named `github-pages` with `gh run download`. Verify the download is the artifact ID recorded in Step 1, extract its `artifact.tar` into `published-out`, and retain the archive digest and extracted manifest.
- Export the selected commit with `git archive` into `validation-source`. In its `demo` directory, run npm with Node.js `22.23.1`: `npm ci`, `npm run lint`, `npm run build`, then `npm test`. Set `NEXT_PUBLIC_SITE_URL=https://bulma.com.au` explicitly for this validation build, but do not deploy its newly generated `out` directory.
- Inspect `published-out`. Confirm expected HTML routes, top-level `404.html`, assets, `robots.txt`, `sitemap.xml`, and current CNAME output. Confirm no `functions/`, `_worker.js`, `_routes.json`, or Wrangler runtime file is present.
- Load the Global API Key from Keychain only for the Wrangler process. Run Wrangler `4.127.1` without modifying project dependency files and upload `published-out` with `--branch=cloudflare-comparison`, the selected commit SHA, `--commit-dirty=false`, and the API-returned project name.
- Capture both the branch alias and immutable deployment-specific URL from the API. Verify `X-Robots-Tag: noindex` on both before opening or sharing them.
- Open `https://bulma.com.au/` and the branch alias in the macOS default browser so the user can view both. Do not create or connect a custom domain.
- Move the disposable parent directory to Trash only after all manifest, parity, benchmark, and deployment checks that need the exact artifact finish.

**Success Criteria:**

- The selected Actions artifact ID, run ID, artifact SHA-256, unexpired status, and workflow head SHA are recorded before extraction.
- All four independent source-validation commands exit 0 under Node.js `22.23.1`: `npm ci`, `npm run lint`, `npm run build`, and `npm test`.
- `published-out` contains fewer than 20,000 files, and every file is smaller than 25 MiB; verify with `find`, `wc`, and `stat` before upload.
- The Pages deployment API reports `success`, branch `cloudflare-comparison`, the selected commit SHA, and `uses_functions: false`.
- The Pages project still has no custom domains and no production deployment.
- Both Cloudflare preview URLs return HTTPS, HTTP 200 for `/`, and `X-Robots-Tag: noindex`.
- HTML from the preview contains `https://bulma.com.au` canonicals and contains no returned project subdomain; verify with `curl` and `rg`.
- No Git branch, Git commit, GitHub Pages setting, DNS record, source file, or index entry changes in this step.

### ~~Step 4: Prove Hosted Functional and Content Parity~~ ✅ **COMPLETED**

**Objective:** Establish that Cloudflare serves the same site before interpreting any speed difference.

#### 4.1 High-Level Approach

- Generate a SHA-256 manifest for the extracted `published-out` artifact before it is trashed. Map each HTML `index.html` to its clean trailing-slash route, map top-level `404.html` to a random unknown route, and request all other representative files by emitted path.
- Compare decoded response-body hashes between local output, GitHub Pages, and Cloudflare Pages for `/`, `/about/`, `/pricing/`, `/contact/`, `/privacy-policy/`, one unknown path, `robots.txt`, `sitemap.xml`, every emitted CSS and JavaScript file under `_next/static`, and at least one image and font from each emitted asset directory.
- Compare status, redirect, content type, content encoding, ETag, cache, and robots headers. Header values may differ by host, but route semantics and content types must match. Record the intentional Cloudflare defaults separately from regressions.
- Use `dev-browser` for hosted verification after reading `.cursor/rules/dev-browser.mdc`. Emulate `prefers-color-scheme: light`, which proves the permanent dark lock-in. Test `1440x900` and `390x900` on every public route.
- Verify navigation, `/#lenders`, pricing Monthly and Yearly states, mobile navigation, key CTAs, asset loading, no horizontal overflow, and no console or page errors.
- On `/contact/`, verify the form fields remain exactly hidden `form_source`, `name`, `email`, and `message`. Intercept the Formspree POST, inspect its destination and field names, then abort it so no real message is sent.

**Success Criteria:**

- The named HTML, discovery, JavaScript, CSS, image, and font responses have matching decoded SHA-256 hashes on both hosts; differences are limited to headers and provider transport encoding.
- `/`, `/about/`, `/pricing/`, `/contact/`, and `/privacy-policy/` return HTTP 200 with their existing trailing-slash policy on Cloudflare.
- A random unknown path returns HTTP 404 and the decoded body hash of the built top-level `404.html`.
- `robots.txt` returns plain text, `sitemap.xml` returns XML, and all canonical/discovery URLs remain on `https://bulma.com.au`.
- Desktop and mobile browser checks show zero console errors, zero page errors, zero failed first-party requests, and `document.documentElement.scrollWidth <= document.documentElement.clientWidth` on every route.
- Direct and same-page `#lenders` navigation both open the intended FAQ disclosure.
- The intercepted contact submission targets `https://formspree.io/f/xojvwybl` with only the existing four field names, and no network request reaches Formspree.
- Any failed parity assertion blocks benchmarking and custom-domain work.

### ~~Step 5: Run the Side-by-Side Speed Comparison and Obtain Approval~~ ✅ **COMPLETED**

**Objective:** Give the user repeatable evidence and both URLs before any production change.

#### 5.1 High-Level Approach

- Use Lighthouse `13.4.1` with Google Chrome from the same machine and network for both hosts. Test `/` and `/pricing/` at mobile and desktop settings.
- Run five fresh-profile Lighthouse measurements for each route, viewport, and host. Alternate host order on every run. Record median and range for performance score, server response time, FCP, LCP, Speed Index, TBT, and CLS.
- Run one warm-up followed by twenty alternating `curl` requests per host for `/`, `/pricing/`, and the largest emitted JavaScript asset. Record DNS, TCP, TLS, TTFB, total time, HTTP version, remote IP, status, and transfer size. Report medians and ranges; do not use a single request as the result.
- Keep the Cloudflare noindex response and host defaults in place. Do not add Cache Rules, `_headers`, Early Hints configuration, security headers, image changes, JavaScript changes, or any other tuning during the comparison.
- Add a comparison table to `documents/guides/_hosting.md` containing the exact commit SHA, host URLs, tool versions, commands, run counts, medians, ranges, absolute deltas, and percentage deltas. State which host was faster for each metric without claiming that one synthetic score proves all real-user performance.
- Give the user clickable links for `https://bulma.com.au/` and the API-returned Cloudflare branch alias, plus the compact comparison result. Request one explicit approval to connect `bulma.com.au`.
- If approval is withheld, leave GitHub Pages, DNS, custom domains, and production Pages deployments unchanged. Keep the noindexed preview available.

**Success Criteria:**

- The report contains 40 successful Lighthouse JSON results: 2 hosts x 2 routes x 2 viewport modes x 5 runs.
- The report contains 120 timed `curl` results: 2 hosts x 3 resources x 20 measured requests, excluding warm-ups.
- Every result names the same commit SHA, and the Step 4 body-hash checks remain passing.
- Every metric table includes run count, median, minimum, maximum, absolute delta, and percentage delta.
- The user receives both direct URLs before the approval request.
- No Pages production deployment, custom domain, DNS record, GitHub Pages setting, or canonical redirect changes until explicit approval is recorded.

### ~~Step 5A: Refresh the Preview with the Agent-Readiness Build~~ ✅ **COMPLETED**

**Objective:** Publish and test the complete current readiness implementation on the existing noindexed Cloudflare comparison branch without changing production.

#### 5A.1 High-Level Approach

- Treat the existing GitHub Pages deployment at commit `2a475b50527f3d81593b0a9d3036cde94b974adc` as the unchanged before state and the current dirty `demo/` working tree as the after state.
- Copy the current `demo/` source into a disposable isolated directory because the shared checkout has a pre-existing dev server on port 3001. Run `npm ci`, lint, the production build, and all tests there under Node.js `22.23.1` so the live Turbopack cache remains untouched.
- Record the source-file inventory, generated-output manifest, file count, total bytes, largest file, and SHA-256 digest. Confirm the static-only, canonical-origin, discovery, 404, accessibility, image, font-preload, and no-runtime contracts before upload.
- Deploy the isolated `out` directory to the existing `bulma-root` Pages project and `cloudflare-comparison` branch with Wrangler. Attach the current `HEAD` SHA, set the deployment dirty flag, and use a message that identifies the agent-readiness refresh. Do not create a production deployment, custom domain, DNS change, redirect, branch, commit, or push.
- Verify the branch alias points to the new immutable deployment, both URLs carry `X-Robots-Tag: noindex`, `uses_functions` remains false, and every deployed file matches the isolated export after transport decoding.
- Re-run the full five-route browser matrix at `1440x900` and `390x900` with `prefers-color-scheme: light`. Include skip navigation, direct and same-page `#lenders`, Monthly and Yearly pricing parity, mobile navigation, responsive image selection, Dot Pool and FAQ animation, WebGL fallback, contact form interception, overflow, console errors, page errors, and first-party request failures.
- Repeat the original benchmark shape: five Lighthouse runs per host, route, and viewport plus twenty measured curl runs per host for `/`, `/pricing/`, and the largest refreshed JavaScript asset. Compare the refreshed Cloudflare result with both the unchanged GitHub baseline and the prior Cloudflare artifact, and label causation limits clearly.
- Update `documents/guides/_hosting.md`, this plan's implemented solution, and the existing readiness implementation report with deployment identity, complete results, differences, validation outcomes, and remaining production gates.

**Success Criteria:**

- Isolated `npm ci`, lint, production build, and all 23 tests pass under Node.js `22.23.1`.
- The generated export includes the readiness features: deferred Three.js and Mixpanel loading, zero font preloads, five correct canonicals, static JSON-LD, `/llms.txt`, corrected sitemap, skip navigation, decorative icon semantics, AA contrast, responsive image candidates, WebGL fallback, and one noindex-only 404 robots directive.
- The refreshed Cloudflare deployment reports environment `preview`, branch `cloudflare-comparison`, attached commit `2a475b50527f3d81593b0a9d3036cde94b974adc`, dirty source `true`, `uses_functions: false`, no custom domains, and no production deployment.
- Both Cloudflare URLs return `X-Robots-Tag: noindex`, every generated file matches the deployed response body, and no canonical or discovery artefact contains a `pages.dev` origin.
- All required browser scenarios pass at both viewports with the permanent dark theme, no horizontal overflow, no page errors, no unexpected console errors, and no failed first-party requests.
- The refreshed benchmark contains 40 successful Lighthouse JSON results and 120 successful measured curl rows, with median, range, delta, and causal-boundary notes.
- The user receives a concise before-and-after overview that separates application changes, hosting differences, measured performance changes, and unverified production effects.

### ~~Step 5B: Remediate the Current Preview Speed Gaps~~ ✅ **COMPLETED**

**Objective:** Fix the measured About and Contact LCP delays, reduce the shared navbar client boundary, and enable immutable caching for hashed Cloudflare assets without changing production.

#### 5B.1 High-Level Approach

- Keep the About photo and Contact hero copy visible at first paint while retaining their documented 700ms transform entrances. Keep the About photo's 150ms delay and the Contact card scroll animations.
- Recompress the About mobile photo candidate without changing its dimensions or responsive source contract.
- Server-render the active navbar shell. Hydrate only route-aware links and `NavbarController`; keep the native mobile dialog transition, native mobile navigation, active-state styling, scroll glass, and cleanup contracts.
- Add `demo/public/_headers` with one rule for `/_next/static/*`: `Cache-Control: public, max-age=31556952, immutable`. Keep HTML on Pages defaults.
- Build, test, verify both viewports locally, publish only to `cloudflare-comparison`, verify every emitted response body, repeat the hosted browser matrix, rerun 240 fixed-probe Melbourne/Sydney requests, and rerun three mobile Lighthouse reports per host and route.

**Success Criteria:**

- Lint, production build, and all 26 tests pass.
- About and Contact above-fold LCP candidates have opacity `1` throughout their entrance and complete at zero transform on desktop and mobile.
- Mobile dialog open, close, and link navigation work after the server/client split; no route has horizontal overflow, console errors, or page errors.
- Hashed Cloudflare assets return the one-year immutable header, HTML retains revalidation, and both preview URLs remain noindexed.
- All 182 served export files match the local build, all 240 Globalping samples return HTTP 200, and all 30 Lighthouse reports complete.
- The Pages project remains preview-only. DNS, custom domains, GitHub Pages, Git branches, commits, pushes, and production settings remain unchanged.

### ~~Step 5C: Commit and Recheck the Remediated Build on Both Hosts~~ ✅ **COMPLETED**

**Objective:** Remove the application-version mismatch and make the hosting recommendation from the same committed source.

#### 5C.1 High-Level Approach

- Commit and push the complete readiness and first performance-remediation scope as one revision.
- Wait for GitHub Pages to deploy that revision, then build the same revision and publish a clean Cloudflare comparison preview.
- Verify route behaviour, static-output parity, Melbourne/Sydney transport, and three mobile Lighthouse runs per host and route.
- Record the provider-controlled build-ID differences separately from rendered behaviour and delivery timing.

**Success Criteria:**

- Both hosts identify commit `854b85f576910a5a5c3576bdf9fef62a6da4df81`, and GitHub Actions run `33314166806` plus Cloudflare deployment `62181028-c315-4134-b11b-7c61971bc9f6` report success.
- All 182 Cloudflare-served files match the committed local export; all non-build-generated GitHub files match, and the independently generated Next.js IDs are the only body differences.
- All five routes pass the two-viewport hosted behaviour matrix on both hosts.
- The 240 Globalping samples and 30 Lighthouse files are complete and recorded in `documents/guides/_hosting.md`.
- The result recommends keeping GitHub Pages until the remaining cold-render work below is implemented and remeasured.

### ~~Step 5D: Add Durable Performance Budgets and Regression Fixtures~~ ✅ **COMPLETED**

**Objective:** Turn the current reports into deterministic release gates before changing JavaScript or images.

#### 5D.1 High-Level Approach

- Add `demo/performance-budgets.json` as the machine-readable source of truth for REQ-19, the 40 KiB per-route reduction, the 40 KiB gzip Mixpanel-core ceiling, the About image ceiling, and deterministic compressed route-JavaScript non-regression.
- Add `demo/src/scripts/report-performance-budgets.mjs` to map each emitted route to its initial and deferred JavaScript, gzip each owned chunk, identify Mixpanel, Three.js, and Tailwind Plus contributions without relying on content-hash filenames, and summarise Lighthouse JSON supplied through an explicit input directory.
- Extend `demo/test/performance-regressions.test.mjs` to run after `npm run build` and assert the budget file schema, emitted chunk identities, approved `_headers` scope, and absence of timing tricks that defer Mixpanel beyond the existing 1,200 ms fallback and 3,000 ms idle timeout.
- Add `demo/test/analytics-runtime.test.mjs` with a browser-independent fake `window`, document, idle scheduler, Mixpanel instance, and recorder loader. Cover production and development paths, one initial Page View, client route changes, custom events, identity, first-touch referral properties, readiness/disabled events, and sampled/unsampled recorder outcomes.
- Copy the compact pre-change route medians, exact tool versions, report locations, and bundle-analysis summary into `documents/guides/_hosting.md`. Do not commit full transient Lighthouse traces or `.next/diagnostics` output.

**Success Criteria:**

- `demo/performance-budgets.json` parses without comments or duplicate keys and contains all five route keys plus explicit units.
- `report-performance-budgets.mjs` reproduces the current `103-170 KiB` unused-JavaScript range from the saved 30-report baseline and exits non-zero for a synthetic over-budget fixture.
- The performance regression suite fails when the default Mixpanel entry, a shipped Tailwind Plus client import, a delayed analytics timeout, or an over-budget owned chunk is injected into a disposable fixture.
- The analytics suite fails if any current event name, property, identity operation, replay percentage, heatmap option, masking selector, or readiness event is removed or reordered beyond the existing idle-load contract.
- Lint, production build, and the complete Node test suite exit 0 before implementation proceeds.

### ~~Step 5E: Reduce Owned JavaScript Without Behaviour Loss~~ ✅ **COMPLETED**

**Objective:** Remove the common analytics recorder payload, active Tailwind Plus client payload, and dead button hydration boundary while preserving all site and analytics behaviour.

#### 5E.1 High-Level Approach

- In `demo/src/lib/mixpanelClient.js`, replace the default `mixpanel-browser` import with `mixpanel-browser/src/loaders/loader-module-with-async-recorder`. Keep Mixpanel `2.73.0`, the token, every current `init` option, global exposure, and readiness events unchanged.
- Keep `demo/src/components/MixpanelProvider.jsx` on the current load-then-idle schedule. Do not increase either timeout. Ensure the SDK initialises once, Page View events queue safely before readiness, and client route changes emit once per pathname.
- Update `demo/src/lib/analytics.js` and `demo/public/scripts/referral-tracking.js` only as required to queue calls until readiness without losing the current event names, properties, first-touch profile fields, or super properties. Never send a real analytics request during automated tests.
- Create one focused local disclosure controller for `demo/src/components/sections/faqs-accordion.tsx` and `demo/src/components/sections/faqs-two-column-accordion.tsx`. Preserve the current grid-track animation, contextual icon crossfade, `#lenders` direct-load and same-page opening, rapid toggle reversal, trusted answer markup, focus, IDs, and cleanup.
- Replace `ElTabGroup`, `ElTabList`, and `ElTabPanels` in `demo/src/components/sections/plan-comparison-table.tsx` with the existing controlled plan state plus complete WAI-ARIA tab semantics. Preserve click and focus selection, add ArrowLeft, ArrowRight, Home, and End keyboard movement, retain the live `Viewing <plan>` text, and render only the selected mobile panel while leaving the desktop table unchanged.
- Remove `preloadOnHover`, its `useCallback`, its helper import, `demo/src/lib/preload-animation-components.ts`, and the duplicate unused homepage preload export. Remove the `use client` boundary from `demo/src/components/elements/button.tsx` if its remaining imports and props stay server-compatible; otherwise split only the interactive button consumer into a focused client file.
- Keep the installed Tailwind Plus dependency for inactive source/reference components, but verify it no longer enters any routed client graph. Keep the current `three` imports and Dot Pool implementation unchanged.
- Read `documents/guides/_animations.md` before implementation and update its FAQ/tab ownership notes if control logic moves. Do not change documented timing or visual behaviour.

**Success Criteria:**

- The built Mixpanel core contribution is at most 40 KiB gzip, compared with the measured 100,243-byte default entry, and the full recorder is absent from an unsampled session.
- A forced sampled session loads the official recorder successfully and retains `record_sessions_percent: 20`, heatmap collection, font collection, masking, minimum duration, and idle timeout.
- No emitted route chunk contains the active `@tailwindplus/elements` client runtime; Home and Pricing each shed its approximately 22,825-byte gzip contribution.
- `rg` finds no `preloadOnHover`, no `preloadAnimationComponents`, and no dead animation preloader module; every button renders the same class string and passes hover, focus, active, internal-link, external-link, and form-submit checks.
- Direct `/#lenders`, same-page `#lenders`, every pricing FAQ, and the mobile plan tabs pass mouse, touch, keyboard, focus, ARIA, rapid-reversal, and route-navigation checks at `1440x900` and `390x900`.
- The permanent dark class, exact pricing copy, equal-height cards, contact field contract, mobile menu, Dot Pool timing/pointer/fallback, and all other animation contracts remain unchanged.
- Lint, production build, every Node test, and the deterministic performance budget script exit 0.

### ~~Step 5F: Reduce About Image Waste and Resolve the CSS Finding~~ ✅ **COMPLETED**

**Objective:** Remove the measured mobile image excess and close the render-blocking CSS finding without trading first-load speed for cache or visual regressions.

#### 5F.1 High-Level Approach

- Generate a 640-pixel-wide About hero candidate from the highest-resolution team-photo source and a 640-pixel-wide testimonial candidate from the current portrait source with `cwebp -m 6 -q 80`. Keep the existing large source files and aspect ratios as desktop/high-density fallbacks.
- Add width-descriptor `srcSet` and `sizes` selection in `demo/src/app/about/page.tsx` so the `390x900`, DPR 1.75 profile selects the 640-pixel candidates while desktop and higher-density displays retain an adequate larger source. Preserve hero `loading="eager"`, `fetchPriority="high"`, and `decoding="async"`; preserve lazy loading for the below-fold testimonial.
- Add source assertions for dimensions, aspect ratios, file-size ceilings, alt text, load priority, and responsive markup. Record the exact encoder command and source digest in `documents/guides/_hosting.md` so the assets are reproducible.
- Capture matching About screenshots at both required viewports before and after the asset selection. Compare crop, colour, facial detail, text integration, layout, LCP element, and selected `currentSrc`; reject the candidates if a visible difference appears at normal and 200% inspection.
- Re-run CSS coverage on all five routes at both viewports after Step 5E, including menu, FAQ, pricing, form, hover, focus, and yearly states. Preserve the two external stylesheets when coverage and Lighthouse still report no removable bytes.
- If the post-JavaScript baseline still reports more than 200 ms median render-blocking FCP savings on either host, create a disposable critical-CSS prototype outside the working tree. Test it against REQ-23. Move the prototype to Trash if any gate fails; only then record that CSS is closed with no shipped source change.

**Success Criteria:**

- The 640-pixel hero candidate is at most 21 KiB and the 640-pixel testimonial candidate is at most 11 KiB; both retain their current aspect ratios.
- At `390x900` with DPR 1.75, About selects the 640-pixel candidates, keeps the hero as the intended eager/high-priority image, and reports at most 20 KiB total Lighthouse image-delivery waste.
- At `1440x900`, the browser selects a source with enough physical pixels for its rendered size, and the before/after screenshots show no visible crop, colour, sharpness, or layout regression.
- All five routes retain zero horizontal overflow, zero unexpected console/page errors, zero failed first-party requests, dark-only rendering, and CLS within REQ-27.
- No critical-CSS source change ships unless compressed document-plus-CSS bytes, cold FCP, repeat-navigation transfer, unstyled-frame duration, and CLS all pass REQ-23 on GitHub and Cloudflare.
- Lint, production build, every Node test, and targeted image/performance assertions exit 0.

### Step 5G: Publish One Matched Artifact and Re-run the Full Speed Matrix 🔄 **IN PROGRESS**

**Objective:** Prove the completed speed work on both hosts, across every route, before changing the migration recommendation.

#### 5G.1 High-Level Approach

- Complete local lint, build, tests, performance-budget reporting, and two-viewport browser verification first. Stop if any REQ-19 through REQ-27 gate fails.
- Begin the hosted proof only when the execution request explicitly authorises GAC and push. Commit only task-owned files under the repository's mixed-file rules, push `main`, wait for the GitHub Pages workflow, and verify the deployed SHA.
- Download the exact unexpired `github-pages` artifact from that successful workflow and deploy its extracted contents to the existing Cloudflare `cloudflare-comparison` branch. Do not rebuild for Cloudflare. Record the artifact digest, deployment ID, immutable URL, branch alias, clean commit flag, and `uses_functions: false`.
- Re-run decoded-body parity for every served file and route. Allow only provider headers; any body, status, content type, canonical, discovery, or interaction mismatch blocks benchmarking.
- Run ten alternating fresh-profile Lighthouse mobile reports and five alternating desktop reports per host and route from the same machine. Add three DevTools-throttled mobile runs per host and route to distinguish observed delivery from Lighthouse simulation.
- Re-query Cloudflare Speed API availability before hosted testing. Start no Sydney run unless at least 50 tests remain. If fewer remain, wait for quota renewal or use a pre-authorised equivalent Sydney Chromium runner for the complete 50-test matrix; never compare a partial or mixed-runner sample.
- Use the Cloudflare Speed API without a recurring schedule for five `australia-southeast1` tests per host and route. Preserve all 50 returned test IDs and both desktop/mobile report summaries. Do not describe these Sydney tests as Cloudflare-only; the same API runner must request both host URLs.
- Re-run the fixed four-probe Melbourne and four-probe Sydney Globalping matrix for three alternating rounds per host and route, preserving all 240 HTTP rows. Re-run explicit IPv4 and IPv6 curl samples from the execution machine.
- Repeat the hosted browser matrix on all five routes and both viewports for both hosts, including analytics interception, forced sampled/unsampled replay, FAQs, pricing states, mobile menu, contact error/success, image `currentSrc`, Dot Pool, WebGL fallback, focus states, overflow, and error checks.
- Update `documents/guides/_hosting.md`, this plan's implemented-solution record, and the existing cold-reader HTML report with per-host before/after tables, cross-host tables, deterministic byte changes, all failures, regional scope, and a new hosting recommendation.

**Success Criteria:**

- The selected GitHub artifact and Cloudflare deployment identify one commit and produce zero decoded-body or status mismatches across the complete served manifest.
- All 150 local Lighthouse reports complete: 2 hosts x 5 routes x 10 mobile runs plus 2 hosts x 5 routes x 5 desktop runs. All 30 DevTools-throttled reports complete separately.
- All 50 Sydney Speed API tests complete and return both mobile and desktop reports; all 240 Globalping rows return HTTP 200; IPv4 and IPv6 checks succeed on both hosts.
- Both hosts meet every REQ-19 route ceiling, About meets REQ-22, and every host-and-route comparison passes REQ-27 against its own pre-change baseline.
- Hosted analytics requests are intercepted rather than sent. One initial and one per-route Page View are observed, custom/referral payloads match, unsampled sessions omit the recorder, and sampled sessions load it.
- Every route and interaction passes at both viewports with permanent dark rendering, no overflow, no visual regression, no unexpected console/page error, and no failed first-party request.
- The report distinguishes Perth/local browser results, Sydney browser results, Melbourne/Sydney transport results, cold and warm behaviour, application bytes, and provider delivery. It does not infer Melbourne render performance from Globalping.
- Steps 6 through 10 remain blocked until the user receives both URLs, the full result, and explicitly approves production cutover.

### Step 6: Add a Parallel Cloudflare Deployment to GitHub Actions

**Objective:** Prove the permanent CI path while GitHub Pages remains available for rollback.

#### 6.1 High-Level Approach

- Begin only after Step 5G passes and the user approves cutover from its matched-artifact report.
- Add exact dev dependency `wrangler@4.127.1` to `demo/package.json` and `demo/package-lock.json`; do not add a Wrangler configuration file.
- Update `.github/workflows/deploy.yml` so one build on `main` uses Node.js `22.23.1`, runs `npm ci`, `npm run lint`, `npm run build`, and `npm test`, uploads the existing GitHub Pages artifact, deploys it to GitHub Pages, and uploads the same `demo/out` directory to the Cloudflare Pages production branch `main` with Wrangler.
- Use GitHub secret `CLOUDFLARE_PAGES_API_TOKEN` and repository variable `CLOUDFLARE_ACCOUNT_ID`. Pass the project name, branch `main`, and `GITHUB_SHA` explicitly. Do not interpolate commit-message text directly into a shell command.
- Keep existing GitHub Pages permissions only while its deploy job remains. Add no Pages Function, Worker, adapter, build environment, runtime secret, or custom header.
- Add or update assertions in `demo/test/runtime-and-browser-rules.test.mjs` for the Node pin, static output path, Wrangler version, project name, production branch, secret/variable names, and required validation commands.
- Review the complete scoped diff. Commit only migration-owned files and push only when the execution request explicitly authorises commit and push. Wait for the workflow and both deployment providers to finish.

**Success Criteria:**

- `demo/package.json` and lockfile resolve Wrangler exactly to `4.127.1`, whose Node engine accepts Node.js `22.23.1`.
- The workflow contains one build of `demo/out`; GitHub Pages and Cloudflare consume that output without separate framework builds.
- The workflow runs lint, build, and the existing Node test suite before either deploy can complete.
- A pushed `main` revision produces successful GitHub Pages and Cloudflare Pages deployments with the same `GITHUB_SHA`.
- `https://bulma.com.au/` still reports GitHub Pages before DNS cutover, while the Pages project production deployment reports the same SHA at its root `pages.dev` subdomain.
- `npm --prefix /Users/sacino/bulma-root/demo run lint`, `npm --prefix /Users/sacino/bulma-root/demo run build`, and `npm --prefix /Users/sacino/bulma-root/demo test` all exit 0.
- No unrelated file or pre-existing staged change enters the migration commit.

### Step 7: Refresh Rollback Evidence and Connect the Custom Domains

**Objective:** Move production traffic to the verified Cloudflare deployment with an exact, tested rollback path.

#### 7.1 High-Level Approach

- Immediately before DNS mutation, re-query all records named `bulma.com.au` and `www.bulma.com.au`, every proxied hostname, all account redirect lists/rulesets, all zone Cache Rules, compression rules, configuration rules, redirect rulesets/Page Rules, every setting listed in Current Cloudflare Delivery Settings, the Pages production deployment, and the GitHub Pages state. Replace the provisional DNS/settings sections in `documents/guides/_hosting.md` with this final pre-cutover snapshot and commit it before changing DNS.
- Compare the four web A records to the current-state baseline. If an unexpected web record, redirect, custom domain, Pages deployment, or third-party change exists, stop and request direction. Do not delete or overwrite it.
- Record an exact Cloudflare API rollback payload for `browser_cache_ttl: 14400`, then change only that zone setting to `0` (`Respect Existing Headers`). Re-query the complete settings list and prove every other value is unchanged. This setting write precedes the proxied Pages records, so it does not alter the current DNS-only GitHub Pages responses.
- Through the Pages custom-domain API, associate `bulma.com.au` and `www.bulma.com.au` with the verified project before manually creating any CNAME.
- Inspect the DNS response after each association. If Cloudflare created the required proxied CNAME, do not add another. If the domain is `pending` and the old A records remain, delete only the exact snapshotted A records for that hostname, re-query DNS, and create one proxied CNAME to the API-returned Pages subdomain only when none exists.
- Poll the Pages domain API in bounded intervals until both custom domains report `active` and certificate validation is active. Do not use a blocking wait longer than 60 seconds without a user update.
- Verify apex HTTPS, HTML revalidation, hashed-asset immutability, Brotli, HTTP/2 or HTTP/3, IPv4, and IPv6 before adding redirects. Keep the GitHub Pages site and its last deployment intact throughout this step.
- If any cutover gate fails, restore the exact web A records and `browser_cache_ttl: 14400` before detaching the Pages domains. Re-query both resources and verify GitHub Pages serves the apex again.

**Success Criteria:**

- The final pre-cutover snapshot is committed and contains sufficient JSON-equivalent fields to recreate every apex and `www` record exactly.
- The snapshot contains every listed Cloudflare setting and ruleset plus tested request payloads for `browser_cache_ttl: 0` and rollback to `14400`.
- Immediately before domain association, the API reports `browser_cache_ttl: 0`; every other Cloudflare setting and every ruleset is unchanged from the snapshot.
- Pages domain API returns `active` for both `bulma.com.au` and `www.bulma.com.au` with no validation error.
- DNS API returns exactly one proxied Cloudflare-managed web record for the apex and one for `www`, each targeting the API-returned project subdomain directly or through Cloudflare's Pages association.
- The three apex A records and one `www` A record are absent only after the Pages association exists.
- The existing MX record and all three TXT records match the final pre-cutover snapshot in every recorded field.
- `curl -I https://bulma.com.au/` returns HTTP 200, a valid Cloudflare-served certificate, `server: cloudflare`, no redirect, and `Cache-Control: public, max-age=0, must-revalidate`.
- A content-hashed `/_next/static/*` response returns the one-year immutable policy; compressible responses negotiate Brotli when the client offers it; IPv4 and IPv6 both return the same status and decoded body.
- GitHub Pages remains enabled and its last successful artifact remains available for rollback.

### Step 8: Enforce One Canonical Host and Verify Production

**Objective:** Preserve the existing `www` redirect and prevent duplicate `pages.dev` content after cutover.

#### 8.1 High-Level Approach

- Re-query account redirect lists and the account `http_request_redirect` entry-point ruleset. Preserve every existing item and rule if concurrent changes appeared.
- Create a dedicated redirect list named `bulma_root_canonical_redirects` with two path-preserving, query-preserving permanent redirects:
  - `www.bulma.com.au` to `https://bulma.com.au`, covering all paths.
  - The API-returned project `pages.dev` hostname to `https://bulma.com.au`, covering all paths and subdomains so the production, branch, and deployment-specific aliases redirect.
- Create or append one enabled account Bulk Redirect rule that references only this list. Record list, operation, ruleset, and rule IDs in `documents/guides/_hosting.md`. Poll list-item operations until `completed` before enabling the rule.
- Run direct header checks for apex, `www`, root `pages.dev`, the comparison alias, and the immutable deployment URL. Verify path and query preservation with a value such as `/pricing/?source=host-check`.
- Re-query `browser_cache_ttl`, Brotli, HTTP/3, IPv6, Early Hints, Speed Brain, 0-RTT, Rocket Loader, Development Mode, Cache Rules, compression rules, and configuration rules. Confirm only Browser Cache TTL differs from the pre-cutover setting snapshot.
- Repeat hosted browser checks for all five public routes at `1440x900` and `390x900`, emulating `prefers-color-scheme: light`. Check route rendering, navigation, pricing states, FAQ hash behaviour, overflow, console errors, page errors, and first-party network failures.
- Run three Lighthouse measurements for the custom apex on every public route in both viewport modes. Compare route medians with the Step 5G Cloudflare preview medians and apply REQ-27. Treat any failed route as a failed cutover gate before decommissioning GitHub Pages.
- Verify Chrome negotiates HTTP/3 on a repeated eligible request and that an `Accept-Encoding: br` request receives Brotli for HTML, CSS, and JavaScript. Record a provider limitation rather than adding a compression rule if Pages itself selects another valid compressed representation and the Step 5G transfer/non-inferiority gates still pass.
- If any critical route, TLS, redirect, body, cache, browser, or performance gate fails, disable the new Bulk Redirect rule, restore the exact four A records and `browser_cache_ttl: 14400` from the snapshot, verify GitHub Pages serves the apex and `www` again, then detach the Pages custom domains. Do not disable GitHub Pages.

**Success Criteria:**

- `https://www.bulma.com.au/pricing/?source=host-check` returns exactly one HTTP 301 whose `Location` is `https://bulma.com.au/pricing/?source=host-check`.
- Root, comparison, and deployment-specific `pages.dev` URLs return HTTP 301 to the matching apex path and query.
- `https://bulma.com.au/` and all five public routes return HTTP 200 without a host redirect, and a random unknown path returns HTTP 404 with the built custom page.
- Apex responses contain no `X-Robots-Tag: noindex`; `robots.txt`, sitemap, canonicals, Open Graph data, and JSON-LD all retain the apex origin.
- Apex HTML keeps `public, max-age=0, must-revalidate`; hashed `/_next/static/*` assets keep the one-year immutable policy; no custom Cache Rule exists.
- The settings API reports `browser_cache_ttl: 0`, Brotli/HTTP/3/IPv6/TLS 1.3 on, Development Mode/Rocket Loader/Speed Brain/0-RTT off, and no unexpected setting or ruleset change.
- Browser checks pass at both required viewports with zero console errors, page errors, horizontal overflow, and failed first-party requests.
- Every route's custom-domain performance passes REQ-27 against the corresponding Step 5G Cloudflare preview median.
- The redirect list and rule IDs, exact item configuration, live DNS state, and tested rollback result are recorded in `documents/guides/_hosting.md`.

### Step 9: Make Cloudflare the Sole Deployment Target and Retire GitHub Pages

**Objective:** Complete the migration only after production has passed with GitHub Pages still recoverable.

#### 9.1 High-Level Approach

- Update `.github/workflows/deploy.yml` to remove `actions/upload-pages-artifact`, `actions/deploy-pages`, the GitHub Pages deploy job, and the `pages: write` and `id-token: write` permissions. Keep checkout, Node `22.23.1`, `npm ci`, lint, build, tests, and the Wrangler Direct Upload to project production branch `main`.
- Update `demo/test/runtime-and-browser-rules.test.mjs` so it asserts the Cloudflare-only workflow and reads the new hosting guide rather than `github-pages-setup.md`.
- Update `demo/next.config.ts` comments to describe portable static export rather than GitHub Pages. Preserve `output`, `basePath`, image, and trailing-slash values exactly.
- Update `README.md` and `AGENTS.md` to identify Cloudflare Pages Direct Upload as production, name `demo/out`, the account and project selection rules, the GitHub Actions workflow, the `pages.dev` preview model, and the no-dashboard requirement. Add `documents/guides/_hosting.md` to the architecture documentation table.
- Use `trash` to remove root `CNAME`, `demo/public/CNAME`, and `github-pages-setup.md`. Do not use `rm` or Git restore operations.
- Run the full local validation, inspect the complete diff, commit only migration-owned files, push the Cloudflare-only workflow, and wait for its deployment. Verify the deployed SHA before disabling GitHub Pages.
- Disable the GitHub Pages site through `gh api` only after the Cloudflare-only workflow succeeds and all Step 8 production checks still pass.
- Retain the least-privilege Pages token because GitHub Actions uses it. Record its rotation and revocation commands in the hosting guide without including the token value.

**Success Criteria:**

- `.github/workflows/deploy.yml` contains no `actions/upload-pages-artifact`, `actions/deploy-pages`, GitHub Pages environment, `pages: write`, or `id-token: write` entry.
- The workflow contains Node `22.23.1`, `npm ci`, lint, build, tests, and Wrangler upload of `demo/out` to the returned project name with branch `main`.
- A new successful Cloudflare deployment reports the final `origin/main` SHA before GitHub Pages is disabled.
- `gh api repos/Culpable/bulma-root/pages` returns the expected not-found response after decommissioning, while `https://bulma.com.au/` continues to return HTTP 200 from Cloudflare.
- Root `CNAME`, `demo/public/CNAME`, and `github-pages-setup.md` no longer exist in the final commit.
- `README.md`, `AGENTS.md`, `documents/guides/_hosting.md`, `demo/next.config.ts`, and `demo/test/runtime-and-browser-rules.test.mjs` contain no active claim that GitHub Pages hosts production.
- `rg -n "GitHub Pages|github-pages|actions/deploy-pages|upload-pages-artifact"` returns only explicit historical or rollback context in `documents/guides/_hosting.md` and this completed plan.
- Step 9 makes no additional animation, design, page, component, metadata, sitemap, robots, contact-field, or analytics implementation change beyond the already approved and verified Step 5 remediation.

### Step 10: Complete Final Hosted and Repository Verification

**Objective:** Prove the final repository, CI pipeline, Cloudflare control plane, DNS, and public site agree.

#### 10.1 High-Level Approach

- Run local lint, build, and tests with absolute project targeting. Inspect `demo/out` for all expected routes and the absence of GitHub/Cloudflare runtime-only files.
- Query the Pages project, deployments, and domains. Confirm Direct Upload, `source: null`, `uses_functions: false`, production branch `main`, both custom domains active, and the latest deployment SHA equal to `origin/main`.
- Query DNS, redirects, all delivery settings, and every ruleset phase. Confirm only intended Bulma web records, canonical redirects, and `browser_cache_ttl` changed; compare MX, TXT, all other settings, and all unrelated rules to the final pre-cutover snapshot.
- Re-run apex, `www`, `pages.dev`, discovery, asset, unknown-path, browser, and performance checks from Steps 4 and 8.
- Re-run the deterministic bundle and image budgets. Confirm the final Cloudflare-only workflow builds the same REQ-19-through-REQ-27-compliant application tested in Step 5G.
- Review the complete committed diff and the final commit contents. Confirm the unrelated plan and all unrelated worktree/index changes remain intact.
- Add final commands, results, deployment IDs, redirect IDs, DNS state, benchmark summary, and rollback verification to `documents/guides/_hosting.md`. Do not include secret values or raw headers that expose authentication data.

**Success Criteria:**

- `npm --prefix /Users/sacino/bulma-root/demo run lint` exits 0 with zero errors.
- `npm --prefix /Users/sacino/bulma-root/demo run build` exits 0 and produces the static export and sitemap without errors.
- `npm --prefix /Users/sacino/bulma-root/demo test` exits 0 with all existing and migration assertions passing.
- The final Pages project returns `source: null`, `uses_functions: false`, `production_branch: main`, active apex and `www` domains, and a latest production deployment SHA equal to `git -C /Users/sacino/bulma-root rev-parse origin/main`.
- Apex, `www`, `pages.dev`, route, 404, discovery, content-type, body, browser, and performance checks meet every Step 8 assertion.
- DNS comparison proves MX and TXT records are byte-for-byte unchanged from the committed pre-cutover snapshot.
- Cloudflare comparison proves `browser_cache_ttl: 0` is the only intended delivery-setting change, no custom Cache Rule exists, and every rollback payload remains valid.
- Every final route retains the Step 5G JavaScript and image budgets and passes REQ-27 against the approved Cloudflare baseline.
- The final GitHub Actions run succeeds, GitHub Pages is disabled, and no custom domain points to GitHub's `185.199.108.153` through `185.199.111.153` addresses.
- `git show --stat --oneline HEAD` and `git show --name-status HEAD` contain only the authorised migration files, while unrelated working-tree and index state remains unchanged.

---

## 6. Testing Plan

### 6.1 Source-of-Truth Regression Artifacts

| Artifact | Why it matters | Expected final behaviour | Scope |
| --- | --- | --- | --- |
| `.github/workflows/deploy.yml` | Exact current build and GitHub Pages deployment owner | Builds once with Node `22.23.1`, validates, and uploads `demo/out` only to Cloudflare Pages | Full file |
| `demo/next.config.ts` | Static-export, base-path, image, and trailing-slash contract | Values remain unchanged; only provider-specific comments change | Full file |
| Downloaded `github-pages` artifact from the selected successful Actions run | Exact payload GitHub deployed and Cloudflare must receive | Hosted response bodies match the extracted artifact; no separately rebuilt output is used for comparison | Full extracted tree and artifact digest |
| `https://bulma.com.au/` and its current headers | Live GitHub Pages baseline and canonical URL | Same URL and content are served by Cloudflare after cutover | Full response and headers |
| GitHub Pages API for `Culpable/bulma-root` | Current host state: workflow build, CNAME, HTTPS, active site | Active through rollback verification, then disabled after Cloudflare-only deploy succeeds | Repository Pages resource |
| Cloudflare zone `0534ecfcfde9d322566af12ec11c1bef` DNS records | Exact rollback source and mail/verification safety boundary | Four web A records are replaced; MX and TXT records are unchanged | Every record named apex or `www` |
| Cloudflare account `213ab3604485056376263d22fa242742` Pages and redirect inventories | Identifies the existing Direct Upload project and proves unrelated redirect resources will not be overwritten | Existing `bulma-root` project is preserved; one Bulma-specific canonical redirect list/rule exists after cutover | Exact account resources |
| Cloudflare zone delivery settings and rulesets | Controls custom-domain caching, compression, protocol, script rewriting, and speculative loading | Only `browser_cache_ttl` changes from `14400` to `0`; every named toggle and ruleset matches the recorded decision | Full settings list, all ruleset phases, and rollback payloads |
| `demo/performance-budgets.json` and `demo/src/scripts/report-performance-budgets.mjs` | Durable byte and hosted-report gates | All five routes meet REQ-19 and deterministic compressed JavaScript cannot grow silently | Full files and generated summary |
| `demo/src/lib/mixpanelClient.js`, `demo/src/components/MixpanelProvider.jsx`, `demo/src/lib/analytics.js`, and `demo/public/scripts/referral-tracking.js` | Analytics, attribution, replay, and heatmap contracts | Official async recorder split with unchanged events, configuration, sampling, timing, and readiness | Full runtime contract |
| FAQ, plan-tab, and button source files named in Step 5E | Removes owned client runtime without changing interactions | No shipped Tailwind Plus runtime or dead preload boundary; identical visual, hash, ARIA, keyboard, and button behaviour | Full active component graph |
| `demo/src/app/about/page.tsx` and responsive About assets | Current 46 KiB image-delivery opportunity | Mobile selects verified 640-pixel candidates; desktop retains adequate sources; no visible change | Markup, assets, encoder provenance, and screenshots |
| `demo/public/_headers` | Approved Cloudflare browser caching boundary | Only content-hashed `/_next/static/*` receives one-year immutable caching | Full file and hosted headers |
| `demo/public/robots.txt`, `demo/public/sitemap.xml`, and built metadata | Production-origin discovery contract | Continue to name only `https://bulma.com.au` on preview and production | Full files and emitted HTML |
| `demo/src/app/contact/contact-form.tsx` | Exact external form destination and field contract | Same endpoint and four fields; migration tests send no real enquiry | Full form contract |
| `demo/test/runtime-and-browser-rules.test.mjs` | Existing deployment/runtime documentation assertions | Asserts Cloudflare workflow, Node pin, and hosting guide | Full test file |
| `documents/todo/agent_readiness_and_page_speed_plan.md` and commit `854b85f576910a5a5c3576bdf9fef62a6da4df81` | Committed starting point for remaining speed work | Remains the recorded before state; later speed work is measured against it on each host | Complete plan, commit, and baseline manifests |

<critical_warning>
> **CRITICAL WARNING:** The live DNS records, Cloudflare settings/rulesets, GitHub Pages API state, selected commit export, and hosted response bodies are the rollback and parity sources of truth. Re-query and record them immediately before writes. Do not replace them with example records, dashboard screenshots, a newly generated synthetic site, or assumptions copied from this plan. If they differ from the inspected baseline, stop before changing settings, deleting records, or disabling GitHub Pages.
</critical_warning>

### 6.2 Automated Checks

| Check | Tool and location | Expected Result |
| --- | --- | --- |
| Lint | ESLint via `npm --prefix /Users/sacino/bulma-root/demo run lint` | Exit 0, zero errors |
| Static build | Next.js via `npm --prefix /Users/sacino/bulma-root/demo run build` | Exit 0; `demo/out` contains all public routes, assets, top-level `404.html`, robots, and sitemap |
| Regression suite | Node test runner via `npm --prefix /Users/sacino/bulma-root/demo test` | Exit 0; existing and migration assertions pass |
| Performance budgets | `demo/src/scripts/report-performance-budgets.mjs` against `demo/out`, gzip output, and supplied Lighthouse JSON | Every route meets REQ-19; Mixpanel core is at most 40 KiB gzip; deterministic compressed JavaScript does not increase |
| Analytics runtime | `demo/test/analytics-runtime.test.mjs` with network and scheduler fakes | Event names/properties, identity, referral, readiness, timing, heatmaps, and 20% replay sampling remain intact; no real request is sent |
| Active client graph | Turbopack production analysis plus source assertions | No default Mixpanel entry, shipped Tailwind Plus runtime, dead preload helper, or deep Three.js import enters a route |
| Responsive images | Dimension/file-size assertions plus browser `currentSrc` | About mobile candidates meet Step 5F ceilings and desktop retains adequate physical pixels |
| CSS decision gate | Browser coverage, compressed byte manifest, and Lighthouse render-blocking audit | Shared CSS remains external unless every REQ-23 condition passes on both hosts |
| Direct Upload limits | `find`, `wc`, `stat` against the selected `out` directory | Fewer than 20,000 files; no file exceeds 25 MiB |
| Static-only contract | `find` and `rg` against repository and `out` | No Pages Functions, `_worker.js`, `_routes.json`, adapter, runtime binding, or request-time route |
| Body parity | `curl`, `shasum -a 256`, and generated manifest | Named responses match local output and one another after decoding transport compression |
| Canonical/discovery policy | `curl`, `rg`, and XML parsing | No `pages.dev` URL in canonical, sitemap, robots, JSON-LD, Open Graph, or HTML discovery output |
| Preview indexing | `curl -I` against branch and deployment URLs | `X-Robots-Tag: noindex` present before cutover |
| Deployment identity | GitHub and Cloudflare APIs | Each compared and final deployment reports the selected commit SHA |
| Credential scope | Cloudflare account-token API and `gh secret list` | One Pages Write account token; secret exists by name; no value is printed |
| DNS preservation | Cloudflare DNS API and committed snapshot | MX/TXT fields unchanged; only recorded web records differ |
| Cloudflare delivery state | Zone settings API plus every ruleset endpoint | Pre-cutover state matches the snapshot; final state changes only `browser_cache_ttl` from `14400` to `0` and has a tested rollback |
| CI ownership | Source assertions and GitHub Actions API | Final workflow deploys only to Cloudflare and latest run succeeds |

### 6.3 Hosted Integration Tests

1. **Noindexed Cloudflare comparison deployment**
   - Action: Request the branch alias and immutable deployment URL before custom-domain work.
   - Expected: HTTP 200 for `/`, `X-Robots-Tag: noindex`, production canonical, no custom domains.
   - Verify: Cloudflare Pages deployment/project APIs and `curl -I`.

2. **Route and body parity**
   - Action: Request all five public routes, one unknown path, discovery files, emitted JavaScript/CSS, and representative media on both hosts.
   - Expected: Matching decoded body hashes, matching route statuses, correct content types, and only documented provider-header differences.
   - Verify: SHA-256 manifest plus raw status/header summary.

3. **Side-by-side speed comparison**
   - Action: Run the Step 5G alternating local Lighthouse matrix, Sydney Speed API matrix, fixed-probe Globalping matrix, and IPv4/IPv6 checks against one artifact on both hosts.
   - Expected: Every route meets REQ-19, REQ-22, and REQ-27; complete median/range/delta tables preserve every run and state its geographic scope.
   - Verify: 150 standard Lighthouse JSON files, 30 DevTools-throttled files, 50 Sydney test records with both device reports, 240 Globalping rows, deterministic gzip manifests, and raw failure records before aggregation.

4. **Dark-only responsive rendering**
   - Action: Open every public route on both hosts at `1440x900` and `390x900` while emulating `prefers-color-scheme: light`.
   - Expected: Dark rendering, identical text and interactions, no overflow, no console/page errors, and no failed first-party requests.
   - Verify: `dev-browser` DOM checks and targeted screenshots with absolute paths when evidence is needed.

5. **Navigation and interaction preservation**
   - Action: Exercise mobile navigation, direct and same-page `#lenders`, pricing Monthly/Yearly states, and key CTA links.
   - Expected: Current routes and states behave identically on GitHub Pages and Cloudflare preview, then on the custom apex.
   - Verify: URL, disclosure state, visible text, and browser error checks.

6. **Contact form safety**
   - Action: Fill the four existing fields, intercept submit, inspect the request, and abort it.
   - Expected: POST target `https://formspree.io/f/xojvwybl`; field names exactly `form_source`, `name`, `email`, `message`; no external request completes.
   - Verify: Intercepted request metadata and absence of a successful Formspree response.

7. **Custom-domain routing**
   - Action: Request apex, `www`, Pages aliases, discovery files, assets, and an unknown path after cutover.
   - Expected: Apex serves Cloudflare content with revalidating HTML and immutable hashed assets; `www` and Pages aliases redirect once with path/query preserved; unknown path returns 404; discovery remains apex-only.
   - Verify: `curl --location --max-redirs`, Pages API, DNS API, redirect API, settings API, content negotiation, and browser protocol inspection.

8. **Rollback before GitHub decommissioning**
   - Action: Validate the stored recreation payloads against the final pre-cutover snapshot without mutating production; if any cutover gate fails, execute them.
   - Expected: The payload recreates the three apex A records and one `www` A record exactly, restores `browser_cache_ttl: 14400`, disables the Bulma redirect rule, and returns traffic to the still-active GitHub Pages deployment.
   - Verify: JSON schema/field comparison before cutover; settings/DNS API equality plus live `server: GitHub.com` and current `www` redirect only if rollback is triggered.

9. **Cloudflare-only continuous deployment**
   - Action: Push the final authorised migration commit and wait for `.github/workflows/deploy.yml`.
   - Expected: Local validation passes; one Wrangler deployment reaches Pages production branch `main`; no GitHub Pages job runs; deployed SHA equals `origin/main`.
   - Verify: GitHub Actions logs/status and Cloudflare deployment API.

10. **Final decommissioning**
    - Action: Disable GitHub Pages after all prior checks pass.
   - Expected: GitHub Pages API reports no active site; apex remains HTTP 200 from Cloudflare; `www` and Pages aliases retain canonical redirects.
   - Verify: GitHub API, Cloudflare API, DNS API, and live HTTP requests.

11. **Analytics and replay preservation**
    - Action: Intercept Mixpanel endpoints while loading each route, navigating client-side, firing custom/referral events, and forcing sampled and unsampled replay paths.
    - Expected: Existing events, properties, identity, first-touch values, timing, heatmaps, and readiness events remain exact; only sampled sessions request the recorder; no request reaches Mixpanel during the test.
    - Verify: Intercepted request/queue records, recorder request count, cookie state, and zero completed third-party analytics requests.

12. **Cloudflare delivery-setting verification**
    - Action: Compare every named setting and ruleset before and after cutover, then request HTML, CSS, JavaScript, and images over supported protocols and encodings.
    - Expected: Only Browser Cache TTL changes from `14400` to `0`; HTML revalidates; hashed Next assets remain immutable; Brotli, HTTP/3, IPv6, and Pages Early Hints work where eligible; Rocket Loader, Speed Brain, and 0-RTT remain off.
    - Verify: Full API snapshots, exact rollback payload, response headers, decoded body hashes, Chrome protocol data, and IPv4/IPv6 curl output.

---

## 7. Implemented Solution

### Completed Scope

- Completed Steps 1 through 5C only. Steps 5D through 10 remain unstarted and require a later execution request; Steps 6 through 10 also remain behind the production cutover approval gate.
- Completed Steps 5A, 5B, and 5C after the user explicitly requested the readiness refresh, first remediation pass, commit/push, and commit-matched recheck.
- Kept the aggregate plan status `IN PROGRESS` because the full migration is not complete.

### Repository Files

- Created `documents/guides/_hosting.md` as the migration source of truth. It records provider identifiers, credential boundaries, the complete initial DNS snapshot, rollback payloads, selected GitHub artifact and commit, Cloudflare project and deployment identifiers, parity evidence, browser checks, full Lighthouse and curl comparison tables, and the current approval state.
- Updated `documents/todo/cloudflare_pages_migration_plan.md` with live status markers and this implemented-solution record.
- Made no migration changes to application source, package files, workflows, generated public output, Git branches, the Git index, or commits.
- Preserved all unrelated collaborative worktree changes. Removed only the migration-generated `.wrangler/` cache by moving it to Trash.

### External Resources

- Created active account-owned Cloudflare token `bulma-root-cloudflare-pages-deploy` with exactly one allow policy, one `Pages Write` permission group, and account `213ab3604485056376263d22fa242742` as its only resource.
- Stored the one-time token value only as GitHub Actions secret `CLOUDFLARE_PAGES_API_TOKEN`; stored the account ID as repository variable `CLOUDFLARE_ACCOUNT_ID`.
- Created Direct Upload Pages project `bulma-root` with production branch `main`, `source: null`, and no custom domains.
- Deployed the exact GitHub Pages artifact for commit `2a475b50527f3d81593b0a9d3036cde94b974adc` only to preview branch `cloudflare-comparison`.
- Published no Cloudflare production deployment and changed no DNS, custom domain, redirect, or GitHub Pages setting.

### Hosted Behaviour and Performance

- Verified zero decoded-body mismatches across all 178 emitted files before and after benchmarking.
- Verified every public route, custom 404, discovery file, navigation state, pricing state, mobile menu, FAQ hash path, CTA, contact-field contract, dark-only rendering, and responsive viewport requirement.
- Kept both Cloudflare preview URLs noindexed. The branch alias is `https://cloudflare-comparison.bulma-root.pages.dev/`; the immutable deployment is `https://80ac3a14.bulma-root.pages.dev/`.
- Recorded all 40 Lighthouse results and 120 measured curl results. From the Perth execution machine, GitHub Pages had lower median TTFB and total time for every tested resource; Cloudflare transferred fewer bytes and led selected metrics.
- Requested explicit cutover approval after presenting both URLs and the comparison. The approval prompt returned no selection, so approval is withheld and production remains on GitHub Pages.

### Validation

- Passed independent selected-revision `npm ci`, lint, production build, and 17-test suite under Node.js `22.23.1`.
- Passed live-checkout lint and all 23 current live-checkout tests after unrelated collaborative changes appeared.
- Passed Direct Upload file limits, static-only inspection, preview noindex, canonical-origin inspection, project/deployment identity, credential-scope, DNS-preservation, full body parity, hosted browser, benchmark-count, and post-benchmark parity checks.
- Did not repeat a live-checkout production build while the pre-existing port 3001 Bulma dev server was active. The selected revision's disposable archive build is the production-build evidence for Steps 1 through 5.

### Step 5A Readiness Refresh

- Added Step 5A to distinguish the original byte-identical host comparison from the later user-authorised readiness comparison. The refreshed result is a combined application-and-host delta and cannot support cutover until the readiness source is committed.
- Copied the current `demo/` source into disposable path `/tmp/bulma-cloudflare-readiness.4B7IDb` because the shared checkout's pre-existing port 3001 dev server remained active.
- Isolated Node.js `22.23.1` validation passed: `npm ci`, ESLint, production static build, and all 23 tests. The first test attempt lacked repository-level fixtures; after copying the exact referenced workflow, README, browser rule, runtime pin, GitHub Pages guide, and animation guide, all 23 tests passed.
- The refreshed export contains 182 files and 6,667,165 uncompressed bytes. Its largest file is 488,911-byte Three.js chunk `_next/static/chunks/5995cb1810ff71d4.js`; its combined manifest SHA-256 is `9c9c5f2dee159ba968c0c38d65a32792b89d25e130f1ea227497bf7dea7cac35`.
- Verified zero font preloads, zero `role="image"` source matches, zero Pages Function or Worker runtime files, one canonical per indexable route, static JSON-LD, `/llms.txt`, corrected sitemap, no `pages.dev` discovery origin, responsive image candidates, WebGL fallback, and noindex-only static 404 robots output.
- Wrangler `4.127.1` published deployment `0e21f32b-05ae-4d52-9557-18a7433fd08b` to the existing `cloudflare-comparison` preview branch. It reports commit `2a475b50527f3d81593b0a9d3036cde94b974adc`, `commit_dirty: true`, `uses_functions: false`, status `success`, immutable URL `https://0e21f32b.bulma-root.pages.dev/`, and branch alias `https://cloudflare-comparison.bulma-root.pages.dev/`.
- Both preview URLs return HTTP 200 and `X-Robots-Tag: noindex`. The project still has no production deployment or custom domain, and the complete DNS baseline remains unchanged.
- Compared all 182 generated files against decoded branch-alias responses before and after benchmarking. Every status and SHA-256 body matched, including the custom 404 through an unknown route.
- Re-ran the hosted browser matrix on all five routes at `1440x900` and `390x900` with light colour-scheme emulation. Verified dark lock-in, zero overflow, skip navigation, both `#lenders` paths, FAQ transitions, Monthly and Yearly pricing, equal-height desktop cards, mobile navigation, CTAs, Dot Pool post-load timing, pointer response, WebGL fallback, DPR 1.75 responsive images, and mocked contact error/success states without sending Formspree traffic.
- Lighthouse homepage results reached Accessibility `1.00`, Best Practices `1.00`, and Agentic Browsing `1.00`. The noindexed preview's SEO result is intentionally not representative. Separate route audits exposed pre-existing `/about/` list semantics and `/pricing/` heading/table semantics outside this deployment refresh.
- Recorded 40 successful Lighthouse performance files and 120 successful curl rows. Against unchanged GitHub production, refreshed Cloudflare mobile LCP improved by 351.7 ms on `/` and 712.9 ms on `/pricing/`; Cloudflare median TTFB remained 25-46 ms slower from Perth.
- Compared with the previous Cloudflare artifact, mobile homepage LCP improved 13.3% and mobile pricing LCP improved 28.6%. Mobile homepage FCP regressed to 1,979.9 ms and does not meet the 1,500 ms readiness target. `documents/guides/_hosting.md` records every median, range, delta, method, deployment identity, caveat, and remaining gate.
- Updated the existing HTML implementation report at `/Users/sacino/.agents/skills/post-work-response/tmp/bulma-root/20260830-1457-agent-readiness-page-speed/index.html` with the deployed result, screenshots, benchmark summary, production boundary, and next action.
- Passed the report contract and presentation validators, responsive browser checks at 390 px, 1440 px, and 1920 px, and an independent cold read. The report now names the preview URLs, deployment identity, dirty-source provenance, remaining semantics findings, and exact pre-cutover and post-cutover gates.

### Step 5A Melbourne and Sydney Recheck

- Re-ran the current Cloudflare readiness preview against GitHub production from four fixed Melbourne probes and four fixed Sydney probes through Globalping.
- Covered all five public routes for three rounds per host. Reused the same probes, alternated host order, and recorded 240 successful HTTP 200 samples.
- GitHub returned the fastest fully warm HTML: route-level median totals were about 14-17 ms versus Cloudflare's 39-50 ms in round 2.
- Cloudflare retained the warm result in round 3 at 36-41 ms across the route medians. GitHub returned to 215-229 ms on most routes. Cloudflare's initial fill was slower and included a 2,261 ms Sydney pricing-route median.
- Ran three mobile Lighthouse reports for each host and all five routes. All 30 completed without runtime errors.
- Current Cloudflare mobile LCP led by 1,401 ms on `/`, 657 ms on `/pricing/`, and 884 ms on `/privacy-policy/`. `/about/` and `/contact/` were effective ties.
- Current Cloudflare homepage FCP measured 1,232 ms, compared with 1,980 ms in the earlier five-run set. Treated the 1,500 ms target as unresolved measurement variance and added a ten-run commit-matched post-cutover gate.
- Selected Cloudflare as the stronger current visitor experience because the three large LCP wins outweigh its 20-37 ms higher Lighthouse server-response medians. Kept the conclusion explicitly separate from a host-only result because the two hosts serve different application artifacts.
- Recorded remaining work in `documents/guides/_hosting.md`: about-page and contact-page above-fold opacity delays, 120-184 KiB unused JavaScript across all routes, immutable browser caching for hashed Cloudflare assets, and lower-priority homepage, pricing, and privacy follow-up.
- Kept the production cutover approval gate unchanged. No DNS, custom-domain, production deployment, GitHub Pages, branch, index, commit, or push change was made.

### Step 5B Performance Remediation

- Changed the About and Contact above-fold entrances from opacity-plus-transform reveals to server-rendered, transform-only entrances. The About photo retains its 150ms stagger, and the Contact card animations remain scroll-triggered.
- Recompressed `demo/public/img/photos/1-720.webp` from 30,366 to 23,032 bytes without changing its 720x378 dimensions.
- Split the active navbar into server markup, `navbar-controller.tsx::NavbarController`, and route-aware link clients. The non-home routes now ship about 2.3-3.9 KB less raw initial JavaScript; Lighthouse's representative unused-JavaScript estimate fell by about 20-21 KB on About, Contact, and Privacy.
- Added `demo/public/_headers` for a one-year immutable browser TTL on content-hashed `/_next/static/*` assets. Deployed assets return the configured header, HTML remains `max-age=0, must-revalidate`, and Lighthouse `cache-insight` now reports zero wasted bytes.
- Added three focused performance regression tests and updated the mobile-menu transition contract test. Final lint, static build, and all 26 tests passed.
- Published deployment `ad546a08-869e-43b8-920f-0734c3e656f0` to the existing `cloudflare-comparison` preview branch. The immutable URL is `https://ad546a08.bulma-root.pages.dev/`; both preview URLs remain noindexed, the project has no production deployment or custom domain, and DNS is unchanged.
- Verified all 182 served export files against the local build with zero body or status mismatches. The hosted five-route matrix passed at `1440x900` and `390x900` with light colour-scheme emulation, zero overflow, working About and Contact entrances, and working mobile-menu open, close, active state, and navigation.
- Re-ran 240 Globalping requests from four fixed Melbourne and four fixed Sydney probes. All returned HTTP 200. When both hosts were warm, GitHub route medians were 12-14 ms versus Cloudflare's 36-51 ms; both hosts retained their warm state in round 3.
- Re-ran 30 mobile Lighthouse reports. Cloudflare About LCP improved from 4,385 to 1,908 ms and Contact from 2,582 to 1,831 ms. The new cross-host medians favour Cloudflare for About and Contact, show an effective tie on Pricing and Privacy, and give Cloudflare a 347ms homepage LCP lead; homepage, pricing, and privacy results still show substantial run-to-run variance.
- Kept the aggregate migration status `IN PROGRESS`. No production, DNS, custom-domain, GitHub Pages, Git branch, commit, or push action was performed.

### Step 5C Commit-Matched Production Recheck

- Committed the complete agent-readiness and performance work as `854b85f576910a5a5c3576bdf9fef62a6da4df81` and pushed `main` to GitHub.
- Verified GitHub Actions run `33314166806` completed successfully and GitHub Pages serves the new build, including HTTP 200 for `/llms.txt`.
- Published Cloudflare preview deployment `62181028-c315-4134-b11b-7c61971bc9f6` on branch `cloudflare-comparison`. It reports the same commit, `commit_dirty: false`, `uses_functions: false`, no custom domain, and no production deployment.
- Compared all 182 served files with the committed local export. Cloudflare matched every byte. GitHub matched all 123 non-build-generated files; 59 HTML, React flight, 404, and build-manifest files differ only because GitHub Actions and the local Cloudflare upload are independent Next.js builds. Both hosted route and interaction matrices produced the same rendered behaviour.
- Re-ran the five-route browser matrix at `1440x900` and `390x900` with light colour-scheme emulation. Both hosts returned HTTP 200, retained the permanent dark class, had zero horizontal overflow, and passed mobile menu, yearly pricing, direct and same-page `#lenders`, About visibility, and contact-field checks.
- Re-ran 240 Globalping requests from the same four Melbourne and four Sydney probes. All returned HTTP 200. Cloudflare's combined end-to-end TTFB median was `39 ms`; GitHub's was `220 ms`. City medians were `42 ms` versus `222 ms` in Melbourne and `34 ms` versus `213.5 ms` in Sydney.
- Re-ran 30 Lighthouse mobile reports, three per host and route. GitHub produced the stronger median rendered result on all five routes: scores `98-100` versus Cloudflare's `87-95`, and LCP `1,083-2,360 ms` versus `2,686-3,351 ms` except for no route-level exception.
- Recommended keeping GitHub Pages as production for now. Cloudflare has the stronger Melbourne/Sydney HTML delivery in this run, but it did not convert that transport lead into faster cold-browser rendering. The comparison does not yet support a performance-led production cutover.
- Kept the aggregate migration status `IN PROGRESS`. Steps 5D through 10 remain unstarted. No DNS, custom-domain, redirect, Cloudflare production, or GitHub Pages setting changed.

### Remaining Speed Planning Investigation

- Re-read the current application, tests, animation/design contracts, migration evidence, and full Lighthouse JSON before adding Steps 5D through 5G.
- Ran the Next.js Turbopack production analyser. It identified Mixpanel as the dominant shared owned payload, Tailwind Plus as an active Home/Pricing payload, and Three.js as the preserved homepage-specific floor.
- Measured the installed Mixpanel `2.73.0` entries in disposable bundles: the default entry was 100,243 gzip bytes and the official async-recorder entry was 31,513 gzip bytes. This supports a recorder split without reducing analytics features.
- Measured Three.js in disposable bundles: current named imports were 119,938 gzip bytes and deep source imports were 123,691 gzip bytes. The plan rejects deep imports and preserves the Dot Pool implementation.
- Confirmed the two shared stylesheets transfer about 26.8 KiB combined and Lighthouse reports zero removable CSS bytes. Critical CSS is now a strict disposable experiment rather than an assumed implementation.
- Measured quality-80 640-pixel About candidates at 20,224 bytes for the hero and 10,240 bytes for the testimonial portrait. The plan retains a visual and responsive-selection gate before either can ship.
- Queried the live Pages project, zone, rulesets, Page Rules, DNS proxy scope, and delivery settings through the Cloudflare API without changing them. The project remains preview-only, there are no proxied DNS records or custom rules, and the only planned setting change is Browser Cache TTL from `14400` to `0` immediately before cutover.
- Verified the Cloudflare Speed API has 50 free tests and the Sydney `australia-southeast1` browser region. Melbourne remains transport-only because the available API has no Melbourne browser region.
- Changed only this plan during the new investigation. No application source, dependency, generated output, deployment, Cloudflare setting, DNS record, GitHub setting, Git branch, commit, or push changed.

### Steps 5D-5F Performance Implementation

- Added `demo/performance-budgets.json`, `demo/src/scripts/report-performance-budgets.mjs`, and regression fixtures for the five route ceilings, the recorded `103-170 KiB` baseline, deterministic gzip non-regression, Mixpanel core, active client graph, analytics contracts, and About media.
- Changed Mixpanel `2.73.0` to its official async-recorder entry. The built core is 30,951 bytes gzip, below the 40 KiB ceiling. The token, load/idle timing, cookie and identity configuration, Page View and custom events, referral first touch, heatmaps, masking, fonts, and 20% replay sampling remain unchanged.
- Replaced the routed Tailwind Plus FAQ and mobile plan-tab controllers with focused local React state. Browser checks passed direct and same-page `#lenders`, rapid FAQ reversal, glow/icon state, ARIA, ArrowLeft/ArrowRight/Home/End plan selection, single-panel rendering, Monthly/Yearly pricing, and exact annual copy.
- Removed the unused animation preload module, homepage export, `preloadOnHover`, and shared button client boundary. The built routed graph contains no Tailwind Plus contribution and preserves the existing Three.js Dot Pool chunk.
- Added a 20,224-byte 640x336 About hero and a 10,240-byte 640x458 testimonial portrait. Mobile selected both 640-pixel sources; desktop retained the 1,600-pixel hero and 1,400-pixel testimonial sources. Visual inspection found no crop, colour, sharpness, or layout regression.
- Rejected and trashed a disposable critical-CSS prototype. It saved only 102-243 compressed bytes on a cold route but added 25,904-26,045 bytes to repeat navigation, so the shared external stylesheets remain unchanged under REQ-23.
- Passed lint, production build, all 32 tests, the synthetic failure fixture, deterministic budget reporting, five-route browser checks at `1440x900` and `390x900`, permanent dark rendering under light scheme emulation, interaction checks, image selection, equal-height pricing cards after animation settles, overflow checks, and first-party error checks.
- Kept Step 5G in progress. The local Python static server does not provide production compression, so hosted Lighthouse results remain required for REQ-19 and REQ-27 before the cutover approval gate can reopen.
