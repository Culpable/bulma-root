# Animations & Parallax Tilt System

## 1. Overview

The animation system provides scroll-triggered entrance animations for page sections and a 3D parallax tilt effect for screenshots. Animations use CSS transitions controlled by React state via IntersectionObserver, with no external animation libraries required.

---

## 2. File Structure

```
demo/src/
├── hooks/
│   ├── use-scroll-animation.ts          # Reusable IntersectionObserver hook
│   └── use-hero-parallax.ts             # Hero depth parallax scroll effect (NEW)
├── app/
│   └── globals.css                       # CSS keyframes and utility classes
└── components/
    ├── elements/
    │   ├── animated-counter.tsx          # Scroll-triggered number counting
    │   ├── aurora-background.tsx         # Morphing gradient aurora background (NEW)
    │   ├── cursor-spotlight.tsx          # Cursor-following ambient glow
    │   ├── floating-orbs.tsx             # Ambient drifting background orbs
    │   ├── gradient-border-wrapper.tsx   # Rotating gradient CTA border
    │   ├── logo-marquee.tsx              # Infinite scrolling logo display
    │   ├── luminance-sweep.tsx           # Metallic sheen sweep on headlines (NEW)
    │   ├── magnetic-wrapper.tsx          # Magnetic cursor-attraction effect
    │   ├── blur-transition-text.tsx      # Blur in/out text cycling animation
    │   └── screenshot.tsx                # Parallax tilt implementation
    └── sections/
        # Home page sections
        ├── features-two-column-with-demos.tsx   # Slide left/right staggered
        ├── stats-animated-graph.tsx             # Slide up staggered + graph draw
        ├── pricing-multi-tier.tsx               # Scale up staggered
        ├── faqs-two-column-accordion.tsx        # Header slide + item fade
        ├── call-to-action-simple.tsx            # Slide up with CTA delay
        ├── testimonials-glassmorphism.tsx       # Slide up + scale staggered
        # About page sections
        ├── hero-left-aligned-with-photo.tsx     # Slide up with photo delay
        ├── team-four-column-grid.tsx            # Staggered fade-in
        ├── testimonial-two-column-with-large-photo.tsx  # Slide up
        # Pricing page sections
        ├── pricing-hero-multi-tier.tsx          # Header slide + scale up staggered plans
        ├── plan-comparison-table.tsx            # Slide up
        ├── faqs-accordion.tsx                   # Header slide + item fade
        └── call-to-action-simple-centered.tsx   # Slide up with CTA delay
```

---

## 3. Scroll Animation Hook

`use-scroll-animation.ts::useScrollAnimation` returns a `containerRef` to attach to the observed element and an `isVisible` boolean that flips to `true` when the element enters the viewport.

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `threshold` | `number` | `0.1` | Percentage of element visible to trigger |
| `rootMargin` | `string` | `'0px'` | Margin around viewport boundary |
| `triggerOnce` | `boolean` | `true` | Disconnect observer after first trigger |

**Usage pattern in section components:**

```tsx
const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.15 })

// Apply to container
<div ref={containerRef} className={clsx(
  'transition-all duration-600 ease-out',
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
)}>
```

---

## 4. Animation Types by Section

### Home Page

| Section | Animation | Direction | Stagger Delay |
|---------|-----------|-----------|---------------|
| Features | Slide X | Alternating left/right | 150ms |
| Stats | Slide Y + graph draw | Up | 120ms |
| Pricing | Scale + Slide Y | Up with scale | 100ms |
| FAQs Two Column | Slide X (header) + Slide Y (items) | Left / Up | 80ms |
| CTA Simple | Slide Y | Up | 150ms (CTA delayed) |
| Testimonials Grid | Slide Y + scale | Up | 100ms |

### About Page

| Section | Animation | Direction | Stagger Delay |
|---------|-----------|-----------|---------------|
| Hero with Photo | Slide Y | Up (photo 150ms delay) | — |
| Team Grid | Slide Y | Up | 80ms |
| Testimonial Large Photo | Slide Y | Up | — |

### Pricing Page

| Section | Animation | Direction | Stagger Delay |
|---------|-----------|-----------|---------------|
| Pricing Hero | Slide Y (header) + Scale Y (plans) | Up | 100ms (plans start at 300ms) |
| Plan Comparison | Slide Y | Up | — |
| FAQs Accordion | Slide Y (header) + Slide Y (items) | Up | 80ms (items start at 200ms) |
| CTA Centered | Slide Y | Up | 150ms (CTA delayed) |

All animations use `transition-all` with `ease-out` timing. Duration ranges from 500ms to 1500ms, with longer timings reserved for graph draw and glow effects.

---

## 5. Parallax Tilt Effect

`screenshot.tsx::Screenshot` implements a 3D tilt effect on mouse hover.

**Configuration constants (`TILT_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `maxRotation` | 8 | Maximum tilt angle in degrees |
| `perspective` | 1000 | 3D perspective depth in pixels |
| `resetDuration` | 400 | Reset animation duration in ms |
| `hoverScale` | 1.02 | Scale factor on hover |

**Behavior:**
- `handleMouseMove` calculates cursor position relative to element center, maps to rotation angles
- `handleMouseLeave` resets transform with smooth transition
- Glow overlay follows cursor using CSS custom properties `--mouse-x` and `--mouse-y`
- Disable via `enableTilt={false}` prop

---

## 6. Cursor Spotlight Effect

`cursor-spotlight.tsx::CursorSpotlight` creates an ambient radial gradient that follows the cursor, producing a "flashlight" illumination effect.

**File:** `demo/src/components/elements/cursor-spotlight.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | — | Content to wrap |
| `size` | `number` | `500` | Spotlight diameter in px |
| `opacity` | `number` | `0.08` | Gradient opacity (0–1) |

**Behavior:**
- Tracks mouse position via `mousemove` event listener on container
- Position state updates spotlight `left`/`top` coordinates
- Fades in/out on `mouseenter`/`mouseleave` (500ms transition)
- Movement easing: 150ms `ease-out` on transform

**Visual layers:**
| Layer | Blend Mode | Visibility | Effect |
|-------|------------|------------|--------|
| Primary glow | `soft-light` | Always | White radial gradient, illumination |
| Secondary glow | `screen` | Dark mode only | Blue-tinted (#78B4DC), 1.5× size, adds depth |

**Integration:** Wrap any component to add the effect. Currently applied to `HeroLeftAlignedWithDemo`.

```tsx
<CursorSpotlight size={600} opacity={0.1}>
  <section>...</section>
</CursorSpotlight>
```

---

## 7. Magnetic Button Effect

`magnetic-wrapper.tsx::MagneticWrapper` creates a subtle cursor-attraction effect where wrapped elements pull toward the cursor when nearby, creating a tactile, interactive feel.

**File:** `demo/src/components/elements/magnetic-wrapper.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | — | Content to wrap |
| `disabled` | `boolean` | `false` | Disable magnetic effect |
| `maxOffset` | `number` | `6` | Maximum pull distance in px |
| `activationRadius` | `number` | `1.4` | Trigger zone multiplier |

**Configuration constants (`MAGNETIC_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `maxOffset` | 6 | Maximum translation in pixels |
| `activationRadius` | 1.4 | Multiplier for trigger zone size |
| `returnDuration` | 400 | Spring-back animation duration (ms) |
| `springEasing` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoot easing for return |

**Behavior:**
- `handleMouseMove` calculates cursor offset from element center, applies proportional translation
- `handleMouseLeave` resets with spring easing (400ms, overshoots then settles)
- Movement easing: 150ms `ease-out` for responsive tracking

**Integration:** Wrap buttons or interactive elements. Currently applied to hero and CTA section buttons.

```tsx
<MagneticWrapper>
  <ButtonLink href="/register">Try Bulma free</ButtonLink>
</MagneticWrapper>
```

---

## 8. Blur Transition Text Animation

`blur-transition-text.tsx::BlurTransitionText` creates a dreamy blur in/out effect that cycles through phrases, perfect for hero headlines communicating multiple value propositions without layout shift.

**File:** `demo/src/components/elements/blur-transition-text.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `phrases` | `string[]` | — | Array of phrases to cycle |
| `className` | `string` | — | Additional container styling |

**Configuration constants (`BLUR_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `blurDuration` | 400 | Duration of blur out/in transition (ms) |
| `displayDuration` | 3000 | How long each phrase is displayed (ms) |

**Animation behavior:**
- Current phrase blurs out (12px blur + 0.95 scale + opacity 0)
- Next phrase blurs in (0px blur + 1.0 scale + opacity 1)
- Smooth 400ms transitions with ease-out timing
- Animation pauses when the text is scrolled out of view to avoid layout jank

**Layout stability (width constraint):**
- Measures longest phrase on mount, applies as `width` (prevents desktop jumping)
- Constrains with `maxWidth: '100%'` to prevent mobile overflow
- Desktop: fixed width ensures consistent container size across all phrases
- Mobile: text wraps naturally when width exceeds viewport

**Implementation details:**
- Uses `useRef` to track initialization and prevent re-measurement
- IntersectionObserver toggles visibility state so intervals stop when offscreen
- Single `useEffect` manages animation cycle with proper cleanup
- Hidden measurement span (`whitespace-nowrap`) sized absolutely within relative parent
- CSS `filter: blur()` and `transform: scale()` for visual effect

**Integration:** Insert within text content. Currently applied to hero headline.

```tsx
<h1>
  Your AI assistant for{' '}
  <BlurTransitionText
    phrases={[
      'policy questions.',
      'planning scenarios.',
      'credit preparation.',
      'comparing lenders.',
    ]}
  />
</h1>
```

---

## 9. CSS Classes

`globals.css` defines keyframes and utility classes:

| Class/Keyframe | Purpose |
|----------------|---------|
| `@keyframes scroll-slide-up` | Fade up 32px |
| `@keyframes scroll-slide-left` | Fade from left 32px |
| `@keyframes scroll-slide-right` | Fade from right 32px |
| `@keyframes scroll-scale-up` | Fade with 0.95 scale |
| `@keyframes gradient-border-rotate` | Rotating angle for conic gradient |
| `@keyframes orb-float` | Multi-point drifting movement for orbs |
| `@keyframes orb-pulse` | Opacity pulsing for orbs |
| `.parallax-tilt` | Base 3D transform styles |
| `.parallax-tilt-glow` | Cursor-following radial gradient overlay |
| `.magnetic-wrapper` | Base magnetic effect styles |
| `.gradient-border-wrapper` | Rotating gradient border container |
| `.gradient-border-rotating` | Conic gradient with animated angle |
| `.gradient-border-glow` | Blurred glow effect layer |
| `.floating-orb` | Animated orb with float + pulse |

---

## 10. Staggered Animation Implementation

Sections use `Children.map` to wrap each child with animation styles:

```tsx
const animatedChildren = Children.map(children, (child, index) => (
  <div
    className={clsx(
      'h-full transition-all duration-600 ease-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    )}
    style={{ transitionDelay: `${index * staggerDelay}ms` }}
  >
    {child}
  </div>
))
```

<important_note>

> **NOTE:** Animation wrappers must include `h-full` when used in CSS Grid layouts to ensure child components (like pricing cards) maintain equal heights across rows.

</important_note>

---

## 11. FAQ Spring Animation

`faqs-two-column-accordion.tsx` and `faqs-accordion.tsx` implement a spring-based "wiggle" effect on expand/collapse using CSS cubic-bezier overshoot.

**Files:**
- `globals.css` — keyframes and utility classes
- `faqs-two-column-accordion.tsx`, `faqs-accordion.tsx` — component implementation

**Spring Easing Curve:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — overshoots target then settles back

| Element | Animation | Duration | Behavior |
|---------|-----------|----------|----------|
| Plus icon | Rotate 0° → 90° + fade out | 300ms | Overshoots to ~95° then settles |
| Minus icon | Rotate -90° → 0° + fade in | 300ms | Overshoots slightly then settles |
| Content | `faq-spring-open` keyframe | 400ms | translateY: -8px → +2px → 0 with opacity |

**CSS Keyframe (`faq-spring-open`):**
```css
0%   { opacity: 0; transform: translateY(-8px); }
60%  { opacity: 1; transform: translateY(2px); }  /* overshoot */
100% { opacity: 1; transform: translateY(0); }
```

**Icon Implementation (Tailwind):**
```tsx
<PlusIcon className={clsx(
  'transition-all duration-300',
  '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
  'opacity-100 rotate-0',
  'in-aria-expanded:opacity-0 in-aria-expanded:rotate-90',
)} />
```

Content uses `.faq-spring-content` class which applies the keyframe animation on mount.

---

## 12. Glassmorphism Testimonials

`testimonials-glassmorphism.tsx::TestimonialGlass` implements a premium glass card using layered gradients, stronger blur, and a hover lift/glow.

**Visual layers by theme:**

| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `from-white/70 via-white/50 to-white/30` | `from-white/[0.08] via-white/[0.04] to-white/[0.02]` |
| Blur | `backdrop-blur-xl backdrop-saturate-150` | same |
| Border | `ring-1 ring-white/50` | `ring-1 ring-white/10` |
| Shadow | `shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]` | `shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]` |
| Hover | `-translate-y-1` + stronger glow | darker glow + gradient intensifies |

**Combined Tailwind classes:**
```tsx
<figure className={clsx(
  'bg-gradient-to-br from-white/70 via-white/50 to-white/30',
  'backdrop-blur-xl backdrop-saturate-150',
  'ring-1 ring-white/50',
  'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
  'dark:from-white/[0.08] dark:via-white/[0.04] dark:to-white/[0.02]',
  'dark:ring-white/10',
  'dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
  'transition-all duration-500 ease-out',
  'hover:-translate-y-1',
  'hover:shadow-[0_12px_28px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]',
)}>
```

**Section animation + backdrop details:**
- `TestimonialsGlassmorphism` wraps cards in staggered containers (700ms duration, 100ms delay, slight scale-in).
- A background blur layer adds two gradient orbs (`bg-mist-400/10` and `bg-mist-500/10`) for depth without competing with content.

**Design notes:**
- Gradient overlay and top highlight line simulate layered glass edges.
- Decorative gradient quote mark uses `text-7xl` with `bg-clip-text` for subtle emphasis.
- Avatar ring glow reinforces the premium feel on hover.

---

## 13. Animated Gradient Border

`gradient-border-wrapper.tsx::GradientBorderWrapper` wraps primary CTA buttons with a continuously rotating conic gradient border, creating an eye-catching focal point that draws attention to conversion elements.

**File:** `demo/src/components/elements/gradient-border-wrapper.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | — | Content to wrap (typically a button) |
| `disabled` | `boolean` | `false` | Disable the gradient effect |
| `rotationDuration` | `number` | `3000` | Full rotation duration in ms |

**Configuration constants (`GRADIENT_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `rotationDuration` | 3000 | Time for full 360° rotation (ms) |
| `borderWidth` | 2 | Border thickness in pixels |
| `borderRadius` | 9999 | Fully rounded (pill shape) |

**Implementation:**
- Outer container background uses `conic-gradient` with `var(--gradient-angle)` animation
- Padding creates the visible border effect
- Inner div with solid background (mist-100 light / mist-950 dark) reveals the border
- CSS animation `gradient-border-rotate` continuously rotates the angle
- Detects dark mode via `document.documentElement.classList.contains('dark')`

**Visual behavior:**
| State | Rotation Speed |
|-------|---------------|
| Default | 3s per rotation |
| Hover | 1.5s per rotation (2× faster) |

**Theme adaptation:**
| Theme | Gradient Colors |
|-------|----------------|
| Light mode | mist-600 → mist-500 → mist-400 → mist-700 |
| Dark mode | mist-400 → mist-300 → mist-200 → mist-500 |

**Shimmer effect:**

The component includes a periodic shimmer effect - a diagonal shine sweep that crosses the button to draw attention. Controlled via props:

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `shimmer` | `boolean` | `true` | Enable/disable shimmer |
| `shimmerInterval` | `number` | `4000` | Time between shimmer animations (ms) |

**Shimmer behavior:**
- Initial shimmer triggers 1s after mount
- Repeats every 4s by default
- 600ms sweep animation with ease-out timing
- Skewed diagonal gradient for natural light reflection
- Respects `prefers-reduced-motion`

**CSS Keyframe (`cta-shimmer-sweep`):**
```css
0%   { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
10%  { opacity: 1; }
90%  { opacity: 1; }
100% { transform: translateX(200%) skewX(-20deg); opacity: 0; }
```

**Integration:** Currently applied to hero and bottom CTA buttons.

```tsx
<GradientBorderWrapper>
  <ButtonLink href="/register">Try Bulma free</ButtonLink>
</GradientBorderWrapper>

// Disable shimmer if needed
<GradientBorderWrapper shimmer={false}>
  <ButtonLink href="/register">Try Bulma free</ButtonLink>
</GradientBorderWrapper>
```

---

## 14. Floating Orbs

`floating-orbs.tsx::FloatingOrbs` renders ambient, pulsing orbs in the hero background that gently drift and pulse, creating an atmospheric "living" effect that metaphorically represents "questions floating to answers."

**File:** `demo/src/components/elements/floating-orbs.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `count` | `number` | `7` | Number of orbs to render |
| `disabled` | `boolean` | `false` | Disable the orbs |
| `className` | `string` | — | Additional container styles |

**Configuration constants (`ORB_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `count` | 7 | Default number of orbs |
| `sizeRange` | [80, 180] | Min/max orb diameter (px) |
| `opacityRange` | [0.08, 0.15] | Min/max orb opacity |
| `durationRange` | [15, 25] | Animation cycle duration range (s) |
| `blur` | 35 | Gaussian blur radius (px) |

**Animation behavior:**
- Each orb has randomized size, position, opacity, and animation timing
- Uses seeded random generator for SSR consistency
- Combines two animations:
  - `orb-float`: Gentle drifting movement with slight scale variation
  - `orb-pulse`: Opacity pulsing (1× to 1.5× base opacity)
- Orbs fade in on mount with 1s transition

**CSS Keyframes:**
```css
@keyframes orb-float {
  0%, 100% { transform: translate(-50%, -50%) translate(0, 0) scale(1); }
  25% { transform: translate(-50%, -50%) translate(var(--orb-x-offset), calc(var(--orb-y-offset) * -0.5)) scale(1.05); }
  50% { transform: translate(-50%, -50%) translate(calc(var(--orb-x-offset) * -0.5), var(--orb-y-offset)) scale(0.95); }
  75% { transform: translate(-50%, -50%) translate(calc(var(--orb-x-offset) * 0.5), calc(var(--orb-y-offset) * -0.5)) scale(1.02); }
}
```

**Theme adaptation:**
| Theme | Orb Colors |
|-------|-----------|
| Light mode | mist-600 → mist-500 (radial gradient) |
| Dark mode | mist-400 → mist-300 (radial gradient) |

**Integration:** Currently applied inside `HeroLeftAlignedWithDemo`.

```tsx
<CursorSpotlight>
  <FloatingOrbs className="z-0" />
  <section className="relative z-10">...</section>
</CursorSpotlight>
```

---

## 15. Animated Counter

`animated-counter.tsx::AnimatedCounter` animates numbers counting up from 0 to a target value when the element scrolls into view, creating engagement and emphasizing statistical impact.

**File:** `demo/src/components/elements/animated-counter.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `value` | `number` | — | Target number to count to |
| `prefix` | `string` | `''` | Text before number (e.g., "$") |
| `suffix` | `string` | `''` | Text after number (e.g., "+", "%") |
| `duration` | `number` | `1500` | Animation duration in ms |
| `decimals` | `number` | `0` | Decimal places to display |
| `animateOnView` | `boolean` | `true` | Trigger on scroll visibility |
| `threshold` | `number` | `0.5` | IntersectionObserver threshold |

**Configuration constants (`COUNTER_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `duration` | 1500 | Default animation length (ms) |
| `easeOutQuad` | `t * (2 - t)` | Deceleration easing function |
| `frameInterval` | ~16.67 | 60fps target (ms per frame) |

**Animation behavior:**
- Uses `requestAnimationFrame` for smooth 60fps animation
- Applies ease-out quadratic easing for satisfying deceleration
- Triggers via IntersectionObserver when element is 50% visible
- Animates only once (guards against re-triggering)
- Uses `tabular-nums` font feature for stable width during counting

**Integration with StatAnimated component:**

The `StatAnimated` component in `stats-animated-graph.tsx` accepts optional `countTo` props:

```tsx
// Static stat (no animation)
<StatAnimated stat="Seconds" text="Average time to answer" />

// Animated counter
<StatAnimated countTo={30} countSuffix="+" text="Major lenders covered" />
```

| StatAnimated Prop | Type | Purpose |
|-----------|------|---------|
| `countTo` | `number` | If provided, animates from 0 to this value |
| `countPrefix` | `string` | Prefix before animated number |
| `countSuffix` | `string` | Suffix after animated number |
| `countDuration` | `number` | Animation duration (default: 1500ms) |

---

## 16. Logo Marquee

`logo-marquee.tsx::LogoMarquee` creates an infinite horizontal scrolling display of logos, commonly used for partner/lender logos to create visual movement and imply scale.

**File:** `demo/src/components/elements/logo-marquee.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | — | Logo items to display |
| `speed` | `number` | `1` | Speed multiplier (1 = normal, 2 = twice as fast) |
| `direction` | `'left' \| 'right'` | `'left'` | Scroll direction |
| `pauseOnHover` | `boolean` | `true` | Whether to pause on hover |

**Configuration constants (`MARQUEE_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `baseDuration` | 30 | Base duration for one scroll cycle (seconds) |
| `gap` | 16 | Gap between logo items (Tailwind spacing) |
| `pauseOnHover` | true | Pause animation on hover |

**Animation behavior:**
- Children are duplicated to create seamless infinite loop
- Uses CSS `translateX(-50%)` animation on duplicated content
- Edge fade gradients (via `::before`/`::after`) create smooth visual blend
- Pauses on hover for accessibility and logo inspection
- Respects `prefers-reduced-motion` (pauses animation)

**CSS Keyframes:**
```css
@keyframes marquee-scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

**Integration:**
```tsx
<LogoMarquee speed={0.8}>
  <MarqueeLogo><Image src="/logo1.svg" /></MarqueeLogo>
  <MarqueeLogo><Image src="/logo2.svg" /></MarqueeLogo>
</LogoMarquee>
```

---

## 17. Navbar Glassmorphism on Scroll

The navbar components (`navbar-with-links-actions-and-centered-logo.tsx`, `navbar-with-logo-actions-and-left-aligned-links.tsx`) implement a glassmorphism effect that activates when the user scrolls down.

**Hook:** `useScrolled(threshold = 20)` — returns `true` when `scrollY > threshold`

**Visual states:**

| State | Background | Effects |
|-------|------------|---------|
| At top (`!scrolled`) | `bg-mist-100` / `bg-mist-950` (solid) | None |
| Scrolled (`scrolled`) | `bg-mist-100/80` / `bg-mist-950/80` (semi-transparent) | `backdrop-blur-xl`, `backdrop-saturate-150`, subtle shadow |

**Transition:** `transition-all duration-300` for smooth state changes

**Implementation:**
```tsx
const scrolled = useScrolled(20)

<header className={clsx(
  'sticky top-0 z-10 transition-all duration-300',
  !scrolled && 'bg-mist-100 dark:bg-mist-950',
  scrolled && 'bg-mist-100/80 backdrop-blur-xl backdrop-saturate-150 dark:bg-mist-950/80',
  scrolled && 'shadow-sm shadow-mist-950/5 dark:shadow-black/20',
)}>
```

---

## 18. Border Beam Effect

`border-beam.tsx::BorderBeam` creates a traveling light effect around the perimeter of an element, producing a premium "scan line" effect for featured cards.

**File:** `demo/src/components/elements/border-beam.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `duration` | `number` | `8000` | Duration for one complete revolution (ms) |
| `size` | `number` | `100` | Size of the beam gradient (px) |
| `delay` | `number` | `0` | Delay before animation starts (ms) |
| `borderRadius` | `number` | `12` | Border radius to match parent element |
| `active` | `boolean` | `true` | Whether the beam is active |

**Animation behavior:**
- A single point of light continuously traces the element's border
- Uses CSS keyframe animation `border-beam` moving through four corners
- Secondary softer glow follows the primary beam for added depth
- Light/dark mode adaptive gradient colors from mist palette

**CSS Keyframe (`border-beam`):**
```css
0%   { top: 0; left: 0; }     /* top-left */
25%  { top: 0; left: 100%; }  /* top-right */
50%  { top: 100%; left: 100%; } /* bottom-right */
75%  { top: 100%; left: 0; }  /* bottom-left */
100% { top: 0; left: 0; }     /* top-left (loop) */
```

**Integration:** Currently applied to featured pricing cards via `CardSpotlight` when `featured={true}`.

```tsx
<CardSpotlight featured={true}>
  <Plan ... />
</CardSpotlight>
```

---

## 19. Animated Checkmark Icons

`animated-checkmark-icon.tsx::AnimatedCheckmarkIcon` draws itself in with a satisfying stroke animation using stroke-dasharray/dashoffset technique.

**File:** `demo/src/components/icons/animated-checkmark-icon.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `animate` | `boolean` | `false` | Whether to animate (false = static) |
| `delay` | `number` | `0` | Delay before animation starts (ms) |
| `duration` | `number` | `400` | Duration of draw animation (ms) |

**Animation behavior:**
- Measures path length on mount for accurate dash animation
- Stroke draws from start to end after specified delay
- Uses ease-out easing for satisfying deceleration at end
- Falls back to static display when `animate={false}`

**Integration with staggered pricing features:**

The `PricingMultiTier` and `PricingHeroMultiTier` components use React Context to pass visibility state and base delay to child `Plan` components. Each checkmark in the features list receives a staggered delay:

```tsx
// Inside Plan component
const checkmarkStagger = 60 // ms between each checkmark
const checkmarkBaseDelay = baseDelay + 300 // start after card fades in

{features.map((feature, index) => (
  <AnimatedCheckmarkIcon
    animate={isVisible}
    delay={checkmarkBaseDelay + index * checkmarkStagger}
    duration={350}
  />
))}
```

---

## 20. Morphing Price Transitions

The pricing toggle includes enhanced transitions when switching between Monthly/Yearly options, creating a morph-like feel.

**Files:**
- `demo/src/components/elements/morphing-price.tsx` — `MorphingPrice` component (available for advanced use)
- `demo/src/components/sections/pricing-hero-multi-tier.tsx` — Tab panel transitions
- `demo/src/app/globals.css` — CSS keyframes

**Tab panel morph animation:**
When switching tabs, the new panel slides up with a subtle fade:

```css
@keyframes pricing-panel-enter {
  0%   { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

**Digit morph animations (for advanced use):**
The `MorphingPrice` component can animate individual digits when price values change:

| Keyframe | Purpose |
|----------|---------|
| `digit-morph` | Digit slides up into position |
| `digit-slide-out` | Previous digit slides up and fades out |
| `digit-slide-in` | New digit slides up and fades in |

**CSS class `.morphing-price`:**
Applied to price elements to enable `tabular-nums` and smooth transitions.

---

## 21. Dot Matrix Background

`dot-matrix.tsx::DotMatrix` creates a subtle dot grid pattern with cursor proximity effect, where dots near the cursor brighten to create a wave that follows mouse movement.

**File:** `demo/src/components/elements/dot-matrix.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `dotSize` | `number` | `1` | Size of each dot (px) |
| `spacing` | `number` | `24` | Spacing between dots (px) |
| `baseOpacity` | `number` | `0.03` | Base dot opacity |
| `maxOpacity` | `number` | `0.15` | Maximum opacity near cursor |
| `effectRadius` | `number` | `150` | Radius of cursor effect (px) |
| `active` | `boolean` | `true` | Whether effect is active |

**Animation behavior:**
- Uses Canvas for performance with many dots
- Tracks mouse position relative to container
- Applies easeOutQuad falloff for smooth opacity transition
- Dark mode adaptive: white dots on dark, black dots on light
- 60fps animation loop via requestAnimationFrame

**Performance considerations:**
- Canvas scales for retina displays via devicePixelRatio
- Animation stops when component unmounts
- ResizeObserver handles dimension changes

**Integration:** Currently applied to `StatsAnimatedGraph` section.

```tsx
<Section className="relative isolate">
  <DotMatrix
    className="-z-10"
    spacing={28}
    baseOpacity={0.025}
    maxOpacity={0.12}
    effectRadius={180}
  />
  {/* Section content */}
</Section>
```

---

## 22. Table Row Highlight

The Plan Comparison Table features enhanced row and cell hover states for improved usability and visual polish.

**File:** `demo/src/components/sections/plan-comparison-table.tsx`

**Row highlight behavior:**
| Element | Hover Effect |
|---------|-------------|
| Table row (`<tr>`) | Subtle background tint (`bg-mist-950/[0.02]`) |
| Row label (`<th>`) | Text color intensifies to primary |
| Cell (`<td>`) | Gradient overlay fades in from top |

**Implementation:**
```tsx
<tr className={clsx(
  'group',
  'transition-colors duration-200',
  'hover:bg-mist-950/[0.02] dark:hover:bg-white/[0.02]',
)}>
  <th className="... group-hover:text-mist-950 dark:group-hover:text-white">
    {feature.name}
  </th>
  <td className={clsx(
    '...',
    'before:bg-gradient-to-b before:from-mist-500/5 before:to-transparent',
    'hover:before:opacity-100',
  )}>
    {value}
  </td>
</tr>
```

**Design notes:**
- Uses CSS `group` utility for coordinated hover effects
- Row background creates cross-column visual continuity
- Cell gradient overlay provides vertical column emphasis
- 200ms transition duration for responsive feel

---

## 23. Screenshot Reflection Effect

`screenshot.tsx::Screenshot` can display a blurred, faded reflection below screenshots, simulating a polished glass surface.

**File:** `demo/src/components/elements/screenshot.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `enableReflection` | `boolean` | `false` | Enable polished surface reflection effect |

**CSS class:** `.screenshot-reflection` (in `globals.css`)

**Visual behavior:**
- Pseudo-element positioned below the screenshot (30% height)
- Uses gradient mask that fades from 40% opacity to transparent
- Blur filter (8px) creates frosted effect
- Scales vertically to 50% for compressed reflection look
- Enhanced opacity on hover (0.6 → 0.8)

**Theme adaptation:**
| Theme | Reflection Color |
|-------|-----------------|
| Light mode | `rgba(0, 0, 0, 0.04)` — subtle dark shadow |
| Dark mode | `rgba(255, 255, 255, 0.03)` — subtle light reflection |

**Integration:** Currently enabled on hero screenshots.

```tsx
<Screenshot wallpaper="blue" placement="bottom" enableReflection>
  <Image src="/screenshot.webp" ... />
</Screenshot>
```

**To disable:** Remove `enableReflection` prop or set to `false`.

---

## 24. Elastic Pricing Toggle

`pricing-hero-multi-tier.tsx::ElasticTabToggle` implements a sliding pill indicator with spring physics animation.

**File:** `demo/src/components/sections/pricing-hero-multi-tier.tsx`

**Animation behavior:**
- Pill indicator slides between tab positions
- Uses spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)` for overshoot effect
- ~8% overshoot past target, then settles back
- 400ms transition duration when animating, 300ms for normal repositioning

**CSS class:** `.pricing-toggle-pill` (in `globals.css`)

**Implementation:**
```tsx
<ElasticTabToggle
  options={['Monthly', 'Yearly']}
  selectedIndex={selectedIndex}
  onSelect={handleSelect}
/>
```

**Visual states:**
| State | Easing | Duration |
|-------|--------|----------|
| Animating (just clicked) | Spring with overshoot | 400ms |
| Repositioning | Ease-out | 300ms |

**To disable:** Replace `ElasticTabToggle` with standard tab buttons.

---

## 25. Section Reveal Horizon Line

Animated horizontal accent lines that draw inward from both edges when a section enters the viewport.

**CSS class:** `.section-horizon` (in `globals.css`)

**Animation behavior:**
- Two lines animate from left and right edges toward center
- Each line spans 35% of container width
- Uses `scaleX(0)` → `scaleX(1)` with `transform-origin` at edges
- 800ms duration with ease-out easing
- Right line staggers 100ms after left

**Usage:**
```tsx
<div
  data-visible={isVisible}
  className={clsx(enableHorizon && 'section-horizon')}
>
  {/* Section content */}
</div>
```

**Theme adaptation:**
| Theme | Gradient Colors |
|-------|----------------|
| Light mode | transparent → mist-500 → mist-400 |
| Dark mode | transparent → mist-400 → mist-300 |

**Currently applied to:**
- `FeaturesTwoColumnWithDemos` (prop: `enableHorizon`, default: `true`)

**To disable:** Set `enableHorizon={false}` on the section component.

---

## 26. Testimonial Avatar Presence Ring

Slow-pulsing concentric ring on testimonial avatar hover that creates a "live presence" indicator effect.

**CSS class:** `.avatar-presence` (in `globals.css`)

**Animation behavior:**
- Ring pulses from 100% to 115% scale
- Opacity fades from 0.4 to 0 during pulse
- 2.5s animation cycle, infinite loop
- Animation pauses when not hovering (via `animation-play-state`)
- Activates on parent `.group:hover`

**CSS Keyframe (`presence-pulse`):**
```css
0%   { transform: scale(1); opacity: 0.4; }
50%  { transform: scale(1.15); opacity: 0; }
100% { transform: scale(1); opacity: 0; }
```

**Theme adaptation:**
| Theme | Ring Color |
|-------|-----------|
| Light mode | mist-500 |
| Dark mode | mist-400 |

**Integration:** Applied to `TestimonialGlass` avatar wrapper.

```tsx
<div className="avatar-presence relative ...">
  <div className="size-full">{img}</div>
</div>
```

**To disable:** Remove `avatar-presence` class from the avatar wrapper.

---

## 27. Card Entrance Depth Stack

Ghost shadow card that appears behind cards during entrance animation, creating a "pulled from deck" sensation.

**CSS class:** `.card-depth-stack` (in `globals.css`)

**Animation behavior:**
- Ghost card starts offset by 4px right, 6px down, scaled to 98%
- Fades from 25% opacity to 0 over 700ms
- Uses ease-out easing for natural settling
- Triggered via `data-animating="true"` attribute

**CSS Keyframe (`depth-stack-fade`):**
```css
0%   { opacity: 0.25; transform: translate(4px, 6px) scale(0.98); }
100% { opacity: 0; transform: translate(0, 0) scale(1); }
```

**Theme adaptation:**
| Theme | Ghost Card Color |
|-------|-----------------|
| Light mode | mist-800 at 8% opacity |
| Dark mode | mist-200 at 6% opacity |

**Currently applied to:**
- `PricingMultiTier` plan cards (home page)
- `PricingHeroMultiTier` plan cards (pricing page)
- `TestimonialsGlassmorphism` testimonial cards

**Integration:**
```tsx
<div
  data-animating={isVisible}
  className="card-depth-stack rounded-xl ..."
>
  {child}
</div>
```

**To disable:** Remove `card-depth-stack` class and `data-animating` attribute from the card wrapper.

---

## 29. Page Route Transitions

`page-transition.tsx::PageTransition` and `main.tsx::Main` provide smooth entrance animations for page content, creating a polished transition feel when navigating between routes.

**Files:**
- `demo/src/components/elements/page-transition.tsx` — Standalone wrapper component
- `demo/src/components/elements/main.tsx` — Main wrapper with built-in transition
- `demo/src/app/globals.css` — CSS keyframes

**Animation behavior:**
- Content fades in from 0 to full opacity
- Subtle slide up from 16px offset
- 500ms duration with smooth ease-out timing
- Triggers automatically on page mount

**CSS Keyframe (`page-enter`):**
```css
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Configuration:**

| Setting | Value | Effect |
|---------|-------|--------|
| Duration | 500ms | Animation length |
| Easing | cubic-bezier(0.22, 1, 0.36, 1) | Smooth ease-out |
| Slide distance | 16px | Vertical translation |

**Integration via Main component (automatic):**

The `Main` component in `layout.tsx` automatically applies page transitions to all page content.

```tsx
// In layout.tsx - transitions enabled by default
<Main>{children}</Main>

// To disable for a specific layout
<Main enableTransition={false}>{children}</Main>
```

**Integration via PageTransition wrapper (manual):**

```tsx
import { PageTransition } from '@/components/elements/page-transition'

export default function Page() {
  return (
    <PageTransition>
      <HeroSection />
      <ContentSection />
    </PageTransition>
  )
}
```

**To disable:**
- Set `enableTransition={false}` on the `Main` component, or
- Remove the `page-transition-enter` class from the wrapper element

---

## 30. Micro-Animated Icons

CSS classes and wrapper components that add subtle hover animations to SVG icons, making the interface feel more responsive and alive.

**Files:**
- `demo/src/components/elements/animated-icon.tsx` — Reusable wrapper component
- `demo/src/components/sections/footer-with-newsletter-form-categories-and-social-icons.tsx` — SocialLink with built-in animation
- `demo/src/app/globals.css` — CSS keyframes and animation classes

**Available animation types:**

| Type | Effect | Best For | Duration |
|------|--------|----------|----------|
| `wiggle` | Rotation back and forth (±8°) | Notification, settings, warning icons | 400ms |
| `pulse` | Gentle scale pulse (1× → 1.15×) | Heart, star, favorite icons | 500ms |
| `bounce` | Vertical bounce with squash | Arrow, navigation, action icons | 500ms |
| `float` | Gentle up-down drift (-3px) | Cloud, mail, document icons | 600ms (infinite) |
| `spin` | Single full rotation | Settings, refresh, loading icons | 500ms |
| `sparkle` | Scale + brightness pulse | Sparkles, star, magic icons | 600ms |

**Animation behavior:**
- Animations trigger on direct element hover
- Also trigger when parent with `.group` class is hovered
- Uses CSS animations for consistent performance
- Non-infinite animations play once per hover

**CSS classes:**

```css
/* Base class for animated icons */
.icon-animated { ... }

/* Animation variants */
.icon-wiggle:hover,
.group:hover .icon-wiggle { animation: icon-wiggle 0.4s ease-in-out; }

.icon-pulse:hover,
.group:hover .icon-pulse { animation: icon-pulse 0.5s ease-out; }

.icon-bounce:hover,
.group:hover .icon-bounce { animation: icon-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }

.icon-float:hover,
.group:hover .icon-float { animation: icon-float 0.6s ease-in-out infinite; }

.icon-spin:hover,
.group:hover .icon-spin { animation: icon-spin 0.5s cubic-bezier(0.22, 1, 0.36, 1); }

.icon-sparkle:hover,
.group:hover .icon-sparkle { animation: icon-sparkle 0.6s ease-in-out; }
```

**Integration via AnimatedIcon wrapper:**

```tsx
import { AnimatedIcon } from '@/components/elements/animated-icon'
import { HeartIcon } from '@/components/icons/heart-icon'

// Direct hover animation
<AnimatedIcon animation="pulse">
  <HeartIcon className="size-5" />
</AnimatedIcon>

// Parent group hover animation
<button className="group">
  <AnimatedIcon animation="bounce">
    <ArrowRightIcon className="size-4" />
  </AnimatedIcon>
  Continue
</button>
```

**Integration via SocialLink (footer icons):**

```tsx
import { SocialLink } from '@/components/sections/footer-with-newsletter-form-categories-and-social-icons'
import { XIcon } from '@/components/icons/social/x-icon'

// Default pulse animation
<SocialLink href="https://x.com/bulma" name="X">
  <XIcon />
</SocialLink>

// Custom animation type
<SocialLink href="..." name="..." iconAnimation="wiggle">
  <BellIcon />
</SocialLink>

// Disable animation
<SocialLink href="..." name="..." iconAnimation={undefined}>
  <LinkIcon />
</SocialLink>
```

**Integration via direct CSS classes:**

```tsx
// Apply class directly to icon or wrapper
<span className="icon-pulse">
  <HeartIcon className="size-5" />
</span>

// With group hover
<button className="group">
  <CogIcon className="icon-spin size-4" />
  Settings
</button>
```

**To disable:**
- Remove the `AnimatedIcon` wrapper, or
- Set `animation={undefined}` on AnimatedIcon, or
- Remove the `icon-*` class from the element, or
- Remove the `group` class from the parent element

---

## 31. Points of Error

- **Missing `h-full`**: Grid children wrapped for animation lose equal-height alignment without `h-full` on both wrapper and inner component (see `pricing-multi-tier.tsx::Plan`)
- **Server-side rendering**: Hook initializes `isVisible` to `false`, so elements start hidden. This is intentional—elements animate in on scroll
- **Multiple observers**: Each section creates its own IntersectionObserver instance. For pages with many animated sections, consider a shared observer context if performance degrades
- **Tilt on touch devices**: Parallax tilt uses mouse events only; touch devices see no effect (acceptable degradation)
- **CSS transition conflicts**: Plan components have their own hover transitions; ensure animation wrapper transitions don't override using specific properties rather than `transition-all` if conflicts arise
- **Magnetic on touch**: Magnetic wrapper uses mouse events only; touch devices see no magnetic effect (acceptable degradation)
- **BlurTransitionText width calculation**: Component measures phrase widths on mount; uses `width` + `maxWidth: '100%'` to prevent desktop jumping while avoiding mobile overflow. Container shows `auto` width until measurement completes.
- **Gradient border browser support**: `@property` (CSS Houdini) required for smooth gradient angle animation; older browsers may show static gradient. Dark mode detection uses MutationObserver on `html.dark` class.
- **CTA shimmer timing**: Shimmer uses JS class toggle with `offsetWidth` reflow to restart animation. If multiple CTAs are visible, they shimmer in sync (by design). Disable with `shimmer={false}` prop if unwanted.
- **Floating orbs visibility**: Opacity range [0.08–0.15] and size range [80–180px] calibrated for visible but subtle effect. Reduce blur if GPU performance is impacted.
- **Animated counter precision**: For large numbers or many decimal places, floating-point rounding may cause minor visual jitter near end of animation
- **Logo marquee with few items**: If fewer than ~4-5 logos are provided, the marquee may have visible gaps during the seamless loop. Add more logos or reduce speed to compensate.
- **Navbar glassmorphism on Safari**: `backdrop-blur` may have performance implications on older iOS Safari versions. Effect degrades gracefully to solid background.
- **Border beam on touch devices**: Border beam uses CSS animation only; works on all devices but may impact battery on mobile. Consider disabling on touch devices for extended sessions.
- **Animated checkmark path length**: Path length measurement occurs on mount. If SVG is hidden initially, measurement may fail. Ensure parent is mounted before animating.
- **Dot matrix canvas performance**: Canvas redraws at 60fps when active. On low-end devices with many dots, may cause jank. Increase `spacing` or reduce `effectRadius` to mitigate.
- **Dot matrix dark mode detection**: Uses `document.documentElement.classList.contains('dark')` which runs on every frame. If dark mode toggle doesn't use this class, dots won't adapt.
- **Table row highlight z-index**: Cell `::before` pseudo-element requires `position: relative` on parent. If table cells have positioned children, may need z-index adjustment.
- **Screenshot reflection overflow**: Reflection pseudo-element extends 30% below the screenshot. Ensure parent container has sufficient padding-bottom or `overflow: visible` to accommodate.
- **Elastic toggle initial position**: Pill position is calculated via `getBoundingClientRect` on mount. If the toggle is rendered off-screen initially, pill may misposition until first interaction.
- **Section horizon line visibility**: Lines use `scaleX(0)` to hide initially. If parent has `overflow: hidden`, ensure the horizon wrapper itself doesn't clip the lines.
- **Avatar presence ring z-index**: Ring uses `::before` pseudo-element with `inset: -4px`. If avatar has sibling elements, ring may appear behind them. Add `z-index` if needed.
- **Card depth stack border-radius**: Ghost card inherits `border-radius` from parent. Ensure wrapper div has matching `rounded-*` class to avoid visible corners on the ghost.
- **Page transition double animation**: If using both `Main` with `enableTransition={true}` (default) and a manual `PageTransition` wrapper, the animation will apply twice. Use only one method.
- **Page transition with hero animations**: Page transition (500ms) runs concurrently with hero entrance animations (600ms with delays). This is intentional—the page fades in while hero elements stagger. If timing feels off, adjust `hero-delay-*` values.
- **Icon animation replay**: Icon animations play once per hover and reset when cursor leaves. Rapid hover in/out may cause animation to restart mid-play. This is expected CSS behavior.
- **Icon animation on touch**: Touch devices don't trigger hover states, so icon animations won't play on tap. Consider adding `:active` variants if touch feedback is desired.
- **SocialLink children sizing**: The `SocialLink` component wraps children in a `size-6` span. Ensure child icons don't have conflicting size classes that override this.

---

## 32. Prismatic Grid Entrances (Rec A)

Cards enter from different directions based on grid position with subtle color temperature shift, creating an organic "dealing from deck" sensation.

**Files:**
- `demo/src/app/globals.css` — Keyframes and prismatic-enter classes
- `demo/src/components/sections/testimonials-glassmorphism.tsx` — Applied to testimonial cards

**Animation behavior:**
- Corner cards enter diagonally (top-left, top-right, bottom-left, bottom-right)
- Edge cards enter horizontally or vertically
- Center cards scale in from center
- Subtle hue shift (±8°) during entrance that settles to neutral
- 700ms duration with smooth ease-out timing

**Position-based directions (3-column grid):**

| Position | Direction | Hue Shift |
|----------|-----------|-----------|
| 0 (top-left) | Diagonal from top-left | -8° |
| 1 (top-center) | Slide up | 0° |
| 2 (top-right) | Diagonal from top-right | +8° |
| 3 (middle-left) | Slide from left | -5° |
| 4 (center) | Scale up | 0° |
| 5 (middle-right) | Slide from right | +5° |
| 6 (bottom-left) | Diagonal from bottom-left | -8° |
| 7 (bottom-center) | Slide up | 0° |
| 8 (bottom-right) | Diagonal from bottom-right | +8° |

**Integration:**
```tsx
<div
  data-visible={isVisible}
  data-position={index}
  className="prismatic-enter"
  style={{ animationDelay: `${delay}ms` }}
>
  {child}
</div>
```

**To disable:** Remove `prismatic-enter` class and `data-position` attribute; use standard transition classes instead.

---

## 33. Pricing Card Focus Isolation (Rec B)

Cinema-style focus pull where hovering one pricing card dims others, creating decisive attention direction.

**Files:**
- `demo/src/app/globals.css` — Focus group and focus card classes
- `demo/src/components/sections/pricing-multi-tier.tsx` — Applied to home page pricing grid
- `demo/src/components/sections/pricing-hero-multi-tier.tsx` — Applied to pricing page grid

**Animation behavior:**
- Parent container uses `pricing-focus-group` class
- Each card uses `pricing-focus-card` class
- When any card is hovered, siblings are dimmed (70% opacity, 70% saturation)
- Hovered card gains subtle glow halo effect
- 400ms transition for smooth focus shift

**Visual states:**

| State | Opacity | Saturation | Brightness | Shadow |
|-------|---------|------------|------------|--------|
| Default | 1 | 1 | 1 | None |
| Sibling hovered | 0.7 | 0.7 | 0.95 | None |
| Self hovered | 1 | 1 | 1 | Glow halo |

**Integration:**
```tsx
<div className="pricing-focus-group grid ...">
  <div className="pricing-focus-card">
    <Plan ... />
  </div>
</div>
```

**To disable:** Remove `pricing-focus-group` from parent and `pricing-focus-card` from children.

---

## 34. Magnetic Ripple on CTA Entry (Rec C)

Radial ripple emanating from CTA buttons when cursor enters the magnetic field, providing anticipation feedback.

**Files:**
- `demo/src/app/globals.css` — Ripple keyframes and classes
- `demo/src/components/elements/magnetic-wrapper.tsx` — Ripple integration

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `enableRipple` | `boolean` | `true` | Enable/disable ripple effect |

**Animation behavior:**
- Ripple triggers when cursor enters magnetic field (before touching button)
- Single pulse at 40% opacity radiating outward
- 500ms duration, fires once per entry
- Resets when cursor leaves element

**CSS Keyframe (`magnetic-ripple`):**
```css
@keyframes magnetic-ripple {
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}
```

**Integration:**
```tsx
<MagneticWrapper enableRipple={true}>
  <Button>Click me</Button>
</MagneticWrapper>

// To disable ripple only
<MagneticWrapper enableRipple={false}>
  <Button>No ripple</Button>
</MagneticWrapper>
```

**To disable:** Set `enableRipple={false}` prop on MagneticWrapper.

---

## 35. Progressive Screenshot Reveal (Rec D)

Gradient wipe that "materializes" screenshots from left to right with glowing leading edge.

**Files:**
- `demo/src/app/globals.css` — Reveal keyframes and classes
- `demo/src/components/elements/screenshot.tsx` — Reveal integration

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `enableReveal` | `boolean` | `false` | Enable progressive reveal animation |

**Animation behavior:**
- Screenshot starts hidden via clip-path
- Reveals from left to right using animated clip-path
- Glowing leading edge travels with reveal
- 800ms duration, triggers on scroll visibility
- Tilt effect activates after reveal completes

**CSS Keyframe (`screenshot-reveal`):**
```css
@keyframes screenshot-reveal {
  0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
  100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
}
```

**Integration:**
```tsx
<Screenshot
  wallpaper="blue"
  placement="bottom"
  enableReveal={true}
>
  <Image src="/screenshot.webp" ... />
</Screenshot>
```

**To disable:** Omit `enableReveal` prop or set to `false`.

---

## 36. Animated Section Dividers (Rec E)

Horizontal lines that draw from center outward with traveling light pulse, creating visual rhythm between sections.

**Files:**
- `demo/src/app/globals.css` — Divider keyframes and classes
- `demo/src/components/elements/section-divider.tsx` — Divider component

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `enablePulse` | `boolean` | `true` | Enable light pulse after line draws |
| `className` | `string` | — | Additional styling classes |

**Animation behavior:**
- Lines draw from center outward (left and right simultaneously)
- 600ms draw duration with slight stagger
- Optional light pulse travels along line after drawing
- Pulse travels both directions from center

**Integration:**
```tsx
import { SectionDivider } from '@/components/elements/section-divider'

// Between sections
<HeroSection />
<SectionDivider />
<FeaturesSection />

// Without pulse
<SectionDivider enablePulse={false} />
```

**To disable:** Remove the `SectionDivider` component from the page composition.

---

## 37. Navbar Scroll Glow (Rec 6)

Animated gradient glow line along navbar bottom edge when scrolled, adding life to glassmorphism state.

**Files:**
- `demo/src/app/globals.css` — Glow keyframes and classes
- `demo/src/components/sections/navbar-with-logo-actions-and-left-aligned-links.tsx` — Glow integration

**Animation behavior:**
- Glow line appears when navbar is scrolled (glassmorphism state)
- 2px height with animated gradient that shifts colors over 6s cycle
- 25% opacity for subtle ambient effect
- Fades in/out with 300ms transition

**CSS Keyframe (`navbar-glow-shift`):**
```css
@keyframes navbar-glow-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

**Integration:** Automatic when `navbar-scrolled` class is applied (via scroll detection).

**To disable:** Remove the `.navbar-glow` div element from the navbar component.

---

## 38. Testimonial Quote Mark Float (Rec 7)

Slow floating animation for decorative quote marks, adding organic breathing life to testimonial cards.

**Files:**
- `demo/src/app/globals.css` — Float keyframe
- `demo/src/components/sections/testimonials-glassmorphism.tsx` — Applied to quote marks

**Animation behavior:**
- Quote mark floats up 4px and down over 8s cycle
- Pauses when card is hovered (for focus)
- Increases opacity slightly on hover
- Uses sinusoidal easing for natural movement

**CSS Keyframe (`quote-float`):**
```css
@keyframes quote-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
```

**Integration:**
```tsx
<div className="quote-float">
  "
</div>
```

**To disable:** Remove `quote-float` class from the quote mark element.

---

## 39. Stats Graph Data Pulse (Rec 8)

Traveling dots along graph line suggesting live data activity.

**Files:**
- `demo/src/app/globals.css` — Pulse keyframes and classes
- `demo/src/components/sections/stats-animated-graph.tsx` — Pulse integration

**Animation behavior:**
- Small glowing dots travel along graph path
- Uses CSS `offset-path` for path-following animation
- 4s full path traversal, infinite loop
- Two pulses staggered 2s apart
- Starts after graph draw animation completes

**CSS Keyframe (`data-pulse-travel`):**
```css
@keyframes data-pulse-travel {
  0% { offset-distance: 0%; opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}
```

**Integration:** Automatic in StatsAnimatedGraph component when `isVisible` is true.

**To disable:** Remove the data pulse div elements from the stats component.

---

## 40. FAQ Accordion Glow Trail (Rec 9)

Glow effect that follows the expanding content edge when FAQ items open.

**Files:**
- `demo/src/app/globals.css` — Glow trail keyframes and classes
- `demo/src/components/sections/faqs-two-column-accordion.tsx` — Glow integration

**Animation behavior:**
- 2px glow line appears at bottom of expanding content
- Animates from full opacity to fade-out over 600ms
- Uses gradient with center emphasis
- Triggers when FAQ item opens

**CSS Keyframe (`faq-glow-trail`):**
```css
@keyframes faq-glow-trail {
  0% { opacity: 0.8; height: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; height: 100%; }
}
```

**Integration:**
```tsx
<div data-open={isOpen} className="faq-glow-trail">
  <ElDisclosure>{content}</ElDisclosure>
</div>
```

**To disable:** Remove `faq-glow-trail` class from the wrapper element.

---

## 41. Scroll-Velocity Responsive Elements (Rec 10)

Global scroll velocity tracking that influences animation timing and visual intensity.

**Files:**
- `demo/src/hooks/use-scroll-velocity.ts` — Velocity tracking hook
- `demo/src/app/globals.css` — CSS custom properties and velocity-responsive classes

**Hook return values:**

| Property | Type | Description |
|----------|------|-------------|
| `velocity` | `number` | Current scroll velocity in px/s |
| `intensity` | `'stopped' \| 'slow' \| 'normal' \| 'fast'` | Scroll intensity level |
| `intensityMultiplier` | `number` | 1 = normal, >1 = fast, <1 = slow |

**CSS custom properties (set on :root):**
- `--scroll-velocity`: Current velocity in px/s
- `--scroll-intensity`: Multiplier (0.7–1.5)

**Velocity thresholds:**

| Level | Velocity Range | Multiplier |
|-------|----------------|------------|
| Stopped | < 10 px/s | 0.7 |
| Slow | 10–200 px/s | 0.7–1.0 |
| Normal | 200–800 px/s | 1.0 |
| Fast | > 800 px/s | 1.0–1.5 |

**Integration:**
```tsx
import { useScrollVelocity } from '@/hooks/use-scroll-velocity'

function Page() {
  // Hook sets CSS custom properties automatically
  useScrollVelocity()

  return (
    <div className="velocity-responsive">
      {/* Animation duration scales with scroll velocity */}
    </div>
  )
}
```

**CSS usage:**
```css
.velocity-responsive {
  transition-duration: calc(0.6s / var(--scroll-intensity, 1));
}
```

**To disable:** Don't call the `useScrollVelocity` hook, or don't apply velocity-responsive classes.

---

## 42. Premium Effects Points of Error

- **Prismatic entrance filter conflict**: The hue-rotate filter may conflict with other filters on the element. If using multiple filters, combine them carefully.
- **Focus isolation on touch**: The focus isolation effect relies on hover states; touch devices won't see the dimming effect.
- **Magnetic ripple z-index**: The ripple element uses `pointer-events: none` but may appear above other absolutely positioned elements. Adjust z-index if needed.
- **Screenshot reveal clip-path**: Clip-path animations may not work in older browsers. Falls back to instant reveal.
- **Section divider pulse visibility**: The light pulse is 30px wide and very brief. On very narrow viewports, it may be barely visible.
- **Navbar glow GPU impact**: The animated gradient glow uses continuous animation. On low-end devices, may impact scrolling performance.
- **Quote float pausing**: Animation pauses via `animation-play-state`, which may cause a slight visual jump on hover.
- **Data pulse offset-path support**: The `offset-path` property has limited browser support. Falls back to no animation in unsupported browsers.
- **FAQ glow trail timing**: The glow effect is brief (600ms). If content takes longer to expand, the glow may complete before content is fully visible.
- **Scroll velocity sampling**: Velocity is sampled at ~50ms intervals with exponential smoothing. Rapid direction changes may not register accurately.

---

## 43. Aurora Hero Background (New - Premium Effect A)

`aurora-background.tsx::AuroraBackground` renders ambient, morphing gradient layers that create an organic, living atmosphere in the hero section.

**File:** `demo/src/components/elements/aurora-background.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `className` | `string` | — | Additional container styles |
| `disabled` | `boolean` | `false` | Disable the aurora effect |

**Animation behavior:**
- Three gradient layers at different blend modes (normal, soft-light, screen)
- Each layer drifts on a different cycle (22s, 28s, 35s) for organic movement
- Layers shift position, scale, and rotation for natural aurora effect
- Uses 80px Gaussian blur for soft, ambient appearance
- Fades in on mount with 1s transition
- Pauses CSS animation when scrolled off-screen for performance

**CSS Keyframes:**
- `aurora-drift-1`: 35s cycle, primary gradient movement
- `aurora-drift-2`: 28s cycle, secondary gradient with animation-delay stagger
- `aurora-drift-3`: 22s cycle, accent highlight layer

**Theme adaptation:**
| Theme | Visual Effect |
|-------|--------------|
| Light mode | Cooler, more subtle gradients |
| Dark mode | Brighter, more vibrant auroras |

**Integration:** Currently applied inside `HeroLeftAlignedWithDemo` when `enableAurora={true}` (default).

```tsx
// Enabled by default
<HeroLeftAlignedWithDemo
  headline={...}
  demo={...}
/>

// To disable
<HeroLeftAlignedWithDemo
  enableAurora={false}
  headline={...}
  demo={...}
/>

// Standalone usage
<div className="relative">
  <AuroraBackground />
  <Content />
</div>
```

**To disable:** Set `enableAurora={false}` on `HeroLeftAlignedWithDemo`, or set `disabled={true}` on `AuroraBackground` directly.

---

## 44. Luminance Sweep Headlines (New - Premium Effect B)

`luminance-sweep.tsx::LuminanceSweep` creates a metallic sheen that sweeps across headlines when they enter the viewport, creating a premium "light catching metal" reveal effect.

**File:** `demo/src/components/elements/luminance-sweep.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `children` | `ReactNode` | — | Content to apply sweep to |
| `text` | `string` | — | Text for sweep overlay (must match children) |
| `className` | `string` | — | Additional wrapper styles |
| `disabled` | `boolean` | `false` | Disable the sweep effect |
| `delay` | `number` | `200` | Delay before triggering sweep (ms) |

**Animation behavior:**
- Single 800ms sweep triggered once via IntersectionObserver
- Diagonal gradient sweep (105deg angle) creates metallic sheen
- Uses `background-clip: text` with pseudo-element overlay
- Non-destructive: original text remains visible throughout
- Sweep overlay fades out after animation completes

**CSS Keyframe (`luminance-sweep`):**
```css
0%   { background-position: -100% center; }
100% { background-position: 200% center; }
```

**Theme adaptation:**
| Theme | Sheen Color |
|-------|-------------|
| Light mode | Subtle white/silver gradient |
| Dark mode | Brighter, more pronounced sheen |

**Integration:** Currently applied to hero headline on home page.

```tsx
// Wrap any heading with luminance sweep
<LuminanceSweep text="Your headline text here">
  <Heading>Your headline text here</Heading>
</LuminanceSweep>

// With custom delay
<LuminanceSweep text="Section Title" delay={400}>
  <h2>Section Title</h2>
</LuminanceSweep>

// Disabled
<LuminanceSweep text="..." disabled>
  <Heading>...</Heading>
</LuminanceSweep>
```

**To disable:** Set `disabled={true}` on `LuminanceSweep`, or remove the wrapper entirely.

---

## 45. Hero Depth Parallax (New - Premium Effect C)

`use-hero-parallax.ts::useHeroParallax` provides multi-layer scroll parallax where different hero elements move at different speeds as user scrolls, creating depth perception.

**File:** `demo/src/hooks/use-hero-parallax.ts`

**Hook return values:**

| Property | Type | Description |
|----------|------|-------------|
| `containerRef` | `RefObject<HTMLDivElement>` | Ref for parallax container |
| `scrollY` | `number` | Current scroll offset in pixels |
| `isScrolling` | `boolean` | Whether user is actively scrolling |
| `isEnabled` | `boolean` | Whether device supports parallax (non-touch) |

**Configuration (`PARALLAX_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `maxScrollDistance` | 800 | Maximum scroll distance for parallax (px) |
| `throttleDelay` | 16 | RAF throttle (~60fps) |
| `scrollEndDelay` | 150 | Delay before removing will-change (ms) |

**Speed factors (CSS custom property `--parallax-speed`):**

| Element | Speed | Effect |
|---------|-------|--------|
| Background/Aurora | 0.5 | Moves slowest (furthest) |
| Screenshot | 0.7 | Moves slower (distant) |
| Headline | 1.0 | Baseline (normal scroll) |
| CTA Button | 1.1 | Moves faster (closest) |

**CSS classes:**
- `.hero-parallax`: Container class, sets `--scroll-y` custom property
- `.hero-parallax-element`: Individual parallax elements
- `.hero-parallax-bg`: Speed 0.5 (background)
- `.hero-parallax-screenshot`: Speed 0.7 (screenshots)
- `.hero-parallax-headline`: Speed 1.0 (text)
- `.hero-parallax-cta`: Speed 1.1 (buttons)

**Animation behavior:**
- CSS custom property `--scroll-y` updated on scroll via JS
- Transform calculated: `translateY(scrollY * (1 - speed))`
- `will-change: transform` applied only during active scroll
- Automatically disabled on touch devices
- Respects `prefers-reduced-motion`

**Integration:** Currently applied inside `HeroLeftAlignedWithDemo` when `enableParallax={true}` (default).

```tsx
// Enabled by default
<HeroLeftAlignedWithDemo
  headline={...}
  demo={...}
/>

// To disable
<HeroLeftAlignedWithDemo
  enableParallax={false}
  headline={...}
  demo={...}
/>

// Manual usage with hook
function CustomHero() {
  const { containerRef, isScrolling } = useHeroParallax()

  return (
    <section
      ref={containerRef}
      className="hero-parallax"
      data-scrolling={isScrolling}
    >
      <div className="hero-parallax-element hero-parallax-screenshot">
        <Screenshot />
      </div>
    </section>
  )
}
```

**To disable:** Set `enableParallax={false}` on `HeroLeftAlignedWithDemo`, or don't apply the `hero-parallax` classes.

---

## 46. Premium Effects A/B/C Points of Error

- **Aurora GPU impact**: Three animated gradient layers with blur may impact performance on low-end devices. Layers pause when off-screen to mitigate.
- **Aurora layer visibility**: At high browser zoom levels, aurora layers may become more visible than intended. Opacity is calibrated for 100% zoom.
- **Luminance sweep text mismatch**: The `text` prop must exactly match the rendered text for the sweep overlay to align correctly. Dynamic text may cause misalignment.
- **Luminance sweep with children changes**: If children re-render with different text after initial mount, the sweep overlay will not update.
- **Parallax on touch**: Parallax is automatically disabled on touch devices via `(hover: hover)` media query. This is intentional for mobile UX.
- **Parallax with sticky elements**: If hero contains sticky positioned children, parallax transforms may conflict. Avoid mixing sticky and parallax on same elements.
- **Parallax max scroll distance**: Beyond 800px scroll, parallax effect caps out. This prevents excessive translation on long pages.
- **Combined effects performance**: Running aurora + parallax + cursor spotlight simultaneously is tested but may impact low-end devices. Disable individual effects via props if needed.
