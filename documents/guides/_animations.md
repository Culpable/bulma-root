# Animations & Parallax Tilt System

## 1. Overview

The animation system provides scroll-triggered entrance animations for page sections and a 3D parallax tilt effect for screenshots. Animations use CSS transitions controlled by React state via IntersectionObserver, with no external animation libraries required.

---

## 2. File Structure

```
demo/src/
├── hooks/
│   └── use-scroll-animation.ts          # Reusable IntersectionObserver hook
├── app/
│   └── globals.css                       # CSS keyframes and utility classes
└── components/
    ├── elements/
    │   ├── animated-counter.tsx          # Scroll-triggered number counting
    │   ├── cursor-spotlight.tsx          # Cursor-following ambient glow
    │   ├── floating-orbs.tsx             # Ambient drifting background orbs
    │   ├── gradient-border-wrapper.tsx   # Rotating gradient CTA border
    │   ├── logo-marquee.tsx              # Infinite scrolling logo display
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

## 18. Points of Error

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
