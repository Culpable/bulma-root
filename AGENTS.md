# IMPORTANT

- This file defines the binding project rules for the Bulma marketing site.
- Paths are relative to this repository unless stated otherwise.
- Read the mapped architecture and design documents before changing their systems.

<container_guidelines>

<code_standards>

- Give complete solutions without omitting implementation lines.
- Separate distinct functions and classes by two new lines.
- Keep distinct responsibilities in focused modules.
- Follow `documents/AGENTS/code-standards.md` for Astro structure, static-first boundaries, build configuration, and source ownership.
- Follow `documents/AGENTS/site-configuration.md` before changing public site facts or their owners.
- Follow `documents/AGENTS/metadata.md` before changing metadata or structured data.
- Follow `documents/AGENTS/third-party-scripts.md` before changing analytics or other provider code.
- Follow `documents/AGENTS/agent-readiness.md` before changing routes, discovery files, crawler policy, redirects, 404 behaviour, negotiated representations, or Worker routing.
- Follow `documents/AGENTS/testing.md` when selecting and reporting validation.

<git_commit_guidelines>

Git commit guidelines are documented in `.cursor/rules/git-commit-message-format.mdc`.

</git_commit_guidelines>

<commenting_standards>

- Write clear comments that explain purpose, constraints, business rules, and edge cases.
- Use imperative mood in code comments.
- Avoid comments that only repeat the code.

</commenting_standards>

<worker_architecture>

- `site/` is a static Astro application deployed through the `bulma-root` Cloudflare Worker.
- `site/src/worker.ts` is the request entrypoint. It delegates public assets and same-URL HTML or Markdown negotiation to `site/src/lib/agent-readable-http/`.
- Astro prerenders public HTML. The Worker selects a prebuilt representation and must never server-render page content.
- `site/public/_headers` owns the Content Security Policy, security headers, plain-text charsets, and immutable `/_astro/*` caching. `site/scripts/generate-headers.mjs` resolves generated script hashes during the build.
- Keep `Vary: Accept` complete on negotiated document responses. Fixed assets, `robots.txt`, `sitemap.xml`, and `llms.txt` retain their own media types.
- Keep generated Markdown under the private `/_agent-markdown/` path. Block direct public requests and exclude it from canonicals, links, robots, sitemap, and `llms.txt`.
- Do not add HSTS unless the user explicitly approves it after the production host and all subdomains have been audited.

</worker_architecture>

<frontend_design>

<colour_scheme_rules>

**The marketing site is dark-only for every visitor. Never reintroduce a light rendering path.**

- `site/src/styles/global.css` declares `@custom-variant dark (&:where(.dark, .dark *))`.
- `site/src/layouts/BaseLayout.astro` puts a permanent `dark` class on `<html>` and declares the dark colour scheme.
- Do not branch on `prefers-color-scheme` in CSS, markup, or client code.
- Unprefixed light utilities overridden by `dark:` utilities are inert and may remain. Never rely on them rendering.
- Verify UI changes with `prefers-color-scheme: light` emulated to prove the dark lock-in.

</colour_scheme_rules>

- For pricing card grids, pair `items-stretch` on the grid with `h-full` on each card and animation wrapper.
- When reusing a visual component, verify text colour, opacity, hover, focus, active, underline, accent, wrapper, and background parity with the source.

<hash_navigation_rules>

- Preserve the homepage FAQ deep link `#lenders`. It targets the `Which lenders does Bulma cover?` FAQ item and opens it when the hash matches.
- Use `#supported-lenders` only for the visual supported-lenders field.
- Verify both direct `/#lenders` loads and same-page `#lenders` clicks after editing FAQ or navigation behaviour.

</hash_navigation_rules>

<contact_form_rules>

- Preserve the contact form field contract unless the user explicitly requests a field model change.
- The fields are hidden `form_source`, `name`, `email`, and `message`.
- Layout, styling, focus, loading, error, success, analytics, and fallback behaviour may change without changing this field model.

</contact_form_rules>

<pricing_module_parity_rules>

- Keep the homepage pricing section in `site/src/components/pages/home-sections.tsx` visually and verbally aligned with the pricing-page section in `site/src/components/pages/pricing-sections.tsx`.
- Treat `/pricing/` as the source of truth unless the user explicitly requests a different homepage variant.
- The annual callout must be exactly `Get 2 months free on a yearly plan.` in both modules.
- Update and verify both modules when changing pricing copy, savings, bonuses, plan features, CTA labels, shared pricing components, or card presentation.
- Verify Monthly and Yearly states at `1440x900` and `390x900`, including equal-height cards, prompts, wrapping, hover/focus styling, and horizontal overflow.

</pricing_module_parity_rules>

<animation_standards>

**NEVER add `prefers-reduced-motion`, reduced-motion media queries, or equivalent runtime conditionals.**

- Do not remove, simplify, or rewrite an existing marketing animation unless the user explicitly requests that animation change.
- Read `documents/guides/_animations.md` before changing animation code. Update it when behaviour, timing, boundaries, or lifecycle changes.
- Preserve `h-full` through animated grid wrappers. Prevent overflow, clipping, overlap, and layout shift.
- Clean up every observer, timer, event listener, animation frame, and WebGL resource.
- Avoid React state in high-frequency scroll and pointer paths.
- Browser-verify scroll, hover, focus, pointer, parallax, counters, blur transitions, gradients, and ambient motion on desktop and mobile.

</animation_standards>

</frontend_design>

</code_standards>

<testing_rules>

<validation_commands>

Run these commands from the repository root before reporting completion:

- `pnpm --dir site check` - Generate Worker types, then run Astro and TypeScript checks.
- `pnpm --dir site build` - Build `site/dist`, normalise island IDs, generate agent Markdown, and generate final headers.
- `pnpm --dir site test` - Run unit, built-output, performance, trust-page, and Playwright suites. Run the build first because output checks inspect `site/dist`.
- `pnpm --dir site worker:dev` - Start the local Worker runtime on Wrangler's reported URL.
- `pnpm --dir site test:http -- <worker-url>` - Against that running Worker, verify negotiated HTML and Markdown, 404 and 406 responses, headers, caching, and blocked internal paths.
- Run focused tests when a relevant command exists or the task adds a test.
- If a required command cannot run, report the command, exact failure, and residual risk.

</validation_commands>

<dev_server_policy>

LOCAL SERVER POLICY:

- `site/` is the only runnable app. Do not run Astro or pnpm commands from the repository root.
- The development URL is `http://localhost:4331` and the command is `pnpm --dir site dev`.
- Before browser testing, check whether port `4331` already serves the Bulma Astro site. Reuse the correct server.
- If port `4331` is occupied by another service, run `pnpm --dir site dev -- --port <port>` on another available port and report the URL.
- Wait for the URL to respond before opening a browser tool.
- Stop a server you started when testing finishes. Leave a pre-existing server running.
- The Playwright suite must serve built `site/dist` through `node site/scripts/preview-server.mjs`. Do not use `astro preview` for the suite because it does not reproduce the static preview contract.
- Playwright owns its server with `reuseExistingServer: false`. If another process occupies port `4331`, do not stop it unless you started it for this task; fail and report the conflict or use an explicitly configured separate port.
- Use `pnpm --dir site worker:dev` when validating Worker request handling and response headers.
- Follow `.cursor/rules/dev-browser.mdc` for interactive browser verification and screenshot evidence.

</dev_server_policy>

<ui_verification>

- UI-affecting work requires both the relevant Playwright checks and browser verification with `dev-browser` or `agent-browser`, unless the user explicitly takes responsibility for UI testing.
- Open every changed route and relevant interaction state.
- Verify at `1440x900` and `390x900` with `prefers-color-scheme: light` emulated.
- Check horizontal overflow, console and page errors, clipping, overlap, wrapping, and offscreen changed elements.
- Scroll observed, sticky, and lazy-hydrated targets into the live viewport and wait for settled state before measuring.
- Save useful screenshots with absolute paths and describe the exact evidence they show.
- For UI work, report automated checks, browser routes and interactions, viewport coverage, results, and every skipped check with residual risk.

</ui_verification>

</testing_rules>

</container_guidelines>

<container_information>

<host_limits>

Cloudflare Workers Static Assets serves production through the `bulma-root` Worker. The platform supports the generated `_headers` policy, CSP, negotiated same-URL Markdown with `Vary: Accept`, and immutable caching for content-hashed `/_astro/*` assets. Keep HSTS absent until explicitly approved. Production HTML and discovery files must remain indexable; preview Worker hosts must emit `X-Robots-Tag: noindex`.

</host_limits>

<description>

This repository contains the Bulma marketing site at `https://bulma.com.au`. Bulma helps Australian mortgage brokers automate scenario planning, credit assessment preparation, policy matching, and lender selection. The application is at `https://app.bulma.com.au`.

</description>

<system_architecture_documentation>

| Component | Path | Purpose |
| --- | --- | --- |
| Animations | `documents/guides/_animations.md` | Motion primitives, island timing, and Three.js Dot Pool lifecycle |
| Hosting | `documents/guides/_hosting.md` | Worker topology, DNS, builds, headers, cutover, and rollback evidence |
| Agent readiness | `documents/AGENTS/agent-readiness.md` | Routes, discovery, crawler, negotiation, and provider boundaries |
| Code standards | `documents/AGENTS/code-standards.md` | Astro ownership and static-first implementation rules |
| Metadata | `documents/AGENTS/metadata.md` | Metadata, canonical, social, and structured-data ownership |
| Site configuration | `documents/AGENTS/site-configuration.md` | Public facts and configuration ownership |
| Testing | `documents/AGENTS/testing.md` | Validation selection, isolation, generated output, and proof |
| Third-party scripts | `documents/AGENTS/third-party-scripts.md` | Provider snippet placement and verification |
| Demo video | `documents/guides/_demo-video.md` | Historical Remotion marketing demo project |

When code changes a mapped component, read its guide, compare it with the final implementation, and update only outdated or missing behaviour.

</system_architecture_documentation>

<design_documentation>

`DESIGN.md` is the visual implementation contract for `site/src`. Token values belong to `site/src/styles/global.css`; motion detail belongs to `documents/guides/_animations.md`.

</design_documentation>

<brand_colors>

- Primary gradient: `#243a42` to `#232f40`
- White: `#ffffff`
- Black: `#000000`

</brand_colors>

<folder_structure>

The former `demo/` directory contained the Next.js marketing application. It was removed after the Astro migration; the active marketing application is now `site/`. The remaining root `components/` and `pages/` directories are historical references, and `video/` contains the separate historical Remotion demo video project.

```text
/
├── site/                              # Only runnable application
│   ├── src/
│   │   ├── pages/                     # Astro route entrypoints
│   │   ├── layouts/BaseLayout.astro   # Document shell and global head/body integration
│   │   ├── components/
│   │   │   ├── elements/              # Shared React and Astro-facing primitives
│   │   │   ├── icons/                 # Local SVG React components
│   │   │   ├── sections/              # Reusable page sections and controllers
│   │   │   ├── pages/                 # Route-level React island compositions
│   │   │   ├── shell/                 # Static navbar/footer shell and controller boundary
│   │   │   ├── head/                  # Metadata and structured-data Astro components
│   │   │   └── scripts/               # Sitewide provider registries
│   │   ├── config/                    # Typed public site and llms configuration
│   │   ├── data/                      # Canonical sitemap data
│   │   ├── hooks/                     # Shared React hooks
│   │   ├── lib/                       # Metadata, analytics, schema, and HTTP helpers
│   │   ├── scripts/                   # Project-owned browser entrypoints
│   │   ├── styles/global.css          # Tailwind theme and animation authority
│   │   └── worker.ts                  # Cloudflare Worker request entrypoint
│   ├── public/                        # Stable assets, discovery files, and header template
│   ├── scripts/                       # Build, preview, HTTP, hosted, and Lighthouse tools
│   ├── test/                          # Node and Playwright suites
│   ├── astro.config.mjs               # Static output, Fonts API, Vite, and port configuration
│   ├── playwright.config.ts           # Desktop/mobile browser projects and preview server
│   ├── wrangler.jsonc                 # Production and preview Worker configuration
│   ├── package.json                   # pnpm commands and dependency authority
│   └── pnpm-lock.yaml                 # Locked dependencies
├── components/                        # Historical unrouted component reference tree
├── pages/                             # Historical unrouted page variation tree
├── video/                             # Historical Remotion demo video project
├── documents/                         # Architecture, operations, and project guides
├── DESIGN.md                          # Visual implementation contract
└── AGENTS.md                          # Binding project instructions
```

</folder_structure>

</container_information>

<environments>

- Development: `pnpm --dir site dev` serves the Astro site at `http://localhost:4331`.
- Local static test runtime: `node site/scripts/preview-server.mjs` serves `site/dist` for Playwright.
- Local Worker runtime: `pnpm --dir site worker:dev` exercises response negotiation and headers.
- Production: Cloudflare Workers Builds deploys `main` to Worker `bulma-root`, served at `https://bulma.com.au`.
- Preview: non-main branches upload non-promoted versions to `bulma-root-preview` on its `workers.dev` preview hosts. Preview responses are noindexed.
- `https://www.bulma.com.au/<path>?<query>` redirects once with status `308` to the matching apex URL.

</environments>
