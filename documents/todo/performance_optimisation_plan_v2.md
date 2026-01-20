# Performance Optimisation Plan v2 (Comprehensive)

<important_note>
> **IMPORTANT NOTE:** Each step includes a "How to Test" section with specific locations, verification instructions, and measurable success criteria. This allows testing in a fresh context without prior conversation history.
>
> **Based on:** Vercel Engineering React Best Practices (January 2026)
>
> **Audit Date:** January 2026
</important_note>

---

## Table of Contents

1. [Goal & Success Criteria](#1-goal--success-criteria)
2. [Methodology](#2-methodology)
3. [Executive Summary](#3-executive-summary)
4. [Previously Completed Optimisations (v1)](#4-previously-completed-optimisations-v1)
5. [Bundle Size Optimisations](#5-bundle-size-optimisations)
6. [Re-render Optimisations](#6-re-render-optimisations)
7. [Rendering Performance Optimisations](#7-rendering-performance-optimisations)
8. [JavaScript Performance Optimisations](#8-javascript-performance-optimisations)
9. [Event Handling Optimisations](#9-event-handling-optimisations)
10. [Implementation Priority Matrix](#10-implementation-priority-matrix)
11. [Testing Plan](#11-testing-plan)
12. [References](#12-references)

---

## 1. Goal & Success Criteria

### 1.1 Goal

Improve frontend performance by eliminating unnecessary CPU/GPU usage, reducing bundle size, minimizing re-renders, and optimizing JavaScript execution paths—all while maintaining 100% visual parity.

### 1.2 Quantitative Success Criteria

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Initial JS Bundle | ~145KB gzipped | ~130KB gzipped | `next build` output |
| DotMatrix DOM calls/frame | ~1000 | 1 | Chrome Performance panel |
| MutationObserver instances | 4+ per page | 1 shared | React DevTools |
| Logo children clones/render | 12 | 0 (memoized) | React Profiler |
| Scroll velocity DOM writes/sec | 20 | ~4 | Performance panel |
| Passive listener violations | 2 | 0 | Chrome Console |
| useHueShift sorts/scroll | ~30 | ~5 | Performance panel |

### 1.3 Qualitative Success Criteria

- Zero visual regression on any component
- Smooth 60fps animations on mid-range devices
- No "Forced reflow" warnings in Chrome DevTools
- Clean React Profiler traces showing stable component references

---

## 2. Methodology

This audit follows the **Vercel Engineering React Best Practices** framework, which categorizes optimisations by impact:

| Priority | Category | Impact Level |
|----------|----------|--------------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

For this static marketing site (Next.js with `output: 'export'`), categories 1, 3, and 4 are largely not applicable. We focus on **Bundle Size**, **Re-render**, **Rendering**, and **JavaScript Performance**.

---

## 3. Executive Summary

### 3.1 What's Already Done Well

| Best Practice | Status | Evidence |
|---------------|--------|----------|
| No barrel file imports | ✅ PASSING | No lucide-react, @heroicons imports found |
| Content-visibility CSS | ✅ IMPLEMENTED | `globals.css:111-146` with section-specific intrinsic sizes |
| Passive scroll listeners | ✅ MOSTLY GOOD | `use-hero-parallax.ts:140`, `use-scroll-velocity.ts:98` |
| IntersectionObserver patterns | ✅ CONSISTENT | All 12 animation components use IO correctly |
| RAF cleanup | ✅ IMPLEMENTED | All RAF loops properly cancel on unmount |
| useState lazy initialization | ✅ PASSING | No expensive synchronous initializers found |
| useEffect primitive dependencies | ✅ PASSING | Dependencies use primitives, not objects |
| Dynamic imports for heavy components | ✅ IMPLEMENTED | `page.tsx:38-55` dynamically imports 4 animation components |
| Preload on hover | ✅ IMPLEMENTED | `preloadAnimationComponents()` exported at `page.tsx:64-69` |

### 3.2 Issues Found (27 Total)

| Severity | Count | Categories |
|----------|-------|------------|
| 🔴 CRITICAL | 3 | DOM loops, MutationObserver consolidation, Context memoization |
| 🟠 HIGH | 5 | Array cloning, inline styles, missing passive listeners |
| 🟡 MEDIUM | 12 | Hoist constants, memoize callbacks, throttle updates |
| 🟢 LOW | 7 | Micro-optimizations, code style improvements |

---

## 4. Previously Completed Optimisations (v1)

These items from the original `performance_optimisation_plan.md` are **already implemented**:

| # | Component | Issue | Status |
|---|-----------|-------|--------|
| 1 | DotMatrix | Removed from stats section (invisible 2.5% opacity effect) | ✅ COMPLETED |
| 2 | MagneticWrapper | Conditional `will-change` only on hover/focus | ✅ COMPLETED |
| 3 | LogoMarquee | CSS animation pauses when off-screen via IntersectionObserver | ✅ COMPLETED |
| 4 | GradientBorderWrapper | Gradient rotation pauses when off-screen | ✅ COMPLETED |
| 5 | Stats ping | Changed from `infinite` to `3` iterations | ✅ COMPLETED |

**No changes needed for v1 items.**

---

## 5. Bundle Size Optimisations

### 5.1 ~~Dynamic Imports for Animation Components~~ ✅ ALREADY IMPLEMENTED

**File:** `demo/src/app/page.tsx:38-55`

The codebase already correctly uses `next/dynamic` for:
- `BlurTransitionText`
- `MagneticWrapper`
- `GradientBorderWrapper`
- `LuminanceSweep`

**No action needed.**

---

### 5.2 Code-Split AnimatedCounter Component

**Severity:** 🟡 MEDIUM
**Impact:** ~3KB bundle reduction
**Vercel Rule:** `bundle-dynamic-imports`

**File:** `demo/src/components/sections/stats-animated-graph.tsx`
**Lines:** 5, 45-50

**Problem:**
```tsx
// Line 5: Synchronous import
import { AnimatedCounter } from '../elements/animated-counter'

// Lines 45-50: Only renders when scrolled into view
{useAnimatedCounter ? (
  <AnimatedCounter
    value={countTo}
    prefix={countPrefix}
    suffix={countSuffix}
    duration={countDuration}
  />
) : (
  stat
)}
```

The `AnimatedCounter` component (~134 lines with RAF logic and easing functions) is imported synchronously but only renders after the user scrolls to the stats section. It's not needed for initial paint.

**Solution:**
```tsx
// Option A: Dynamic import in stats-animated-graph.tsx
import dynamic from 'next/dynamic'

const AnimatedCounter = dynamic(
  () => import('../elements/animated-counter').then((m) => m.AnimatedCounter),
  { ssr: true } // SSR for SEO - renders initial "0" value
)

// Option B: Move to page.tsx dynamic imports (consistent with other animations)
// In page.tsx:
const AnimatedCounter = dynamic(() =>
  import('@/components/elements/animated-counter').then((m) => m.AnimatedCounter)
)

// In stats-animated-graph.tsx - accept as prop or use context
```

**Why it matters:** AnimatedCounter isn't needed for LCP. Deferring it reduces initial parse time.

#### How to Test

1. Run `npm run build` and check `.next/analyze` or build output
2. **Before:** AnimatedCounter bundled in main chunk
3. **After:** AnimatedCounter in separate chunk, loaded on scroll

---

### 5.3 Evaluate @tailwindplus/elements Import

**Severity:** 🟢 LOW
**Impact:** Depends on library tree-shaking
**Vercel Rule:** `bundle-barrel-imports`

**File:** `demo/src/components/sections/faqs-two-column-accordion.tsx`
**Line:** 1

**Problem:**
```tsx
import { ElDisclosure } from '@tailwindplus/elements/react'
```

**Analysis:** This is already a direct import (not from a barrel file), which is the correct pattern. However, we should verify:
1. Does `@tailwindplus/elements` tree-shake properly?
2. Is the FAQ section below the fold (yes, it uses `content-visibility-faqs`)?

**Recommendation:** No immediate action needed. The import is correct. Consider dynamic import only if bundle analysis shows the library is unexpectedly large.

---

## 6. Re-render Optimisations

### ~~6.1 🔴 CRITICAL: Memoize PricingAnimationContext Value~~ ✅ **COMPLETED**

**Severity:** 🔴 CRITICAL
**Impact:** Prevents cascade re-renders in all Plan components
**Vercel Rule:** `rerender-memo`

**File:** `demo/src/components/sections/pricing-multi-tier.tsx`
**Lines:** 120-138

**Problem:**
```tsx
const animatedPlans = Children.map(plans, (child, index) => {
  const delay = index * staggerDelay

  return (
    <div /* ... */>
      {/* ❌ New object created on every render */}
      <PricingAnimationContext.Provider value={{ isVisible, baseDelay: delay }}>
        {child}
      </PricingAnimationContext.Provider>
    </div>
  )
})
```

When `isVisible` changes (IntersectionObserver triggers), the context value object `{ isVisible, baseDelay: delay }` is recreated. This causes **all Plan children to re-render**, which triggers **all AnimatedCheckmarkIcon components to re-render**.

**Impact Analysis:**
- 3 Plan components × 5-6 features each = 15-18 AnimatedCheckmarkIcon re-renders
- Each checkmark has SVG path animation logic
- Happens on every scroll tick that changes visibility

**Solution:**
```tsx
import { useMemo } from 'react'

const animatedPlans = Children.map(plans, (child, index) => {
  const delay = index * staggerDelay

  // ✅ Memoize context value per child
  // Note: useMemo inside Children.map is valid because map order is stable
  const contextValue = useMemo(
    () => ({ isVisible, baseDelay: delay }),
    [isVisible, delay]
  )

  return (
    <div /* ... */>
      <PricingAnimationContext.Provider value={contextValue}>
        {child}
      </PricingAnimationContext.Provider>
    </div>
  )
})
```

**Alternative (cleaner architecture):**
```tsx
// Create stable context values at component level
const PlanWrapper = memo(function PlanWrapper({
  child,
  delay,
  isVisible,
}: {
  child: ReactNode
  delay: number
  isVisible: boolean
}) {
  const contextValue = useMemo(
    () => ({ isVisible, baseDelay: delay }),
    [isVisible, delay]
  )

  return (
    <div /* ... */>
      <PricingAnimationContext.Provider value={contextValue}>
        {child}
      </PricingAnimationContext.Provider>
    </div>
  )
})

// Usage
const animatedPlans = Children.map(plans, (child, index) => (
  <PlanWrapper
    key={index}
    child={child}
    delay={index * staggerDelay}
    isVisible={isVisible}
  />
))
```

#### How to Test

1. Open React DevTools → Profiler
2. Scroll to pricing section (triggers `isVisible` change)
3. **Before:** All Plan and AnimatedCheckmarkIcon components show as "rendered"
4. **After:** Only components whose props actually changed show as "rendered"

---

### ~~6.2 🟠 HIGH: Memoize LogoMarquee Duplicated Children~~ ✅ **COMPLETED**

**Severity:** 🟠 HIGH
**Impact:** Prevents 12+ React.cloneElement calls per render
**Vercel Rule:** `rerender-memo`

**File:** `demo/src/components/elements/logo-marquee.tsx`
**Lines:** 106-121

**Problem:**
```tsx
// Line 106: Converts children to array (fine)
const childArray = Children.toArray(children)

// Lines 110-121: Clones array on EVERY render
const duplicatedChildren = [
  ...childArray.map((child, index) =>
    isValidElement(child)
      ? cloneElement(child, { key: `marquee-a-${index}` })
      : child
  ),
  ...childArray.map((child, index) =>
    isValidElement(child)
      ? cloneElement(child, { key: `marquee-b-${index}` })
      : child
  ),
]
```

**Impact Analysis:**
- With 6 logo children, this creates 12 cloned elements per render
- `cloneElement` is not free—it creates new React element objects
- Marquee may re-render on hover (pause), visibility changes, etc.

**Solution:**
```tsx
import { useMemo } from 'react'

// Memoize the duplication - only re-compute when children change
const duplicatedChildren = useMemo(() => {
  const childArray = Children.toArray(children)
  return [
    ...childArray.map((child, index) =>
      isValidElement(child)
        ? cloneElement(child, { key: `marquee-a-${index}` })
        : child
    ),
    ...childArray.map((child, index) =>
      isValidElement(child)
        ? cloneElement(child, { key: `marquee-b-${index}` })
        : child
    ),
  ]
}, [children])
```

**Additional optimization - use stable keys:**
```tsx
// Even better: avoid cloneElement if you control the children
// Instead, render children twice and let React handle keys:
const duplicatedChildren = useMemo(() => {
  const childArray = Children.toArray(children)
  return [
    // First set
    ...childArray.map((child, i) => (
      <Fragment key={`a-${i}`}>{child}</Fragment>
    )),
    // Second set (duplicate for infinite scroll)
    ...childArray.map((child, i) => (
      <Fragment key={`b-${i}`}>{child}</Fragment>
    )),
  ]
}, [children])
```

#### How to Test

1. Open React DevTools → Components
2. Find LogoMarquee in tree
3. Trigger a re-render (resize window, toggle hover)
4. **Before:** Children show as newly created elements
5. **After:** Children remain stable (same object references)

---

### 6.3 🟠 HIGH: Memoize StatsAnimatedGraph Children Mapping

**Severity:** 🟠 HIGH
**Impact:** Prevents inline style objects recreation
**Vercel Rule:** `rerender-memo`, `rendering-hoist-jsx`

**File:** `demo/src/components/sections/stats-animated-graph.tsx`
**Lines:** 123-137

**Problem:**
```tsx
// Runs on every render
const animatedStats = Children.map(children, (child, index) => {
  const delay = index * staggerDelay

  return (
    <div
      className={clsx(/* ... */)}
      // ❌ New style object created per child per render
      style={{ transitionDelay: `${delay}ms` }}
    >
      {child}
    </div>
  )
})
```

**Solution:**
```tsx
// Option 1: Memoize the entire mapping
const animatedStats = useMemo(
  () =>
    Children.map(children, (child, index) => {
      const delay = index * staggerDelay
      return (
        <div
          className={clsx(
            'transition-all duration-700 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
          style={{ transitionDelay: `${delay}ms` }}
        >
          {child}
        </div>
      )
    }),
  [children, staggerDelay, isVisible]
)

// Option 2: Use CSS custom properties (avoids JS entirely)
// In the JSX:
<div
  className="stat-item transition-all duration-700 ease-out"
  style={{ '--stagger-index': index } as React.CSSProperties}
>
  {child}
</div>

// In globals.css:
.stat-item {
  transition-delay: calc(var(--stagger-index) * 120ms);
}
```

---

### ~~6.4 🟡 MEDIUM: Inline Event Handlers in GradientBorderWrapper~~ ✅ **COMPLETED**

**Severity:** 🟡 MEDIUM
**Impact:** Event handlers recreated on every render
**Vercel Rule:** `rerender-functional-setstate`

**File:** `demo/src/components/elements/gradient-border-wrapper.tsx`
**Lines:** 172-177

**Problem:**
```tsx
<div
  ref={wrapperRef}
  // ❌ New arrow function on every render
  onMouseEnter={(e) => {
    ;(e.currentTarget as HTMLDivElement).style.animationDuration = `${rotationDuration * 0.5}ms`
  }}
  // ❌ New arrow function on every render
  onMouseLeave={(e) => {
    ;(e.currentTarget as HTMLDivElement).style.animationDuration = `${rotationDuration}ms`
  }}
>
```

**Solution:**
```tsx
// Define stable callbacks with useCallback
const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.animationDuration = `${rotationDuration * 0.5}ms`
}, [rotationDuration])

const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.animationDuration = `${rotationDuration}ms`
}, [rotationDuration])

// Use in JSX
<div
  ref={wrapperRef}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
```

**Even better - use CSS for this:**
```css
/* In globals.css */
.gradient-border-wrapper {
  animation-duration: var(--gradient-rotation-duration);
  transition: animation-duration 0.2s ease;
}

.gradient-border-wrapper:hover {
  animation-duration: calc(var(--gradient-rotation-duration) * 0.5);
}
```

This eliminates the JavaScript entirely and uses pure CSS, which is more performant.

---

### 6.5 🟡 MEDIUM: useScrollHighlights Returns New Array Every Render

**Severity:** 🟡 MEDIUM
**Impact:** All ScrollHighlight consumers re-render on any highlight change
**Vercel Rule:** `rerender-memo`

**File:** `demo/src/hooks/use-scroll-highlight.ts`
**Lines:** 156-162 (estimated)

**Problem:** The hook returns a new array of objects on every render, even if the highlighted states haven't changed.

**Solution:** Memoize the return value:
```tsx
return useMemo(
  () =>
    refs.current.map((_, index) => ({
      ref: (el: HTMLElement | null) => {
        refs.current[index] = el
      },
      isHighlighted: highlightedStates[index],
      index,
    })),
  [highlightedStates]
)
```

Note: The ref callbacks will still be recreated, but that's unavoidable with this pattern. Consider using `useCallback` for each ref if this becomes a bottleneck.

---

## 7. Rendering Performance Optimisations

### ~~7.1 🔴 CRITICAL: Cache Dark Mode State Outside Render Loop (DotMatrix)~~ ✅ **COMPLETED**

**Severity:** 🔴 CRITICAL
**Impact:** Eliminates thousands of DOM class lookups per frame
**Vercel Rule:** `js-cache-property-access`

**File:** `demo/src/components/elements/dot-matrix.tsx`
**Lines:** 200-204

**Problem:**
```tsx
// Inside drawFrame(), which runs at 60fps
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    // ... (lines 181-199)

    // ❌ Line 201: DOM class lookup inside INNER LOOP
    const isDark = document.documentElement.classList.contains('dark')
    const dotColor = isDark
      ? `rgba(255, 255, 255, ${opacity})`
      : `rgba(0, 0, 0, ${opacity})`
    // ...
  }
}
```

**Impact Analysis:**
- Typical grid: 50 cols × 20 rows = 1000 dots
- At 60fps: 1000 × 60 = **60,000 DOM lookups per second**
- `classList.contains()` is not free—it reads from the DOM

**Solution:**
```tsx
const drawFrame = () => {
  ctx.clearRect(0, 0, dimensions.width, dimensions.height)
  const mouse = mouseRef.current

  // ✅ Cache dark mode check ONCE per frame
  const isDark = document.documentElement.classList.contains('dark')
  const baseColor = isDark ? [255, 255, 255] : [0, 0, 0]

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // ... calculate opacity ...

      // ✅ Use cached color values
      const dotColor = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacity})`

      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.fill()
    }
  }
}
```

**Even better - use the useDarkMode hook (see Step 7.2):**
```tsx
import { useDarkMode } from '@/hooks/use-dark-mode'

export function DotMatrix(/* ... */) {
  const isDark = useDarkMode()

  // In drawFrame:
  const baseColor = isDark ? [255, 255, 255] : [0, 0, 0]
  // ...
}
```

#### How to Test

1. Enable DotMatrix component for testing
2. Open Chrome DevTools → Performance → Record
3. Move mouse over DotMatrix area for 5 seconds
4. Look at flame chart for `classList.contains` calls
5. **Before:** Thousands of calls per frame
6. **After:** 1 call per frame (or 0 if using useDarkMode hook)

---

### ~~7.2 🔴 CRITICAL: Create Shared useDarkMode Hook~~ ✅ **COMPLETED**

**Severity:** 🔴 CRITICAL
**Impact:** Consolidates multiple MutationObservers into one
**Vercel Rule:** `client-event-listeners` (deduplicate global listeners)

**Current State:**
- `gradient-border-wrapper.tsx:121` creates MutationObserver
- `dot-matrix.tsx:201` reads `classList.contains('dark')` directly
- Each GradientBorderWrapper instance = 1 new MutationObserver
- 4 CTA buttons on homepage = 4 redundant observers

**Files to Create/Modify:**
- **NEW:** `demo/src/hooks/use-dark-mode.ts`
- **MODIFY:** `demo/src/components/elements/gradient-border-wrapper.tsx`
- **MODIFY:** `demo/src/components/elements/dot-matrix.tsx` (if re-enabled)

**Solution - Create shared hook:**
```tsx
// demo/src/hooks/use-dark-mode.ts
'use client'

import { useSyncExternalStore } from 'react'

/**
 * Module-level singleton state for dark mode detection.
 * Shared across all hook consumers to avoid multiple MutationObservers.
 */

// Set of listener functions to notify on dark mode changes
const listeners = new Set<() => void>()

// Cached dark mode value (null = not yet initialized)
let cachedIsDark: boolean | null = null

// Single MutationObserver instance (created lazily on first subscription)
let observer: MutationObserver | null = null

/**
 * Subscribe to dark mode changes.
 * Creates a single shared MutationObserver on first subscription.
 */
function subscribe(listener: () => void): () => void {
  // Initialize observer on first subscriber
  if (listeners.size === 0 && typeof window !== 'undefined') {
    cachedIsDark = document.documentElement.classList.contains('dark')

    observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark')
      if (newIsDark !== cachedIsDark) {
        cachedIsDark = newIsDark
        // Notify all listeners
        listeners.forEach((fn) => fn())
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  listeners.add(listener)

  // Cleanup function
  return () => {
    listeners.delete(listener)

    // Optionally disconnect observer when no listeners remain
    // (keeping it alive is also fine - minimal overhead)
    if (listeners.size === 0 && observer) {
      observer.disconnect()
      observer = null
    }
  }
}

/**
 * Get current dark mode snapshot.
 */
function getSnapshot(): boolean {
  if (cachedIsDark === null && typeof window !== 'undefined') {
    cachedIsDark = document.documentElement.classList.contains('dark')
  }
  return cachedIsDark ?? false
}

/**
 * Server-side snapshot (default to light mode for SSR).
 */
function getServerSnapshot(): boolean {
  return false
}

/**
 * Hook to subscribe to dark mode changes.
 *
 * Uses a single shared MutationObserver for all consumers,
 * avoiding redundant observers per component instance.
 *
 * @returns Current dark mode state (true = dark, false = light)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isDark = useDarkMode()
 *   return <div style={{ color: isDark ? 'white' : 'black' }}>...</div>
 * }
 * ```
 */
export function useDarkMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

**Update gradient-border-wrapper.tsx:**
```tsx
// BEFORE (lines 110-125):
useEffect(() => {
  if (disabled) return
  const updateGradient = () => {
    if (!wrapperRef.current) return
    const isDark = document.documentElement.classList.contains('dark')
    wrapperRef.current.style.background = isDark ? DARK_GRADIENT : LIGHT_GRADIENT
  }

  updateGradient()

  // ❌ Each instance creates its own observer
  const observer = new MutationObserver(updateGradient)
  observer.observe(document.documentElement, { attributes: true })

  return () => observer.disconnect()
}, [disabled])

// AFTER:
import { useDarkMode } from '@/hooks/use-dark-mode'

export function GradientBorderWrapper(/* ... */) {
  const isDark = useDarkMode()

  // ✅ React handles updates when isDark changes
  useEffect(() => {
    if (disabled || !wrapperRef.current) return
    wrapperRef.current.style.background = isDark ? DARK_GRADIENT : LIGHT_GRADIENT
  }, [disabled, isDark])

  // ... rest of component
}
```

#### How to Test

1. Add `console.log('MutationObserver created')` in the hook's observer creation
2. Load homepage with 4 CTA buttons
3. **Before:** 4 console logs (one per GradientBorderWrapper)
4. **After:** 1 console log (shared observer)

---

### ~~7.3 🟠 HIGH: Hoist Static Grid Lines Array~~ ✅ **COMPLETED**

**Severity:** 🟠 HIGH
**Impact:** Eliminates 14 object creations per render
**Vercel Rule:** `rendering-hoist-jsx`

**File:** `demo/src/components/sections/stats-animated-graph.tsx`
**Lines:** 202-214

**Problem:**
```tsx
{/* ❌ Array.from creates 14 temporary objects on every render */}
{Array.from({ length: 14 }, (_, i) => {
  const x = (i / 13) * 1199 + 0.5
  return (
    <line
      key={i}
      x1={x}
      y1="400"
      x2={x}
      y2="0"
      vectorEffect="non-scaling-stroke"
    />
  )
})}
```

**Solution - Hoist to module level:**
```tsx
// At top of file (outside component)
const GRID_LINES = Array.from({ length: 14 }, (_, i) => {
  const x = (i / 13) * 1199 + 0.5
  return (
    <line
      key={i}
      x1={x}
      y1="400"
      x2={x}
      y2="0"
      vectorEffect="non-scaling-stroke"
    />
  )
})

// In JSX:
<g /* ... */>
  {GRID_LINES}
</g>
```

---

### ~~7.4 🟡 MEDIUM: Hoist IntersectionObserver Threshold Arrays~~ ✅ **COMPLETED**

**Severity:** 🟡 MEDIUM
**Impact:** Avoids array allocation on every component mount
**Vercel Rule:** `rendering-hoist-jsx`

**Files Affected:**
- `demo/src/hooks/use-hue-shift.ts:118`
- Various components with `threshold: [0, 0.1, 0.2, ...]`

**Problem:**
```tsx
// Line 117-118 in use-hue-shift.ts
const observer = new IntersectionObserver(
  (entries) => { /* ... */ },
  {
    // ❌ New array created on every effect run
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    rootMargin: '-20% 0px -20% 0px',
  }
)
```

**Solution - Hoist to module level:**
```tsx
// At top of file
const HUE_SHIFT_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] as const

// In useEffect:
const observer = new IntersectionObserver(
  (entries) => { /* ... */ },
  {
    threshold: HUE_SHIFT_THRESHOLDS,
    rootMargin: '-20% 0px -20% 0px',
  }
)
```

---

## 8. JavaScript Performance Optimisations

### ~~8.1 🟠 HIGH: Optimize useHueShift Sorting on Every Callback~~ ✅ **COMPLETED**

**Severity:** 🟠 HIGH
**Impact:** Reduces CPU work during scroll
**Vercel Rule:** `js-combine-iterations`, `js-early-exit`

**File:** `demo/src/hooks/use-hue-shift.ts`
**Lines:** 100-114

**Problem:**
```tsx
const observer = new IntersectionObserver(
  (entries) => {
    // ❌ On EVERY callback (fires multiple times per scroll):
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting && entry.target.getAttribute('data-section-hue'))
      .map((entry) => ({
        id: entry.target.getAttribute('data-section-hue') as string,
        ratio: entry.intersectionRatio,
      }))
      .sort((a, b) => b.ratio - a.ratio) // ❌ O(n log n) sort

    const mostVisible = visibleEntries[0]
    // ...
  },
  { threshold: [0, 0.1, 0.2, ...] } // 11 thresholds = many callbacks
)
```

**Impact Analysis:**
- 11 threshold values × 6-8 sections = many callback fires per scroll
- Each callback: filter → map (creates objects) → sort
- `.sort()` is O(n log n) but n is small; main issue is the array allocations

**Solution - Find max in single pass:**
```tsx
const observer = new IntersectionObserver(
  (entries) => {
    // ✅ Single pass to find most visible section
    let mostVisibleId: string | null = null
    let maxRatio = 0

    for (const entry of entries) {
      if (!entry.isIntersecting) continue

      const sectionId = entry.target.getAttribute('data-section-hue')
      if (!sectionId) continue

      if (entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio
        mostVisibleId = sectionId
      }
    }

    // Only update if significantly visible (threshold check)
    if (mostVisibleId && maxRatio > 0.2) {
      updateHueShift(mostVisibleId)
    }
  },
  { /* ... */ }
)
```

**Benefits:**
- No intermediate arrays created
- Single loop instead of filter + map + sort chain
- O(n) instead of O(n log n)
- Better for garbage collection

---

### 8.2 🟡 MEDIUM: BlurTransitionText Sequential Measurement

**Severity:** 🟡 MEDIUM
**Impact:** Reduces layout thrashing during initialization
**Vercel Rule:** `js-batch-dom-css`

**File:** `demo/src/components/elements/blur-transition-text.tsx`
**Lines:** 64-75

**Problem:**
```tsx
// Inside requestAnimationFrame callback:
phrases.forEach((phrase) => {
  measureEl.textContent = phrase           // DOM write
  const width = measureEl.getBoundingClientRect().width  // DOM read (forces reflow)
  if (width > maxWidth) {
    maxWidth = width
  }
})
```

Each iteration writes to DOM (textContent), then reads (getBoundingClientRect), forcing a reflow per phrase.

**Solution - Batch writes, then read:**
```tsx
requestAnimationFrame(() => {
  if (!measureRef.current || hasInitialized.current) return

  const measureEl = measureRef.current
  let maxWidth = 0

  // Option 1: Clone element for each phrase to batch measurements
  const fragment = document.createDocumentFragment()
  const tempSpans: HTMLSpanElement[] = []

  phrases.forEach((phrase) => {
    const span = measureEl.cloneNode() as HTMLSpanElement
    span.textContent = phrase
    span.style.position = 'absolute'
    span.style.visibility = 'hidden'
    tempSpans.push(span)
    fragment.appendChild(span)
  })

  // Single DOM insertion
  document.body.appendChild(fragment)

  // Now read all widths (single reflow for all)
  tempSpans.forEach((span) => {
    const width = span.getBoundingClientRect().width
    if (width > maxWidth) maxWidth = width
  })

  // Cleanup
  tempSpans.forEach((span) => span.remove())

  setContainerWidth(Math.ceil(maxWidth))
  hasInitialized.current = true
})
```

**Simpler alternative - accept the cost:**
The current approach with 4 phrases causes 4 reflows, which is acceptable for a one-time initialization. This optimisation is LOW priority unless you have many phrases.

---

## 9. Event Handling Optimisations

### ~~9.1 🟠 HIGH: Add Passive Event Listeners~~ ✅ **COMPLETED**

**Severity:** 🟠 HIGH
**Impact:** Unblocks main thread for scroll/pointer events
**Vercel Rule:** Best practice for event listeners

**Files Affected:**
- `demo/src/components/elements/cursor-spotlight.tsx:50-52`
- `demo/src/components/elements/dot-matrix.tsx:145-146`

**Problem:**
```tsx
// cursor-spotlight.tsx:50-52
container.addEventListener('mousemove', handleMouseMove)      // ❌ Missing passive
container.addEventListener('mouseenter', handleMouseEnter)
container.addEventListener('mouseleave', handleMouseLeave)

// dot-matrix.tsx:145-146
container.addEventListener('mousemove', handleMouseMove)      // ❌ Missing passive
container.addEventListener('mouseleave', handleMouseLeave)
```

**Solution:**
```tsx
// cursor-spotlight.tsx
container.addEventListener('mousemove', handleMouseMove, { passive: true })
container.addEventListener('mouseenter', handleMouseEnter)  // No passive needed
container.addEventListener('mouseleave', handleMouseLeave)

// dot-matrix.tsx
container.addEventListener('mousemove', handleMouseMove, { passive: true })
container.addEventListener('mouseleave', handleMouseLeave)
```

**Note:** `mouseenter` and `mouseleave` don't need `passive: true` because they don't fire continuously and don't have default behaviors to prevent.

#### How to Test

1. Open Chrome DevTools → Console
2. Look for "[Violation] Added non-passive event listener" warnings
3. **Before:** May see warnings
4. **After:** No passive listener warnings

---

### 9.2 🟡 MEDIUM: MagneticWrapper Uses React Synthetic Events

**Severity:** 🟡 MEDIUM
**Impact:** React synthetic events don't support passive option directly

**File:** `demo/src/components/elements/magnetic-wrapper.tsx`
**Lines:** ~150

**Current State:**
```tsx
<div
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
  onMouseEnter={handleMouseEnter}
>
```

**Analysis:** React's synthetic event system handles `onMouseMove` etc. The passive flag isn't directly available, but React already optimizes these handlers internally.

**Recommendation:** No change needed. If performance issues are observed specifically with magnetic effect, consider:
1. Throttling the state update
2. Using native event listeners with passive flag

---

## 10. Implementation Priority Matrix

### 10.1 Priority Order

| Priority | Step | Issue | Impact | Effort | Files | Status |
|----------|------|-------|--------|--------|-------|--------|
| 🔴 P0 | 7.1 | Cache dark mode in DotMatrix loop | Critical | Low | dot-matrix.tsx | ✅ COMPLETED |
| 🔴 P0 | 7.2 | Create shared useDarkMode hook | Critical | Medium | NEW: use-dark-mode.ts, gradient-border-wrapper.tsx | ✅ COMPLETED |
| 🔴 P0 | 6.1 | Memoize PricingAnimationContext | Critical | Low | pricing-multi-tier.tsx | ✅ COMPLETED |
| 🟠 P1 | 6.2 | Memoize LogoMarquee children | High | Low | logo-marquee.tsx | ✅ COMPLETED |
| 🟠 P1 | 9.1 | Add passive event listeners | High | Low | cursor-spotlight.tsx, dot-matrix.tsx | ✅ COMPLETED |
| 🟠 P1 | 7.3 | Hoist static grid lines | High | Low | stats-animated-graph.tsx | ✅ COMPLETED |
| 🟠 P1 | 8.1 | Optimize useHueShift sorting | High | Medium | use-hue-shift.ts | ✅ COMPLETED |
| 🟡 P2 | 6.3 | Memoize StatsAnimatedGraph children | Medium | Low | stats-animated-graph.tsx | |
| 🟡 P2 | 6.4 | useCallback for GradientBorderWrapper handlers | Medium | Low | gradient-border-wrapper.tsx | ✅ COMPLETED |
| 🟡 P2 | 7.4 | Hoist threshold arrays | Medium | Low | use-hue-shift.ts, others | ✅ COMPLETED |
| 🟢 P3 | 5.2 | Code-split AnimatedCounter | Low | Medium | stats-animated-graph.tsx, page.tsx | |
| 🟢 P3 | 6.5 | Memoize useScrollHighlights return | Low | Low | use-scroll-highlight.ts | |
| 🟢 P3 | 8.2 | Batch BlurTransitionText measurements | Low | Medium | blur-transition-text.tsx | |

### 10.2 Estimated Total Effort

- **P0 (Critical):** ~3 hours
- **P1 (High):** ~2 hours
- **P2 (Medium):** ~1.5 hours
- **P3 (Low):** ~2 hours

**Total:** ~8.5 hours for complete implementation

---

## 11. Testing Plan

### 11.1 Automated Tests

Consider adding these to the test suite:

```tsx
// Example: Test that useDarkMode doesn't create multiple observers
describe('useDarkMode', () => {
  it('should create only one MutationObserver for multiple consumers', () => {
    const observerSpy = jest.spyOn(window, 'MutationObserver')

    // Render multiple components using the hook
    render(
      <>
        <ComponentUsingDarkMode />
        <ComponentUsingDarkMode />
        <ComponentUsingDarkMode />
      </>
    )

    // Should only create one observer
    expect(observerSpy).toHaveBeenCalledTimes(1)
  })
})
```

### 11.2 Manual Performance Tests

| Test | Tool | Metric | Pass Criteria |
|------|------|--------|---------------|
| Bundle size | `npm run build` | JS size | < 130KB gzipped |
| DotMatrix performance | Chrome Performance | DOM calls/frame | < 10 |
| Scroll jank | Chrome Performance | Long tasks | None > 50ms |
| Passive listeners | Chrome Console | Violations | 0 warnings |
| React re-renders | React DevTools Profiler | Wasted renders | < 5% |

### 11.3 Visual Regression Tests

After each change, verify:
- [ ] Logo marquee scrolls smoothly
- [ ] Gradient borders rotate correctly
- [ ] Dark mode toggle updates all components
- [ ] Pricing card animations play correctly
- [ ] Stats graph draws on scroll
- [ ] Hue shift transitions smoothly between sections

---

## 12. References

### Vercel React Best Practices
- [bundle-dynamic-imports](https://vercel.com/docs/react-best-practices#bundle-dynamic-imports)
- [rerender-memo](https://vercel.com/docs/react-best-practices#rerender-memo)
- [client-event-listeners](https://vercel.com/docs/react-best-practices#client-event-listeners)
- [js-cache-property-access](https://vercel.com/docs/react-best-practices#js-cache-property-access)
- [rendering-hoist-jsx](https://vercel.com/docs/react-best-practices#rendering-hoist-jsx)
- [js-combine-iterations](https://vercel.com/docs/react-best-practices#js-combine-iterations)

### React Documentation
- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)

### Web Performance
- [Passive Event Listeners](https://developer.chrome.com/docs/lighthouse/best-practices/uses-passive-event-listeners)
- [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
