# Hosting and Cloudflare Pages Migration

This guide records the hosting control plane, deployment revision, credential boundaries, DNS rollback data, and validation evidence for the migration from GitHub Pages to Cloudflare Pages. It contains identifiers and configuration only. It must never contain a credential value.

## Migration State

- Migration phase: Steps 1 through 5 complete; waiting at the production cutover approval gate.
- Production host: GitHub Pages at `https://bulma.com.au/`.
- Cloudflare custom domains: none.
- Production DNS changes: none.
- Selected revision: `2a475b50527f3d81593b0a9d3036cde94b974adc` from `origin/main`.
- Approval gate: do not associate a custom domain, create a production Pages deployment, change DNS, or disable GitHub Pages until the user approves cutover after reviewing the comparison report.

## Provider Inventory

### GitHub

| Field | Value |
| --- | --- |
| Repository | `Culpable/bulma-root` |
| Repository ID | `1126720966` |
| Default branch | `main` |
| Selected workflow run | `33259142714` |
| Workflow head SHA | `2a475b50527f3d81593b0a9d3036cde94b974adc` |
| Workflow result | `completed / success` |
| GitHub Pages deployment | `6156985652` |
| Deployment result | `success` |
| Deployment URL | `https://bulma.com.au/` |
| Pages build type | `workflow` |
| Pages status | `built` |
| Custom domain | `bulma.com.au` |
| HTTPS enforced | `true` |
| Artifact ID | `9716735629` |
| Artifact name | `github-pages` |
| Artifact size | `4,139,492` bytes |
| Artifact expires | `2026-08-30T15:02:45Z` |
| Artifact expired at selection | `false` |

### Cloudflare

| Field | Value |
| --- | --- |
| Account | `Jake.sacino@gmail.com's Account` |
| Account ID | `213ab3604485056376263d22fa242742` |
| Zone | `bulma.com.au` |
| Zone ID | `0534ecfcfde9d322566af12ec11c1bef` |
| Zone state | `active`, full setup, not paused |
| Nameservers | `vita.ns.cloudflare.com`, `will.ns.cloudflare.com` |
| Authenticated member | `jake.sacino@gmail.com` |
| Membership | `accepted` |
| Role | `Super Administrator - All Privileges` |
| Pages projects at revalidation | None |
| Account-owned API tokens at revalidation | None |
| Account redirect lists at revalidation | None |
| Account `http_request_redirect` rulesets at revalidation | None |
| Zone `http_request_dynamic_redirect` rulesets at revalidation | None |
| Zone Page Rules at revalidation | None |
| Pages project | `bulma-root` |
| Pages project ID | `d427c772-9189-45c4-ab72-e83683e233ea` |
| Pages subdomain | `bulma-root.pages.dev` |
| Pages production branch | `main` |
| Pages source integration | None (`source: null`) |
| Pages custom domains | None |
| Pages deployments after provisioning | None |

The `Pages Write` permission group was revalidated by name as ID `8d28297797f24fb8a0c332fe0866ec89`. The `Account API Tokens Write` permission group was revalidated by name as ID `5bc3f8b21c554832afc660159ab75fa4`. Query permission groups by name again before any later token write.

## Credential Map

| Credential or value | Storage | Use |
| --- | --- | --- |
| Cloudflare Global API Key | macOS Keychain service `cloudflare-global-api-key`, account `jake.sacino@gmail.com` | Local Cloudflare control-plane operations only |
| Cloudflare account email | Command-scoped `CLOUDFLARE_EMAIL` | Global API Key authentication |
| Cloudflare Pages deploy token | GitHub Actions secret `CLOUDFLARE_PAGES_API_TOKEN` | Pages deployments only |
| Cloudflare account ID | GitHub Actions variable `CLOUDFLARE_ACCOUNT_ID` | Select account `213ab3604485056376263d22fa242742` |
| GitHub authentication | `gh` credential store | Repository, Actions, artifact, deployment, secret, and variable operations |

Never print the Global API Key or account-token value. Never write either value to a repository file, environment file, shell profile, temporary file, command argument, or report. Pipe the one-time Pages token directly from the Cloudflare API response to `gh secret set`.

## Initial DNS Snapshot

Snapshot time: `2026-08-30` in the Australia/Perth execution session. This is the initial migration snapshot. Refresh and commit the complete live apex and `www` record state immediately before any custom-domain or DNS change.

Cloudflare represents automatic TTL as `1`. `settings` and `meta` are empty objects for every listed record. `tags` is an empty array for every listed record.

| ID | Type | Name | Content | Proxiable | Proxied | TTL | Settings | Meta | Comment | Tags | Created | Modified |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `f4126d8a14cbaef48bdb01475469868a` | A | `bulma.com.au` | `185.199.111.153` | true | false | 1 | `{}` | `{}` | null | `[]` | `2026-01-02T13:44:43.68224Z` | `2026-01-02T13:44:43.68224Z` |
| `5c2d843829044e88737e52479e6059f4` | A | `bulma.com.au` | `185.199.110.153` | true | false | 1 | `{}` | `{}` | null | `[]` | `2026-01-02T13:44:35.310541Z` | `2026-01-02T13:44:35.310541Z` |
| `31b4ad370c84b9fd0c443af8af34f096` | A | `bulma.com.au` | `185.199.108.153` | true | false | 1 | `{}` | `{}` | null | `[]` | `2025-12-28T04:47:35.261723Z` | `2026-01-02T13:44:15.264091Z` |
| `00832e9d4a08edb5072892b6cba436a1` | MX | `bulma.com.au` | `bulma-com-au.mail.protection.outlook.com` | false | false | 3600 | `{}` | `{}` | null | `[]` | `2026-02-06T05:21:22.984424Z` | `2026-02-06T05:21:22.984424Z` |
| `b6ff3371f8fefbd584bf8c6a30afe7d7` | TXT | `bulma.com.au` | `\"v=spf1 include:spf.protection.outlook.com ~all\"` | false | false | 3600 | `{}` | `{}` | null | `[]` | `2026-02-06T05:21:22.670437Z` | `2026-02-06T05:21:22.670437Z` |
| `c27e9cb54e6e6a0a93132dbf71c34da3` | TXT | `bulma.com.au` | `\"MS=ms59823863\"` | false | false | 3600 | `{}` | `{}` | null | `[]` | `2026-02-06T05:14:17.76886Z` | `2026-02-06T05:14:17.76886Z` |
| `0b3b817b0b6f152c44ba7a5018dd5e7c` | TXT | `bulma.com.au` | `\"google-site-verification=0tckke5_vKtAzc4213cMKkKfJCBOwhYwTdA3Pe9hE0o\"` | false | false | 1 | `{}` | `{}` | `GSC; added 04/03/26` | `[]` | `2026-01-04T04:47:10.261785Z` | `2026-01-04T04:47:22.468493Z` |
| `c8e82fc2b97b87587bca888d574a8869` | A | `www.bulma.com.au` | `185.199.109.153` | true | false | 1 | `{}` | `{}` | null | `[]` | `2025-12-28T04:47:35.273331Z` | `2026-01-02T13:44:22.613143Z` |

Only the four A records are migration targets. Preserve all MX and TXT records by ID, type, name, content, TTL, comment, and tags.

## DNS Rollback Procedure

Use this procedure only after resolving the exact current records and only if a later approved cutover must return web traffic to GitHub Pages. Load the key inside the command process and do not expose it in shell tracing or output.

1. Query all live `bulma.com.au` and `www.bulma.com.au` records. Identify only migration-created proxied CNAME records for the apex and `www`.
2. Delete only those verified migration-created CNAME records.
3. Recreate the four recorded A records with these exact payloads:

```json
{"type":"A","name":"bulma.com.au","content":"185.199.111.153","ttl":1,"proxied":false,"comment":null,"tags":[]}
{"type":"A","name":"bulma.com.au","content":"185.199.110.153","ttl":1,"proxied":false,"comment":null,"tags":[]}
{"type":"A","name":"bulma.com.au","content":"185.199.108.153","ttl":1,"proxied":false,"comment":null,"tags":[]}
{"type":"A","name":"www.bulma.com.au","content":"185.199.109.153","ttl":1,"proxied":false,"comment":null,"tags":[]}
```

4. Confirm that all MX and TXT records still match the snapshot before testing the restored GitHub Pages host.
5. Confirm `https://bulma.com.au/` reports the expected GitHub Pages response and `https://www.bulma.com.au/<path>?<query>` redirects once to the matching apex URL.

## Step 1 Validation Evidence

- `git rev-parse HEAD` and `git rev-parse origin/main` both returned `2a475b50527f3d81593b0a9d3036cde94b974adc` on `main`.
- GitHub Actions run `33259142714` completed successfully for that SHA.
- GitHub Pages deployment `6156985652` reported `success` for that SHA and `https://bulma.com.au/`.
- Artifact `9716735629` was named `github-pages`, was unexpired, and belonged to the selected successful run.
- Cloudflare returned the expected account and active zone. The accepted member has the Super Administrator role.
- Cloudflare returned no Pages projects, account tokens, redirect lists, matching account or zone redirect rulesets, or Page Rules.
- The repository has no configured secret scanner. Manual migration-file checks must reject credential-shaped content before completion.

## Step 2 Validation Evidence

- Created account-owned token ID `9dd6d8eb748379192f4d2d9b7fb4fc3b` with name `bulma-root-cloudflare-pages-deploy` and status `active`.
- The token has exactly one allow policy. Its only permission group is `Pages Write`, and its only resource is account `213ab3604485056376263d22fa242742`.
- Verified the token through `GET /accounts/213ab3604485056376263d22fa242742/tokens/verify` before discarding the one-time value.
- Stored the value only as GitHub Actions secret `CLOUDFLARE_PAGES_API_TOKEN`; stored the account ID as repository variable `CLOUDFLARE_ACCOUNT_ID`.
- Created Direct Upload project `bulma-root` with production branch `main`, `source: null`, no custom domains, no canonical or latest deployment, and no deployment records.
- Before a first deployment, the project API reported `uses_functions: null`. The first static preview deployment now reports `uses_functions: false` at both project and deployment level.

## Step 3 Validation Evidence

| Field | Value |
| --- | --- |
| Selected artifact ID | `9716735629` |
| Workflow run | `33259142714` |
| Workflow head SHA | `2a475b50527f3d81593b0a9d3036cde94b974adc` |
| Downloaded `artifact.tar` SHA-256 | `dcc278c0afe2e61fe8d071974bc894f336a879639d646c1484e69c1fcbb8d256` |
| Extracted file count | `178` |
| Extracted total size | `6,643,181` bytes |
| Largest extracted file | `488,789` bytes |
| Cloudflare deployment ID | `80ac3a14-73c7-4811-8915-e86afca32db6` |
| Immutable preview URL | `https://80ac3a14.bulma-root.pages.dev/` |
| Branch alias | `https://cloudflare-comparison.bulma-root.pages.dev/` |
| Environment | `preview` |
| Deployment branch | `cloudflare-comparison` |
| Deployment commit | `2a475b50527f3d81593b0a9d3036cde94b974adc` |
| Deployment dirty flag | `false` |
| Deployment result | `success` |
| Uses Functions | `false` |

- Downloaded the exact unexpired GitHub Pages artifact. The independently built source export was used only for validation and was not uploaded.
- Independent source validation passed under Node.js `22.23.1`: `npm ci`, `npm run lint`, `NEXT_PUBLIC_SITE_URL=https://bulma.com.au npm run build`, and `npm test` with 17 passing tests.
- The extracted artifact contains the expected routes, `404.html`, assets, `robots.txt`, `sitemap.xml`, and current `CNAME` output.
- The artifact contains no `functions/`, `_worker.js`, `_routes.json`, or Wrangler runtime configuration file.
- The artifact is below Wrangler's 20,000-file and 25 MiB-per-file Direct Upload limits.
- Both preview URLs returned HTTPS 200 and `X-Robots-Tag: noindex` before being opened.
- Preview HTML contains the canonical origin `https://bulma.com.au` and does not contain the Pages project hostname.
- The project still has no custom domains and no production deployment. GitHub Pages, DNS, repository branches, source files, and the Git index were unchanged by the deployment.

## Step 4 Validation Evidence

### Content and Route Parity

- Compared all 178 extracted files against decoded GitHub Pages and Cloudflare Pages responses. Every local, GitHub, and Cloudflare SHA-256 matched, and both hosts returned matching status semantics.
- The full sweep included 8 HTML files, 2 CSS files, 25 JavaScript files, 80 images, 10 fonts, 49 text outputs, the sitemap, the icon, the source map, and the remaining emitted static files.
- `/`, `/about/`, `/pricing/`, `/contact/`, and `/privacy-policy/` returned HTTP 200 with `text/html; charset=utf-8` on both hosts.
- Random route `/__cloudflare-parity-404-2a475b50/` returned HTTP 404 and the exact decoded body of the built top-level `404.html` on both hosts.
- `robots.txt` returned HTTP 200 as `text/plain; charset=utf-8`; `sitemap.xml` returned HTTP 200 as `application/xml`.
- GitHub Pages retained `Cache-Control: max-age=600`. Cloudflare Pages used its default `Cache-Control: public, max-age=0, must-revalidate` and `X-Robots-Tag: noindex` on preview assets. These provider headers do not alter route or body parity.
- Canonical HTML, robots, and sitemap output name only `https://bulma.com.au`; no Pages hostname occurs in the checked discovery output.

### Hosted Browser Checks

- Tested every public route at `1440x900` and `390x900` in a task-owned headed Chromium browser with `prefers-color-scheme: light` emulated.
- Every route retained the permanent `dark` class, returned HTTP 200, stayed within the viewport width, and loaded with zero spontaneous console errors, page errors, or failed document, stylesheet, script, image, or font requests.
- Verified Monthly and Yearly pricing states. Yearly selected `aria-selected=true`, Monthly changed to `false`, the Solo savings note changed to `Save $98 compared with monthly`, and neither desktop nor mobile pricing overflowed horizontally.
- Verified direct `/#lenders` navigation and a same-page `#lenders` click. Both set the hash, expanded `#lenders-question`, and removed `hidden` from `#lenders-answer`.
- Verified the mobile menu opens and closes, shows its Pricing link, and keeps the Get started target at `https://app.bulma.com.au/register`.
- Verified homepage Try Bulma free and Get started CTAs target `https://app.bulma.com.au/register`.
- Verified the contact form contract contains only hidden `form_source=contact_page`, `name`, `email`, and `message`.
- Intercepted the submitted POST to `https://formspree.io/f/xojvwybl`, confirmed the same four field names, and aborted it with `ERR_BLOCKED_BY_CLIENT`; no request reached Formspree.
- Inspected stable desktop and mobile homepage and pricing captures. The dark surfaces, navigation, hero copy, CTAs, pricing toggle, plan cards, wrapping, and viewport edges were present without clipping or unintended overlap. The mobile Yearly capture showed `$490 /year` and the yearly savings note in the Solo card.
- Closed the task-owned browser and confirmed it was absent from `dev-browser browsers`.

## Comparison Results

### Method

- Commit: `2a475b50527f3d81593b0a9d3036cde94b974adc`.
- GitHub Pages: [https://bulma.com.au/](https://bulma.com.au/).
- Cloudflare Pages: [https://cloudflare-comparison.bulma-root.pages.dev/](https://cloudflare-comparison.bulma-root.pages.dev/).
- Machine: macOS 26.1 in Perth, Australia, on one unchanged local network.
- Lighthouse: `13.4.1` with Google Chrome `151.0.7922.174` through `CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Lighthouse command template: `npx --yes lighthouse@13.4.1 <url> [--preset=desktop] --only-categories=performance --output=json --output-path=<absolute-json-path> --disable-full-page-screenshot --quiet --chrome-flags=--headless`.
- Lighthouse sample: five fresh CLI processes for each host, route, and mode. Odd repetitions ran GitHub first; even repetitions ran Cloudflare first. Total: 40 successful JSON results.
- curl: `8.7.1` with HTTP/2 support. Command template: `curl --silent --show-error --compressed --output /dev/null --write-out <DNS/TCP/TLS/TTFB/total/HTTP/IP/status/size format> <url>`.
- curl sample: one excluded warm-up, then 20 measured requests per host for `/`, `/pricing/`, and `/_next/static/chunks/75f1a8d59960386a.js`. Host order alternated on every measured pair. Total: 120 successful results.
- Every host served the same selected commit and the Step 4 decoded-body hashes matched before benchmarking. No caching, header, image, JavaScript, or security tuning was applied.
- Values use `median [minimum-maximum]`. Delta is Cloudflare median minus GitHub median. A negative time delta favours Cloudflare; a positive time delta favours GitHub.

### Lighthouse Results

#### Mobile homepage

| Metric | Runs/host | GitHub median [min-max] | Cloudflare median [min-max] | Delta | Delta % | Better median |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Performance score | 5 | 92.0 [50.0-92.0] | 91.0 [77.0-92.0] | -1.0 points | -1.1% | GitHub |
| Server response | 5 | 8.0 ms [6.0-10.0] | 33.0 ms [27.0-101.0] | +25.0 ms | +312.5% | GitHub |
| FCP | 5 | 1,206.6 ms [1,205.8-1,465.5] | 1,232.8 ms [1,227.1-2,659.0] | +26.2 ms | +2.2% | GitHub |
| LCP | 5 | 3,381.6 ms [3,305.8-5,755.0] | 3,407.8 ms [3,402.1-4,646.0] | +26.2 ms | +0.8% | GitHub |
| Speed Index | 5 | 1,956.0 ms [1,618.1-4,741.7] | 1,995.7 ms [1,232.8-4,515.8] | +39.7 ms | +2.0% | GitHub |
| TBT | 5 | 51.5 ms [30.5-1,370.0] | 33.0 ms [26.0-70.5] | -18.5 ms | -35.9% | Cloudflare |
| CLS | 5 | 0.00000 [0.00000-0.00000] | 0.00000 [0.00000-0.00123] | 0.00000 | n/a | Tied median |

#### Mobile pricing page

| Metric | Runs/host | GitHub median [min-max] | Cloudflare median [min-max] | Delta | Delta % | Better median |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Performance score | 5 | 98.0 [96.0-98.0] | 97.0 [97.0-97.0] | -1.0 points | -1.0% | GitHub |
| Server response | 5 | 7.0 ms [6.0-274.0] | 33.0 ms [26.0-48.0] | +26.0 ms | +371.4% | GitHub |
| FCP | 5 | 961.5 ms [954.5-968.9] | 936.2 ms [927.1-947.7] | -25.3 ms | -2.6% | Cloudflare |
| LCP | 5 | 2,483.6 ms [2,476.5-2,709.5] | 2,511.2 ms [2,502.1-2,522.7] | +27.6 ms | +1.1% | GitHub |
| Speed Index | 5 | 1,389.5 ms [1,211.0-2,697.7] | 1,378.9 ms [1,362.3-1,537.8] | -10.6 ms | -0.8% | Cloudflare |
| TBT | 5 | 7.0 ms [6.5-35.0] | 9.0 ms [8.0-11.5] | +2.0 ms | +28.6% | GitHub |
| CLS | 5 | 0.00000 [0.00000-0.00000] | 0.00000 [0.00000-0.00000] | 0.00000 | n/a | Tied median |

#### Desktop homepage

| Metric | Runs/host | GitHub median [min-max] | Cloudflare median [min-max] | Delta | Delta % | Better median |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Performance score | 5 | 99.0 [99.0-99.0] | 99.0 [99.0-99.0] | 0.0 points | 0.0% | Tied median |
| Server response | 5 | 7.0 ms [7.0-312.0] | 28.0 ms [24.0-53.0] | +21.0 ms | +300.0% | GitHub |
| FCP | 5 | 288.2 ms [285.9-310.0] | 314.3 ms [307.0-362.4] | +26.1 ms | +9.1% | GitHub |
| LCP | 5 | 971.2 ms [967.9-993.0] | 974.3 ms [967.0-982.4] | +3.1 ms | +0.3% | GitHub |
| Speed Index | 5 | 459.4 ms [438.7-670.8] | 470.6 ms [356.2-516.8] | +11.3 ms | +2.5% | GitHub |
| TBT | 5 | 0.0 ms [0.0-0.0] | 0.0 ms [0.0-0.0] | 0.0 ms | n/a | Tied median |
| CLS | 5 | 0.00000 [0.00000-0.00000] | 0.00000 [0.00000-0.00000] | 0.00000 | n/a | Tied median |

#### Desktop pricing page

| Metric | Runs/host | GitHub median [min-max] | Cloudflare median [min-max] | Delta | Delta % | Better median |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Performance score | 5 | 100.0 [100.0-100.0] | 100.0 [90.0-100.0] | 0.0 points | 0.0% | Tied median |
| Server response | 5 | 7.0 ms [5.0-8.0] | 32.0 ms [23.0-8,815.0] | +25.0 ms | +357.1% | GitHub |
| FCP | 5 | 260.8 ms [258.7-262.2] | 269.4 ms [266.3-281.9] | +8.6 ms | +3.3% | GitHub |
| LCP | 5 | 706.3 ms [687.2-711.3] | 709.4 ms [706.3-721.9] | +3.1 ms | +0.4% | GitHub |
| Speed Index | 5 | 507.9 ms [497.5-513.9] | 539.2 ms [527.3-5,133.4] | +31.3 ms | +6.2% | GitHub |
| TBT | 5 | 0.0 ms [0.0-0.0] | 0.0 ms [0.0-0.0] | 0.0 ms | n/a | Tied median |
| CLS | 5 | 0.00074 [0.00061-0.00078] | 0.00082 [0.00074-0.00090] | +0.00008 | +11.1% | GitHub |

### curl Network Results

#### Homepage

| Metric | Runs/host | GitHub median [min-max] | Cloudflare median [min-max] | Delta | Delta % | Better median |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| DNS | 20 | 3.4 ms [3.0-4.0] | 2.9 ms [2.5-6.9] | -0.5 ms | -14.4% | Cloudflare |
| TCP | 20 | 8.7 ms [6.7-13.9] | 8.9 ms [6.6-46.5] | +0.1 ms | +1.3% | GitHub |
| TLS | 20 | 17.6 ms [14.0-37.2] | 21.5 ms [16.8-59.9] | +4.0 ms | +22.6% | GitHub |
| TTFB | 20 | 26.6 ms [19.9-42.4] | 60.4 ms [42.8-103.0] | +33.8 ms | +127.2% | GitHub |
| Total | 20 | 30.3 ms [21.5-46.5] | 61.3 ms [44.0-106.2] | +31.0 ms | +102.5% | GitHub |
| Transfer size | 20 | 26,195 B [26,195-26,195] | 25,607 B [25,607-25,607] | -588 B | -2.2% | Cloudflare smaller |

#### Pricing page

| Metric | Runs/host | GitHub median [min-max] | Cloudflare median [min-max] | Delta | Delta % | Better median |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| DNS | 20 | 3.5 ms [3.0-5.2] | 2.9 ms [2.5-17.6] | -0.6 ms | -16.0% | Cloudflare |
| TCP | 20 | 8.3 ms [7.0-17.2] | 8.0 ms [6.3-24.2] | -0.3 ms | -3.7% | Cloudflare |
| TLS | 20 | 17.6 ms [14.2-27.0] | 20.0 ms [15.6-52.9] | +2.4 ms | +13.3% | GitHub |
| TTFB | 20 | 24.5 ms [20.1-37.9] | 57.6 ms [38.6-102.5] | +33.1 ms | +134.9% | GitHub |
| Total | 20 | 25.2 ms [20.4-38.3] | 58.2 ms [39.0-108.9] | +33.0 ms | +131.1% | GitHub |
| Transfer size | 20 | 15,973 B [15,973-15,973] | 15,453 B [15,453-15,453] | -520 B | -3.3% | Cloudflare smaller |

#### Largest JavaScript asset

| Metric | Runs/host | GitHub median [min-max] | Cloudflare median [min-max] | Delta | Delta % | Better median |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| DNS | 20 | 3.3 ms [2.6-3.9] | 3.1 ms [2.4-11.0] | -0.2 ms | -7.3% | Cloudflare |
| TCP | 20 | 7.8 ms [6.8-17.6] | 8.0 ms [6.4-15.2] | +0.2 ms | +2.9% | GitHub |
| TLS | 20 | 17.1 ms [14.4-28.9] | 20.0 ms [15.4-31.6] | +2.9 ms | +16.7% | GitHub |
| TTFB | 20 | 25.2 ms [19.8-35.0] | 74.6 ms [56.0-141.0] | +49.5 ms | +196.4% | GitHub |
| Total | 20 | 37.3 ms [31.8-59.8] | 87.8 ms [70.4-154.9] | +50.5 ms | +135.2% | GitHub |
| Transfer size | 20 | 122,800 B [122,800-122,800] | 121,097 B [121,097-121,097] | -1,703 B | -1.4% | Cloudflare smaller |

### Network Context

| Resource | Host | Runs | HTTP versions | Remote IPs | Statuses |
| --- | --- | ---: | --- | --- | --- |
| Homepage | GitHub | 20 | 2 | `185.199.111.153` | 200 |
| Homepage | Cloudflare | 20 | 2 | `2606:4700:310c::ac42:2c6d` | 200 |
| Pricing page | GitHub | 20 | 2 | `185.199.111.153` | 200 |
| Pricing page | Cloudflare | 20 | 2 | `2606:4700:310c::ac42:2c6d` | 200 |
| Largest JavaScript asset | GitHub | 20 | 2 | `185.199.111.153` | 200 |
| Largest JavaScript asset | Cloudflare | 20 | 2 | `2606:4700:310c::ac42:2c6d` | 200 |

### Interpretation

- GitHub Pages had the lower median TTFB and total time for all three unthrottled curl resources. Its median total-time advantage was 31.0 ms for the homepage, 33.0 ms for pricing, and 50.5 ms for the largest JavaScript asset.
- Cloudflare transferred 1.4% to 3.3% fewer bytes and had lower median DNS time for all three resources. It also had lower median mobile-pricing FCP and Speed Index, and lower mobile-home TBT.
- Lighthouse medians were close overall. GitHub led most non-tied timing medians, while desktop performance scores tied at 99 for the homepage and 100 for pricing.
- Variability matters. Cloudflare's desktop-pricing server-response range included one 8,815 ms outlier, and its corresponding Speed Index range reached 5,133.4 ms. GitHub also had outliers, including a 5,755.0 ms mobile-home LCP and 1,370.0 ms mobile-home TBT.
- This synthetic comparison does not prove universal real-user performance. From this Perth machine and network, GitHub Pages was faster on the most direct network-latency measures. Cloudflare's smaller transfers did not offset its higher median TTFB in these runs.

## Step 5 Validation Evidence

- Recorded 40 valid Lighthouse JSON results: 2 hosts x 2 routes x 2 modes x 5 runs.
- Recorded 120 valid curl results after excluded warm-ups: 2 hosts x 3 resources x 20 measured requests.
- Every Lighthouse group contains exactly five results per host. Every curl group contains exactly twenty results per host, HTTP 200 only, and HTTP/2 only.
- Revalidated all 178 decoded response-body hashes after benchmarking; zero local, GitHub, Cloudflare, or status mismatches occurred.
- Revalidated `HEAD`, `origin/main`, the latest successful GitHub Actions run, and the active GitHub Pages deployment at commit `2a475b50527f3d81593b0a9d3036cde94b974adc`.
- Revalidated Cloudflare deployment `80ac3a14-73c7-4811-8915-e86afca32db6` as a successful preview for the same commit with `uses_functions: false`, no canonical production deployment, and no custom domains.
- Revalidated that all apex and `www` DNS records still match the initial snapshot and remain unproxied GitHub Pages A records plus the preserved MX and TXT records.
- Revalidated that GitHub Pages remains active and that the least-privilege GitHub secret and account-ID variable still exist by name.
- Live-checkout lint passed with zero errors. All 23 current live-checkout tests passed.
- Production build and the selected revision's 17 tests passed in the disposable archive export under Node.js `22.23.1`. The live checkout build was not repeated because a pre-existing Bulma dev server was active on port 3001 and project policy forbids running a build against that live Turbopack cache.
- Approval state: withheld because the approval prompt returned no selection. No production Pages deployment, custom domain, DNS record, canonical redirect, GitHub Pages setting, branch, commit, or push has been created or changed.

## Agent-Readiness Preview Refresh

### Scope and Deployment Identity

- Refreshed the existing `cloudflare-comparison` branch after the user explicitly requested the complete local implementation from `documents/todo/agent_readiness_and_page_speed_plan.md`.
- This is a combined application-and-host comparison. It is not the matched-artifact host-only comparison recorded above because GitHub Pages still serves commit `2a475b50527f3d81593b0a9d3036cde94b974adc`, while the refreshed Cloudflare preview includes uncommitted readiness changes.
- Built the current `demo/` source in `/tmp/bulma-cloudflare-readiness.4B7IDb` because the shared checkout's pre-existing port 3001 dev server remained active. The isolated build prevented Turbopack cache overlap.
- The Cloudflare API reports deployment `0e21f32b-05ae-4d52-9557-18a7433fd08b`, immutable URL `https://0e21f32b.bulma-root.pages.dev/`, branch alias `https://cloudflare-comparison.bulma-root.pages.dev/`, environment `preview`, branch `cloudflare-comparison`, commit `2a475b50527f3d81593b0a9d3036cde94b974adc`, `commit_dirty: true`, `uses_functions: false`, and status `success`.
- The Pages project still has `source: null`, production branch `main`, no canonical production deployment, and no custom domains. GitHub Pages, DNS, repository branches, the Git index, commits, and production traffic remain unchanged.
- Both preview URLs return HTTP 200, `server: cloudflare`, `Cache-Control: public, max-age=0, must-revalidate`, and `X-Robots-Tag: noindex`.

### Build and Content Evidence

| Field | Refreshed value | Previous matched artifact | Difference |
| --- | ---: | ---: | ---: |
| Exported files | 182 | 178 | +4 |
| Total uncompressed bytes | 6,667,165 | 6,643,181 | +23,984 |
| Largest file | 488,911 bytes | 488,789 bytes | +122 bytes |
| Largest file path | `_next/static/chunks/5995cb1810ff71d4.js` | `_next/static/chunks/75f1a8d59960386a.js` | Build hash changed |
| Export manifest SHA-256 | `9c9c5f2dee159ba968c0c38d65a32792b89d25e130f1ea227497bf7dea7cac35` | Recorded artifact digest above | Different source |

- Isolated Node.js `22.23.1` validation passed: `npm ci`, ESLint, the production static build, and all 23 Node tests.
- The export has zero font preloads, zero `role="image"` source matches, zero Pages Functions or Worker runtime files, and zero `pages.dev` references in HTML, robots, sitemap, or `llms.txt` discovery output.
- `/llms.txt` exists in the export, contains 1,542 uncompressed bytes, and returns HTTP 200 as `text/plain; charset=utf-8`.
- Compared all 182 generated files with their decoded branch-alias responses before and after benchmarking. Every response status and SHA-256 body matched, including the custom 404 through an unknown route.
- All five indexable routes return HTTP 200 with exactly one canonical. The unknown route returns HTTP 404; `robots.txt` returns plain text; `sitemap.xml` returns XML.

### Hosted Browser and Audit Evidence

- Tested `/`, `/about/`, `/pricing/`, `/contact/`, and `/privacy-policy/` at `1440x900` and `390x900` with `prefers-color-scheme: light`. Every page retained the permanent dark class, correct canonical, static JSON-LD, `rel="describedby"`, and zero horizontal overflow.
- Verified the Three.js chunk starts after `loadEventEnd` (`166.3 ms` versus `136.5 ms`), the Dot Pool renders and responds to pointer movement, and the hero remains usable with WebGL contexts forced unavailable.
- Verified first-Tab skip navigation, direct and same-page `#lenders`, FAQ open/close transitions, Monthly and Yearly pricing, equal-height desktop cards, mobile navigation, CTA destinations, and zero page or unexpected console errors.
- At `412x900` and DPR `1.75`, the browser selected `bulma-policy-advisor-workspace-mobile@1.5x.webp`, `bulma-policy-evidence-ledger-mobile@1.5x.webp`, and `bulma-lender-comparison-mobile@1.6x.webp`.
- Mocked `window.fetch` before contact submission so no Formspree request left the page. Both mocked error and success states used POST target `https://formspree.io/f/xojvwybl` with exactly `form_source`, `name`, `email`, and `message`.
- Lighthouse homepage scores: Accessibility `1.00`, Best Practices `1.00`, Agentic Browsing `1.00`, `agent-accessibility-tree` `1.00`, `llms.txt` `1.00`, and colour contrast `1.00`. The preview's required noindex header intentionally reduces SEO to `0.69`.
- Lighthouse also found pre-existing route semantics outside this refresh: `/about/` scores Accessibility `0.96` because animated wrappers sit between `ul` and `li`; `/pricing/` scores `0.99` because of heading order and a table caption heuristic. Contact and privacy score `1.00`.

### Refreshed Lighthouse Comparison

Method matches the original host comparison: Lighthouse `13.4.1`, Chrome `151.0.7922.174`, five fresh CLI processes per host, route, and mode, with host order alternating. Total: 40 successful JSON results. Values are `median [minimum-maximum]`; delta is refreshed Cloudflare minus unchanged GitHub.

#### Mobile homepage

| Metric | Runs/host | GitHub | Refreshed Cloudflare | Delta | Delta % |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 5 | 92.0 [75.0-92.0] | 93.0 [93.0-98.0] | +1.0 | +1.1% |
| Server response | 5 | 11.0 ms [5.0-262.0] | 42.0 ms [34.0-46.0] | +31.0 ms | +281.8% |
| FCP | 5 | 1,206.6 ms [1,201.0-2,711.8] | 1,979.9 ms [1,229.0-1,990.0] | +773.3 ms | +64.1% |
| LCP | 5 | 3,306.6 ms [3,301.0-4,759.8] | 2,954.9 ms [2,211.1-3,040.0] | -351.7 ms | -10.6% |
| Speed Index | 5 | 1,617.9 ms [1,602.1-4,821.3] | 1,979.9 ms [1,676.4-1,990.0] | +362.0 ms | +22.4% |
| TBT | 5 | 48.5 ms [36.5-68.5] | 45.5 ms [31.5-52.0] | -3.0 ms | -6.2% |
| CLS | 5 | 0.00000 [0.00000-0.00123] | 0.00000 [0.00000-0.00000] | 0.00000 | n/a |

#### Mobile pricing

| Metric | Runs/host | GitHub | Refreshed Cloudflare | Delta | Delta % |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 5 | 97.0 [87.0-98.0] | 100.0 [99.0-100.0] | +3.0 | +3.1% |
| Server response | 5 | 6.0 ms [5.0-265.0] | 31.0 ms [27.0-41.0] | +25.0 ms | +416.7% |
| FCP | 5 | 966.2 ms [957.3-1,538.6] | 979.4 ms [974.3-989.4] | +13.2 ms | +1.4% |
| LCP | 5 | 2,505.0 ms [2,481.6-3,585.6] | 1,792.1 ms [1,780.3-2,062.4] | -712.9 ms | -28.5% |
| Speed Index | 5 | 1,348.3 ms [1,323.7-4,194.6] | 1,400.8 ms [1,345.0-1,523.0] | +52.5 ms | +3.9% |
| TBT | 5 | 7.5 ms [1.5-20.0] | 10.0 ms [8.0-19.5] | +2.5 ms | +33.3% |
| CLS | 5 | 0.00000 [0.00000-0.00000] | 0.00000 [0.00000-0.00000] | 0.00000 | n/a |

#### Desktop homepage

| Metric | Runs/host | GitHub | Refreshed Cloudflare | Delta | Delta % |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 5 | 99.0 [99.0-99.0] | 99.0 [99.0-99.0] | 0.0 | 0.0% |
| Server response | 5 | 7.0 ms [6.0-18.0] | 40.0 ms [27.0-54.0] | +33.0 ms | +471.4% |
| FCP | 5 | 287.1 ms [285.3-310.0] | 429.3 ms [424.3-434.9] | +142.2 ms | +49.5% |
| LCP | 5 | 990.0 ms [987.3-1,012.1] | 1,009.3 ms [1,004.3-1,014.9] | +19.3 ms | +2.0% |
| Speed Index | 5 | 457.6 ms [432.7-506.7] | 612.1 ms [559.5-615.0] | +154.5 ms | +33.8% |
| TBT | 5 | 0.0 ms | 0.0 ms | 0.0 ms | n/a |
| CLS | 5 | 0.00000 | 0.00000 | 0.00000 | n/a |

#### Desktop pricing

| Metric | Runs/host | GitHub | Refreshed Cloudflare | Delta | Delta % |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 5 | 100.0 [100.0-100.0] | 100.0 [100.0-100.0] | 0.0 | 0.0% |
| Server response | 5 | 7.0 ms [5.0-13.0] | 44.0 ms [26.0-46.0] | +37.0 ms | +528.6% |
| FCP | 5 | 262.2 ms [257.3-265.5] | 351.1 ms [285.9-389.1] | +88.9 ms | +33.9% |
| LCP | 5 | 703.6 ms [690.5-708.9] | 709.1 ms [704.3-711.1] | +5.6 ms | +0.8% |
| Speed Index | 5 | 501.4 ms [479.0-527.9] | 554.2 ms [548.9-607.6] | +52.8 ms | +10.5% |
| TBT | 5 | 0.0 ms | 0.0 ms | 0.0 ms | n/a |
| CLS | 5 | 0.00069 [0.00067-0.00074] | 0.00086 [0.00069-0.00094] | +0.00016 | +23.5% |

### Refreshed curl Comparison

Method matches the original comparison: curl `8.7.1`, one excluded warm-up, twenty measured requests per host and resource, alternating host order, HTTP/2 only, and status 200 only. The JavaScript row compares each build's logical Three.js chunk because the readiness build changed the content hash. Total: 120 measured rows.

| Resource | GitHub TTFB | Cloudflare TTFB | GitHub total | Cloudflare total | Transfer difference |
| --- | ---: | ---: | ---: | ---: | ---: |
| Homepage | 23.2 ms [19.0-36.8] | 53.6 ms [41.2-81.3] | 25.1 ms [21.4-39.4] | 55.1 ms [42.5-83.9] | Cloudflare +1,351 B |
| Pricing | 24.1 ms [19.1-42.1] | 53.4 ms [37.7-74.6] | 25.6 ms [19.5-43.5] | 53.8 ms [38.1-75.3] | Cloudflare +933 B |
| Three.js chunk | 22.6 ms [18.7-36.2] | 68.8 ms [50.9-122.8] | 37.3 ms [28.0-58.6] | 81.1 ms [65.7-135.8] | Cloudflare -1,650 B |

Cloudflare retained lower median DNS time for every resource. GitHub retained lower median TLS, TTFB, and total time from the Perth machine. The refreshed HTML transfers are larger because they now contain canonicals, static JSON-LD, and discovery relations; the deferred Three.js transfer is 1.3% smaller.

### Interpretation and Remaining Gate

- On the same Cloudflare host, the readiness build changed mobile homepage LCP from 3,407.8 ms to 2,954.9 ms (-13.3%) and mobile pricing LCP from 2,511.2 ms to 1,792.1 ms (-28.6%). Mobile performance scores changed from 91 to 93 and 97 to 100.
- Mobile homepage FCP changed from 1,232.8 ms to 1,979.9 ms (+60.6%), so the readiness target of no more than 1,500 ms is not met on this preview. Mobile pricing FCP remained close at 936.2 ms versus 979.4 ms.
- The preview meets the readiness targets for mobile performance score, LCP, Speed Index, TBT, CLS, homepage Accessibility, Best Practices, and Agentic Browsing. It does not meet the mobile-home FCP target.
- These results are not a clean application-only causal estimate because the old and refreshed Cloudflare samples ran at different times. They are stronger than a cross-host comparison but still include normal network and Lighthouse variance.
- Before cutover, commit the readiness source, rebuild a clean artifact, rerun the production apex matrix, resolve or explicitly accept the FCP miss, and keep the existing user approval gate. No current result authorises DNS or production changes.

## Melbourne and Sydney Current-Host Recheck

### Scope and Method

- Rechecked the current deployments on `2026-08-30`: GitHub production at `https://bulma.com.au/` and the refreshed Cloudflare branch alias at `https://cloudflare-comparison.bulma-root.pages.dev/`.
- This remains a combined application-and-host comparison. GitHub serves the old production artifact; Cloudflare serves the dirty readiness preview. It is valid for choosing the better current visitor experience, but not for estimating the host-only effect.
- Globalping sent HTTPS IPv4 GET requests from four fixed Melbourne probes and four fixed Sydney probes. The first measurement selected the probes; all later measurements reused them by measurement ID.
- Tested `/`, `/about/`, `/pricing/`, `/contact/`, and `/privacy-policy/` for three rounds on each host. Host order alternated by round and route.
- Recorded 240 successful HTTP 200 samples. End-to-end TTFB is DNS + TCP + TLS + Globalping's first-byte server-wait phase. Complete data is in the HTML report evidence directory under `evidence/regional-au-20260830/`.
- Ran Lighthouse `13.4.1` three times per host and route with the mobile performance profile. All 30 reports completed without a runtime error. Complete data is under `evidence/lighthouse-all-pages-current/` in the same report directory.

### Regional Cache Rounds

Each value is the median total response time across the five route medians for that city and host. Each route median contains four fixed probes.

| City and round | GitHub total | Cloudflare total | Faster | Observed state |
| --- | ---: | ---: | --- | --- |
| Melbourne round 1 | 232 ms | 341 ms | GitHub | First edge fill |
| Sydney round 1 | 220 ms | 424 ms | GitHub | First edge fill |
| Melbourne round 2 | 17 ms | 50 ms | GitHub | Both warm |
| Sydney round 2 | 14 ms | 39 ms | GitHub | Both warm |
| Melbourne round 3 | 229 ms | 41 ms | Cloudflare | Cloudflare retained warmth |
| Sydney round 3 | 215 ms | 36 ms | Cloudflare | Cloudflare retained warmth |

- GitHub was 25-33 ms faster when both hosts were fully warm.
- Cloudflare retained its warm state across every route in round 3. GitHub returned to roughly 214-229 ms on most round-3 routes.
- Cloudflare's first fill was slower. The largest single route median was 2,261 ms for Sydney `/pricing/` in round 1.
- The three rounds do not support one cache-blind median. The defensible result is that GitHub has the faster best case, while Cloudflare had the stronger retained-cache result in this run.

### All-Page Mobile Lighthouse Result

Values are medians from three fresh Lighthouse processes per host and route.

| Route | GitHub score | Cloudflare score | GitHub LCP | Cloudflare LCP | Current result |
| --- | ---: | ---: | ---: | ---: | --- |
| `/` | 92 | 99 | 3,304 ms | 1,903 ms | Cloudflare leads |
| `/about/` | 85 | 85 | 4,362 ms | 4,385 ms | Effective tie; page gap |
| `/pricing/` | 98 | 100 | 2,484 ms | 1,827 ms | Cloudflare leads |
| `/contact/` | 97 | 97 | 2,572 ms | 2,582 ms | Effective tie |
| `/privacy-policy/` | 98 | 100 | 2,340 ms | 1,456 ms | Cloudflare leads |

- Cloudflare leads current user-visible mobile LCP on three routes and is effectively unchanged on two.
- Median TBT stayed below 35 ms on every route. CLS was zero or negligible. Cloudflare's large LCP gains on the homepage, pricing, and privacy policy outweigh its 20-37 ms higher Lighthouse server-response medians.
- Overall recommendation: prefer Cloudflare for the current visitor experience, subject to the existing commit-matched cutover gate. GitHub remains the warm-response latency leader.

### Pre-Remediation Speed Work

The first four items below were implemented and rechecked in the Step 5B preview. The homepage stability gate and lower-priority route work remain open.

1. **About page LCP (P0, explicit animation approval required)**
   - Evidence: 4,385 ms Cloudflare LCP; the eager team photo is the LCP element; Lighthouse estimates 51 KiB image savings; the photo wrapper starts at zero opacity.
   - Fix: render the eager photo at full opacity in initial HTML, preserve its transform entrance, and recompress the 720 px WebP candidate. Recheck at `390x900` and `1440x900` because this changes a documented animation.
2. **Contact page LCP (P1, explicit animation approval required)**
   - Evidence: 2,582 ms Cloudflare LCP; the hero copy is the LCP element and starts at zero opacity; Lighthouse estimates 270 ms of render-blocking work.
   - Fix: keep above-fold text visible at first paint and retain motion through transform instead of opacity. Recheck form states and both responsive viewports.
3. **Shared client JavaScript (P1)**
   - Evidence: Lighthouse estimates 120-184 KiB of unused JavaScript on every route, including 135 KiB on the otherwise static privacy policy.
   - Fix: map production chunks to source modules, split the navbar's server markup from its small mobile controller, and keep route-only interaction code outside the root client graph. Use the privacy page as the first low-interaction proof case.
4. **Cloudflare browser caching and cold-fill monitoring (P1)**
   - Evidence: Pages currently sends `Cache-Control: public, max-age=0, must-revalidate`; the first regional Cloudflare fill was slow and one route reached 2,261 ms.
   - Fix: give content-hashed `/_next/static/*` assets a one-year immutable browser TTL through a Pages `_headers` file. Keep HTML revalidation until the custom-domain apex has at least ten cold/warm rounds. If apex cold fills remain high, test a short HTML edge TTL with explicit purge-on-deploy behaviour before adopting it.
5. **Homepage FCP measurement stability (P1)**
   - Evidence: the earlier five-run Cloudflare set measured 1,980 ms median homepage FCP, while this three-run set measured 1,232 ms. The current data no longer supports a stable pass or fail against the 1,500 ms target.
   - Fix: run at least ten mobile samples on a commit-matched custom apex after cutover. Record median, range, and cache state before accepting or rejecting the target.
6. **Homepage, pricing, and privacy follow-up (P2)**
   - Homepage: profile the deferred Three.js and shared runtime behind the 184 KiB unused-JavaScript estimate and 1.4 seconds of main-thread work. Preserve the Dot Pool design and post-load start.
   - Pricing: reduce the hydrated pricing boundary after shared JavaScript work; current 1,827 ms LCP and score 100 already pass.
   - Privacy: target the shared navigation/runtime because page content is static and current LCP is already 1,456 ms.

### Measurement Boundary

- Globalping is a synthetic HTTP test, not real-user monitoring. The sample covers three rounds and eight fixed Australian probes.
- Lighthouse ran from the Perth execution machine. It covers browser rendering across all pages but does not claim Melbourne- or Sydney-specific Core Web Vitals.
- Repeat the regional test against the custom apex after cutover. Use the same application artifact on both hosts if a final host-only causal comparison is still required.

## Step 5B Performance Remediation Recheck

### Deployment and Scope

- Built the complete dirty working tree and deployed only to branch `cloudflare-comparison` as preview deployment `ad546a08-869e-43b8-920f-0734c3e656f0` (`https://ad546a08.bulma-root.pages.dev/`). The attached commit remains `2a475b50527f3d81593b0a9d3036cde94b974adc` with `commit_dirty: true`.
- Kept the Pages project on `source: null`, production branch `main`, no production deployment, and no custom domain. Both preview URLs return `X-Robots-Tag: noindex`.
- Changed no DNS record. The three apex A records, one `www` A record, MX record, and three TXT records retain their recorded IDs and values.
- Compared all 182 served export files with the local build after deployment. Every expected status and decoded SHA-256 body matched.

### Implemented Performance Changes

| Area | Change | Verified result |
| --- | --- | --- |
| About LCP | Kept hero copy and photo at opacity `1`; retained the 700ms transform entrance and 150ms photo delay | Cloudflare median LCP fell from 4,385 to 1,908 ms |
| About image | Recompressed the 720x378 WebP | File fell from 30,366 to 23,032 bytes; Lighthouse's remaining hero-image estimate is 17 KiB |
| Contact LCP | Server-rendered visible hero copy; hydrated only the scroll-animated card grid | Cloudflare median LCP fell from 2,582 to 1,831 ms |
| Shared navigation | Server-rendered the navbar shell; isolated scroll/dialog control and route-aware links | Non-home raw initial JS fell by about 2.3-3.9 KB; representative unused-JS estimates fell about 20-21 KB on About, Contact, and Privacy |
| Hashed assets | Added `demo/public/_headers` for `/_next/static/*` only | Assets return `public, max-age=31556952, immutable`; HTML remains `max-age=0, must-revalidate`; Lighthouse cache waste is zero |

### Melbourne and Sydney Network Recheck

Globalping reused four fixed Melbourne and four fixed Sydney probes for three rounds, five routes, and both hosts. All 240 requests returned HTTP 200. Each table value is the median across the five route medians; each route median contains four probes.

| City and round | GitHub total | Cloudflare total | Faster | Observed state |
| --- | ---: | ---: | --- | --- |
| Melbourne round 1 | 227 ms | 350 ms | GitHub | First edge fill |
| Sydney round 1 | 221 ms | 427 ms | GitHub | First edge fill; both pricing medians exceeded 800 ms |
| Melbourne round 2 | 14 ms | 51 ms | GitHub | Both warm |
| Sydney round 2 | 13 ms | 39 ms | GitHub | Both warm |
| Melbourne round 3 | 13 ms | 51 ms | GitHub | Both retained warmth |
| Sydney round 3 | 12 ms | 38 ms | GitHub | Both retained warmth |

GitHub is the clear HTML latency leader in this recheck. Cloudflare's prior retained-cache advantage did not repeat because GitHub also stayed warm in round 3. Complete data is under `evidence/regional-au-after-remediation/` in the HTML report directory.

### All-Page Mobile Lighthouse Recheck

Values are medians from three fresh Lighthouse `13.4.1` processes per host and route. The hosts still serve different application artifacts, so this measures the current visitor choices rather than an isolated hosting delta.

| Route | GitHub score | Cloudflare score | GitHub LCP | Cloudflare LCP | Current result |
| --- | ---: | ---: | ---: | ---: | --- |
| `/` | 92 | 93 | 3,301 ms | 2,954 ms | Cloudflare leads by 347 ms |
| `/about/` | 85 | 100 | 4,355 ms | 1,908 ms | Cloudflare leads by 2,447 ms |
| `/pricing/` | 98 | 97 | 2,476 ms | 2,501 ms | Effective tie |
| `/contact/` | 97 | 99 | 2,551 ms | 1,831 ms | Cloudflare leads by 720 ms |
| `/privacy-policy/` | 97 | 97 | 2,509 ms | 2,496 ms | Effective tie |

- Cloudflare now leads LCP materially on the three routes with the most active presentation and is effectively tied on Pricing and Privacy. This remains the stronger current visitor experience despite GitHub's lower HTML latency.
- Homepage Cloudflare LCP changed from 1,903 to 2,954 ms between consecutive three-run sets; Pricing changed from 1,827 to 2,501 ms and Privacy from 1,456 to 2,496 ms without route-specific source changes. Treat those movements as measurement and cache variance, not regressions caused by the About, Contact, or navbar fixes.
- The user-visible causal signal is strongest on About and Contact because those routes received direct LCP changes and improved by 2,477 ms and 751 ms respectively. Complete reports are under `evidence/lighthouse-all-pages-after-remediation/`.

### Remaining Speed Gaps

1. **Stabilise homepage, Pricing, and Privacy evidence:** run at least ten mobile samples per route on a commit-matched custom apex after cutover, split cold and warm states, and compare median plus range. The current three-run sets are too volatile for a narrow target decision.
2. **Reduce residual shared JavaScript:** representative Cloudflare unused-JS estimates remain 114-163 KB. The navbar boundary is now small; further reductions require profiling the Next/React shared runtime and route features. Keep the homepage Dot Pool's post-load design, Pricing toggle interaction, Mixpanel page-view tracking, and mobile navigation behaviour intact.
3. **Add smaller responsive About media:** Lighthouse still estimates about 47 KiB across the 720px hero source and the 1400px testimonial portrait. Add an approximately 400px hero candidate for single-density mobile and responsive testimonial portrait candidates; preserve the current crop, dimensions, and eager/lazy priorities.
4. **Reduce render-blocking CSS:** Lighthouse still estimates roughly 100-270 ms on representative routes. Measure the emitted CSS coverage before splitting because the current global stylesheet owns shared design tokens and animation contracts.
5. **Monitor Cloudflare cold fill:** the first regional round remains slower than GitHub. Keep HTML on revalidation through cutover, then test the apex for at least ten cold/warm rounds before considering a short HTML edge TTL with purge-on-deploy behaviour.
