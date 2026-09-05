# Bulma Root

Bulma Root is the marketing site for [Bulma](https://app.bulma.com.au), an AI assistant for Australian mortgage brokers. The public site runs at [bulma.com.au](https://bulma.com.au).

## Repository layout

```text
bulma-root/
├── site/               # Only runnable app: Astro source, Worker, tests, and deployment config
│   ├── src/            # Pages, layout, React islands, styles, libraries, and Worker entrypoint
│   ├── public/         # Static assets, discovery files, and header template
│   ├── scripts/        # Build, preview, verification, and reporting tools
│   ├── test/           # Node and Playwright suites
│   ├── astro.config.mjs
│   ├── playwright.config.ts
│   └── wrangler.jsonc
├── components/         # Historical unrouted Tailwind Plus component sources
├── pages/              # Historical unrouted page variations
├── video/              # Historical Remotion demo project
├── documents/          # Architecture, hosting, and agent guides
├── AGENTS.md           # Binding project instructions
└── DESIGN.md           # Visual implementation contract
```

`site/` is the only runnable application. Root `components/`, `pages/`, and `video/` remain reference material and do not ship.

## Requirements

- Node.js 22.23.1, pinned by `.nvmrc`
- pnpm 11.22.0, declared in `site/package.json`

Activate the pinned runtime from the repository root, then install the site dependencies:

```bash
nvm use
pnpm --dir site install --frozen-lockfile
```

## Development

Start Astro on the configured local port:

```bash
pnpm --dir site dev
```

Open `http://localhost:4331`. Source pages are prerendered by Astro. React hydrates only the sections that own interaction or animation state.

## Validation

Run the complete local gate from the repository root:

```bash
pnpm --dir site check
pnpm --dir site build
pnpm --dir site test
```

- `check` generates Cloudflare types and runs Astro and TypeScript checks.
- `build` writes `site/dist`, generated agent Markdown, and the final hashed Content Security Policy.
- `test` runs Node tests, built-output checks, performance and trust checks, then Playwright at `1440x900` and `390x900`.
- `test:http` verifies the Worker request contract for HTML and Markdown negotiation, status codes, headers, cache policy, and blocked internal paths.

Start Wrangler in the first terminal:

```bash
pnpm --dir site worker:dev
```

Pass its reported URL to the HTTP contract in a second terminal:

```bash
pnpm --dir site test:http -- http://127.0.0.1:8787
```

Playwright serves the built output through `site/scripts/preview-server.mjs`. Do not use `astro preview` as its test server.

## Hosting and deployment

Cloudflare Workers Static Assets serves production through Worker `bulma-root`:

- `https://bulma.com.au` is the canonical, indexable origin.
- `https://www.bulma.com.au/<path>?<query>` returns one `308` redirect to the matching apex URL.
- Cloudflare Workers Builds deploys the `main` branch from `site/`.
- Non-main branches upload non-promoted versions to `bulma-root-preview` on Cloudflare preview hosts. Preview responses are noindexed.
- `site/src/worker.ts` selects prerendered HTML or generated Markdown at the same canonical URL from the request `Accept` header.
- `site/public/_headers` owns the Content Security Policy, security headers, text charsets, and immutable caching for `/_astro/*` assets.

See `documents/guides/_hosting.md` for the live topology, rollback evidence, and hosted verification record.

## Design and architecture

- Read `AGENTS.md` before repository work.
- Read `DESIGN.md` before changing a user-facing surface.
- Read `documents/guides/_animations.md` before changing animation code.
- Read the routed guides in `documents/AGENTS/` before changing configuration, metadata, third-party scripts, agent readiness, or testing contracts.

## License

The retained Tailwind Plus template sources are a commercial product licensed under the [Tailwind Plus licence](https://tailwindcss.com/plus/license).
