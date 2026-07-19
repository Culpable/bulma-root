# Bulma Marketing Runtime and Browser Rules Plan

> **Implemented status (verified 2026-07-19):** Implemented and ready to archive from documents/todo. Evidence: `.nvmrc`, `demo/package.json`, `.github/workflows/deploy.yml`, `.cursor/rules/dev-browser.mdc`, and `demo/test/runtime-and-browser-rules.test.mjs` (3 passing runtime/browser contract tests).

<critical_warning>
> **CRITICAL WARNING:** Preserve the pre-existing newline-only `demo/public/sitemap.xml` change and exclude it from the scoped commit unless the deterministic build produces a separate necessary sitemap content change.
</critical_warning>

<important_note>
> **IMPORTANT NOTE:** Work directly on `main`, create exactly one scoped Conventional Commit, and do not amend, rebase, push, force-push, expose credentials, or make destructive external changes.
</important_note>

## 1. Goal

Align the Bulma marketing repository with a supported Node LTS runtime and deterministic browser-verification rules. Pin Node 22.23.1 across local development, package metadata, CI, and setup documentation; document that Next.js 16.1.5 supports Node `>=20.9.0`; retain the existing Tailwind dependency because the reproduced `module.register()` warning is absent under the pinned LTS runtime; and update the dev-browser rule to handle canonical trailing slashes and viewport-dependent content evidence. Completion requires runtime regression coverage, lint/build success, and live desktop/mobile checks for the homepage, yearly pricing, free-trial FAQ, and `/#lenders`.

---

## 2. Current State Analysis

### 2.1 Current Implementation Overview

- `demo/package.json` uses Next.js 16.1.5 but declares no Node engine.
- The repository has no `.nvmrc` or equivalent runtime pin.
- `.github/workflows/deploy.yml` uses the floating Node 20 major, while `github-pages-setup.md` mixes a Node 18+ prerequisite with a Node 20.18.3 workflow example.
- `demo/next.config.ts` uses `output: 'export'` and `trailingSlash: true`, so exported routes such as `/pricing` settle at `/pricing/`.
- `.cursor/rules/dev-browser.mdc` does not describe canonical-path URL waits or targeted evidence for IntersectionObserver, content-visibility, and sticky states.

### 2.2 Reproduced Failures

- `NODE_OPTIONS=--trace-deprecation npm run build` under Node 26.4.0 emits `[DEP0205] DeprecationWarning: module.register() is deprecated` from `demo/node_modules/@tailwindcss/node/dist/index.js`, installed through `@tailwindcss/postcss@4.1.18`.
- The same traced build under Node 22.23.1 completes without the warning.
- Next.js 16.1.5 package metadata declares `engines.node` as `>=20.9.0`; Node 22.23.1 is therefore supported and is an installed LTS runtime in the development environment.
- The static export writes `demo/out/pricing/index.html`, proving `/pricing/` is the canonical exported path.
- `demo/src/hooks/use-scroll-animation.ts` changes visible state only after IntersectionObserver reports intersection, and `demo/src/hooks/use-sticky-section.ts` derives sticky state from live viewport rectangles after scrolling. A full-page screenshot alone does not prove either state.

### 2.3 Root Cause

Runtime selection is ambiguous because package metadata, CI, setup documentation, and local version-manager configuration do not share a pinned version. Node 26 exposes a deprecation in the installed Tailwind loader that is not emitted on Node 22.23.1 LTS. Separately, the browser rule assumes requested and final URL paths are identical and does not account for state that activates only when content enters the live viewport.

### 2.4 Technical Constraints

- Preserve all unrelated changes, especially `demo/public/sitemap.xml`, unstaged.
- Update no application UI or animation implementation because reproduction identifies testing/runtime configuration defects rather than product defects.
- Do not update Tailwind solely for Node 26 compatibility when the supported pinned runtime removes the warning; document the ownership and workaround instead.
- Run Next.js commands only from `demo/` and use `http://localhost:3001` for browser validation unless occupied.

---

## 3. Desired State

### 3.1 Requirements

- **REQ-1 (MUST):** `.nvmrc`, `demo/package.json`, `.github/workflows/deploy.yml`, README setup, and GitHub Pages setup documentation must consistently select Node 22.23.1 or an engine range bounded to that Node 22 baseline.
- **REQ-2 (MUST):** Runtime regression tests must assert the pin, engine, CI, documentation, Next.js minimum, and browser-rule contracts.
- **REQ-3 (MUST):** `.cursor/rules/dev-browser.mdc` must accept canonical trailing-slash equivalents when waiting for URLs.
- **REQ-4 (MUST):** The browser rule must require scrolling IntersectionObserver, content-visibility, and sticky targets into view, waiting for state/layout settlement, and capturing viewport or element evidence.
- **REQ-5 (MUST):** Lint and build must pass under Node 22.23.1 without `DEP0205`.
- **REQ-6 (MUST):** Browser verification must cover the homepage, yearly pricing, free-trial FAQ, and `/#lenders` at the requested desktop/mobile viewports with no console, page, request, HTTP, image, or overflow errors.
- **REQ-7 (MUST NOT):** The commit must not contain the pre-existing sitemap newline change or any unrelated work.

### 3.2 Defaults and Fallbacks

- **Runtime default:** Node 22.23.1 LTS through `.nvmrc` and CI.
- **Package fallback:** `engines.node` rejects versions below 22.23.1 and future Node majors until separately validated.
- **Warning fallback:** Keep `@tailwindcss/postcss` and `tailwindcss` at the existing compatible lockfile versions; record Node 26 as outside the repository runtime contract.
- **URL comparison:** Compare requested and final paths after normalising an optional trailing slash, while retaining query strings and hashes required by the scenario.

---

## 4. Additional Context

The delegated remediation source is `/Users/sacino/documents/todo/dev_browser_issue_remediation_threads_plan.md`, specifically section 2.6 and Step 6. Source-of-truth browser artefacts are `/Users/sacino/.dev-browser/tmp/dev-browser-cross-app/bulma-root/07-pricing-mobile-faq-open.png` and `/Users/sacino/.dev-browser/tmp/dev-browser-cross-app/bulma-root/08-home-mobile-lenders-hash.png`. The existing sitemap modification is a final-newline-only delta that predates this task.

---

## 5. Implementation Plan

### ~~Step 1: Pin and document the supported runtime~~ ✅ **COMPLETED**

**Objective:** Make local development, package installation, CI, and setup instructions select the same supported Node LTS runtime.

**Files:** `.nvmrc`, `demo/package.json`, `demo/package-lock.json`, `.github/workflows/deploy.yml`, `README.md`, `github-pages-setup.md`.

**Success Criteria:**

- `.nvmrc` contains exactly `22.23.1`.
- `demo/package.json` and the root package entry in `demo/package-lock.json` declare `node: >=22.23.1 <23`.
- `.github/workflows/deploy.yml` selects Node 22.23.1.
- README and GitHub Pages setup instructions state Node 22.23.1 LTS and Next.js 16.1.5's `>=20.9.0` upstream minimum.
- Documentation identifies `@tailwindcss/node@4.1.18` as the Node 26 warning owner and states that Node 22.23.1 produces no warning.

### ~~Step 2: Make browser verification deterministic~~ ✅ **COMPLETED**

**Objective:** Align URL waits and screenshot evidence with the static export and viewport-driven UI state.

**File:** `.cursor/rules/dev-browser.mdc`.

**Success Criteria:**

- The rule explicitly accepts `/pricing` and `/pricing/` as canonical equivalents for URL-wait path comparison.
- The rule preserves query strings and hashes when they are part of a test assertion.
- The rule requires scrolling observer, content-visibility, and sticky targets into the viewport, waiting for layout and animation state to settle, and capturing a viewport or element screenshot.
- The rule requires returning to the intended starting position before a later full-page screenshot so fixed and sticky elements composite correctly.

### ~~Step 3: Add focused regression tests~~ ✅ **COMPLETED**

**Objective:** Prevent runtime metadata and browser-rule guidance from drifting apart.

**Files:** `demo/test/runtime-and-browser-rules.test.mjs`, `demo/package.json`.

**Success Criteria:**

- `npm test` uses Node's built-in test runner and passes under Node 22.23.1.
- Tests fail if `.nvmrc`, package engines, CI runtime, or documentation runtime values diverge.
- Tests verify Next.js 16.1.5's installed engine minimum remains `>=20.9.0`.
- Tests fail if trailing-slash equivalence or targeted viewport/element evidence requirements are removed from the browser rule.

### ~~Step 4: Validate runtime, export, and browser scenarios~~ ✅ **COMPLETED**

**Objective:** Prove the repository works under the selected runtime and that required static/browser behaviours remain intact.

**Success Criteria:**

- `npm test`, `npm run lint`, and `NODE_OPTIONS=--trace-deprecation npm run build` pass from `demo/` under Node 22.23.1 with zero `DEP0205` output.
- The build retains `demo/out/pricing/index.html` and the homepage lender hash target.
- At `1440x900`, homepage dynamic/sticky sections are scrolled into view and captured with targeted evidence; no console, page, request, HTTP, image, or horizontal-overflow errors occur.
- At `390x900`, yearly pricing, the free-trial FAQ, and direct `/#lenders` navigation are verified with targeted evidence and no listed errors.
- `demo/public/sitemap.xml` remains unstaged and contains only its pre-existing newline-only delta.

### ~~Step 5: Record the implemented solution and commit once~~ ✅ **COMPLETED**

**Objective:** Complete the plan record and create one reviewable scoped commit on `main`.

**Success Criteria:**

- This plan contains an appended `Implemented Solution` section listing exact files, behaviour changes, and validation outcomes.
- `git diff --cached --name-only` contains only scoped runtime, rule, plan, test, and documentation files.
- Exactly one new Conventional Commit is created, and `demo/public/sitemap.xml` remains unstaged.

---

## 6. Testing Plan

- **Runtime/rule regression:** `demo/test/runtime-and-browser-rules.test.mjs`, Node built-in test runner, run with `cd demo && npm test`; validates runtime metadata and browser-rule text contracts.
- **Lint:** run `cd demo && npm run lint` under Node 22.23.1; must exit 0 with zero errors.
- **Production export:** run `cd demo && NODE_OPTIONS=--trace-deprecation npm run build` under Node 22.23.1; must exit 0, contain no `DEP0205`, and produce `out/pricing/index.html`.
- **Desktop browser:** use dev-browser at `1440x900` on `/`; scroll dynamic/sticky sections into view, wait for settlement, capture targeted evidence, and assert no console/page/request/HTTP/image/overflow failures.
- **Mobile browser:** use dev-browser at `390x900`; select Yearly on `/pricing/`, open the free-trial FAQ, and load `/#lenders`, asserting the expected state and the same error/overflow conditions.
- **Source-of-truth artefacts:** compare the mobile pricing FAQ and lender-hash outcomes with `/Users/sacino/.dev-browser/tmp/dev-browser-cross-app/bulma-root/07-pricing-mobile-faq-open.png` and `/Users/sacino/.dev-browser/tmp/dev-browser-cross-app/bulma-root/08-home-mobile-lenders-hash.png`.
- **Git scope:** inspect `git status --short`, `git diff --cached`, and the resulting commit; ensure `demo/public/sitemap.xml` is not staged.

---

## 7. Implemented Solution

### Files Changed

- `.nvmrc`: pinned local version-manager selection to Node 22.23.1 LTS.
- `demo/package.json` and `demo/package-lock.json`: added the `>=22.23.1 <23` engine contract and the Node built-in regression-test command.
- `.github/workflows/deploy.yml`: aligned GitHub Pages builds with Node 22.23.1.
- `README.md` and `github-pages-setup.md`: aligned runtime setup, recorded Next.js 16.1.5's `>=20.9.0` upstream minimum, and documented the Node 26 warning trace and pinned-runtime result.
- `.cursor/rules/dev-browser.mdc`: added canonical trailing-slash URL comparison and targeted evidence requirements for IntersectionObserver, content-visibility, scroll-reveal, and sticky states.
- `demo/test/runtime-and-browser-rules.test.mjs`: added three Node tests covering runtime pin consistency, Next/warning documentation, and browser-rule contracts.
- `documents/todo/bulma_marketing_runtime_browser_rules_plan.md`: recorded the reproduction, implementation contract, execution status, and validation evidence.

### Key Decisions and Behaviour

- Selected Node 22.23.1 LTS because Next.js 16.1.5 supports Node `>=20.9.0`, the version is available in the repository environment, and traced builds complete without the Node 26 `DEP0205` warning.
- Kept `@tailwindcss/postcss`, `@tailwindcss/node`, and `tailwindcss` unchanged. The reproduced warning belongs to `@tailwindcss/node@4.1.18` under Node 26.4.0 but does not occur under the repository's supported pinned runtime; avoiding a coordinated Tailwind upgrade keeps this task scoped to runtime and verification alignment.
- Browser URL waits now treat `/pricing` and `/pricing/` as equivalent canonical paths while preserving scenario-specific query-string and hash assertions.
- Viewport-driven states now require scrolling the target into view, waiting for settlement, and recording viewport or element evidence; later full-page captures must reset scroll position first.
- Architecture-documentation sync found no affected documented subsystem: animation and demo-video implementations were not changed, so `documents/guides/_animations.md` and `documents/guides/_demo-video.md` required no update.

### Validation Results

- Reproduction: Node 26.4.0 traced build emitted `DEP0205` from `@tailwindcss/node@4.1.18`; Node 22.23.1 traced build emitted no deprecation warning.
- `cd demo && npm test` under Node 22.23.1: passed 3 tests, 0 failures.
- `cd demo && npm run lint` under Node 22.23.1: passed with 0 errors and 0 warnings after converting the test to an ES module.
- `cd demo && NODE_OPTIONS=--trace-deprecation npm run build` under Node 22.23.1: passed; Next.js compiled, type-checked, generated 8/8 pages, generated 5 sitemap URLs, emitted no `DEP0205`, and produced `demo/out/pricing/index.html`.
- Dev-browser desktop `1440x900`: verified homepage targeted scrolled content, yearly pricing selection, expanded free-trial FAQ, and direct `/#lenders`; zero console, page, request, HTTP, broken-image, or horizontal-overflow failures.
- Dev-browser mobile `390x900`: verified canonical `/pricing/`, yearly pricing with `$490/year`, expanded 14-day free-trial answer, and direct `/#lenders`; zero console, page, request, HTTP, broken-image, or horizontal-overflow failures.
- Screenshots: `/Users/sacino/.dev-browser/tmp/bulma-runtime/home-desktop-targeted.png`, `/Users/sacino/.dev-browser/tmp/bulma-runtime/pricing-desktop-yearly.png`, `/Users/sacino/.dev-browser/tmp/bulma-runtime/pricing-desktop-free-trial-answer.png`, `/Users/sacino/.dev-browser/tmp/bulma-runtime/home-desktop-lenders-hash.png`, `/Users/sacino/.dev-browser/tmp/bulma-runtime/pricing-mobile-yearly.png`, `/Users/sacino/.dev-browser/tmp/bulma-runtime/pricing-mobile-yearly-faq.png`, and `/Users/sacino/.dev-browser/tmp/bulma-runtime/home-mobile-lenders-hash.png`.
- `demo/public/sitemap.xml` remains an unstaged pre-existing final-newline-only change; deterministic build timestamp rewrites were removed.
