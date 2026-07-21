---
version: alpha
name: Bulma
description: Marketing website for Bulma, the AI assistant for Australian mortgage brokers, served at bulma.com.au
---

# Bulma Marketing Site Design System

## Overview

### Purpose and authority

This document is the visual implementation contract for the Bulma marketing site (the `demo/` Next.js static export deployed to bulma.com.au). Read it before changing any user-facing surface in `demo/src`. It documents implemented behaviour; it does not own token values. When this document and the implementation disagree, the implementation plus `AGENTS.md` win, and the mismatch must be recorded under Approved Exceptions and Drift. `AGENTS.md` owns commands, server lifecycle, testing rules, and binding content contracts (contact form fields, pricing parity, hash navigation, motion policy); this document restates them only where they constrain visual work.

### Product character

- Audience and job: Australian mortgage brokers evaluating an AI policy assistant; the site's job is to earn trust and convert visitors to `https://app.bulma.com.au/register`.
- Character: calm, premium, precision-engineered. Concretely: a single cool-grey `mist` palette instead of saturated accents, hairline borders over heavy outlines, frosted-glass surfaces, tactile press physics on the primary CTA, and restrained scroll-triggered entrances.
- Not: multi-colour gradients as identity, marketing-neon accents, bouncy or attention-grabbing looped animation on content, dense enterprise chrome.
- Expressive exceptions: ambient hero and section effects (cursor spotlight, floating orbs, aurora, dot matrix, luminance sweep) and glassmorphism testimonial cards are approved decorative layers; they stay behind content and never carry meaning.

### Source map

| Concern | Source | Ownership |
| --- | --- | --- |
| Global tokens, themes, keyframes | `demo/src/app/globals.css` | Tailwind v4 theme block with the mist palette and font variables; all animation keyframes and utility classes; scrollbar, selection, and caret colours |
| Primary action component | `demo/src/components/elements/glass-press-button-link.tsx::GlassPressButtonLink` | Glass Press primary CTA surface, press physics, light and dark treatments, focus ring |
| Secondary button family | `demo/src/components/elements/button.tsx` | Solid, soft, and plain button and link variants, shared sizes, press scale, focus ring |
| Shared primitives | `demo/src/components/elements` | Headings, text, eyebrow, links, container, section, screenshot, wallpaper, and animation elements |
| Page sections | `demo/src/components/sections` | Composed hero, feature, stats, pricing, FAQ, testimonial, navbar, and footer sections |
| Application shell | `demo/src/app/layout.tsx::RootLayout` | Font loading, metadata, navbar and footer composition, analytics scripts |
| Product routes | `demo/src/app` | Home, pricing, about, contact, privacy-policy, and 404 pages |
| Brand wallpaper gradients | `demo/src/components/elements/wallpaper.tsx::Wallpaper` | Screenshot backdrop gradients per colour and theme, noise overlay |
| Motion system guide | `documents/guides/_animations.md` | Canonical documentation of every animation primitive, timing, and known failure points |
| Scroll entrance hook | `demo/src/hooks/use-scroll-animation.ts::useScrollAnimation` | IntersectionObserver visibility trigger shared by section entrances |
| Assets | `demo/public/img` | Logos, screenshots, avatars, photos, and Open Graph images |
| Binding project rules | `AGENTS.md` | Validation commands, dev server policy, browser verification gates, motion policy, content contracts |

### Foundations

- Framework and rendering: Next.js 16 App Router with React 19, static export only (no server runtime), deployed to GitHub Pages. Only `demo/` runs.
- Styling and token authority: Tailwind CSS v4; the theme block in `demo/src/app/globals.css` is the canonical token source (implementation-authoritative). This document names roles only and never duplicates values.
- Components and icons: hand-rolled primitives in `demo/src/components/elements`, composed sections in `demo/src/components/sections`, and roughly 110 local SVG icon components in `demo/src/components/icons`. No external UI or animation library.
- Fonts and charts: Mona Sans (variable width axis) for display, Inter for body, both self-hosted through `next/font/google` with swap display. The stats graph is bespoke SVG; there is no charting library.

## Colors

| Role | Token or source | Use |
| --- | --- | --- |
| Palette | `--color-mist-50` through `--color-mist-950` in `demo/src/app/globals.css` | Single cool blue-grey ramp (oklch) used for every UI colour decision |
| Canvas | mist-100 light, mist-950 dark | Page background, set on the root in `globals.css`; navbar matches when unscrolled |
| Primary text | mist-950 light, white dark | Headings, button labels, emphasised copy |
| Secondary text | mist-700 light, mist-400 dark | Body copy (`text.tsx::Text`), eyebrows, captions |
| Accent | The mist ramp itself | There is no separate accent hue; emphasis comes from contrast, glass, and depth |
| Border | Translucent mist-950 or white hairlines (about 6 to 30 percent alpha) | Card rings, glass button borders, dividers |
| Screenshot backdrops | `wallpaper.tsx::Wallpaper` gradients (blue, green, purple, brown; separate light and dark stops) | Product screenshot framing; blue is the brand default and matches the brand gradient in `AGENTS.md` |
| Success, warning, error | No dedicated tokens | Contact form status uses neutral mist surfaces with text plus `role="alert"` or `role="status"`; never colour alone |

- Theme status: light and dark are both shipped and follow `prefers-color-scheme` only. There is no manual theme toggle and no `.dark` class strategy; every change must be verified in both schemes.
- Accessibility target: no formal audited contrast target. Text pairs in shipped use (mist-950 on mist-100, white on mist-950, mist-700 on mist-100, mist-400 on mist-950) are treated as the safe set; measure the rendered pair before introducing new text-on-tint combinations.
- Status communication: text and iconography always accompany colour (verified in the contact form and pricing feature lists).

## Typography

- Display role: Mona Sans via `--font-display` with a widened variation setting, applied by `heading.tsx::Heading` (h1, 5xl tightening to 3.5rem at `sm`, medium weight, tight tracking, balanced wrap) and `subheading.tsx::Subheading` (h2, 3xl to 2rem, pretty wrap).
- Body role: Inter via `--font-sans`. `text.tsx::Text` renders base/7 (md) or lg/8 (lg) in the secondary text colour with pretty wrapping.
- Label roles: `eyebrow.tsx::Eyebrow` is sm/7 semibold in secondary colour above subheadings. All buttons and nav links use sm/7; the Glass Press primary uses bold weight, every other button uses medium.
- Numerics: animated stats and morphing prices force `tabular-nums` so digits do not shift width mid-animation.
- Measure and wrapping: section headers cap at `max-w-2xl` inside `section.tsx::Section`; headings use balance, body uses pretty. Never let CTA labels wrap; buttons stay single-line at all supported viewports.
- Locale: en-AU copy, sentence case for headlines and CTA labels ("Try Bulma free", "Get started", "Book a demo").

## Layout

- Spacing rhythm: Tailwind spacing scale only. Sections are `py-16` with internal column gaps of 10 to 16; section headers stack with gap-2 and gap-6.
- Breakpoints and frames: Tailwind defaults. `container.tsx::Container` centres content at `max-w-2xl` with `px-6`, widening to `max-w-3xl` at `md` and `max-w-7xl` with `px-10` at `lg`.
- Navigation and shell: sticky top navbar (`navbar-with-links-actions-and-centered-logo.tsx`) that gains a translucent blurred background after 20px of scroll; centred logo, left links, right actions (Log in as plain button, Get started as Glass Press primary). Mobile menu repeats both actions full-width, Glass Press first. Footer carries newsletter form, link categories, social icons, and the fineprint.
- Overflow and dense data: no page-level horizontal scrolling anywhere; the plan comparison table is the only dense grid and must reflow, not scroll the page. Verify horizontal overflow at both reference viewports after any layout change.
- Touch targets: 44px minimum boxes on small screens stepping to 40px at `lg`, owned by the shared size classes in `button.tsx` and mirrored by `GlassPressButtonLink` and the `cta` size of `link.tsx::Link`.

## Elevation & Depth

- Surface hierarchy: flat canvas, then hairline-ringed cards with translucent tints, then frosted glass (blurred, saturated, translucent) for the navbar when scrolled, testimonial cards, and the Glass Press primary. Shadows are reserved for interactive lift and card depth, never for static decoration.
- Overlays and stacking: the site has no modal, dialog, or popover layer. The navbar sits at `z-10`; ambient background layers (orbs, spotlight, dot matrix) sit at or below `z-0` behind content.
- Expressive depth: approved ambient layers are cursor spotlight, floating orbs, aurora background, dot matrix, border beam on featured pricing cards, and the screenshot reflection. The Glass Press primary expresses depth mechanically: the key rests 2px above a hard offset ledge shadow, rises to 3px on hover, and drops onto the ledge when pressed.

## Shapes

- Radius and geometry: the standard button family is fully rounded (pill). The Glass Press primary is deliberately `rounded-xl`, not pill, to read as a physical key. Cards and status panels use xl to 2xl radii; screenshots use md rising to lg at `lg`.
- Icons: local SVG components sized by Tailwind (`size-4` to `size-6` in controls), inheriting `currentColor`. Decorative icons are `aria-hidden`; standalone icon links carry an accessible name (footer social links). Hover micro-animations (wiggle, pulse, bounce, float, spin, sparkle) come from the icon animation classes in `globals.css`.
- Imagery: product screenshots are real captures of the Bulma app rendered inside `screenshot.tsx::Screenshot` on a `Wallpaper` gradient with optional parallax tilt and reflection; photographic media gets an inset hairline outline. All meaningful images have descriptive alt text (the logo alt names the product and audience).

## Components

### Interaction and accessibility

- Semantics: native elements only; links are `next/link` anchors, buttons are `button` elements. There are no custom ARIA widgets outside the FAQ disclosures, which use the disclosure lifecycle attributes documented in the motion guide.
- Cursor and stable states: all interactive controls set `cursor-pointer` and keep hover, active, and focus feedback within 150 to 300ms colour, shadow, and transform transitions that list only the properties they change.
- Focus and keyboard: every button variant applies a visible 2px focus ring with 2px offset via `focus-visible`; the Glass Press primary carries its own theme-matched ring. Focus order follows DOM order; no keyboard traps exist (verified for nav, FAQ disclosures, pricing toggle, and contact form; whole-site keyboard conformance is not claimed).
- Names and announcements: form inputs pair `label htmlFor` with ids; contact form errors use `role="alert"`, progress and success use `role="status"` plus `aria-busy` and a state-matched `aria-label` on the submit button.
- Motion: binding project policy in `AGENTS.md` - never add `prefers-reduced-motion` or similar conditionals; animations run identically for every user. All motion primitives, timings, and easings are documented in `documents/guides/_animations.md`; prefer those primitives over new ones and keep animation wrappers layout-neutral (`h-full` in equal-height grids).

### Actions and buttons

Action hierarchy, from most to least prominent:

1. **Glass Press primary** (`glass-press-button-link.tsx::GlassPressButtonLink`): the only treatment for the primary conversion action. Shipped uses: "Try Bulma free" in the homepage hero and homepage closing CTA, and "Get started" in the navbar (desktop and mobile menu). All three link to the app register URL. Frosted-glass surface (backdrop blur and saturation, hairline border, inset top sheen) with tactile press physics on a hard ledge shadow; bold sm/7 label; dark-tinted glass over light canvas, white-tinted glass over dark. Do not wrap it in magnetic or gradient-border effects.
2. **Solid** (`button.tsx::ButtonLink` and `Button`, dark/light colour): high-contrast pill (dark fill on light, light fill on dark) with hover shadow lift and press scale. Shipped use: featured plan CTA in both pricing modules.
3. **Soft** (`SoftButtonLink` and `SoftButton`): translucent tinted pill for co-primary or non-featured actions (non-featured plan CTAs, contact prompts).
4. **Plain** (`PlainButtonLink` and `PlainButton`): text-only pill with hover tint for secondary actions ("See it in action", "Book a demo", "Log in"). Secondary hero and CTA-section actions may sit inside `MagneticWrapper`; the Glass Press primary never does.
5. **Inline link** (`link.tsx::Link`): sm/7 medium text with the grow-from-center underline hover; `size="cta"` adds compliant target height for standalone use.

All button-family variants press to `scale(0.96)` unless their `static` prop opts out; the Glass Press primary presses by dropping onto its ledge instead of scaling.

### Forms and selection

The contact form (`demo/src/app/contact/contact-form.tsx`) is the only full form. Its field contract is binding in `AGENTS.md`: hidden `form_source` plus required `name`, `email`, `message`; never add, remove, rename, or repurpose fields without explicit approval. Inputs are labelled, validated natively plus on submit, and report state through the role-attributed status panels described above. The footer newsletter form reuses the same visual language. The Monthly/Yearly pricing toggle is a two-option control with a spring-animated pill indicator on the pricing page and shared state tokens across both pricing modules.

### Navigation and search

No search exists. Navbar links are Pricing and Contact; the mobile menu adds the stacked actions. Internal navigation uses `transition-link.tsx::TransitionLink` View Transitions (300ms root crossfade with vertical settle) where supported. The homepage FAQ deep link contract is binding: `#lenders` targets the lender-coverage FAQ and must keep auto-opening it on both direct loads and same-page clicks; `#supported-lenders` targets the hero lender field only.

### Cards, badges, and statuses

Pricing cards must stay equal-height: `items-stretch` on the grid with `h-full` on every card and animation wrapper. The homepage pricing module mirrors the pricing page module; `/pricing` is the source of truth and both must change together, including the exact annual callout copy noted below. Testimonial cards use the layered glassmorphism treatment with hover lift; featured pricing cards add the border beam. Statuses everywhere are text-first on neutral surfaces.

### Tables and dense data

The plan comparison table (`plan-comparison-table.tsx`) uses row hover tinting, label emphasis, and cell gradient overlays at 200ms. Keep it readable without page-level horizontal scrolling at 390px width.

### Dialogs, sheets, popovers, and tooltips

None are implemented. Do not introduce one without extending this contract; the FAQ disclosure pattern covers progressive reveal.

### Alerts, loading, empty, and error states

The contact form owns the only shipped loading, success, and error states: submit shows a spinner with `aria-busy`, success and recoverable-error panels animate in via the scoped spring class and use `role="status"` or `role="alert"`. There are no skeletons or empty states on the static marketing pages.

## Do's and Don'ts

- Do use `GlassPressButtonLink` for every primary register CTA (Try Bulma free, Get started); don't reintroduce the porcelain button, gradient border wrapper, or magnetic effects on it.
- Don't add `prefers-reduced-motion` or any reduced-motion conditional to animation code, ever (binding rule in `AGENTS.md`).
- Do verify every UI change at 1440x900 and 390x900 in both light and dark schemes before reporting completion.
- Don't change contact form fields, the `#lenders` deep-link behaviour, or pricing-module copy parity without explicit approval; the annual callout must read exactly "Get 2 months free on a yearly plan." in both modules.
- Do keep equal-height card grids intact: `items-stretch` on the grid, `h-full` on cards and every animation wrapper between them.
- Don't hardcode colour values in components or docs; use mist utility classes backed by the theme block in `globals.css`.
- Do read `documents/guides/_animations.md` before touching any animation and update it when behaviour changes.

## Product Workflows and Content

- Conversion flow: every primary CTA routes to `https://app.bulma.com.au/register`; Log in routes to `https://app.bulma.com.au/login`; secondary CTAs route to `/contact`.
- Shipped CTA copy: "Try Bulma free" (homepage hero and closing CTA), "Get started" (navbar), "See it in action" (hero secondary), "Book a demo" (closing secondary), "Log in".
- Terminology: "brokers", "lenders", "policy questions"; Australian English throughout (en-AU locale in metadata).
- Hero value proposition cycles through phrase variants via the blur transition text without layout shift; the supported-lenders field is the canonical lender-coverage visual and shares data with the lenders FAQ.
- Load-bearing copy: the pricing annual callout sentence above, the FAQ lender answer, and the fineprint "© 2026 Bulma Pty Ltd".

## Approved Exceptions and Drift

- Approved exceptions: the Glass Press primary intentionally breaks the pill-radius rule (`rounded-xl`) and uses bold weight; ambient decorative layers are exempt from the "no looped animation on content" stance because they sit behind content.
- Known implementation drift: `documents/guides/_animations.md` (sections 7 and 13) still names the porcelain treatment as the homepage primary CTA; the working tree has replaced it with `GlassPressButtonLink`. Sync the guide when the button change lands. The Glass Press source comment cites a prototype HTML file that is not in this repository.
- Retained but unreferenced: `precision-porcelain-button-link.tsx` (superseded primary) and `gradient-border-wrapper.tsx` (no route renders it) remain in the tree as approved dormant variants; do not treat their presence as sanction to use them for primary CTAs.
- Reference-only trees: root `components/` and `pages/` are unrouted template sources; `demo/src` is the authority for everything shipped.

## Design Verification

| Viewport or mode | Routes and states | Proof |
| --- | --- | --- |
| 1440x900, light and dark | Home, pricing, about, contact, privacy-policy, 404; navbar scrolled and unscrolled; Monthly and Yearly | No horizontal overflow, no console or page errors, equal-height pricing cards, glass navbar engages after scroll |
| 1440x900, light and dark | Glass Press CTAs (hero, closing CTA, navbar) hover, press, and keyboard focus | Key rises on hover, drops onto ledge on press, visible focus ring in both schemes, label never wraps |
| 390x900, light and dark | Same routes; mobile menu open; hero CTA stack | Full-width stacked CTAs (Glass Press first in menu), 44px targets, no clipped or overlapping text |
| Either viewport | `/#lenders` direct load and same-page click; contact form invalid, pending, success | FAQ auto-opens in both hash paths; form states announce via alert and status roles without layout jump |

Also verify keyboard order and focus visibility on nav, pricing toggle, FAQ disclosures, and the contact form; scroll-triggered sections after settling; and both colour schemes for any changed surface. Commands, server lifecycle, and the browser-verification gate live in `AGENTS.md`.
