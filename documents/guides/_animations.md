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
    │   ├── cursor-spotlight.tsx          # Cursor-following ambient glow
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

## 7. CSS Classes

`globals.css` defines keyframes and utility classes:

| Class/Keyframe | Purpose |
|----------------|---------|
| `@keyframes scroll-slide-up` | Fade up 32px |
| `@keyframes scroll-slide-left` | Fade from left 32px |
| `@keyframes scroll-slide-right` | Fade from right 32px |
| `@keyframes scroll-scale-up` | Fade with 0.95 scale |
| `.parallax-tilt` | Base 3D transform styles |
| `.parallax-tilt-glow` | Cursor-following radial gradient overlay |

---

## 8. Staggered Animation Implementation

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

## 9. Points of Error

- **Missing `h-full`**: Grid children wrapped for animation lose equal-height alignment without `h-full` on both wrapper and inner component (see `pricing-multi-tier.tsx::Plan`)
- **Server-side rendering**: Hook initializes `isVisible` to `false`, so elements start hidden. This is intentional—elements animate in on scroll
- **Multiple observers**: Each section creates its own IntersectionObserver instance. For pages with many animated sections, consider a shared observer context if performance degrades
- **Tilt on touch devices**: Parallax tilt uses mouse events only; touch devices see no effect (acceptable degradation)
- **CSS transition conflicts**: Plan components have their own hover transitions; ensure animation wrapper transitions don't override using specific properties rather than `transition-all` if conflicts arise
