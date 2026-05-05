# Supported Lenders Visual Redesign Plan

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
- At rest, show a quiet summary such as `36 lenders covered across major banks, regional banks, specialists, and channels.`
- When active, show the selected lender and its group, for example `Commonwealth Bank · Major bank · Policy coverage active`.
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

### Step 1: Create Shared Lender Data

Objective: Make the lender data expressive enough to drive the visual design.

- Create `demo/src/lib/supported-lenders.ts`.
- Move the current lender names into `SUPPORTED_LENDERS`.
- Add group and visual-tier metadata based on the existing market-order comments in `page.tsx`.
- Export hero-order names and alphabetical FAQ names from this module.
- Update `page.tsx` to import the shared data.

### Step 2: Build The Visual Component

Objective: Replace the current inline list with a designed component.

- Create `demo/src/components/elements/supported-lenders-field.tsx`.
- Render the wrapper, eyebrow, lender list, and readout.
- Use `button` elements inside the list items.
- Apply visual-tier data attributes to each lender item.
- Add active and peer data attributes for styling.
- Keep the initial render complete and readable before effects run.

### Step 3: Add Ledger Surface CSS

Objective: Make the resting state visibly premium before interaction.

- Add a `SUPPORTED LENDERS FIELD` section in `demo/src/app/globals.css`.
- Style the wrapper as a dark coverage field with subtle row rules and vignette depth.
- Style lender buttons as wordmark-like text.
- Apply tier-based scale, opacity, and colour.
- Add a one-time entrance cascade with opacity, filter, and translate.
- Keep the cascade fast and restrained so the list feels precise.

### Step 4: Add Active And Peer Styling

Objective: Make focus and selection visually obvious.

- Add active transform, brightness, underline beam, and z-index styles.
- Add peer clarity styles based on shared visual tier.
- Add selected/readout styles.
- Tune active scale separately for mobile and desktop.
- Ensure active names do not collide with adjacent names.

### Step 5: Add Pointer Proximity

Objective: Make the field respond like an inspectable coverage surface.

- Gate pointer proximity behind `window.matchMedia('(pointer: fine)')`.
- Attach one passive `pointermove` listener to the list container.
- Cache item centres and refresh them after resize.
- RAF-throttle all pointer calculations.
- Write `--lender-proximity`, `--lender-pointer-x`, and `--lender-pointer-y` directly to DOM nodes.
- Set active lender only when the nearest item passes the proximity threshold.
- Reset proximity values on pointer leave while preserving explicit click/tap selection.

### Step 6: Add Keyboard And Touch Selection

Objective: Make the visual upgrade work outside desktop hover.

- On focus, set the active lender.
- On click or touch pointerdown, select the lender and update the readout.
- Use the same active styles for pointer, keyboard, and touch.
- Keep the last selected lender visible until another lender is selected or focus moves intentionally.

### Step 7: Integrate In The Hero Footer

Objective: Replace the current inline footer list with the redesigned field.

- Import `SupportedLendersField` directly in `demo/src/app/page.tsx`.
- Replace the current `<div id="supported-lenders">` footer block with the new component.
- Update the announcement badge href to `#supported-lenders`.
- Keep the FAQ lender answer backed by the shared data module.

### Step 8: Update Animation Documentation

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
