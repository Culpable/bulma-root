# Plan 002: Add Terms of Service and Security pages and link them in the footer

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e308003..HEAD -- demo/src/app/layout.tsx demo/src/app/privacy-policy demo/src/lib/metadata.ts demo/src/lib/sitemap.js demo/src/app/terms-of-service demo/src/app/security`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW engineering / MED content (legal copy must be owner-reviewed before merge)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `e308003`, 2026-06-12

## Why this matters

bulma.com.au markets a paid SaaS (Solo $49/mo, Team $99/mo, Enterprise custom) with "Start free trial" CTAs pointing at https://app.bulma.com.au/register — but the site has no Terms of Service. The footer already *planned* for one: the Legal category in `demo/src/app/layout.tsx` contains commented-out "Terms of Service" and "Security" links sitting next to the live Privacy Policy link. Separately, the homepage FAQ makes concrete security claims ("AES-256 at rest, TLS 1.3 in transit", "never share your queries or client information with third parties") with no page substantiating them — and mortgage brokers handling client financials are exactly the buyers who look for one. This plan creates both pages following the existing privacy-policy page pattern and activates the commented footer links. Engineering is trivial; the copy is drafted by the executor and **must be flagged for owner/legal review in the branch** — that review is the merge gate.

## Current state

Repo facts:

- Only runnable app: `demo/` (Next.js 16 App Router, Tailwind v4, static export to `demo/out` for GitHub Pages). All commands run from `demo/`.
- Routes today: `/`, `/about`, `/contact`, `/pricing`, `/privacy-policy`, `/404`.

Relevant files:

- `demo/src/app/layout.tsx:158-162` — the footer Legal category with the dormant links:

  ```tsx
  <FooterCategory title="Legal">
    <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
    {/* <FooterLink href="#">Terms of Service</FooterLink> */}
    {/* <FooterLink href="#">Security</FooterLink> */}
  </FooterCategory>
  ```

  (Other commented links — Features, Integrations, Help Center, API Docs, Status at lines 148–155 — are out of scope.)

- `demo/src/app/privacy-policy/page.tsx` — the exact pattern to replicate. Structure:

  ```tsx
  import { pageMetadata } from '@/lib/metadata'
  import { DocumentCentered } from '@/components/sections/document-centered'
  import type { Metadata } from 'next'
  import Link from 'next/link'

  export const metadata: Metadata = {
    title: pageMetadata.privacyPolicy.title,
    description: pageMetadata.privacyPolicy.description,
  }

  export default function Page() {
    return (
      <>
        <DocumentCentered id="document" headline="Privacy Policy" subheadline={<p>Last updated on January 20, 2026.</p>}>
          <p>Bulma Pty Ltd (&quot;<strong>Bulma</strong>&quot;, ...)</p>
          <h2>Section heading</h2>
          ...
        </DocumentCentered>
      </>
    )
  }
  ```

  Contact block at the bottom uses `solutions@bulma.com.au` and "PO Box 155, Northlands PO 6905" (WA, Australia — also in `demo/src/schemas/organization-schema.ts:42-50`). Note: the live privacy policy describes itself as "a general example only" — match its plain, generic tone; do not write more aggressively binding copy than the page it sits beside.

- `demo/src/lib/metadata.ts:58-62` — the per-page metadata shape to extend:

  ```ts
  privacyPolicy: {
    title: 'Privacy Policy',
    description:
      'Read the Bulma privacy policy to understand how we collect, use, and protect your personal information.',
  },
  ```

  Page titles get a " | Bulma" suffix automatically from the layout title template.

- `demo/src/lib/sitemap.js:18-24` — `CORE_ROUTES = ['/', '/about/', '/pricing/', '/contact/', '/privacy-policy/']`. The generator (`demo/src/scripts/generate-sitemap.js`) ALSO auto-discovers any `src/app/**/page.tsx`, so new routes appear in the sitemap either way; add them to `CORE_ROUTES` anyway for parity with `/privacy-policy/`.
- Published security claims the Security page may repeat (the ONLY claims it may make — see STOP conditions), from `demo/src/app/page.tsx:153` (homepage FAQ "Is my data secure with Bulma?"):
  - enterprise-grade encryption: AES-256 at rest, TLS 1.3 in transit
  - queries and client information never shared with third parties
  - conversation history stored securely, accessible only by the user

Conventions: comments in imperative mood; two blank lines between top-level functions; TS strict (typecheck is clean at `e308003`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `cd demo && npx tsc --noEmit` | exit 0 |
| Lint | `cd demo && npm run lint` | **baseline at `e308003` is 12 problems (11 errors, 1 warning)** — gate is "no NEW problems" |
| Build + sitemap | `cd demo && npm run build` | exit 0; regenerates `demo/public/sitemap.xml` (tracked) — commit it for THIS plan, since the route set genuinely changes |
| Dev server | `cd demo && npm run dev` | http://localhost:3000 |

## Scope

**In scope** (the only files you should create/modify):

- `demo/src/lib/metadata.ts` (add two entries)
- `demo/src/app/terms-of-service/page.tsx` (create)
- `demo/src/app/security/page.tsx` (create)
- `demo/src/app/layout.tsx` (footer Legal links only)
- `demo/src/lib/sitemap.js` (CORE_ROUTES)
- `demo/public/sitemap.xml` (regenerated by build)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):

- The other commented footer links (Features, Integrations, Help Center, API Docs, Status) — separate decisions.
- `demo/src/app/privacy-policy/page.tsx` — reference only.
- The homepage FAQ copy in `demo/src/app/page.tsx`.
- Root `components/` and `pages/` template directories.

## Git workflow

- Branch: `advisor/002-trust-pages`.
- Commit style per `.cursor/rules/git-commit-message-format.mdc` (summary sentence, then numbered per-file list with sub-bullets).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add metadata entries

In `demo/src/lib/metadata.ts`, extend `pageMetadata` (after `privacyPolicy`, before `notFound`) with:

```ts
termsOfService: {
  title: 'Terms of Service',
  description:
    'Read the Bulma terms of service covering subscriptions, acceptable use, and your responsibilities when using our AI policy assistant.',
},
security: {
  title: 'Security',
  description:
    'Learn how Bulma protects broker and client data with encryption at rest and in transit, and strict data-sharing safeguards.',
},
```

**Verify**: `cd demo && npx tsc --noEmit` → exit 0.

### Step 2: Create the Terms of Service page

Create `demo/src/app/terms-of-service/page.tsx`, structurally identical to `demo/src/app/privacy-policy/page.tsx` (imports, metadata wiring from `pageMetadata.termsOfService`, `DocumentCentered` with `headline="Terms of Service"`, `subheadline` = "Last updated on" + today's date). Draft copy with `<h2>` sections covering, in the same generic register as the privacy page:

1. The Services — Bulma is an AI research assistant for Australian mortgage brokers; answers are for research, not credit or legal advice; users remain responsible for suitability assessments (mirror the existing disclaimer language in the homepage FAQ "Does Bulma provide credit advice?", `demo/src/app/page.tsx:144-148`).
2. Accounts and acceptable use.
3. Subscriptions and billing — paid plans billed monthly or yearly via the app; cancellation and trial terms stated generically.
4. Intellectual property.
5. Disclaimers and limitation of liability — including that policy answers are based on database snapshots, not real-time lender systems.
6. Governing law — Western Australia, Australia.
7. Contact — same block as the privacy page (`solutions@bulma.com.au`, PO Box 155, Northlands PO 6905).

Open the draft with the same kind of framing sentence the privacy page uses ("provided for informational purposes... general example only") so the two pages stay consistent until counsel reviews both.

**Verify**: `cd demo && npx tsc --noEmit` → exit 0; `npm run dev` → http://localhost:3000/terms-of-service/ renders with the document layout in light and dark mode.

### Step 3: Create the Security page

Create `demo/src/app/security/page.tsx` with the same pattern (`pageMetadata.security`, `DocumentCentered`, `headline="Security"`). Content: restate and expand ONLY the already-published claims listed in "Current state" (encryption at rest AES-256, TLS 1.3 in transit, no sharing of queries/client data with third parties, conversation history private to the user), plus process-level statements already implied by the privacy policy (third-party providers only as needed for hosting/support, lawful disclosure). End with the standard contact block inviting security questions to `solutions@bulma.com.au`.

**Verify**: `cd demo && npx tsc --noEmit` → exit 0; page renders at http://localhost:3000/security/.

### Step 4: Activate the footer links

In `demo/src/app/layout.tsx`, replace the two commented lines in the Legal category with live links:

```tsx
<FooterCategory title="Legal">
  <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
  <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
  <FooterLink href="/security">Security</FooterLink>
</FooterCategory>
```

**Verify**: `npm run dev` → footer shows all three Legal links on every page; both new links navigate correctly.

### Step 5: Update sitemap config and build

Add `'/terms-of-service/'` and `'/security/'` to `CORE_ROUTES` in `demo/src/lib/sitemap.js`, then `cd demo && npm run build`.

**Verify**: build exits 0; `grep -c "<loc>" demo/public/sitemap.xml` → 7; `grep "terms-of-service\|security" demo/public/sitemap.xml` → both URLs present exactly once each (CORE_ROUTES membership prevents the auto-discovery duplicate — confirm no doubled entries); `ls demo/out/terms-of-service/index.html demo/out/security/index.html` → both exist.

## Test plan

No test suite exists in this repo (no test runner in `demo/package.json`); gates are typecheck, lint baseline, build output checks, and the manual render checks above. Do not introduce a test framework.

## Done criteria

ALL must hold:

- [ ] `cd demo && npx tsc --noEmit` exits 0
- [ ] `cd demo && npm run lint` reports no problems beyond the 12-problem baseline
- [ ] `cd demo && npm run build` exits 0
- [ ] `demo/out/terms-of-service/index.html` and `demo/out/security/index.html` exist
- [ ] `demo/public/sitemap.xml` contains both new URLs, each exactly once (7 `<loc>` entries total)
- [ ] `grep -n "Terms of Service" demo/src/app/layout.tsx` → 1 uncommented `FooterLink`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] Branch `advisor/002-trust-pages`, not pushed; the branch description/commit body flags "legal copy drafted — requires owner review before merge"
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The footer Legal category in `layout.tsx` no longer matches the excerpt (drifted since `e308003`).
- You find yourself writing any security claim NOT in the published list (certifications like SOC 2/ISO 27001, penetration testing, data residency, uptime SLAs, backup policy). Those require owner input — never invent compliance claims.
- The owner has indicated specific pricing/trial/cancellation terms anywhere in the repo that conflict with generic billing copy — surface the conflict instead of picking one.
- `DocumentCentered` does not render the new pages correctly without modification — do not alter the shared section component.

## Maintenance notes

- The "Last updated" dates on all three legal pages are manual; whoever changes terms or security posture must bump them.
- Reviewer should scrutinize: every sentence of both drafts (this is the explicit human gate for this plan), and that the Security page makes no claim beyond what app engineering can stand behind.
- Deferred deliberately: the remaining commented footer links (Features, Integrations, Help Center, API Docs, Status) — each needs its own content decision; a future direction audit finding covers a Features page.
