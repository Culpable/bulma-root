# Agent Readiness Audit Reconciliation Plan

## 1. Goal

Explain and prevent disagreement between Bulma's live negotiated HTTP behaviour and the Is Agentic report. The user supplied an 83/100 report with failed Markdown negotiation and partial agent-friendly 404s after the Astro/Cloudflare migration, then requested `npx is-agentic bulma.com.au`, verification, and an end-to-end fix plan.

The investigation found both reported behaviours already passing. No runtime fix is justified by the available evidence. This plan preserves that implementation and strengthens regression coverage and release evidence. Completion requires correct live responses, not merely a vendor score.

This task produced a plan and evidence only. It did not change application code, deploy, change DNS, purge caches, or change security settings.

## 2. Current State Analysis

### 2.1 Verified observations

- `is-agentic@1.0.1` reports 100/100, all seven essential checks passed, eight of nine recommended checks passed, and zero partial results. The report's only failure is brand-name discoverability.
- Its underlying Ora report explicitly passes `markdown-negotiation`, `markdown-negotiation-vary`, and `agent-friendly-404`.
- The CLI retrieves a stored report. A scan request also returned `servedFromCache: true`; a request with `Cache-Control: no-store` did not force a fresh scan. The CLI exposes no force-refresh option.
- Direct live GET `/` with `Accept: text/markdown` returns 200, `Content-Type: text/markdown; charset=utf-8`, and `Vary: Accept`.
- Direct live GET `/some-path-that-does-not-exist` with the same Accept header returns 404 and a 312-byte Markdown body linking home, sitemap, llms.txt, and contact.
- The current 18-case hosted HTTP contract passes. It covers all five public Markdown documents, both cache orders, HTML and Markdown 404s, 406, HEAD, private-path denial, discovery files, and one hashed asset.
- Existing semantic/conditional verification passes: Markdown matches built content, an HTML validator does not suppress Markdown, HTML retains 304, and HEAD has no body.
- Six focused Node tests passed in `document-response.test.ts`, `negotiated-document.test.ts`, and `agent-markdown-generation.test.ts`.

The older report lacks its timestamp, response body, resolved server, and request details. An older report or earlier host is a possible explanation, not a proven root cause. Current CLI results alone are not a fresh external scan; direct live requests independently confirm the two behaviours.

### 2.2 Request flow and source owners

`site/wrangler.jsonc` sends document requests through `site/src/worker.ts`. `handleWorkersRequest()` delegates to `handleNegotiatedDocument()` in `site/src/lib/agent-readable-http/shared.ts`.

`accept.ts` selects HTML or Markdown using media specificity and quality values. Missing or wildcard-only Accept defaults to HTML. The shared handler looks up the public asset for status and redirects, then fetches the selected prebuilt Markdown from the private `/_agent-markdown/` prefix. An unknown document selects `404.md`; `markdownNotFound()` in `document-response.ts` supplies fallback recovery content if the internal asset is missing.

`headers.ts` owns `mergeVary()` and `negotiatedHeaders()`. It merges Accept into existing dimensions and removes stale body headers for transformed responses. `site/public/_headers` owns the security and asset-cache baseline. Astro prerenders the human-facing HTML; the Worker must never server-render pages.

### 2.3 Coverage gaps relevant to this report

The HTTP 404 case currently asserts the heading and contact URL, but not all four recovery links. Its `Vary` assertion uses substring matching, which can confuse an exact Accept field with another field name. The focused response tests do not directly exercise merging an existing `Accept-Encoding` dimension or all 404 fallback/HEAD paths. `verify-negotiated-content.mjs` byte-compares four public Markdown routes; the HTTP manifest covers contact separately.

These are opportunities to make failures more diagnostic. They are not evidence that current production negotiation is broken.

## 3. Desired State

- **REQ-1 MUST:** All five canonical routes `/`, `/about/`, `/pricing/`, `/contact/`, and `/privacy-policy/` return direct 200 HTML or Markdown according to Accept. Markdown has `text/markdown; charset=utf-8`.
- **REQ-2 MUST:** Every negotiated document response has an exact case-insensitive `Accept` member in Vary and preserves existing members, including `Accept-Encoding` when present. Do not require a fixed textual order.
- **REQ-3 MUST:** Unknown document paths return 404. Their Markdown bodies contain named absolute links to home, `/sitemap.xml`, `/llms.txt`, and `/contact/`. HTML 404 design stays unchanged.
- **REQ-4 MUST:** Preserve q-values, explicit exclusions, HTML-first defaults, 406, GET/HEAD equivalence, conditional responses, redirect behaviour, and HTML/Markdown cache isolation.
- **REQ-5 MUST:** Keep robots, sitemap, llms.txt and fixed assets in their own media types; keep private Markdown URLs blocked; keep public production routes indexable and preview/404 indexing policies unchanged.
- **REQ-6 MUST NOT:** Change UI, animation, product copy, contact fields, pricing, DNS, bot policy, or metadata to improve a vendor score without a reproduced requirement.
- **REQ-7 MUST:** Any actual behaviour change requires an independently reproduced failing test before the smallest fix, then the same passing test and full project validation.

## 4. Additional Context

### 4.1 Scope and constraints

The migration already deployed the required negotiation and recovery features. The current user request is to verify and outline a plan, not execute a new production change. The quoted priorities apply if failures recur: repair failed negotiation first, then partial 404 recovery. Previously accepted Browser Integrity Check and early rejection-header deferrals are separate; this audit did not implicate them.

Read root `AGENTS.md`, `documents/AGENTS/code-standards.md`, `documents/AGENTS/agent-readiness.md`, `documents/AGENTS/testing.md`, and the current-state section of `documents/guides/_hosting.md` before implementation. Preserve unrelated edits and use the existing local checkout. Do not create branches or worktrees without user instruction.

### 4.2 Decision record

#### D-1: Preserve the passing runtime

- **Context:** The supplied failures do not reproduce in the CLI report or direct live requests.
- **Options:** (a) retain runtime behaviour and strengthen regression evidence; (b) rewrite negotiation or add a second Markdown mechanism.
- **Decision:** (a), plan writer recommendation based on reproduced results.
- **Why:** Existing code already supplies both required contracts; additional runtime mechanisms add risk without a demonstrated benefit.
- **Why not (b):** It duplicates the representation owner and can change existing browser behaviour.
- **Reconsider when:** A captured current request produces the reported failure against the active release.

#### D-2: Separate audit freshness from HTTP correctness

- **Context:** CLI and scan endpoints return cached evidence; the old report cannot be tied to a release.
- **Options:** (a) record report identity and verify live HTTP independently; (b) treat a score as proof of the deployed contract.
- **Decision:** (a), plan writer recommendation.
- **Why:** Direct requests prove current status, media type, body and Vary. Report timestamps explain the scope of vendor evidence.
- **Why not (b):** Cached reports can describe a different state, and bonus points can offset a remaining warning.
- **Reconsider when:** The vendor exposes a verifiable uncached scan tied to the inspected release; retain direct HTTP checks regardless.

#### D-3: Keep brand discoverability separate

- **Context:** The sole current warning concerns search results for the name Bulma.
- **Options:** (a) report it as a separate search/product issue; (b) modify brand identity or create listings within this HTTP task.
- **Decision:** (a), plan writer, following the requested technical scope.
- **Why:** Negotiation headers cannot establish brand ranking. Search Console evidence and approved public identity decisions are needed for targeted follow-up.
- **Why not (b):** It changes product positioning or external accounts without resolving either supplied HTTP finding.
- **Reconsider when:** The user requests search discoverability work and supplies the necessary access or approved identity details.

## 5. Implementation Plan

### Step 1: Establish the exact failing or passing release

**Objective:** Prevent work against an unidentified or cached result (D-2).

Use the saved evidence in section 6.1. Run the exact requested CLI and record package version, report scan time, score, issue IDs, and cache metadata. Run the repository HTTP verifier against the exact canonical origin. Record local HEAD and active Worker version through read-only deployment inspection when available.

**Success Criteria:**

- The two supplied issue IDs have explicit current pass/fail evidence from the report and direct HTTP requests.
- A repeated old report is labelled historical or of unknown freshness, not presented as a reproduced production defect.
- If a failure appears, preserve its complete request, redirect chain, status, headers, body, edge identifier and release before edits. Assign independent reproduction as required by AGENTS.md.

### Step 2: Strengthen negotiation regression checks

**Objective:** Cover the reported missing-Accept failure precisely, without changing the passing runtime (D-1).

Extend `site/test/document-response.test.ts` and `site/test/negotiated-document.test.ts`. Add a focused `site/test/accept.test.ts` if the selector matrix lacks direct coverage. Update `site/test/http-contract.json` to assert exact Vary tokens with the verifier's existing `matches` support, rather than adding a new assertion framework. Include contact in the existing byte comparison loop in `site/scripts/verify-negotiated-content.mjs`.

**Success Criteria:**

- Node tests prove Vary preserves `Accept-Encoding`, adds Accept once regardless of case, and retains wildcard Vary semantics in the generic merge helper.
- Hosted document assertions reject `Vary: Accept-Encoding` alone and accept either ordering of `Accept, Accept-Encoding`; these routes must explicitly include Accept.
- Selector tests cover missing Accept, wildcard-only Accept, explicit Markdown, q-value preference, q=0 exclusions, and 406 when both offers are excluded.
- All five public Markdown bodies match their generated files. HEAD is bodyless and keeps GET-equivalent status and representation headers.
- No runtime source change occurs unless an independent failing reproduction requires it. Any such fix remains within the existing negotiation owner and follows fail/fix/pass verification.

### Step 3: Strengthen 404 recovery assertions

**Objective:** Preserve real 404 status and prove all recovery links.

Extend the unknown-Markdown entry in `site/test/http-contract.json` and add request-handler coverage in `site/test/negotiated-document.test.ts`. Test both an available generated 404 asset and the missing-internal-asset fallback. Use the captured unknown path from section 6.1 directly in hosted regression checks.

**Success Criteria:**

- Both unknown-path GET branches return status 404 and `text/markdown; charset=utf-8`, with exact Accept in Vary.
- Both bodies contain named absolute home, sitemap, llms and contact links; no generic 200 app shell is accepted.
- Unknown-path HEAD retains the GET status/content type/Vary with an empty body.
- HTML unknown paths retain byte-identical `site/dist/404.html`, status 404, and the existing visual recovery link. Private internal URLs remain blocked.

### Step 4: Run the complete local and hosted validation

**Objective:** Verify the contract through the actual Worker and every public document/discovery endpoint.

Run `corepack pnpm --dir /Users/sacino/bulma-root/site check`, then `build`, then `test`. Start the task-owned local Worker with `corepack pnpm --dir /Users/sacino/bulma-root/site worker:dev`; when Wrangler reports `http://127.0.0.1:8787`, run `node /Users/sacino/bulma-root/site/scripts/run-http-contract.mjs http://127.0.0.1:8787`. If the reported URL differs, use that exact URL instead. Stop only task-owned servers afterwards.

For an authorised future release, commit only scoped changes, push only with explicit authority, wait for all triggered checks and Workers Builds, and verify the active release matches the intended commit. A tests-only change may trigger the existing site path filter. Do not change code merely to force a deployment. Repeat the HTTP and semantic verifiers against `https://bulma.com.au` after deployment.

**Success Criteria:**

- Check, build, full test suite, local Worker HTTP contract and hosted contract pass. Report intended viewport skips separately from failures.
- All five public routes pass HTML/Markdown GET and HEAD checks; robots, sitemap and llms keep their original media types and canonical contents; representative fixed assets remain unchanged.
- Both cache orders, q-values, 406, conditional validators, unknown paths, internal paths and www redirects pass. No production form submissions or analytics events are sent.
- Public HTML has no noindex and matches the build. Run browser verification at 1440x900 and 390x900 under light colour-scheme emulation if any runtime/HTML behaviour changes; otherwise record that this was test-only work with no UI change.
- Rerun `npx is-agentic bulma.com.au` and preserve the scan time. If the service still returns cached evidence, label freshness unavailable while reporting live HTTP independently; do not invent a force-refresh option.

### Step 5: Synchronise operating documentation and handoff

**Objective:** Make future release diagnosis reproducible without conversation history.

Update the current verification guidance in `documents/guides/_hosting.md` and `documents/AGENTS/testing.md` only where the final checks add behaviour or requirements. Record vendor cache limitations and the distinction between a 100 score and all checks passing. Keep evidence beside the existing recheck artefacts and update this plan's status as implementation progresses.

**Success Criteria:**

- Documentation identifies the exact scripts and commands for all-route negotiation, recovery, and report freshness checks.
- The final scoped diff contains only necessary tests/verifier/docs changes, unless a reproduced runtime defect justified more.
- The handoff lists changes, actual checks, skipped/unavailable proof, release identity if deployed, and brand discoverability as a separate recommendation (D-3).

## 6. Testing Plan

### 6.1 Source-of-truth regression artefacts

All paths below are relative to `documents/guides/parity/agent-readiness-recheck/`:

- `cli.log` and `report.json`: exact current CLI output and API response, including score and scan time. Reuse their issue IDs to compare later reports; do not assume 100 means every recommended check passed.
- `scan-response.sse`: underlying Ora result and cache metadata. It directly proves all three relevant checks pass in the available report; it does not establish the older report's cause.
- `audit-methodology.md`: captured vendor scoring/caching explanation. Vendor scoring is separate from protocol correctness.
- `home-markdown.headers`: direct live 200 Markdown with Vary Accept. The corresponding body must continue to match `site/dist/_agent-markdown/index.md`.
- `not-found-markdown.headers` and `not-found.md`: original live request `/some-path-that-does-not-exist`, including status 404 and all four recovery links. Reuse this exact request alongside synthetic unit cases.
- `negotiated-content.json`: existing semantic, conditional, redirect and HEAD verification result.

The user's older 83/100 text is preserved in this plan's goal/current-state description. Its original report ID, scan time and raw response are unavailable. Never manufacture a failing fixture and claim it reproduces that report. Synthetic handler inputs supplement the real requests because CI should not depend on a mutable vendor service or production network.

### 6.2 Unit and integration coverage

| Location / framework | Scenario and expected result | Command |
| --- | --- | --- |
| `site/test/document-response.test.ts`, Node test | Merge existing Vary members; Markdown transforms remove stale body headers; HTML remains unchanged | `node --experimental-strip-types --test /Users/sacino/bulma-root/site/test/document-response.test.ts` |
| `site/test/accept.test.ts`, Node test | Specificity, quality exclusions, HTML-first default and unsupported media selection match REQ-4 | `node --experimental-strip-types --test /Users/sacino/bulma-root/site/test/accept.test.ts` |
| `site/test/negotiated-document.test.ts`, Node test | Current validator tests plus available/missing 404 assets and HEAD produce the specified status, body and headers | `node --experimental-strip-types --test /Users/sacino/bulma-root/site/test/negotiated-document.test.ts` |
| `site/test/http-contract.json`, existing HTTP verifier | Exact Vary token assertions, all four recovery links, every document and discovery file pass against Wrangler and live origin; use captured unknown-path input | `node /Users/sacino/bulma-root/site/scripts/run-http-contract.mjs https://bulma.com.au` |
| `site/scripts/verify-negotiated-content.mjs`, Node assertions | All five Markdown bodies match generated output; HTML 304 does not suppress Markdown; redirect and HEAD remain correct | `node /Users/sacino/bulma-root/site/scripts/verify-negotiated-content.mjs https://bulma.com.au` |
| `site/test/agent-readiness.spec.ts` and existing Playwright suites | Preserve human routes, accessibility and dark-only design if runtime output changes | `corepack pnpm --dir /Users/sacino/bulma-root/site test` |

No full rebuild or browser suite was run during this planning-only investigation. The six focused tests and live HTTP/semantic verifiers passed against the existing build. Full gates above apply when the plan is implemented.

### 6.3 Published contracts and external follow-up

Use [Accept Markdown's published checks](https://acceptmarkdown.com/) and [its protocol references](https://acceptmarkdown.com/reference): RFC 9110 Accept/Vary/406 semantics and RFC 7763 text/markdown registration. Preserve existing Vary dimensions rather than replacing the complete header with a fixed value.

Current public audit: [Bulma Is Agentic report](https://is-agentic.com/scan/bulma.com.au). Its brand-name warning does not establish that the site is unindexed. A separate authorised search task should inspect Search Console URL indexing and search queries before proposing identity, listing, or content changes. No new credentials are required for the HTTP regression work.
