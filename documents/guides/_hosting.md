# Hosting and Cloudflare Workers

This guide records the hosting control plane, deployment revision, credential boundaries, DNS rollback data, and validation evidence for the migration from GitHub Pages to Cloudflare Workers Static Assets. It contains identifiers and configuration only. It must never contain a credential value.

## Workers Migration

This section is the Step 1 source of truth for the Astro-on-Workers migration. It was captured read-only on `2026-09-04T04:12:51Z` (`2026-09-04 12:12:51 AWST`). No Cloudflare resource, GitHub setting, branch, DNS record, or `demo/` source file changed during the capture.

Current state: Steps 1 through 8 are complete. The user submitted no cutover decision, so no approval is recorded. `staging.bulma.com.au` serves the Git-connected production Worker with noindex protection. Production remains unchanged on GitHub Pages, and Step 9 must not start without later explicit approval.

### Baseline identity and repository state

| Field | Captured value |
| --- | --- |
| Repository | `Culpable/bulma-root` |
| Checked-out branch | `main`, ahead of `origin/main` by 3 commits |
| Local HEAD | `10e42f12b20e561a2ce623b1ea575ff8c161bc9b` |
| Production GitHub Pages revision | `4a005a64b8b44b91d168602049cbef38867f79be` |
| Production workflow run | `33351476104`, completed successfully |
| Initial dirty worktree | `documents/todo/astro_workers_migration_plan.md` only |
| Initial index | Clean |
| Production origin | `https://bulma.com.au/` |
| Parity manifest | `documents/guides/parity/production-baseline.json` |
| Production screenshots | `documents/guides/parity/screenshots/production/` |

The production manifest records decoded response hashes, status, content type, complete response headers, visible-text hashes, sorted link targets, and normalised JSON-LD for the five public routes and the real 404 response. It also records the three discovery files and all 84 paths under `demo/public/img/**`. The screenshot set contains the six route states at `1440x900` and `390x900`, plus mobile navigation open, pricing Yearly, homepage FAQ open, contact error, and contact success.

### Cloudflare inventory

| Field | Captured value |
| --- | --- |
| Account | `Jake.sacino@gmail.com's Account` (`213ab3604485056376263d22fa242742`) |
| Membership | `accepted`; `Super Administrator - All Privileges` |
| Zone | `bulma.com.au` (`0534ecfcfde9d322566af12ec11c1bef`), active, full, not paused |
| Nameservers | `vita.ns.cloudflare.com`, `will.ns.cloudflare.com` |
| Workers subdomain | `webpop` |
| Workers custom domains | `taxgenie.com.au` -> `taxgenie-root` production only; no Bulma Worker domain |
| Cloudflare Pages project | `bulma-root`; `bulma-root.pages.dev`; production branch `main`; source `null`; no custom domain |
| Account token | `bulma-root-cloudflare-pages-deploy` (`9dd6d8eb748379192f4d2d9b7fb4fc3b`), active, `Pages Write` |
| User token | `TaxGenie Root Workers Builds deploy` (`2cf009f2720d453e2e584a8d2f8fae4b`), active; not scoped to Bulma |
| Builds token registry | One entry: `TaxGenie Root Workers Builds deploy`, UUID `a103becf-9c9c-4b46-ad27-0c9fc9ee6806`, Cloudflare token ID `2cf009f2720d453e2e584a8d2f8fae4b` |
| Bulma Workers Builds token | None |

Workers scripts at capture:

| Worker | Assets | Modules | Usage model |
| --- | --- | --- | --- |
| `hfmlegal` | true | true | standard |
| `musclehacking-astro-preview` | true | true | standard |
| `taxgenie-root` | true | true | standard |
| `taxgenie-root-preview` | true | true | standard |

Zone settings relevant to the migration were `browser_cache_ttl: 14400`, `always_use_https: off`, `ssl: full`, and `min_tls_version: 1.0`. The zone had only Cloudflare-managed rulesets: `DDoS L7 ruleset` (`4d21379b4f9f4bb088e0729962c8b3cf`), `Cloudflare Managed Free Ruleset` (`77454fe2d30c4220b5701f6fdfb893ba`), and `Cloudflare Normalization Ruleset` (`70339d97bdb34195bbf054b1ebe81f76`). No custom Bulma redirect ruleset or Worker custom domain existed.

Complete DNS inventory at capture:

| ID | Type | Name | Content | Proxied | TTL | Priority | Comment |
| --- | --- | --- | --- | --- | ---: | ---: | --- |
| `5295629a0f6f885fbde3718271e35016` | TXT | `_dmarc.bulma.com.au` | `"v=DMARC1; p=none;"` | false | 1 | null | null |
| `75cf4f7e6ce408098cf70affe7a3b054` | CNAME | `app.bulma.com.au` | `d6e8538622622cb8.vercel-dns-017.com` | false | 1 | null | `Vercel; added 01/01/26` |
| `797da0a47de88cafe72d4a3783b5693c` | CNAME | `autodiscover.bulma.com.au` | `autodiscover.outlook.com` | false | 3600 | null | null |
| `31b4ad370c84b9fd0c443af8af34f096` | A | `bulma.com.au` | `185.199.108.153` | false | 1 | null | null |
| `5c2d843829044e88737e52479e6059f4` | A | `bulma.com.au` | `185.199.110.153` | false | 1 | null | null |
| `f4126d8a14cbaef48bdb01475469868a` | A | `bulma.com.au` | `185.199.111.153` | false | 1 | null | null |
| `00832e9d4a08edb5072892b6cba436a1` | MX | `bulma.com.au` | `bulma-com-au.mail.protection.outlook.com` | false | 3600 | 0 | null |
| `c27e9cb54e6e6a0a93132dbf71c34da3` | TXT | `bulma.com.au` | `"MS=ms59823863"` | false | 3600 | null | null |
| `0b3b817b0b6f152c44ba7a5018dd5e7c` | TXT | `bulma.com.au` | `"google-site-verification=0tckke5_vKtAzc4213cMKkKfJCBOwhYwTdA3Pe9hE0o"` | false | 1 | null | `GSC; added 04/03/26` |
| `b6ff3371f8fefbd584bf8c6a30afe7d7` | TXT | `bulma.com.au` | `"v=spf1 include:spf.protection.outlook.com ~all"` | false | 3600 | null | null |
| `13b9d4e8d09dfa4d13358277bd4542da` | TXT | `resend._domainkey.auth.bulma.com.au` | DKIM public key beginning `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ` | false | 1 | null | null |
| `c7a1e091840c41852b2831a1221c92bf` | CNAME | `selector1._domainkey.bulma.com.au` | `selector1-bulma-com-au._domainkey.getbulma.p-v1.dkim.mail.microsoft` | false | 3600 | null | null |
| `b35398f3563319d481198eed6e444902` | CNAME | `selector2._domainkey.bulma.com.au` | `selector2-bulma-com-au._domainkey.getbulma.p-v1.dkim.mail.microsoft` | false | 3600 | null | null |
| `7e0cf81ae4b9613723923122169b87a7` | MX | `send.auth.bulma.com.au` | `feedback-smtp.ap-northeast-1.amazonses.com` | false | 1 | 10 | null |
| `e510f8d48578acedb6db82d7b4803fac` | TXT | `send.auth.bulma.com.au` | `"v=spf1 include:amazonses.com ~all"` | false | 1 | null | null |
| `c8e82fc2b97b87587bca888d574a8869` | A | `www.bulma.com.au` | `185.199.109.153` | false | 1 | null | null |

Only the three apex `A` records and the one `www` `A` record are migration targets. Immediately before any later DNS write, refresh this full inventory and record the complete API payloads required for exact rollback.

### GitHub inventory

GitHub Pages reported `built`, `build_type: workflow`, custom domain `bulma.com.au`, HTTPS enforced, and source `main` at `/`. Repository secret names contained only `CLOUDFLARE_PAGES_API_TOKEN`. Repository variables contained only `CLOUDFLARE_ACCOUNT_ID=213ab3604485056376263d22fa242742`. Secret values were not readable and no value was requested.

### Workers token naming convention

The dedicated Step 7 token name and Keychain services are fixed before creation:

| Item | Name |
| --- | --- |
| Cloudflare account API token | `bulma-root-cloudflare-build-api-token` |
| Keychain token service | `bulma-root-cloudflare-build-api-token` |
| Keychain token-ID service | `bulma-root-cloudflare-build-api-token-id` |
| Keychain Builds-token UUID service | `bulma-root-cloudflare-build-api-token-uuid` |
| Keychain account | `jake.sacino@gmail.com` |

Only names and identifiers belong in this guide. The token value must remain in Keychain and must never enter Git, command output, temporary files, logs, or documentation.

### Step 7 Workers Builds control plane

Cloudflare's official Workers Builds API added repository-connection support on `2026-08-13`. The migration therefore uses the API directly and needs no dashboard action.

| Field | Value |
| --- | --- |
| API token name | `bulma-root-cloudflare-build-api-token` |
| API token status | Active; verified through `/user/tokens/verify` |
| Account permissions | `Workers CI Write`, `Workers Scripts Write`, `Account Settings Read` |
| Zone permission | `Workers Routes Write`, scoped only to `bulma.com.au` |
| Builds token registry name | `bulma-root-cloudflare-build-api-token` |
| Secret storage | The three Keychain services in the naming table above |
| Repository connection | `Culpable/bulma-root`, GitHub account ID `31677655`, repository ID `1126720966` |
| Repository connection UUID | `3aa4c43c-784c-49b7-8794-75841cf3ee4c` |
| Connection created | `2026-09-04T05:30:39.313Z` |
| Production Worker | `bulma-root`, script tag `79bf696e3bf44fd8a3c63cce810c89da`, bootstrap version `bfe62d41-5651-4896-92de-408295c44e62` |
| Preview Worker | `bulma-root-preview`, bootstrap deployment version `30cb81d5-e8eb-4f09-bb26-6802b0e904a0` |
| Preview migration version | `0d298109-17f4-455c-9596-7015a995ec4a` |
| Version preview URL | `https://migration-bulma-root-preview.webpop.workers.dev/` |
| Production trigger | `75e49326-fa92-4140-8132-546585b00422`; `main`; `pnpm build`; `pnpm deploy` |
| Preview trigger | `9432fe3a-1bea-4307-acc0-408173ca33d9`; owned by script tag `8bd55784bbfe4f2194024fd204343d7e`; every branch except `main`; `pnpm deploy:preview` |
| Trigger root and paths | Root `site`; include `site/*`; no excludes |
| Build variables | `NODE_VERSION=22.23.1`; `PNPM_VERSION=11.22.0` |

The account API token and its Workers Builds registration were created in one process. The one-time secret was passed directly to Keychain and the Builds token endpoint. It was not printed or written to a file.

The preview Worker passed all 18 negotiated HTTP cases. The initial hosted browser run passed 34 cases and intentionally skipped 6 viewport-specific cases; two pricing clicks occurred before their `client:load` island hydrated. After the harness waited for the owning island, the failed desktop and mobile pricing states passed. No app change was required for that timing correction.

The first Git preview build exposed that trigger `c0f21f31-c757-4887-a8da-218cdb64d410` was attached to the production script tag. Cloudflare therefore overrode the `--env preview` name and uploaded inactive version `345363c3-9993-4169-8a2f-b23296949ad7` to `bulma-root`. The active production deployment stayed on version `819c213c-45b4-416d-bcfd-0884b6fb3294`; no traffic changed. The defective trigger was deleted and replaced by trigger `9432fe3a-1bea-4307-acc0-408173ca33d9` on the preview script tag. A second throwaway-branch push started build `543149c2-a3a2-4ba6-952c-af52b5b8cad6`, which completed successfully and uploaded version `74f8672a-c6ce-47f8-b70f-6f86127e24f4` to `bulma-root-preview`. Production build `9af49bec-599e-4ada-b259-ad4cbc1a0dcd` completed successfully from commit `dc2b21c9305b13d537cbd1322b16c283f8658f06` and deployed production version `819c213c-45b4-416d-bcfd-0884b6fb3294`. The throwaway branch `codex/astro-workers-preview-check` was then deleted locally and remotely.

### Committed pre-staging control-plane snapshot

This snapshot was captured at `2026-09-04T06:20:49Z` (`2026-09-04 14:20:49 AWST`) immediately before attaching `staging.bulma.com.au`. It is the exact before-state for the first DNS write. Cloudflare represents automatic TTL as `1`. Every DNS response field needed for exact comparison or recreation is recorded below.

| ID | Type | Name | Content | Proxiable | Proxied | TTL | Priority | Settings | Meta | Comment | Tags | Created | Modified |
| --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- |
| `f4126d8a14cbaef48bdb01475469868a` | A | `bulma.com.au` | `185.199.111.153` | true | false | 1 | null | `{}` | `{}` | null | `[]` | `2026-01-02T13:44:43.68224Z` | `2026-01-02T13:44:43.68224Z` |
| `5c2d843829044e88737e52479e6059f4` | A | `bulma.com.au` | `185.199.110.153` | true | false | 1 | null | `{}` | `{}` | null | `[]` | `2026-01-02T13:44:35.310541Z` | `2026-01-02T13:44:35.310541Z` |
| `31b4ad370c84b9fd0c443af8af34f096` | A | `bulma.com.au` | `185.199.108.153` | true | false | 1 | null | `{}` | `{}` | null | `[]` | `2025-12-28T04:47:35.261723Z` | `2026-01-02T13:44:15.264091Z` |
| `c8e82fc2b97b87587bca888d574a8869` | A | `www.bulma.com.au` | `185.199.109.153` | true | false | 1 | null | `{}` | `{}` | null | `[]` | `2025-12-28T04:47:35.273331Z` | `2026-01-02T13:44:22.613143Z` |
| `75cf4f7e6ce408098cf70affe7a3b054` | CNAME | `app.bulma.com.au` | `d6e8538622622cb8.vercel-dns-017.com` | true | false | 1 | null | `{"flatten_cname":false}` | `{}` | `Vercel; added 01/01/26` | `[]` | `2026-01-01T02:27:59.34763Z` | `2026-01-01T02:27:59.34763Z` |
| `797da0a47de88cafe72d4a3783b5693c` | CNAME | `autodiscover.bulma.com.au` | `autodiscover.outlook.com` | true | false | 3600 | null | `{"flatten_cname":false}` | `{}` | null | `[]` | `2026-02-06T05:21:22.871964Z` | `2026-02-06T05:21:22.871964Z` |
| `c7a1e091840c41852b2831a1221c92bf` | CNAME | `selector1._domainkey.bulma.com.au` | `selector1-bulma-com-au._domainkey.getbulma.p-v1.dkim.mail.microsoft` | true | false | 3600 | null | `{"flatten_cname":false}` | `{}` | null | `[]` | `2026-02-06T05:21:22.670789Z` | `2026-02-06T05:21:22.670789Z` |
| `b35398f3563319d481198eed6e444902` | CNAME | `selector2._domainkey.bulma.com.au` | `selector2-bulma-com-au._domainkey.getbulma.p-v1.dkim.mail.microsoft` | true | false | 3600 | null | `{"flatten_cname":false}` | `{}` | null | `[]` | `2026-02-06T05:21:22.66898Z` | `2026-02-06T05:21:22.66898Z` |
| `00832e9d4a08edb5072892b6cba436a1` | MX | `bulma.com.au` | `bulma-com-au.mail.protection.outlook.com` | false | false | 3600 | 0 | `{}` | `{}` | null | `[]` | `2026-02-06T05:21:22.984424Z` | `2026-02-06T05:21:22.984424Z` |
| `7e0cf81ae4b9613723923122169b87a7` | MX | `send.auth.bulma.com.au` | `feedback-smtp.ap-northeast-1.amazonses.com` | false | false | 1 | 10 | `{}` | `{}` | null | `[]` | `2025-12-28T04:49:31.907161Z` | `2025-12-28T04:49:31.907161Z` |
| `b6ff3371f8fefbd584bf8c6a30afe7d7` | TXT | `bulma.com.au` | `"v=spf1 include:spf.protection.outlook.com ~all"` | false | false | 3600 | null | `{}` | `{}` | null | `[]` | `2026-02-06T05:21:22.670437Z` | `2026-02-06T05:21:22.670437Z` |
| `c27e9cb54e6e6a0a93132dbf71c34da3` | TXT | `bulma.com.au` | `"MS=ms59823863"` | false | false | 3600 | null | `{}` | `{}` | null | `[]` | `2026-02-06T05:14:17.76886Z` | `2026-02-06T05:14:17.76886Z` |
| `0b3b817b0b6f152c44ba7a5018dd5e7c` | TXT | `bulma.com.au` | `"google-site-verification=0tckke5_vKtAzc4213cMKkKfJCBOwhYwTdA3Pe9hE0o"` | false | false | 1 | null | `{}` | `{}` | `GSC; added 04/03/26` | `[]` | `2026-01-04T04:47:10.261785Z` | `2026-01-04T04:47:22.468493Z` |
| `5295629a0f6f885fbde3718271e35016` | TXT | `_dmarc.bulma.com.au` | `"v=DMARC1; p=none;"` | false | false | 1 | null | `{}` | `{}` | null | `[]` | `2025-12-28T04:50:17.709439Z` | `2025-12-28T04:50:17.709439Z` |
| `13b9d4e8d09dfa4d13358277bd4542da` | TXT | `resend._domainkey.auth.bulma.com.au` | `"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDnqxw9oYB2JeMt+z8Kg/3F6Qen0zDtJeEemPvcB4zUn3VCQ1cnIeXyQWSmR4Hlq8M0K6s5A2jzQYlcHdjEmmXKNUf7ItkX96BnO5ph7RiScaW5xT4afOClzQ+5fxgqby3KTmxjhOYWTTN//sw+ik9DMWl2bjFllpDj4LMJV+592wIDAQAB"` | false | false | 1 | null | `{}` | `{}` | null | `[]` | `2025-12-28T04:49:07.695147Z` | `2025-12-28T04:49:07.695147Z` |
| `e510f8d48578acedb6db82d7b4803fac` | TXT | `send.auth.bulma.com.au` | `"v=spf1 include:amazonses.com ~all"` | false | false | 1 | null | `{}` | `{}` | null | `[]` | `2025-12-28T04:49:45.383102Z` | `2025-12-28T04:49:45.383102Z` |

The Workers custom-domain list contained only `taxgenie.com.au` with domain ID `1e50d39091ecc025024430208266c45e0bc93be2`, service `taxgenie-root`, environment `production`, zone `ce76f15eb5f7065b52ed9d8046020b4a`, and certificate ID `716ecedf-d3ce-4970-8a28-5384264d4124`. No Bulma Worker custom domain existed.

The zone ruleset list contained only these Cloudflare-managed rulesets:

| ID | Name | Kind | Version | Phase | Last updated |
| --- | --- | --- | --- | --- | --- |
| `70339d97bdb34195bbf054b1ebe81f76` | Cloudflare Normalization Ruleset | managed | 6 | `http_request_sanitize` | `2024-08-01T17:37:11.538019Z` |
| `77454fe2d30c4220b5701f6fdfb893ba` | Cloudflare Managed Free Ruleset | managed | 74 | `http_request_firewall_managed` | `2026-08-17T16:24:51.912839Z` |
| `4d21379b4f9f4bb088e0729962c8b3cf` | DDoS L7 ruleset | managed | 3408 | `ddos_l7` | `2026-09-03T20:46:57.66225Z` |

GitHub Pages remained `built` with `build_type: workflow`, source `main` at `/`, custom domain `bulma.com.au`, public access, and its approved certificate covering `bulma.com.au` and `www.bulma.com.au` until `2026-11-29`. No Pages setting changed.

### Step 1 validation baseline

- `npm run lint`: passed with zero ESLint errors.
- `npm run build`: passed because port `3001` was not serving a development server. The static export generated all 8 pages.
- `npm test`: passed all 33 Node tests with zero failures.
- `npm run performance:budgets`: passed with zero failures. Current initial JavaScript was `196672`, `184512`, `185311`, `178997`, and `175347` gzip bytes for `/`, `/about/`, `/pricing/`, `/contact/`, and `/privacy-policy/`. The locked `baselineInitialJavaScriptGzipBytes` values in `demo/performance-budgets.json` are `197318`, `185344`, `185927`, `179506`, and `176182`; current output remains below each locked baseline by `646`, `832`, `616`, `509`, and `835` bytes respectively.
- Browser capture used a task-owned `dev-browser` instance with `prefers-color-scheme: light`. All six route states retained the permanent dark class at `1440x900` and `390x900`; the five successful routes had no horizontal overflow, console errors, or page errors. The 404 document returned the expected HTTP `404` and Chromium logged the document's expected failed-resource message.
- State captures verified the open mobile menu, the open `#lenders` FAQ, Yearly selected with `Save $98 compared with monthly`, and the contact error and success panels. Formspree traffic was aborted or fulfilled inside the browser, so no real enquiry was sent.
- Visual inspection confirmed the dark navbar, hero, content cards, pricing controls, contact statuses, privacy document, 404 recovery link, and footer were present without clipped or overlapping target content. Mobile pages reflowed within the viewport and desktop pricing cards retained their shared grid alignment.

The baseline artefacts are inputs to the staging parity gate. Never regenerate them from the Astro implementation.

#### Step 6 production screenshot corrections

Fresh `https://bulma.com.au` captures on `2026-09-04` proved that seven Step 1 screenshots recorded incomplete, stale, or unrasterised states. The replacement commands used `site/scripts/capture-production-parity.mjs --update` for the named screenshots. They used the locked `1440x900` and `390x900` viewports with light colour-scheme emulation, loaded every first-party image, completed the full-page scroll, required explicit reveal owners to reach their final state, waited two animation frames plus the longest transition, and hid only canvas pixels. For pages taller than Chromium's texture limit, the capture scrolled each 4,000px document segment into the raster viewport before taking that clip and hid the fixed header after the first segment. Every replacement came from live production, never from Astro.

| Screenshot | Previous SHA-256 and dimensions | Replacement SHA-256 and dimensions | Evidence |
| --- | --- | --- | --- |
| `home-desktop.webp` | `54b7226cbebb7a201ff71c60c9388b26e37c9cbabd155c64124ce8835e2307ff`, `1429x7844` | `7d32a44de1916751e44b71f77ab5e9b59f4b01118e629acc885713d7c03d72df`, `1429x7844` | The old CDP capture did not rasterise all offscreen clips. Fresh production differed by `3.3113%`; the scrolled-raster replacement passed the strict local `1.0%` gate. |
| `about-desktop.webp` | `169d2bd05cd5677b261fdf3986895ce9ecacf1bf9911dab4f4662040eb320c75`, `1429x4314` | `cd75c5604126d1eefd14ace80e6c8bc25eee66509e6a8a37b1acdfc34c734d0d`, `1429x4314` | Fresh production first differed by `4.0744%`. The final scrolled-raster repeat changed one decoded pixel from the immediately preceding live capture and passed the strict local gate. |
| `about-mobile.webp` | `66ba4e84ad194af0bdeb89713359683eb4c55b4d4be20f80e9eb99c13602b793`, `379x4952` | `b7a3a33b282e06ea1e7e5dc7d7c03889fd1233a84320fa7de4cf734eb8064f14`, `379x4967` | The old capture was 15px short. An intermediate live capture left the testimonial and team at `opacity-0`, producing a `14.9883%` diff bounded by `(24,1753)-(365,4016)`. Explicit reveal-state waits produced two subsequent live captures with identical decoded pixels. |
| `home-mobile.webp` | `17c17298bb836442004edf861b86ef72b6151ea187d0a21d33146f60d1d3b4c0`, `379x9996` | `75a2e19c5248841b50f174dcdc772ed063d6337cc15bd78434e69258829666a6`, `379x9858` | Fresh production and Astro independently measured `9858px`. The first correction still contained blank offscreen raster segments. Two independent scrolled-raster production captures differed by `0.1825%`, below the `1.0%` parity threshold; the residual pixels are active animation phase. |
| `home-mobile-menu-open.webp` | `60a7b297f941f49f15be02fa48f73677a0be132315053df17779ba5a763d36c6`, `379x9996` | `81f6816f1131efb186550cc48dc0ef268b9a3772cb15a3451dacab89fd54847e`, `379x9858` | Fresh production retained the corrected document height with the native mobile dialog open. The first correction still contained blank offscreen raster segments. Two independent scrolled-raster production captures differed by `0.0467%`, below the parity threshold. |
| `pricing-mobile.webp` | `cc9b78d9638db66278480cc967834b58f8dc1dc79a3b879ffba5e6bb11ce27ca`, `379x5951` | `9aac6550161a46bf9a412f11ef2e89931f2eda63d303da773df6c91859ed5673`, `379x5802` | Fresh production measured `5802px`, matching Astro. The old reference retained the pre-fix pricing layout height. |
| `privacy-policy-mobile.webp` | `ce69cc341687809319b346d063a704fcb5f0496eae7543f8534f6104ac395eb4`, `379x2992` | `230cca9871b3b7f9669af9343baffe41b57a2e69d277afb3d9bde71ca07a6016`, `379x2936` | Fresh production measured `2936px`, matching Astro. The old reference retained a stale document height. |

#### Step 6 local gate

- `pnpm --dir site check`: 283 files, zero errors, warnings, or hints after the deterministic island UID regression test was added.
- `pnpm --dir site build`: six static pages and the three discovery endpoints built successfully.
- `pnpm --dir site test`: 37 Node tests passed; build-output, trust-page, and performance-budget validation passed; Playwright passed 78 tests with 6 intentional viewport-specific skips and zero failures.
- Strict local visual parity passed for all six routes at `1440x900` and `390x900`, plus the mobile menu, direct `/#lenders`, yearly pricing, contact success/error, and keyboard plan-tab states. The threshold stayed at `1.0%`; only the Dot Pool canvas was excluded as the declared nondeterministic region.
- Initial JavaScript gzip was `93,025` bytes for `/`, `75,634` for `/about/`, `81,597` for `/pricing/`, `72,629` for `/contact/`, and `68,255` for `/privacy-policy/`. Every route remained below its Next.js baseline.
- `demo/` remained unchanged. Its required lint, build, and 33-test baseline passed before the port and again after the page implementation.

### Step 8 staging deployment and hosted proof

#### Deployment identity and DNS result

- `staging.bulma.com.au` is attached to service `bulma-root`, environment `production`, as custom-domain ID `ac7956c2e528fe295b9bcc8f3398664815ff855c`.
- The staging attach deployed Worker version `05fccc79-5a9c-4c39-8d26-698bd0fac11d`. Git-connected build `c89d5d13-8a96-4568-a874-a269808d254b` then deployed final proof version `5770e5db-f36a-4340-b8cf-a9f4947134ce` from site commit `f844cab4e16a9cc12900e914aab76f73df093307`.
- Cloudflare created exactly one DNS record: read-only proxied AAAA record `b84080eb0e2fdf451c777a0829f391fa`, content `100::`, automatic TTL, and `meta.origin_worker_id` equal to the custom-domain ID.
- Certificate pack `b10d5b68-e58f-4395-944f-4a2449cdd770` is active. Its RSA certificate is `8bee60ca-354e-4f3f-983c-93bf9d842c24`; its ECDSA certificate is `440d8dda-c12b-43b6-8fcd-283f015315af`; both expire on `2026-12-03`.
- Authoritative DNS and public resolvers `1.1.1.1` and `8.8.8.8` returned Cloudflare anycast A and AAAA answers. Direct IPv4 and native IPv6 requests both returned HTTP 200.
- All 16 pre-existing DNS record IDs and `modified_on` values remained byte-identical to the committed pre-staging snapshot. The only seventeenth record is the staging AAAA record.
- GitHub Pages remains built, uses workflow deployment, retains `bulma.com.au`, and continues to serve production with `server: GitHub.com` and its fixed `max-age=600` cache policy.

The first staging body comparison found that the zone-level Cloudflare managed robots setting prepended 61 policy lines to the project file and added crawler-specific disallow rules. The before-state had `is_robots_txt_managed: true`; all AI, content-bot, crawler, JavaScript, and fight-mode controls were disabled. Only `is_robots_txt_managed` was changed to `false`. The hosted `robots.txt` then became byte-identical to `dist/robots.txt`; GPTBot, ClaudeBot, and ChatGPT-User all receive HTTP 200 and the project allow policy.

The first proof after build `df2ac4f0-9c4c-4282-a37a-827515b5256e` found that all six hosted HTML bodies differed from a local build only in 23 `astro-island` `uid` values. Independent reproduction showed that Astro 7.3.1 hashes its absolute checkout path into those values while its production hydration runtime never reads them. Commit `f844cab4e16a9cc12900e914aab76f73df093307` added a post-build normaliser that keeps the attribute and assigns stable document-local IDs before headers and agent files are generated. The regression tests cover stable replacement, static documents, and missing attributes; two consecutive local builds produced identical HTML hashes. The final Git-connected build restored exact local-to-hosted parity without changing rendered content or interaction behaviour.

#### HTTP, transport, cache, and body parity

- All 18 negotiated HTTP contract cases passed after the robots correction. HTML, Markdown, invalid media negotiation, HEAD, slash redirect, internal-file denial, discovery files, immutable asset, and real 404 cases returned their required status and media type.
- Nine decoded bodies matched `dist` byte for byte: the five public documents, `llms.txt`, `sitemap.xml`, `robots.txt`, and the real 404 body. No decoded body, canonical, Open Graph URL, JSON-LD, sitemap, or llms value contains `staging.bulma.com.au` or `workers.dev`.
- Every sampled staging document, asset, discovery response, and 404 response carried `X-Robots-Tag: noindex`. The production canonical and Open Graph origin remained `https://bulma.com.au`.
- The homepage returned HTTP/2 and HTTP/3 successfully. HTML and JavaScript negotiated both Brotli and gzip. IPv4 and IPv6 returned the same built body.
- HTML returned `cache-control: public, max-age=0, must-revalidate`; content-hashed `/_astro/*` returned `public, max-age=31536000, immutable`. A successful exact-URL purge followed by first and repeated requests reported `cf-cache-status: HIT`; Workers Static Assets retained its internal edge object through the zone purge, so an observable `MISS` was not available from the Perth edge. Both cold-attempt and warm requests returned the intended response policy and identical body.
- The root header set passed: `server: cloudflare`, `Vary: Accept`, noindex, the generated hash-based CSP, Permissions Policy, Referrer Policy, nosniff, and frame denial. No header-based production-only policy was added.

#### Browser, accessibility, analytics, and visual parity

- The full hosted Playwright matrix passed 78 tests with 6 intentional viewport-specific skips and zero failures at `1440x900` and `390x900`, with light colour-scheme emulation. Agent readiness passed for ChatGPT-User, Claude-User, and Perplexity-User on all five public routes; axe and interaction-state checks passed.
- A separate hosted browser proof passed all 12 route and viewport combinations with the permanent dark class, zero horizontal overflow, zero console errors, zero page errors, zero CSP violations, and zero failed first-party requests. `dev-browser` independently loaded the same 12 combinations against the current staging Worker; its initial `networkidle` wait was replaced with the page load and dark-root signals because delayed analytics makes network-idle unsuitable.
- Visual parity passed the `1.0%` threshold in every declared state. Desktop: home `0.0039%`, about `0.0000%`, pricing `0.0970%`, contact `0.0004%`, privacy `0.0000%`, 404 `0.0001%`, FAQ open `0.0000%`, Yearly pricing `0.0922%`, contact error `0.8362%`, contact success `0.7439%`. Mobile: home `0.0000%`, about `0.2909%`, pricing `0.0000%`, contact `0.0010%`, privacy `0.0000%`, 404 `0.0006%`, menu open `0.0000%`.
- Hosted analytics interception passed 10 isolated route loads. Every route produced exactly one `Page View` whose `url` and `page` equal its pathname plus the Google Ads referral event and first-touch operations. Five forced sampled sessions reached the intercepted recorder boundary; five forced unsampled sessions requested no recorder. No request completed to Mixpanel or Formspree.

#### Lighthouse 13.4.1 result

The matrix used Chrome `152.0.0.0`, a fresh profile and CLI process for every report, alternating host order for every pair. It completed 100 mobile and 50 desktop performance reports: 10 mobile and 5 desktop runs per route and host. Three launcher-only DevTools endpoint races were preserved and retried with new profiles; all 150 accepted reports have no runtime error and no accepted report was discarded. Values are median `[minimum-maximum]`; delta is staging minus production. LCP is milliseconds.

| Mode | Route | Production score | Staging score | Score delta / % | Production LCP | Staging LCP | LCP delta / % |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| mobile | `/` | 91.5 [84-98] | 100 [94-100] | 8.5 / 9.3% | 3086 [2340-3561] | 1550 [1473-3048] | -1537 / -49.8% |
| mobile | `/about/` | 94.5 [85-100] | 99 [99-100] | 4.5 / 4.8% | 2748 [1889-3954] | 1929 [1721-2001] | -819 / -29.8% |
| mobile | `/pricing/` | 94 [93-96] | 100 [95-100] | 6 / 6.4% | 2781 [2776-2933] | 1042 [967-2393] | -1739 / -62.5% |
| mobile | `/contact/` | 96 [93-100] | 100 [100-100] | 4 / 4.2% | 2555 [1297-2903] | 1091 [1080-1102] | -1465 / -57.3% |
| mobile | `/privacy-policy/` | 97 [90-100] | 100 [95-100] | 3 / 3.1% | 2511 [1788-3206] | 1085 [1075-2517] | -1427 / -56.8% |
| desktop | `/` | 99 [99-99] | 100 [99-100] | 1 / 1.0% | 884 [883-890] | 718 [658-836] | -166 / -18.8% |
| desktop | `/about/` | 100 [100-100] | 100 [100-100] | 0 / 0.0% | 596 [388-780] | 542 [519-571] | -54 / -9.1% |
| desktop | `/pricing/` | 100 [98-100] | 100 [98-100] | 0 / 0.0% | 671 [665-1174] | 535 [527-1138] | -136 / -20.3% |
| desktop | `/contact/` | 100 [100-100] | 100 [100-100] | 0 / 0.0% | 508 [502-510] | 310 [307-348] | -198 / -39.0% |
| desktop | `/privacy-policy/` | 100 [100-100] | 100 [100-100] | 0 / 0.0% | 511 [504-538] | 310 [306-319] | -201 / -39.4% |

Separate staging category reports produced Accessibility / Best Practices / SEO / Agentic Browsing scores of: `/` `100/100/69/100`; `/about/` `96/100/69/100`; `/pricing/` `99/100/69/100`; `/contact/` `100/100/69/100`; `/privacy-policy/` `100/100/69/100`. SEO is excluded from the host comparison because staging is intentionally noindexed. The machine-readable summary is `documents/guides/parity/lighthouse-step8-summary.json`, SHA-256 `77b1cbbc75380b57b2cf1ebaad8d2b69c32b2939e9f9a6f0e5a9e33b3a852cbc`.

Initial JavaScript gzip remains below every Next.js baseline: `/` `93,025`, `/about/` `75,634`, `/pricing/` `81,597`, `/contact/` `72,629`, and `/privacy-policy/` `68,255` bytes. The Three.js chunk remains separate from initial route scripts and loads only after the homepage load event.

#### Step 8 cutover packet

| Field | Verified value |
| --- | --- |
| Production URL | `https://bulma.com.au/`, still GitHub Pages |
| Staging URL | `https://staging.bulma.com.au/`, Cloudflare Worker with noindex |
| Site commit | `f844cab4e16a9cc12900e914aab76f73df093307` |
| Workers build | `c89d5d13-8a96-4568-a874-a269808d254b`, successful |
| Worker and version | `bulma-root`; `5770e5db-f36a-4340-b8cf-a9f4947134ce` at 100% |
| Staging custom domain | `ac7956c2e528fe295b9bcc8f3398664815ff855c` |
| Staging DNS record | `b84080eb0e2fdf451c777a0829f391fa` |
| Staging certificate pack | `b10d5b68-e58f-4395-944f-4a2449cdd770`, active |
| HTTP proof | 18/18 contract cases; 9/9 decoded body comparisons |
| Browser proof | 78 passed, 6 intentional skips; 12/12 error-state combinations passed |
| Visual parity | Every state at or below `0.8362%`; threshold `1.0%` |
| Lighthouse proof | 150/150 performance reports and 5/5 category reports complete |
| DNS before-state | The complete 16-record committed pre-staging snapshot above |
| Intended Step 9 DNS change | Replace only the three apex GitHub A records and the one `www` A record after explicit approval; preserve every other record byte for byte |
| DNS rollback | Delete only migration-created production records, then recreate the four recorded GitHub A payloads exactly; verify `server: GitHub.com` |
| Code rollback | Deploy the previously active Worker version `bb10cf9d-52df-4761-bc9d-3a2c392266ab`; production traffic currently needs no code rollback because it still uses GitHub Pages |

Final revalidation against version `5770e5db-f36a-4340-b8cf-a9f4947134ce` passed 18/18 HTTP cases, 9/9 byte comparisons, 12/12 browser route and viewport combinations, 10/10 analytics route loads, and the full 78-pass hosted Playwright matrix. It returned HTTP/2 and HTTP/3, the intended CSP and security headers, noindex, `Vary: Accept`, revalidating HTML, and immutable hashed assets. The custom-domain certificate remained active. Cloudflare DNS still contained the same 16 pre-staging records plus only the migration-created staging AAAA record; every pre-existing ID, value, TTL, proxy flag, comment, and `modified_on` value matched the committed snapshot.

Step 9 remains prohibited until the user records an explicit cutover decision after reviewing both URLs and this packet.

### Steps 1-8 re-verification and corrections (2026-09-04)

An independent re-verification of Steps 1-8 re-ran the local gate, re-queried every Cloudflare and GitHub resource, and compared the live staging Worker against live production directly.

#### Confirmed correct

- `site/dist` is byte-identical to what `https://staging.bulma.com.au/` serves on all six documents and all three discovery files. Two consecutive local builds produce identical hashes.
- Visible text, sorted `href` lists, and parsed JSON-LD are identical to production on all five public routes.
- `robots.txt` and `llms.txt` are byte-identical to production. `sitemap.xml` publishes the same five URLs with the home page first and no `lastmod`; see the accepted drift below.
- The Worker HTTP contract holds on staging: Markdown negotiation with `Vary: Accept`, `307` on `/pricing`, `406` on an unacceptable `Accept`, `404` on `/_agent-markdown/*`, the Markdown recovery document on an unknown path, `text/plain; charset=utf-8` on `/llms.txt`, and `public, max-age=31536000, immutable` on `/_astro/*`. Every staging response carries `X-Robots-Tag: noindex`, the hash-based CSP, Permissions Policy, Referrer Policy, nosniff, and frame denial.
- Cloudflare state matches the record: `bulma-root` (`workers_dev` and previews disabled) and `bulma-root-preview` (both enabled) exist; the only Workers custom domains in the account are `taxgenie.com.au` and `staging.bulma.com.au`; zone `browser_cache_ttl` is still `14400`; the zone has no custom rulesets; bot management still shows only `is_robots_txt_managed: false` with every other control disabled.
- DNS holds exactly the 16 recorded pre-staging records plus the one migration-created staging `AAAA` record `b84080eb0e2fdf451c777a0829f391fa`. Every pre-existing record ID, value, and proxy flag matches the committed snapshot. The three apex `A` records and the `www` `A` record are unchanged and unproxied.
- Workers Builds is the live release controller. Build `c89d5d13-8a96-4568-a874-a269808d254b` from commit `f844cab` deployed the active production version `5770e5db-f36a-4340-b8cf-a9f4947134ce` at 100%. Cloudflare's account-level `builds/repos/connections` and `builds/triggers` list routes return `12000 Not found` to the Global API Key; the per-build endpoint `builds/builds/{uuid}` resolves and confirms the successful Git-connected build.
- GitHub Pages is still `built`, `build_type: workflow`, `cname: bulma.com.au`, HTTPS enforced, and `https://bulma.com.au/` still answers with `server: GitHub.com`.
- Local gate: `astro check` 284 files with zero errors, warnings, and hints; `pnpm build` clean; 43 Node tests pass; build-output, trust-page, and performance-budget validation pass; Playwright passes 78 with 6 intentional viewport skips. Maximum visual parity difference `0.0970%` against a `1.0%` threshold. `demo/` still passes its 33 tests.

#### Defects found and corrected

The hosted proof compared staging bodies against `site/dist` and compared rendered screenshots and visible text against production. It never compared `site/dist` discovery bytes or head metadata against production, and its href comparison used set membership rather than counts, so seven defects and one accepted difference passed every gate.

| Defect | Production | Shipped staging | Requirement | Fix |
| --- | --- | --- | --- | --- |
| `og:locale` absent | `en-AU` | absent | REQ-9 | `openGraphLocale` in `site/src/config/site.ts`, emitted by `PageMetadata.astro` |
| `og:site_name` absent | `Bulma` | absent | REQ-9 | emitted by `PageMetadata.astro` |
| Viewport lost `initial-scale=1` | `width=device-width, initial-scale=1` | `width=device-width` | parity | `BaseLayout.astro` |
| `og:image:alt` copy changed | `Bulma: AI Assistant for Australian Mortgage Brokers` | `Bulma AI assistant for Australian mortgage brokers` | REQ-27 | `site/src/config/site.ts` |
| `referral-tracking.js` trailing whitespace | `demo/public/scripts/referral-tracking.js` | six differing whitespace runs | REQ-12 | re-copied verbatim |
| Unused runtime dependencies | not in the REQ-1 list | `@fontsource-variable/inter`, `@fontsource-variable/mona-sans` | REQ-1 | removed; lockfile regenerated |
| Internal links lost the trailing slash | `/contact/`, `/pricing/` | `/contact`, `/pricing`; every nav click paid a `307` | REQ-22 | `resolveInternalHref` in `site/src/lib/internal-href.ts`, applied in all ten anchor components |

`/robots.txt` was also served as `text/plain` while production serves `text/plain; charset=utf-8`. A `/robots.txt` charset rule was added to `site/public/_headers` beside the existing `/llms.txt` rule.

`site/test/production-parity.test.ts` now asserts the discovery bytes and the head metadata against `documents/guides/parity/production-baseline.json` on every build, so none of these can regress silently.

#### Accepted sitemap difference

`sitemap.xml` is not byte-identical to production. The shared renderer in `site/src/lib/sitemap.ts` sorts URLs by location and ends the document with a newline, so the emitted file lists `/contact/` before `/pricing/` and is 417 bytes against production's 416. The home page is still the first URL, the five-URL set is unchanged, and neither document carries `lastmod`.

The user reviewed this on 2026-09-04 and withdrew the byte-identical rule for the sitemap: sitemap URL order carries no crawler meaning, and adding site-specific ordering code to reproduce the previous host's hand-written order is unnecessary complexity. REQ-11 in the migration plan is amended accordingly. `site/test/production-parity.test.ts` asserts the URL set, the leading home page, uniqueness, and the absence of `lastmod` instead of a byte hash.

#### Recorded Open Graph drift, approved

Production's Next.js layout never overrides `openGraph` per route, so `/about/`, `/pricing/`, `/contact/`, and `/privacy-policy/` all repeat the homepage `og:title`, `og:description`, and `og:url` even though their `<title>` and `<meta name="description">` are correct. The Astro site emits per-route Open Graph values and a self-referencing `og:url`. This is kept as a deliberate correction of a production defect. The Astro head additionally emits `og:image:type` and `twitter:image:alt`, which production omits.

#### Corrected build deployed and re-proved

Commit `79838f3` was pushed to `main`. Workers Builds deployed production Worker version `77d21bbe-202c-440a-97c0-2c4b7e61f024` at `2026-09-04T11:47:39Z`. Re-proof against the new version:

- All nine decoded staging bodies are byte-identical to the local `site/dist`: the five public documents, the real 404, `robots.txt`, `sitemap.xml`, and `llms.txt`.
- Every route now serves `viewport width=device-width, initial-scale=1`, `og:site_name Bulma`, `og:locale en-AU`, and the production `og:image:alt`.
- `/robots.txt` now returns `text/plain; charset=utf-8`.
- Zero unslashed internal route links remain on any of the five public routes, so no navigation pays a `307`.
- The HTTP contract still holds: 7/7 security headers on `/`, Markdown negotiation returning `text/markdown; charset=utf-8`, `307` on `/pricing`, `406` on an unacceptable `Accept`, `404` on `/_agent-markdown/*` and on an unknown path, `text/plain; charset=utf-8` on `/llms.txt`, and `public, max-age=31536000, immutable` on `/_astro/*`.
- The hosted Playwright matrix against `https://staging.bulma.com.au` passed 78 with 6 intentional viewport skips and zero failures. Maximum visual difference `0.8362%` against the `1.0%` threshold, matching the pre-fix figures.
- Local gate on the corrected tree: `astro check` 285 files with zero errors, warnings, and hints; 44 Node tests; build-output, trust-page, and performance-budget validation; Playwright 78 passed with 6 skips.
- Production is untouched: `https://bulma.com.au/` still answers `server: GitHub.com` with `max-age=600`, GitHub Pages is still `built` on `build_type: workflow` with `cname: bulma.com.au`, and the zone still holds 17 records with the three apex `A` records and the `www` `A` record unproxied and unchanged.

#### Outstanding

The Step 8 cutover packet above still names version `5770e5db-f36a-4340-b8cf-a9f4947134ce` and site commit `f844cab`. Re-issue it against version `77d21bbe-202c-440a-97c0-2c4b7e61f024` and commit `79838f3`, and re-run the Lighthouse matrix if the user wants current numbers, before requesting cutover approval.

## Historical Cloudflare Pages Migration State

- Migration phase: Steps 1 through 5F are complete. Step 5G finished two exact-artifact hosted proof runs but has one failed release gate and one blocked release gate. Steps 6 through 10 remain blocked.
- Production host: GitHub Pages at `https://bulma.com.au/`.
- Current production revision: `4a005a64b8b44b91d168602049cbef38867f79be`.
- Cloudflare custom domains: none.
- Production DNS changes: none.
- Selected current Step 5G comparison revision: `4a005a64b8b44b91d168602049cbef38867f79be`.
- Approval gate: do not request or accept cutover approval while Step 5G is incomplete. Do not associate a custom domain, create a production Pages deployment, change DNS, or disable GitHub Pages until a later complete Step 5G run passes and the user explicitly approves cutover.

## Provider Inventory

### GitHub

| Field | Value |
| --- | --- |
| Repository | `Culpable/bulma-root` |
| Repository ID | `1126720966` |
| Default branch | `main` |
| Selected current workflow run | `33351476104` |
| Workflow head SHA | `4a005a64b8b44b91d168602049cbef38867f79be` |
| Workflow result | `completed / success` |
| GitHub Pages deployment | `6174133038` |
| Deployment result | `success` |
| Deployment URL | `https://bulma.com.au/` |
| Pages build type | `workflow` |
| Pages status | `built` |
| Custom domain | `bulma.com.au` |
| HTTPS enforced | `true` |
| Artifact ID | `9743765230` |
| Artifact name | `github-pages` |
| Artifact size | `4,058,528` bytes |
| Artifact expires | `2026-09-01T02:42:22Z` |
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
| Latest comparison deployment | `3712aa0a-8883-4c46-bf42-3dc1e46be404`, preview branch `cloudflare-comparison` |

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

## Commit-Matched Step 5C Comparison

### Deployment Identity and Scope

- GitHub Pages and Cloudflare Pages now serve source commit `854b85f576910a5a5c3576bdf9fef62a6da4df81`.
- GitHub Actions run `33314166806` completed successfully and deployed the commit to `https://bulma.com.au/`.
- Cloudflare deployment `62181028-c315-4134-b11b-7c61971bc9f6` completed successfully at `https://62181028.bulma-root.pages.dev/` and branch alias `https://cloudflare-comparison.bulma-root.pages.dev/`.
- The Cloudflare deployment reports branch `cloudflare-comparison`, the selected commit, and `commit_dirty: false`. It remains a noindexed preview with no custom domain and no production deployment.
- The comparison includes provider limits. GitHub keeps `Cache-Control: max-age=600` on every response. Cloudflare keeps HTML on `max-age=0, must-revalidate` and serves only content-hashed `/_next/static/*` assets with `public, max-age=31556952, immutable`.
- Cloudflare matched all 182 files in the committed local export byte-for-byte. GitHub matched all 123 non-build-generated files. Its 59 mismatches are HTML, React flight, 404, and build-manifest artefacts produced by the independent GitHub Actions Next.js build. Hosted browser behaviour and application assets match.

### Melbourne and Sydney Network Result

Globalping reused four fixed Melbourne probes and four fixed Sydney probes for three rounds, five routes, and both hosts. Host order alternated by route and round. All 240 requests returned HTTP 200. End-to-end TTFB is DNS + TCP + TLS + first byte.

| City | Samples per host | GitHub median | Cloudflare median | Faster median |
| --- | ---: | ---: | ---: | --- |
| Melbourne | 60 | 222 ms | 42 ms | Cloudflare by 180 ms |
| Sydney | 60 | 213.5 ms | 34 ms | Cloudflare by 179.5 ms |
| Combined | 120 | 220 ms | 39 ms | Cloudflare by 181 ms |

- Cloudflare's first measured route fills were about 281-379 ms, then its route medians settled near 30-40 ms.
- GitHub produced one fully warm round near 11-14 ms, but most first- and third-round requests were about 200-275 ms despite `x-cache: HIT` on many responses. One Sydney homepage request reached 1,120 ms.
- Cloudflare therefore had the stronger retained Australian network result. GitHub still had the faster best-case warm edge.

### All-Page Mobile Lighthouse Result

Lighthouse `13.4.1` used Chrome `151.0.7922.174`, three fresh mobile performance runs per host and route, and alternating host order. Values are medians.

| Route | GitHub score | Cloudflare score | GitHub FCP | Cloudflare FCP | GitHub LCP | Cloudflare LCP | Rendered winner |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/` | 98 | 87 | 1,276 ms | 2,024 ms | 2,262 ms | 3,351 ms | GitHub |
| `/about/` | 100 | 95 | 1,006 ms | 1,699 ms | 1,522 ms | 2,699 ms | GitHub |
| `/pricing/` | 98 | 91 | 1,235 ms | 1,896 ms | 2,360 ms | 3,004 ms | GitHub |
| `/contact/` | 100 | 95 | 1,103 ms | 1,711 ms | 1,777 ms | 2,686 ms | GitHub |
| `/privacy-policy/` | 100 | 93 | 1,076 ms | 1,702 ms | 1,083 ms | 2,902 ms | GitHub |

- GitHub won the median mobile score, FCP, LCP, and Speed Index on every route from the Perth Lighthouse runner.
- Cloudflare transferred about 7-13 KB fewer bytes per route and matched or beat GitHub TBT on the homepage and Pricing, but those smaller payloads did not offset its slower initial document and render-blocking CSS arrival in these cold-browser runs.
- Both hosts kept CLS at zero or negligible levels. Browser checks found no route, interaction, console, page, or overflow defect that would explain the result.

### Recommendation and Remaining Performance Work

Keep GitHub Pages as production for now. Cloudflare is the stronger Australian HTML transport in this run, but GitHub is the stronger complete mobile page experience across every route. A performance-led cutover needs Cloudflare to reproduce its regional network advantage in browser rendering, ideally through at least ten cold and warm mobile runs from Melbourne and Sydney against a custom-apex staging state before DNS changes.

The next application work is shared across both hosts:

1. Reduce the `103-170 KiB` representative unused-JavaScript estimates. Start with shared Next/React navigation code, then profile the homepage Dot Pool and Pricing boundary without changing their interaction or animation contracts.
2. Reduce render-blocking CSS. Representative estimated savings are about `250 ms` on GitHub and up to `870 ms` on Cloudflare. Measure emitted CSS coverage before changing the shared global bundle.
3. Add a smaller About hero and responsive testimonial portrait candidate. Lighthouse still estimates about `46 KiB` of image savings on About.
4. Reduce homepage main-thread work of about `2.0-2.1 s` and Pricing main-thread work of about `2.0-2.6 s` without removing the approved animations or billing interactions.
5. Treat Cloudflare's cold-browser document and stylesheet delay as a deployment investigation. Both hosts use HTTP/2 and the same application routes, so inspect TLS connection setup, edge selection, and critical CSS request timing before changing application code solely for the preview result.

Complete derived evidence is stored in the canonical HTML report under `evidence/regional-au-commit-matched/`, `evidence/lighthouse-all-pages-commit-matched/`, and `evidence/commit-matched-parity/`.

## Step 5D-5F Performance Implementation

### Durable Budgets and JavaScript Ownership

- Added `demo/performance-budgets.json` with the five REQ-19 route ceilings, the recorded `103-170 KiB` host baseline, the 40 KiB minimum reduction, deterministic route gzip baselines, the 40 KiB Mixpanel-core ceiling, and About image ceilings.
- Added `demo/src/scripts/report-performance-budgets.mjs`. It maps emitted route scripts from HTML, measures gzip bytes, identifies Mixpanel, Three.js, and Tailwind Plus by content rather than hashed filenames, accepts an explicit Lighthouse JSON directory, and exits non-zero for route, chunk, or report failures.
- The local production build reports a 30,951-byte gzip Mixpanel core, one preserved 122,050-byte gzip Three.js contribution, no active Tailwind Plus route chunk, and deterministic initial JavaScript below the recorded baseline on all five routes.
- The existing Lighthouse baseline medians remain the hosted comparison authority. The local Python static server does not compress responses, so its unused-JavaScript transfer estimates are not comparable with either hosted baseline and are excluded from the REQ-19 decision.

### Runtime and Interaction Changes

- Changed Mixpanel `2.73.0` to its official `loader-module-with-async-recorder` entry. The token, cookie persistence, cross-subdomain identity, Page View ownership, event payloads, 20% replay sampling, heatmaps, masking, font collection, recorder duration, and current 1,200 ms fallback / 3,000 ms idle timeout remain unchanged.
- Replaced the routed Tailwind Plus FAQ and mobile plan-tab controllers with focused local React ownership. FAQ state retains 400 ms enter, 300 ms leave, rapid reversal, icon/glow coupling, ARIA, cleanup, trusted answer markup, and both direct and same-page `#lenders` opening. Mobile plan tabs retain focus selection and add ArrowLeft, ArrowRight, Home, and End movement while rendering one active panel.
- Removed the unused animation preload helper, duplicate homepage export, `preloadOnHover`, and the shared button client boundary. Rendered button classes and interaction states remain unchanged.
- `npm run lint`, `npm run build`, all 32 Node tests, the synthetic over-budget fixture, and the deterministic performance report pass.

### About Responsive Media

- Generated `/img/photos/1-640.webp` with `cwebp 1.6.0 -m 6 -q 80 -resize 640 0` from source SHA-256 `310430fdc1dc9384d610a058abea02f5532f52563f98045d2e160ac4d1884e94`. The output is 640x336 and 20,224 bytes.
- Generated `/img/avatars/16-h-458-w-640.webp` with the same encoder settings from source SHA-256 `9d497ea774f528f9d0d60363f6c850621c9bae32a6d6445b9399f30d07225756`. The output is 640x458 and 10,240 bytes.
- At `390x900`, light colour-scheme emulation selected both 640-pixel candidates. The hero rendered at 342x180 with eager/high-priority loading; the testimonial rendered at 326x233 and remained lazy. At `1440x900`, the hero selected the 1,600-pixel source and the testimonial selected the 1,400-pixel source.
- Normal and close visual inspection found no crop, colour, facial-detail, text-integration, or layout change. All five routes retained the permanent dark class, zero horizontal overflow, zero page errors, and zero failed first-party requests at both required viewports.

### CSS Decision

- Post-change CSS coverage exercised all five routes plus mobile navigation, FAQ, yearly pricing, plan-tab keyboard selection, and contact focus states. The primary 162,713-byte stylesheet used 108,520-126,105 bytes per tested route/state; the 3,422-byte shared stylesheet remained cross-route infrastructure.
- A disposable prototype inlined both stylesheets into every route. It reduced compressed first-load document-plus-CSS bytes by only 102-243 bytes, but increased every repeat navigation by 25,904-26,045 bytes because the shared stylesheet could no longer be reused from cache.
- The prototype failed REQ-23 and was moved to Trash. The two external stylesheets remain unchanged.

## Step 5G Matched-Artifact Hosted Proof

### Deployment Identity and Parity

- Committed the Steps 5D-5F implementation as `3b131b8bd02c9cf29fe9f0396bcbb1cecfd78416` and pushed `main` to GitHub. GitHub Actions run `33321153005` completed successfully and deployed GitHub Pages.
- Downloaded that successful workflow's exact `github-pages` artifact. Its `artifact.tar` SHA-256 is `ae117694ca17e55eb12be7de0d1b2b04418001cdfd286eded3df82cabd461a17`.
- Uploaded the extracted artifact without rebuilding to Cloudflare preview deployment `8eafed9f-a947-4b88-9449-b2d09f58c29a`. The immutable URL is `https://8eafed9f.bulma-root.pages.dev/`; the branch alias is `https://cloudflare-comparison.bulma-root.pages.dev/`.
- The Cloudflare deployment reports branch `cloudflare-comparison`, the exact selected commit, `commit_dirty: false`, `uses_functions: false`, and success. The project retains no custom domain and no production deployment.
- Compared every hosted body and status against the 179-file artifact manifest. GitHub and Cloudflare returned zero decoded-body, status, content-type, canonical, discovery, or unknown-route mismatches. Cloudflare also parsed the artifact's `_headers` file, which is not itself served as an asset.
- Verified expected provider headers. The Cloudflare preview remains noindexed; HTML revalidates; content-hashed `/_next/static/*` files use the one-year immutable rule. GitHub retains its provider-fixed ten-minute cache.

### Local and Hosted Performance Result

- Passed `npm run lint`, `npm run build`, all 32 Node tests, the synthetic budget failure fixture, and `npm run performance:budgets` before publishing.
- Deterministic initial JavaScript decreased on every route: `646` bytes gzip on `/`, `832` on `/about/`, `616` on `/pricing/`, `509` on `/contact/`, and `835` on `/privacy-policy/`. Mixpanel core is `30,951` bytes gzip; no routed Tailwind Plus contribution remains.
- Completed all 150 standard Lighthouse reports: ten alternating mobile runs and five alternating desktop runs for every host and route. Completed all 30 separate DevTools-throttled mobile reports. One launcher-only failure was preserved and rerun; no completed report was excluded.
- Current mobile GitHub / Cloudflare score and LCP medians are: `/` `93.5 / 2,851 ms` versus `93 / 2,947 ms`; `/about/` `96 / 2,551 ms` versus `96.5 / 2,628 ms`; `/pricing/` `95 / 2,777 ms` versus `97 / 2,499 ms`; `/contact/` `96.5 / 2,551 ms` versus `96 / 2,570 ms`; `/privacy-policy/` `97 / 2,515 ms` versus `97 / 2,457 ms`.
- Both hosts pass every REQ-19 mobile route ceiling. About mobile image-delivery waste is `13.36 KiB`, below the REQ-22 `20 KiB` ceiling. Desktop scores are `99-100`.
- REQ-27 passes all five Cloudflare before/after route comparisons. It fails all five GitHub comparisons. Every GitHub route exceeds its FCP, LCP, Speed Index, and performance-score allowance, even though deterministic JavaScript decreased. The result suggests measurement-window or delivery variance, but the fixed gate does not permit that inference to override a failure.

### Regional Transport and Sydney Browser Gate

- Reused four fixed Melbourne and four fixed Sydney Globalping probes for three alternating rounds, both hosts, and all five routes. All 240 rows returned HTTP 200.
- City medians were GitHub `222 ms` versus Cloudflare `41.5 ms` in Melbourne and GitHub `13 ms` versus Cloudflare `34 ms` in Sydney. The combined medians were GitHub `209 ms` and Cloudflare `38 ms`. These are transport results, not regional render results.
- Explicit IPv4 and IPv6 requests succeeded on both hosts. The GitHub IPv6 observation used an IPv4-mapped address; Cloudflare returned native IPv6.
- The Cloudflare Speed API accepted and completed one Sydney GitHub homepage test, ID `ab317c80-b832-43b9-ae7c-b38eb2c3334a`. Its desktop result was score `95`, FCP `402 ms`, LCP `1,251 ms`, Speed Index `1,525 ms`, and TBT `48 ms`; its mobile result was score `80`, FCP `1,803 ms`, LCP `2,478 ms`, Speed Index `3,154 ms`, and TBT `636 ms`.
- The preserved corresponding create request for the Cloudflare `pages.dev` URL returned HTTP 500 with API error `1004`, `speed.errors.generic`. The response establishes the API failure, not the service's reason for rejecting the URL or the account's later quota state.
- Stopped the matrix instead of spending quota on 49 more GitHub-only tests. The plan prohibits a partial or mixed-runner comparison, so the required 50-test Sydney same-runner gate remains blocked and incomplete.

### Hosted Browser and Analytics Result

- Re-ran all five routes on both hosts at `1440x900` and `390x900` with light colour-scheme emulation. Both hosts passed permanent dark rendering, horizontal overflow, navigation, mobile menu, direct and same-page `#lenders`, rapid FAQ reversal, pricing state and keyboard control, exact yearly copy, desktop equal-height cards, contact error and success paths, responsive About sources, and first-party request checks.
- The retained hosted browser lacked WebGL and exercised the complete Dot Pool fallback. Earlier local validation exercised the normal canvas path. No animation implementation or guide change followed from the hosted fallback result.
- Forced sampled and unsampled analytics profiles on both hosts with all Mixpanel, recorder, and Formspree traffic intercepted. Each host produced the five normalised Page Views, exact Google Ads referral fixture, custom migration-check event, and first-touch profile values. Unsampled sessions requested no recorder; sampled sessions reached the recorder-load boundary.
- The sampled browser proof used a minimal intercepted recorder constructor. It proves the sampling and lazy-load boundary, not the internal rrweb recording implementation; the Node analytics contracts cover that implementation.

### Decision and Evidence Boundary

- Step 5G does not pass because GitHub fails REQ-27 on all five routes and the required Sydney same-runner matrix could not run against the Cloudflare preview URL.
- After the measurement completed, concurrent commit `4a005a64b8b44b91d168602049cbef38867f79be` deployed to GitHub Pages through successful workflow `33351476104`. It is a direct child of the comparison commit and changes only `demo/src/lib/llms.js`, `demo/src/scripts/generate-llms-txt.js`, `demo/public/llms.txt`, and `demo/test/agent-readiness.test.mjs`.
- The later deployment did not change the five rendered routes measured by Lighthouse or rescue either failed gate. It temporarily ended the live byte-matched state because GitHub's `llms.txt` differed from the first Cloudflare comparison artifact. The current rerun below restored an exact-artifact pair.
- Keep GitHub Pages in production. Do not request cutover approval, associate a custom domain, create a Cloudflare production deployment, change DNS, create redirects, or disable GitHub Pages.
- The canonical cold-reader report is `/Users/sacino/.agents/skills/post-work-response/tmp/bulma-root/20260830-1457-agent-readiness-page-speed/index.html`. Its `evidence/step5g-20260831/` directory retains the first hosted proof, and `evidence/step5g-current-20260831/` retains the current exact-pair parity and Lighthouse rerun.
- A later run must pass REQ-27 and complete the Sydney gate before Step 6 may begin. If the plan's baseline or Sydney-hostname rules need to change, that is a user decision and must be recorded before any new external mutation.
- The current exact pair uses GitHub artifact `9743765230` from successful workflow `33351476104` for commit `4a005a64b8b44b91d168602049cbef38867f79be` and Cloudflare deployment `3712aa0a-8883-4c46-bf42-3dc1e46be404`.

### Current Exact-Pair Rerun

- Downloaded artifact `9743765230` from successful GitHub workflow `33351476104`. Its `artifact.tar` SHA-256 is `4f146bab8d4e16e3ae7d342d19cd761ed7820a5e9ebc6acf941441645b98cb6e`.
- Uploaded the extracted artifact without rebuilding to clean Cloudflare preview deployment `3712aa0a-8883-4c46-bf42-3dc1e46be404` at `https://3712aa0a.bulma-root.pages.dev/`. The deployment reports commit `4a005a64b8b44b91d168602049cbef38867f79be`, branch `cloudflare-comparison`, `commit_dirty: false`, `uses_functions: false`, and success.
- Compared all 179 served files with both hosts. Decoded bodies, statuses, and normalised media types produced zero mismatches. Cloudflare parsed the artifact's `_headers` control file, giving 180 artifact files in total.
- Re-ran local validation against the current revision. Lint, production build, all 33 tests, and deterministic performance budgets passed. Routed JavaScript remained unchanged from the prior Step 5G implementation.
- Completed a new exact-pair Lighthouse matrix with 100 mobile and 50 desktop reports. Mobile GitHub / Cloudflare score and LCP medians were: `/` `94 / 2,889 ms` versus `93 / 2,951 ms`; `/about/` `96 / 2,552 ms` versus `100 / 1,913 ms`; `/pricing/` `95 / 2,776 ms` versus `97 / 2,497 ms`; `/contact/` `96.5 / 2,551 ms` versus `97.5 / 2,194 ms`; `/privacy-policy/` `97 / 2,508 ms` versus `97 / 2,462 ms`.
- REQ-27 again passed every Cloudflare route and failed every GitHub route against the locked Step 5C host baseline. GitHub exceeded FCP and LCP allowances on every route, lost 3-4 performance points, and exceeded Speed Index on four routes.
- The Cloudflare Speed API reported 49 of 50 free tests remaining and Sydney available. The plan prohibits starting the 50-test matrix without at least 50 remaining, so no test was consumed and the Sydney same-runner gate remains blocked.
- Stopped the rerun after REQ-27 failed and the Sydney gate remained blocked. The separate DevTools, Globalping, hosted-browser, and analytics matrices were not repeated because they cannot rescue REQ-27 or supply the unavailable 50-test Sydney quota.
- Preserve GitHub Pages as production. No DNS record, custom domain, production Cloudflare deployment, GitHub Pages setting, branch, commit, or push changed during this rerun.
- Current rerun evidence is stored in the canonical report under `evidence/step5g-current-20260831/`.

### Calibrated Lighthouse Test Continuation - 4 September 2026

- Rechecked the current exact pair at `https://bulma.com.au/` and `https://3712aa0a.bulma-root.pages.dev/`. Decoded response hashes still match for all five public routes, `llms.txt`, `robots.txt`, and `sitemap.xml`.
- Ran Lighthouse `13.4.1` with Chrome `152.0.7977.76` through the Lighthouse Test workflow. The host benchmark index was `3050`, which selected a `10.5x` calibrated mobile CPU slowdown.
- Completed 100 calibrated mobile scoring reports, 30 DevTools-throttled mobile diagnostics, 50 desktop scoring reports, and one calibration report. All 181 JSON files parse, no report has a runtime error, and every requested scoring category is numeric.
- Mobile GitHub / Cloudflare score and LCP medians were: `/` `91 / 2,874 ms` versus `90 / 2,307 ms`; `/about/` `98 / 2,018 ms` versus `96.5 / 2,070 ms`; `/pricing/` `95 / 2,782 ms` versus `98 / 1,857 ms`; `/contact/` `99 / 1,529 ms` versus `99 / 1,925 ms`; `/privacy-policy/` `99 / 1,896 ms` versus `97.5 / 1,902 ms`.
- Desktop scores were `99-100` on both hosts. Every median desktop TBT was `0 ms`; route-level LCP medians were `425-885 ms` on GitHub and `422-938 ms` on Cloudflare.
- The DevTools-throttled profile favoured Cloudflare on Home and About, GitHub on Pricing, and produced effective ties on Contact and Privacy Policy. Pricing median TBT was `253 ms` on GitHub and `547 ms` on Cloudflare.
- The random 20% Mixpanel recorder sampler was uneven. It loaded in one GitHub homepage run and six Cloudflare homepage runs. The Cloudflare unsampled homepage median was score `96.5`, LCP `2,231 ms`, and TBT `178 ms`, compared with the all-run median of score `90`, LCP `2,307 ms`, and TBT `324 ms`. All-run medians remain the official result.
- Two first-round mobile reports warned that browser-cache clearing timed out. Both completed with numeric scores and no runtime error; they remain in the evidence and the ten-run medians.
- The Cloudflare Speed API again reported 50 tests available and Sydney present, then rejected the first `pages.dev` request with error `1004`, `speed.errors.generic`. The failed request consumed no quota. Stopped before any GitHub-only request, so the required same-runner Sydney matrix remains blocked.
- This calibrated result must not be compared directly with the fixed-4x Step 5C baseline. It updates the current cross-host evidence but does not change the failed REQ-27 decision or complete Step 5G.
- Durable evidence is stored at `/Users/sacino/Documents/codex/web-performance/bulma-hosting/step5g-speed-20260904/`. No production deployment, DNS record, custom domain, GitHub Pages setting, branch, commit, or push changed.
