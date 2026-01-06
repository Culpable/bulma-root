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
    │   ├── magnetic-wrapper.tsx          # Magnetic cursor-attraction effect
    │   ├── typed-text.tsx                # Typewriter text cycling animation
    │   └── screenshot.tsx                # Parallax tilt implementation
    └── sections/
        # Home page sections
        ├── features-two-column-with-demos.tsx   # Slide left/right staggered
        ├── stats-with-graph.tsx                 # Slide up staggered
        ├── pricing-multi-tier.tsx               # Scale up staggered
        ├── faqs-two-column-accordion.tsx        # Header slide + item fade
        ├── call-to-action-simple.tsx            # Slide up with CTA delay
        ├── testimonials-three-column-grid.tsx   # Slide up staggered
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
| Stats | Slide Y | Up | 120ms |
| Pricing | Scale + Slide Y | Up with scale | 100ms |
| FAQs Two Column | Slide X (header) + Slide Y (items) | Left / Up | 80ms |
| CTA Simple | Slide Y | Up | 150ms (CTA delayed) |
| Testimonials Grid | Slide Y | Up | 100ms |

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

All animations use `transition-all` with `ease-out` timing. Duration ranges from 500ms to 700ms depending on section importance.

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

## 8. Typed Text Animation

`typed-text.tsx::TypedText` creates a typewriter effect that cycles through phrases, perfect for hero headlines communicating multiple value propositions.

**File:** `demo/src/components/elements/typed-text.tsx`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `phrases` | `string[]` | — | Array of phrases to cycle |
| `showCursor` | `boolean` | `true` | Show blinking cursor |
| `typeSpeed` | `number` | `60` | Typing delay per character (ms) |
| `deleteSpeed` | `number` | `40` | Deletion delay per character (ms) |
| `pauseAfterType` | `number` | `2500` | Pause before deleting (ms) |
| `cursorClassName` | `string` | — | Additional cursor styling |

**Configuration constants (`TYPING_CONFIG`):**

| Setting | Value | Effect |
|---------|-------|--------|
| `typeSpeed` | 60 | Character typing interval (ms) |
| `deleteSpeed` | 40 | Character deletion interval (ms) |
| `pauseAfterType` | 2500 | Display duration before delete |
| `pauseAfterDelete` | 300 | Pause before typing next phrase |
| `initialDelay` | 1000 | Delay before animation starts |

**State machine phases:** `waiting` → `typing` → `pausing` → `deleting` → `waiting` (loop)

**Cursor animation:** CSS keyframe `cursor-blink` with 1s step-end timing for classic terminal cursor.

**Integration:** Insert within text content. Currently applied to hero headline.

```tsx
<h1>
  Your AI assistant for{' '}
  <TypedText
    phrases={[
      'lender policy questions.',
      'scenario planning.',
      'credit assessment.',
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
| `@keyframes cursor-blink` | Typewriter cursor blink (1s step-end) |
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

`testimonials-three-column-grid.tsx::Testimonial` implements a frosted glass effect using backdrop blur and semi-transparent backgrounds.

**Visual layers by theme:**

| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `bg-white/60` | `bg-white/[0.03]` |
| Blur | `backdrop-blur-md` | `backdrop-blur-md` |
| Border | `ring-1 ring-mist-950/5` | `ring-1 ring-white/10` |
| Inner glow | — | `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]` |
| Hover BG | `hover:bg-white/70` | `hover:bg-white/[0.05]` |

**Combined Tailwind classes:**
```tsx
<figure className={clsx(
  'bg-white/60 backdrop-blur-md',
  'ring-1 ring-mist-950/5',
  'dark:bg-white/[0.03] dark:ring-white/10',
  'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]',
  'transition-all duration-300 hover:bg-white/70 dark:hover:bg-white/[0.05]',
)}>
```

**Design notes:**
- 60% opacity in light mode provides readability while showing background texture
- 3% opacity in dark mode creates subtle depth without washing out
- Inset top shadow in dark mode simulates light reflection on glass edge
- Decorative `"` watermark at 3% opacity adds visual interest without distraction

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

**Integration:** Currently applied to hero and bottom CTA buttons.

```tsx
<GradientBorderWrapper>
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

**Integration with Stat component:**

The `Stat` component in `stats-with-graph.tsx` accepts optional `countTo` props:

```tsx
// Static stat (no animation)
<Stat stat="Seconds" text="Average time to answer" />

// Animated counter
<Stat countTo={30} countSuffix="+" text="Major lenders covered" />
```

| Stat Prop | Type | Purpose |
|-----------|------|---------|
| `countTo` | `number` | If provided, animates from 0 to this value |
| `countPrefix` | `string` | Prefix before animated number |
| `countSuffix` | `string` | Suffix after animated number |
| `countDuration` | `number` | Animation duration (default: 1500ms) |

---

## 16. Points of Error

- **Missing `h-full`**: Grid children wrapped for animation lose equal-height alignment without `h-full` on both wrapper and inner component (see `pricing-multi-tier.tsx::Plan`)
- **Server-side rendering**: Hook initializes `isVisible` to `false`, so elements start hidden. This is intentional—elements animate in on scroll
- **Multiple observers**: Each section creates its own IntersectionObserver instance. For pages with many animated sections, consider a shared observer context if performance degrades
- **Tilt on touch devices**: Parallax tilt uses mouse events only; touch devices see no effect (acceptable degradation)
- **CSS transition conflicts**: Plan components have their own hover transitions; ensure animation wrapper transitions don't override using specific properties rather than `transition-all` if conflicts arise
- **Magnetic on touch**: Magnetic wrapper uses mouse events only; touch devices see no magnetic effect (acceptable degradation)
- **TypedText SSR**: Component initializes with empty display text; ensure layout doesn't shift significantly when first phrase types in
- **Gradient border browser support**: `@property` (CSS Houdini) required for smooth gradient angle animation; older browsers may show static gradient. Dark mode detection uses MutationObserver on `html.dark` class.
- **Floating orbs visibility**: Opacity range [0.08–0.15] and size range [80–180px] calibrated for visible but subtle effect. Reduce blur if GPU performance is impacted.
- **Animated counter precision**: For large numbers or many decimal places, floating-point rounding may cause minor visual jitter near end of animation
