# Plan 001: Render the Remotion demo video and embed it on the homepage

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat e308003..HEAD -- video/bulma-demo demo/src/app/page.tsx demo/src/lib/analytics.js demo/src/components/elements demo/public documents/guides/_demo-video.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (publishing new marketing content; page-weight risk if the video is too large)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `e308003`, 2026-06-12

## Why this matters

This repo is the marketing site for Bulma (an AI policy assistant for Australian mortgage brokers, app at https://app.bulma.com.au). The homepage hero CTA says "See it in action" and the closing CTA says "Book a demo" — both link to `/contact`, which is a plain enquiry form with no demo of any kind. Meanwhile a complete 30-second Remotion demo video project exists at `video/bulma-demo/` (5 scenes + transitions, documented in `documents/guides/_demo-video.md`), but it has never been rendered (no `out/` directory exists) and no `<video>` element or mp4/webm asset exists anywhere in `demo/src`. The analytics layer even ships a `trackVideoPlay` helper that is never called. This plan finishes that abandoned thread: render the video, embed it in a new homepage section, point the "See it in action" CTA at it, and wire the existing analytics helper.

This is a **ship-on-a-branch plan**: the final video content and placement are marketing decisions, so everything lands on a branch for the owner to review before merge. Do not merge or push to `main`.

## Current state

Repo facts:

- Only runnable app: `demo/` (Next.js 16, React 19, Tailwind v4, static export to `demo/out` for GitHub Pages at bulma.com.au). All site commands run from `demo/`.
- Video project: `video/bulma-demo/` (Remotion 4.x, its own `package.json` and `node_modules`).
- The site is a **static export** (`demo/next.config.ts` → `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`), so the video must be self-hosted as a static file under `demo/public/`.

Relevant files:

- `video/bulma-demo/package.json` — render scripts:

  ```json
  "scripts": {
    "start": "npx remotion studio",
    "build": "npx remotion render BulmaDemoVideo out/bulma-demo.mp4",
    "upgrade": "npx remotion upgrade"
  }
  ```

- `video/bulma-demo/src/Root.tsx` — composition `BulmaDemoVideo`: 1920x1080, 30fps, total duration 30s (scenes 4+6+10+8+4s minus 4×0.5s transition overlaps). Five scene compositions also registered under a "Scenes" folder: `IntroScene`, `ProblemScene`, `SolutionScene`, `FeaturesScene`, `OutroScene`.
- `video/bulma-demo/src/scenes/*.tsx` — scenes are pure React/CSS; verified at planning time that **no scene references `staticFile()`, `<Img>`, `<Video>`, or `<Audio>`** (the project `public/` dir is empty), so rendering requires no external assets.
- `documents/guides/_demo-video.md` — system doc for the video project; documents `npx remotion still BulmaDemoVideo out/thumbnail.png --frame=0` for stills and custom render flags.
- `demo/src/app/page.tsx` — homepage. Hero CTA at lines 218–222:

  ```tsx
  <MagneticWrapper>
    <PlainButtonLink href="/contact" size="lg" className="group">
      See it in action <AnimatedArrowIcon className="-mr-1 ml-1.5" />
    </PlainButtonLink>
  </MagneticWrapper>
  ```

  Section order in the page: Hero (`id="hero"`) → Features (`id="features"`) → Stats (`id="stats"`) → Testimonials (`id="testimonial"`) → FAQs (`id="faqs"`) → Pricing (`id="pricing"`) → CTA (`id="call-to-action"`). Each section sets `sectionHue` and a `content-visibility-*` class; dynamic imports for decorative animation components are declared at lines 41–54 using `next/dynamic`.

- `demo/src/lib/analytics.js:57-67` — unused helper to wire up:

  ```js
  trackVideoPlay: (videoId, properties = {}) => {
    if (isDevelopment) {
      return
    }
    if (typeof window !== 'undefined') {
      mixpanel.track('Video Play', {
        video_id: videoId,
        ...properties,
      })
    }
  },
  ```

  Analytics are disabled in development (`isDevelopment` guard), so dev-server testing verifies wiring by code inspection, not by observing network calls.

- `demo/src/app/contact/contact-page-content.tsx` — exemplar `'use client'` component using the repo's `useScrollAnimation` hook (`demo/src/hooks/use-scroll-animation.ts`) for entrance animations. Match this pattern for any new client component.

Repo conventions that apply:

- Comments in imperative mood, thorough ("Render…", "Track…"). Two blank lines between top-level functions.
- **Animation standard (from AGENTS.md, mandatory): NEVER add `prefers-reduced-motion` checks or accessibility media-query conditionals to animation code.**
- New elements live in `demo/src/components/elements/`, sections in `demo/src/components/sections/`.
- Page metadata comes from `demo/src/lib/metadata.ts`; this plan does not change metadata (no new route).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Render video | `cd video/bulma-demo && npm run build` | exit 0; `out/bulma-demo.mp4` exists |
| Render poster | `cd video/bulma-demo && npx remotion still BulmaDemoVideo out/poster.png --frame=150` | exit 0; `out/poster.png` exists |
| Typecheck site | `cd demo && npx tsc --noEmit` | exit 0 (verified clean at `e308003`) |
| Lint site | `cd demo && npm run lint` | **baseline at `e308003` is 12 problems (11 errors, 1 warning)** — gate is "no NEW problems", not exit 0 |
| Build site | `cd demo && npm run build` | exit 0; static export in `demo/out`; note this regenerates `demo/public/sitemap.xml` (tracked) with fresh `lastmod` timestamps — do NOT commit sitemap.xml churn for this plan (no routes change) |
| Dev server | `cd demo && npm run dev` | http://localhost:3000 |

If `video/bulma-demo/node_modules` is missing, run `npm install` inside `video/bulma-demo/` only (never in the repo root — there is no root package.json).

## Suggested executor toolkit

- Read `documents/guides/_demo-video.md` before Step 1 and `documents/guides/_animations.md` before Step 3 (section conventions, scroll animation hook usage).
- If a browser-automation skill (`dev-browser` / `agent-browser` / `verify`) is available, use it in Step 5 to screenshot the new section in light and dark mode.

## Scope

**In scope** (the only files you should create/modify):

- `video/bulma-demo/out/` (render artifacts — NOT committed; copy outputs out, leave `out/` untracked)
- `demo/public/video/bulma-demo.mp4` (create)
- `demo/public/video/bulma-demo-poster.webp` (create)
- `demo/src/components/elements/demo-video.tsx` (create)
- `demo/src/app/page.tsx` (add section + change one CTA href)
- `documents/guides/_demo-video.md` (doc sync: add "Published render" section)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch, even though they look related):

- Scene content/copy in `video/bulma-demo/src/` — the video ships as designed; copy changes are the owner's call.
- `demo/src/app/contact/*` — "Book a demo" continues to point at /contact.
- `demo/src/lib/analytics.js` — use the existing helper as-is.
- `demo/src/lib/sitemap.js` and `demo/src/scripts/generate-sitemap.js` — no new routes.
- Root `components/` and `pages/` template directories.

## Git workflow

- Branch: `advisor/001-demo-video` (do not commit to `main`; branch off current HEAD).
- Commit style per `.cursor/rules/git-commit-message-format.mdc`: first line is a plain-English summary sentence, then a numbered list of files with sub-bullets describing each change.
- Do NOT push or open a PR unless the operator instructed it.
- Git LFS is NOT an option: GitHub Pages does not serve LFS files. The mp4 must be committed raw, which is why the size gate below is strict.

## Steps

### Step 1: Render the video and poster

```bash
cd video/bulma-demo
npm run build
npx remotion still BulmaDemoVideo out/poster.png --frame=150
```

Frame 150 (~5s in) lands in the Problem scene; if it renders as a transition blur, try frames in the 360–600 range (Solution scene) and pick a visually representative still.

**Verify**: `ls -lh video/bulma-demo/out/` → `bulma-demo.mp4` and `poster.png` exist; note the mp4 size.

### Step 2: Compress to a web-shippable size

Target **≤ 10 MB**, hard gate **≤ 15 MB**. If the default render exceeds the target and `ffmpeg` is available:

```bash
ffmpeg -i out/bulma-demo.mp4 -c:v libx264 -crf 28 -preset slow -movflags +faststart -an out/bulma-demo-web.mp4
```

(`-an` drops the audio track — the composition has no audio. `+faststart` enables progressive playback.) If still over 15 MB, re-render at 720p via `npx remotion render BulmaDemoVideo out/bulma-demo-720.mp4 --scale=0.6667` and compress that. Convert the poster to webp (e.g. `cwebp out/poster.png -q 82 -o out/poster.webp`, or `ffmpeg -i out/poster.png -q:v 80 out/poster.webp`).

**Verify**: `ls -lh` → final mp4 ≤ 15 MB (ideally ≤ 10 MB); poster webp ≤ 150 KB. Play the mp4 locally (e.g. `open out/bulma-demo-web.mp4`) and confirm it plays end to end without corruption.

### Step 3: Copy assets and create the DemoVideo element

```bash
mkdir -p demo/public/video
cp video/bulma-demo/out/bulma-demo-web.mp4 demo/public/video/bulma-demo.mp4
cp video/bulma-demo/out/poster.webp demo/public/video/bulma-demo-poster.webp
```

Create `demo/src/components/elements/demo-video.tsx` as a `'use client'` component:

- Renders `<video>` with: `src="/video/bulma-demo.mp4"`, `poster="/video/bulma-demo-poster.webp"`, `controls`, `playsInline`, `preload="none"` (critical — never preload a multi-MB file), `width={1920} height={1080}`, rounded corners consistent with the `Screenshot` element styling (see `demo/src/components/elements/screenshot.tsx` for the frame treatment used on app screenshots — wrap or mimic it so the video visually matches the screenshots).
- On the **first** `play` event only (use a ref flag), call `analytics.trackVideoPlay('bulma-demo-30s', { location: 'home_demo_section' })` — import `analytics` from `@/lib/analytics` exactly as `demo/src/app/contact/contact-form.tsx:5` does.
- Comment the component thoroughly in imperative mood. Do NOT add `prefers-reduced-motion` or similar gating.

**Verify**: `cd demo && npx tsc --noEmit` → exit 0.

### Step 4: Add the homepage section and repoint the CTA

In `demo/src/app/page.tsx`:

1. Add a new section with `id="demo-video"` **between the Features section (ends line ~401) and the Stats section (starts line ~403)**. Use the same structural conventions as neighbouring sections (eyebrow such as "See it in action", headline, `sectionHue`, short subheadline). Prefer composing existing primitives (`Section`/`Container`/`Heading` from `demo/src/components/elements/`, or an existing section component that accepts arbitrary demo content such as `features-with-large-demo.tsx`) over inventing a new section component. Import `DemoVideo` via the same `next/dynamic` pattern used for the decorative animation components at lines 41–54 (it is below the fold and client-only).
2. Change the hero CTA at line ~219 from `href="/contact"` to `href="#demo-video"` — the "See it in action" label finally points at the demo. Leave the closing-CTA "Book a demo" link (line ~705) untouched.

**Verify**: `cd demo && npx tsc --noEmit` → exit 0; `npm run lint` → no problems beyond the 12 baseline.

### Step 5: Build and visually verify

```bash
cd demo && npm run build
ls -lh out/video/
```

**Verify**: build exits 0; `out/video/bulma-demo.mp4` and poster are in the export. Run `npm run dev`, load http://localhost:3000, and confirm: the section renders in light AND dark mode, the poster shows before play, clicking play works, the hero "See it in action" button scrolls to the section, and no layout shift occurs around the video (explicit width/height attributes present). Revert any uncommitted `demo/public/sitemap.xml` timestamp churn from the build (`git checkout -- demo/public/sitemap.xml`).

### Step 6: Sync documentation

Append a "Published render" section to `documents/guides/_demo-video.md` recording: output asset paths (`demo/public/video/`), the compression settings used, the homepage embed location (`page.tsx`, section `id="demo-video"`), and the analytics event (`Video Play`, `video_id: bulma-demo-30s`). Keep it information-dense.

**Verify**: `grep -n "demo-video" documents/guides/_demo-video.md` → the new section exists.

## Test plan

This repo has no test suite (no test runner is configured in `demo/package.json`); verification is typecheck + lint baseline + build + manual visual check as specified per step. Do not introduce a test framework for this plan.

## Done criteria

ALL must hold:

- [ ] `cd demo && npx tsc --noEmit` exits 0
- [ ] `cd demo && npm run lint` reports no problems beyond the 12-problem baseline
- [ ] `cd demo && npm run build` exits 0 and `demo/out/video/bulma-demo.mp4` exists
- [ ] `ls -l demo/public/video/bulma-demo.mp4` → size ≤ 15728640 bytes (15 MB)
- [ ] `grep -n 'href="#demo-video"' demo/src/app/page.tsx` → 1 match (hero CTA)
- [ ] `grep -rn "trackVideoPlay" demo/src/components/elements/demo-video.tsx` → 1 match
- [ ] `git status` shows no modified files outside the in-scope list (sitemap.xml churn reverted)
- [ ] Work is on branch `advisor/001-demo-video`, not pushed
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The Remotion render fails, or any scene turns out to reference a missing asset (contradicts the "no staticFile usage" finding above).
- The mp4 cannot be brought under 15 MB even at 720p/CRF 28.
- `demo/src/app/page.tsx` no longer matches the section order / CTA excerpts above (homepage has drifted since `e308003`).
- Embedding requires modifying `Screenshot`, `Section`, or any shared element's existing behaviour (visual parity risk for other pages — surface instead of changing shared components).

## Maintenance notes

- The video shows the product UI as designed in mid-2026; when the app UI changes materially, the scenes in `video/bulma-demo/src/scenes/` need updating and the render/compress/copy pipeline above re-running. The doc-sync section from Step 6 is the breadcrumb for whoever does that.
- Reviewer should scrutinize: final video content/copy (owner judgment — scenes were never reviewed for publication), mp4 size in the diff, and that the poster shows correctly with `preload="none"` on a cold cache.
- Deferred deliberately: replacing "Book a demo" with a scheduling tool, a dedicated /demo page, and per-page OG video tags — all owner decisions once the embedded video proves engagement (watch the `Video Play` event in Mixpanel).
