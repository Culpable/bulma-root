# ~~Supported Lenders Visual Redesign Plan~~ ✅ **DONE**

<important_note>

> **Scope correction:** This plan is only for the **Supported Lenders** list shown in the attached reference: the dark hero-footer section with the centered "Supported Lenders" eyebrow and the multi-row text list of lender names.

</important_note>

## 1. Goal

Redesign the existing Supported Lenders list into a memorable, premium visual proof point for Bulma's lender coverage. The current list is technically useful but visually passive: a small grey text wrap under the hero. The new version should feel like a broker-grade lender coverage ledger: precise, authoritative, and quietly interactive.

The design concept is **Policy Coverage Ledger**.

Purpose:

- Show that Bulma covers a serious breadth of Australian lenders.
- Make the lender list feel inspected, live, and verifiable rather than decorative.
- Let brokers scan familiar names quickly while giving the section a stronger first impression.

Tone:

- Refined institutional.
- Financial terminal after dark.
- High-trust, exact, compressed, and deliberate.

Differentiation:

- The list should be remembered as the moment where the page stops talking about coverage and visually proves it.
- The active lender should feel like it has been pulled into focus from a field of policy coverage.
- Typography, contrast, line work, and controlled motion carry the experience.

Success criteria:

- At rest, the section is visibly more premium than the current grey text list.
- The lender names remain the primary visual asset.
- The list keeps the attached composition: centered heading, dark field, multi-row lender names, calm spacing.
- The design has a clear before/after visual delta: larger wordmark-like names, subtle institutional surface, market-weighted row rhythm, focus lens, and a compact selected-lender readout.
- Desktop pointer movement feels smooth at 60fps.
- Keyboard focus and touch selection produce the same visual focus state.
- `npm run lint` and `npm run build` pass inside `demo/`.
- Visual verification confirms desktop and mobile layouts have no overflow or text collisions.

---

## 2. Current State Analysis

### 2.1 Current Implementation

The current Supported Lenders display is rendered in `demo/src/app/page.tsx` inside the `HeroLeftAlignedWithDemo` `footer` prop.

Current structure:

- `AnnouncementBadge` above the hero headline links to `#lenders`.
- The visible Supported Lenders block uses `id="supported-lenders"`.
- The footer contains an `Eyebrow` with the text `Supported Lenders`.
- A single `<ul>` maps over `supportedLendersByMarketCap`.
- Each lender is a plain `<li>` with `text-sm`, `font-semibold`, muted mist colour, and a colour-only hover state.
- The lender list is separate from the FAQ list, which uses `bulmaCoveredLenders`.

Current lender order:

- Big 5 majors: Commonwealth Bank, Westpac, NAB, ANZ, Macquarie.
- Tier-2 majors and major-bank subsidiaries: Bankwest, Bank of Queensland, Bendigo Bank, Suncorp, ING, AMP Bank, St George, UBank, ME Bank, Adelaide Bank.
- Customer-owned and smaller regional banks: Bank Australia, Heritage Bank, Great Southern Bank, Beyond Bank, Auswide Bank, Bank of Sydney, MyState, Police & Nurses, Teachers Mutual Bank.
- Non-bank and specialist lenders: Liberty Financial, Pepper Money, Resimac, Firstmac, La Trobe Financial, Bluestone, Athena, MA Money, RedZed.
- Wholesale, aggregator, and government-backed channels: Advantedge, AFG, Keystart.

### 2.2 Visual Problem

The current list has low visual authority:

- The names are too small for a major proof point.
- Every lender has the same visual weight, so the market-cap ordering is not visible.
- The dark background has little structure, so the text floats without feeling intentionally placed.
- Hover only changes colour, which makes the list feel like default text rather than a designed experience.
- There is no selected state, status readout, or visual confirmation when a broker finds a lender they care about.
- The section is easy to skim past even though it supports the hero announcement claim.

### 2.3 Desired Visual Shift

The redesigned list should move from:

- small text -> wordmark-scale lender names
- flat wrap -> market-weighted coverage field
- grey hover -> focus-lens active state
- empty dark background -> subtle ledger surface
- no confirmation -> compact selected-lender readout
- static credit line -> broker-grade visual proof point

---

## 3. Visual Design Specification

### 3.1 Resting Layout

Keep the same broad shape as the attached screenshot, but make it feel intentionally designed.

Wrapper:

- Use the existing hero footer position.
- Keep the section centered and dark.
- Expand the visual field from the current `max-w-5xl` to a wider but controlled measure, approximately `max-w-7xl`, so the lender names can breathe on desktop.
- Add vertical padding around the list so it reads as a contained coverage moment instead of a footer afterthought.

Heading:

- Keep the visible label as `Supported Lenders`.
- Set it slightly smaller and more technical than the lender names.
- Use subdued mist colour and tighter letter spacing for an institutional caption feel.

List:

- Render lender names as text-first wordmarks.
- Increase the base size materially:
  - mobile: `text-base`
  - small screens: `text-lg`
  - desktop: `text-xl`
  - wide desktop: `text-2xl` where wrap remains balanced
- Use `font-display` with strong weight and no negative letter spacing.
- Keep line height stable so active transforms do not reflow rows.
- Use `flex-wrap` or a CSS grid-like wrapping strategy that preserves the current natural multi-row composition.

Market-weighted rhythm:

- Big 5 lenders should be marginally larger and brighter at rest.
- Tier-2 and major-bank subsidiaries should sit at the main display size.
- Regional, customer-owned, specialist, and channel lenders should be very slightly quieter, but still readable.
- Keystart can remain as the final centered name when the natural wrap produces that layout.

### 3.2 Background Surface

Add a subtle ledger-like surface behind the names.

Surface treatment:

- Use the existing dark mist/blue brand atmosphere.
- Add faint horizontal rule lines aligned to the text rows, like a policy register or trading board.
- Add a soft top-to-bottom vignette so the list has depth without becoming a card.
- Add a fine noise/grain layer only if it stays consistent with the existing site grain.
- Use low-contrast cyan-mist highlights, not saturated colour.

Pointer field:

- Add a low-opacity focus aperture behind the active pointer position.
- Drive it with `--lender-pointer-x` and `--lender-pointer-y`.
- The aperture should feel like light passing across a dark ledger page, not a decorative blob.

### 3.3 Active Lender State

The active lender should feel physically sharper than the surrounding field.

Active treatment:

- Brighten the lender name toward white in dark mode.
- Lift it by roughly `-3px`.
- Scale it subtly, no more than `1.045`.
- Increase optical weight without changing row height.
- Add a crisp underline beam that grows from the centre of the active word.
- Add a very controlled text edge, not a hazy glow.
- Raise active text above neighbours with `z-index`.

Peer treatment:

- Lenders in the same market group as the active lender should become slightly clearer than the rest.
- Non-peer names should remain readable but recede by a small opacity shift.
- This should reveal organisation without adding visible category headings.

Pointer proximity:

- The nearest lender receives the full active state.
- Names within a short radius receive partial lift and contrast.
- Proximity should feel precise rather than elastic or playful.

### 3.4 Selected-Lender Readout

Add a compact readout below the list to make the interaction feel concrete.

Readout behaviour:

- Reserve a stable line-height below the list so the layout never jumps.
- At rest, show a quiet summary such as `36 lender policies indexed across major banks, regional banks, specialists, and channels.`
- When active, show the selected lender and its group, for example `Commonwealth Bank - Major bank - Coverage active`.
- Use `aria-live="polite"` for updates.
- Keep the readout visually subordinate to the lender names.

Readout visual:

- Use small caps or tight technical text.
- Use a hairline top rule or short centre rule to connect it to the ledger surface.
- Use one small status dot or square mark if needed, implemented with CSS.

### 3.5 Mobile And Touch

Mobile should retain the premium treatment without requiring pointer proximity.

Mobile behaviour:

- Lender names wrap cleanly with `text-base` or `text-lg`.
- Tap selects a lender and updates the same active state and readout.
- Focus states should be visible and aligned with the active visual treatment.
- The active scale should be smaller on narrow screens to avoid collisions.

---

## 4. Technical Requirements

- Create a dedicated `SupportedLendersField` component.
- Keep all lender names in the static HTML output.
- Use text buttons for lender names so keyboard and touch users can select a lender.
- Use a single parent-level `pointermove` listener on pointer-fine devices.
- RAF-throttle pointer calculations.
- Write proximity values directly to CSS custom properties.
- Use React state only for the selected lender readout and active slug.
- Use an IntersectionObserver so pointer work starts only when the field enters the viewport.
- Use a `ResizeObserver` or resize invalidation so cached item centres stay correct after wrapping changes.
- Animate only transform, opacity, filter, colour, and CSS variables.
- Keep row heights and field height stable.
- Do not add `prefers-reduced-motion` conditionals.
- Update `documents/guides/_animations.md` after implementation because this feature adds a pointer-driven animation system.

---

## 5. Data Requirements

Create `demo/src/lib/supported-lenders.ts` as the canonical lender source.

Export:

- `SUPPORTED_LENDERS`
- `supportedLendersByMarketCap`
- `bulmaCoveredLenders`
- `bulmaCoveredLendersAnswer`

Each lender profile should include:

- `name`
- `slug`
- `group`
- `shortGroup`
- `visualTier`
- `heroOrder`

Visual tiers:

- `major`: Big 5 majors.
- `tier2`: Tier-2 majors and major-bank subsidiaries.
- `regional`: Customer-owned and smaller regional banks.
- `specialist`: Non-bank and specialist lenders.
- `channel`: Wholesale, aggregator, and government-backed channels.

Rules:

- Preserve the existing lender names.
- Preserve the existing hero order.
- Keep the FAQ list alphabetical.
- Keep the schema answer generated from the same data source.

---

## 6. Implementation Plan

### ~~Step 1: Create Shared Lender Data~~

Objective: Make the lender data expressive enough to drive the visual design.

- Create `demo/src/lib/supported-lenders.ts`.
- Move the current lender names into `SUPPORTED_LENDERS`.
- Add group and visual-tier metadata based on the existing market-order comments in `page.tsx`.
- Export hero-order names and alphabetical FAQ names from this module.
- Update `page.tsx` to import the shared data.

### ~~Step 2: Build The Visual Component~~

Objective: Replace the current inline list with a designed component.

- Create `demo/src/components/elements/supported-lenders-field.tsx`.
- Render the wrapper, eyebrow, lender list, and readout.
- Use `button` elements inside the list items.
- Apply visual-tier data attributes to each lender item.
- Add active and peer data attributes for styling.
- Keep the initial render complete and readable before effects run.

### ~~Step 3: Add Ledger Surface CSS~~

Objective: Make the resting state visibly premium before interaction.

- Add a `SUPPORTED LENDERS FIELD` section in `demo/src/app/globals.css`.
- Style the wrapper as a dark coverage field with subtle row rules and vignette depth.
- Style lender buttons as wordmark-like text.
- Apply tier-based scale, opacity, and colour.
- Add a one-time entrance cascade with opacity, filter, and translate.
- Keep the cascade fast and restrained so the list feels precise.

### ~~Step 4: Add Active And Peer Styling~~

Objective: Make focus and selection visually obvious.

- Add active transform, brightness, underline beam, and z-index styles.
- Add peer clarity styles based on shared visual tier.
- Add selected/readout styles.
- Tune active scale separately for mobile and desktop.
- Ensure active names do not collide with adjacent names.

### ~~Step 5: Add Pointer Proximity~~

Objective: Make the field respond like an inspectable coverage surface.

- Gate pointer proximity behind `window.matchMedia('(pointer: fine)')`.
- Attach one passive `pointermove` listener to the list container.
- Cache item centres and refresh them after resize.
- RAF-throttle all pointer calculations.
- Write `--lender-proximity`, `--lender-pointer-x`, and `--lender-pointer-y` directly to DOM nodes.
- Set active lender only when the nearest item passes the proximity threshold.
- Reset proximity values on pointer leave while preserving explicit click/tap selection.

### ~~Step 6: Add Keyboard And Touch Selection~~

Objective: Make the visual upgrade work outside desktop hover.

- On focus, set the active lender.
- On click or touch pointerdown, select the lender and update the readout.
- Use the same active styles for pointer, keyboard, and touch.
- Keep the last selected lender visible until another lender is selected or focus moves intentionally.

### ~~Step 7: Integrate In The Hero Footer~~

Objective: Replace the current inline footer list with the redesigned field.

- Import `SupportedLendersField` directly in `demo/src/app/page.tsx`.
- Replace the current `<div id="supported-lenders">` footer block with the new component.
- Update the announcement badge href to `#supported-lenders`.
- Keep the FAQ lender answer backed by the shared data module.

### ~~Step 8: Update Animation Documentation~~

Objective: Keep architecture documentation aligned with the new animation behaviour.

- Read `documents/guides/_animations.md`.
- Add a section for the Supported Lenders field.
- Document the component path, data path, CSS variables, pointer gate, RAF throttling, keyboard/touch fallback, and visual verification requirements.

---

## 7. Verification Plan

### Automated Checks

- Run `cd demo && npm run lint`.
- Run `cd demo && npm run build`.
- Confirm `demo/out/index.html` contains the lender names.

### Visual Checks With `dev-browser`

- Start the demo server with `cd demo && npm run dev`.
- Verify desktop at 1440px:
  - The resting state has visibly stronger typography than the current list.
  - The ledger surface is visible but subtle.
  - Big 5 lenders read as the first visual tier.
  - The list remains centred and close to the attached composition.
  - Active lender lift, underline, brightness, and peer clarity are visible.
  - The readout line remains stable and does not move surrounding content.
- Verify wide desktop at 2560px:
  - The list remains a deliberate multi-row field.
  - Spacing does not stretch into a loose single-line strip.
  - Pointer aperture and row rules stay behind the text.
- Verify mobile at 390px:
  - Names wrap cleanly.
  - Tap selection updates the active state and readout.
  - Active transforms do not cause collisions.

### Interaction Checks

- Click the hero announcement badge and confirm it scrolls to the redesigned list.
- Move the pointer across every row and confirm nearest-name focus tracks smoothly.
- Move the pointer quickly between rows and confirm no flicker.
- Leave the list and confirm proximity resets smoothly.
- Tab through lender buttons and confirm focus styling matches the active state.
- Tap multiple lenders in mobile emulation and confirm the readout updates.

### Performance Checks

- Record a Chrome Performance trace while moving the pointer across the list.
- Confirm there is only one `pointermove` listener on the list container.
- Confirm pointer work stays within the frame budget.
- Confirm there are no layout shifts during hover, focus, tap, or readout updates.

---

## 8. Implementation Notes For Reviewers

- Judge the result by the attached Supported Lenders screenshot plus the visual delta described in this plan.
- The section should feel more designed at rest before anyone hovers it.
- The most important change is typography and composition, then active focus, then data/readout support.
- Direct DOM style writes are intentional for proximity values; React state should only drive selected lender identity and readout content.
- If the field feels too busy, reduce background surface contrast first, then proximity radius, then active scale.

---

## 9. Final Post-Review Decisions

User review after implementation changed the final direction:

- Keep the existing lender order; do not alphabetise the visual list.
- Do not show lender categories, including labels such as `Major bank`, `Tier-2 bank`, `Regional bank`, `Specialist lender`, or `Policy channel`.
- Do not vary lender size, weight, colour, or opacity based on the lender or its category.
- Do not show a selected-lender readout, status pip, policy-count copy, freshness copy, or fabricated metadata under the list.
- Remove the card-like panel background, row-band ledger surface, vignette, and heavy inset treatment because they looked out of place against the hero.
- Keep only the centred `Supported Lenders` eyebrow, the multi-row lender names, the subtle top/bottom hairlines, and the pointer aperture.
- Make the active state self-contained: the active lender turns white, brightens, lifts slightly, and shows an underline beam while every non-active lender fades back.
- Fix the active-state specificity bug by excluding `[data-active='true']`, `:hover`, and `:focus-visible` from the dimming selector. Without this, `.supported-lenders-field[data-has-active='true'] .supported-lenders-field__button` had higher specificity than the active selector and dimmed the active lender.

---

## Implemented Solution

### Files Touched

- `demo/src/lib/supported-lenders.ts` (Created)
  - Added `SupportedLender` and `SupportedLenderVisualTier` types.
  - Added `SUPPORTED_LENDERS` as the canonical lender metadata source with `name`, `slug`, `group`, `shortGroup`, `visualTier`, `heroOrder`, and `faqOrder`.
  - Exported `supportedLendersByMarketCap`, `bulmaCoveredLenders`, and `bulmaCoveredLendersAnswer` from the same source so hero, FAQ, and schema copy stay aligned.

- `demo/src/components/elements/supported-lenders-field.tsx` (Created)
  - Added `SupportedLendersField`, a client component that renders all 36 lender names as static HTML buttons.
  - Added pointer-fine proximity tracking with one parent-level `pointermove` listener on `.supported-lenders-field__list`, IntersectionObserver viewport gating, ResizeObserver cache invalidation, and RAF-throttled DOM style writes.
  - Added keyboard focus, click selection, and touch-style pointer selection that pin the active lender visually without rendering any selected-lender readout.
  - Removed peer/category grouping from the visual component: the rendered buttons no longer include `data-lender-tier`, `data-lender-group`, or `data-peer`, and `aria-label` uses only the lender name.

- `demo/src/app/globals.css` (Updated)
  - Added the `SUPPORTED LENDERS FIELD` CSS section with hairline section bounds, a pointer aperture, unified lender typography, active underline beam, and responsive mobile active scale.
  - Post-review tuning removed the heavy panel fill, row-band treatment, category-specific styles, peer clarity, selected-lender readout, readout rule, and status mark.
  - Increased the `Supported Lenders` eyebrow size and contrast after review feedback that it was too small against the lender names.
  - Fixed the active-state specificity bug by excluding active, hover, and focus-visible buttons from the dimming selector so the active lender remains bright while non-active lenders fade.
  - Animated only opacity, filter, transform, colour, and CSS custom properties for this feature.
  - Used breakpoint-based font sizes rather than viewport-scaled font sizing.

- `demo/src/app/page.tsx` (Updated)
  - Replaced the inline hero footer lender list with `<SupportedLendersField />`.
  - Updated the announcement badge href from `#lenders` to `#supported-lenders`.
  - Imported FAQ lender names and schema answer from `demo/src/lib/supported-lenders.ts`.

- `documents/guides/_animations.md` (Updated)
  - Added `supported-lenders-field.tsx` and `supported-lenders.ts` to the animation system file structure.
  - Added `Supported Lenders Field` documentation covering component path, data path, CSS ownership, pointer gate, IntersectionObserver gating, RAF throttling, CSS variables, keyboard/touch fallback, and verification requirements.

- `documents/todo/hero_interactive_enhancements_plan.md` (Updated)
  - Struck through Steps 1-8 after completion.
  - Updated the first heading to completed status.
  - Added final post-review decisions and this `Implemented Solution` section for review context.
  - Moved the completed plan to `documents/learnings/hero_interactive_enhancements_plan.md`.

### Behavioural Deltas

- The hero footer lender list is now a compact supported-lenders field with a centred eyebrow, 36 text buttons, subtle top/bottom hairlines, and no card-like panel fill.
- All lenders render with the same resting size, weight, colour, and opacity; there is no visible category or tier treatment.
- The field keeps the existing lender order from `supportedLendersByMarketCap`; no alphabetical visual reorder was introduced.
- Pointer movement on fine-pointer devices activates the nearest lender, writes proximity values directly to CSS variables, and resets pointer-only values on pointer leave.
- Click, tap, and keyboard focus pin the active lender visually without rendering any readout line below the list.
- The active lender now turns white, brightens, lifts slightly, and shows the underline beam while non-active lenders fade back through a selector that excludes active, hover, and focus-visible buttons.
- The FAQ list and schema answer now share the same canonical data source as the hero field while preserving the existing FAQ lender order.

### Validation Outcomes

- Captured before screenshots:
  - Desktop: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-before-desktop-viewport.png`
  - Mobile: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-before-mobile-viewport.png`

- Captured after screenshots:
  - Desktop resting: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-after-desktop-rest.png`
  - Desktop active: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-after-desktop-active.png`
  - Wide desktop resting: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-after-wide-rest.png`
  - Mobile active: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-after-mobile-active.png`
  - Post-review tuned desktop viewport: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-final-desktop-viewport.png`
  - Post-review tuned desktop active: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-final-desktop-active.png`
  - Post-review tuned mobile viewport: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-final-mobile-viewport.png`
  - Final post-cleanup desktop viewport: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-final2-desktop-viewport.png`
  - Final post-cleanup desktop active: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-final2-desktop-active.png`
  - Final post-cleanup mobile active: `/Users/sacino/.codex/skills/dev-browser/tmp/bulma-supported-lenders-final2-mobile-active.png`

- Automated checks:
  - `npx prettier --write src/app/page.tsx src/app/globals.css src/components/elements/supported-lenders-field.tsx src/lib/supported-lenders.ts ../documents/todo/hero_interactive_enhancements_plan.md` passed.
  - `npx eslint src/app/page.tsx src/components/elements/supported-lenders-field.tsx src/lib/supported-lenders.ts` passed.
  - Final targeted `npx eslint src/components/elements/supported-lenders-field.tsx` passed after removing the readout and peer/category rendering.
  - Final `npm run build` passed and regenerated the static export.
  - `demo/out/index.html` contains the Supported Lenders field and lender names in the static HTML output.
  - `demo/out/index.html` no longer contains `supported-lenders-field__readout`, `supported-lenders-field__status-mark`, `data-lender-tier`, `data-peer`, `Major bank`, `Tier-2 bank`, `Regional bank`, `Specialist lender`, `Policy channel`, `Policy coverage active`, `Coverage active`, or `policies indexed`.

- Visual and interaction checks with `dev-browser` on the running demo app at `http://localhost:3001`:
  - Desktop rendered 36 lender buttons with no horizontal overflow.
  - Wide desktop stayed as a deliberate multi-row field instead of stretching into a single-line strip.
  - Mobile wrapped lender names cleanly with no horizontal overflow.
  - Announcement badge scrolled to `#supported-lenders`.
  - Pointer movement activated the nearest lender without rendering a readout or category text.
  - Fast pointer movement across all rows ended on the nearest final lender without observed flicker.
  - Pointer leave reset pointer-only proximity values while preserving explicit click/tap selections.
  - Post-review desktop viewport measured `1088px` field width, no horizontal overflow, and no selected-lender readout under the names.
  - Final desktop active state rendered 36 uniform buttons with no category labels and no horizontal overflow.
  - Final mobile active state rendered 36 uniform buttons with no category labels and no horizontal overflow.
  - Click selection persisted the active visual state after pointer leave.
  - Keyboard focus activated the focused lender with the same visual treatment as pointer hover.
  - Touch-style pointer selection activated the tapped lender with the same visual treatment as pointer hover.
  - Final active-state diagnosis confirmed the previous dim selector had higher specificity than the active selector; the selector was changed to dim only non-active, non-hovered, and non-focused buttons.
  - Runtime listener instrumentation observed one `pointermove` listener on `.supported-lenders-field__list`; additional pointer listeners came from the browser/dev tooling environment, not this field.

- Performance check:
  - Chrome trace while moving across the lender list recorded 72 pointer events.
  - Maximum traced `pointermove` event work was `0.082ms`, below the 16.7ms frame budget.

### Skipped Or Blocked Checks

- Full `npm run lint` was attempted but remains blocked by pre-existing unrelated lint errors outside this implementation:
  - `demo/src/components/elements/morphing-price.tsx`
  - `demo/src/components/sections/navbar-with-links-actions-and-centered-logo.tsx`
  - `demo/src/components/sections/navbar-with-logo-actions-and-left-aligned-links.tsx`
  - `demo/src/hooks/use-hero-parallax.ts`
  - `demo/src/hooks/use-scroll-highlight.ts`
  - `demo/src/hooks/use-sticky-section.ts`
- AGENTS.md requires testing and iteration before completion; targeted lint, production build, generated HTML inspection, browser screenshots, interaction checks, and performance trace were completed to validate the changed files while leaving unrelated repository lint debt untouched.
