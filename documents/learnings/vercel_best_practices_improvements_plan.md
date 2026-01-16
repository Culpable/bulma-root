# Vercel Best Practices Audit

## 0. Summary

This document audits the Bulma marketing site against Vercel's React/Next.js Best Practices guide (45 rules across 8 categories). Findings are **ranked by difficulty and benefit**, following the priority order from the Vercel guide.

**Overall Assessment**: The codebase demonstrates **excellent performance fundamentals** for a static marketing site. Server Components are used by default, animation architecture is lightweight and GPU-accelerated, and dependencies are minimal (7 production deps). This audit identifies **incremental improvement opportunities**, not critical issues.

**Key Finding**: The largest gains are in **font loading** (currently render-blocking Google Fonts) and **image prioritization** (LCP images missing `priority` attribute).

---

## 1. Priority Matrix

| Priority | Category | Issues Found | Codebase Status |
|----------|----------|--------------|-----------------|
| 1 | Eliminating Waterfalls | 0 | N/A (static export) |
| 2 | Bundle Size | 3 | Good |
| 3 | Server-Side Performance | 1 | Excellent |
| 4 | Client-Side Data Fetching | 0 | N/A (no data fetching) |
| 5 | Re-render Optimization | 1 | Excellent |
| 6 | Rendering Performance | 3 | Good |
| 7 | JavaScript Performance | 1 | Good |
| 8 | Advanced Patterns | 1 | Not Applicable |

---

## 2. Findings by Category

### ~~2.1 Eliminating Waterfalls (CRITICAL)~~ ❌ **NOT APPLICABLE**

**Current State**: Not applicable—static export with no server-side data fetching.

**No issues found.** The site uses `output: 'export'` in `next.config.ts`, meaning all content is pre-rendered at build time.

---

### ~~2.2 Bundle Size Optimization (CRITICAL)~~ ✅ **COMPLETED**

**Current State**: Good—minimal dependencies, no barrel imports, icons split into individual files.

---

#### ~~Issue B-1: Render-Blocking Google Fonts~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Medium |
| **Benefit** | High |
| **Rule** | `bundle-defer-third-party` |
| **File** | `demo/src/app/layout.tsx:68-77` |

**Current Pattern** (render-blocking):
```tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Mona+Sans:..."
    rel="stylesheet"
  />
</head>
```

**Problem**: External font stylesheets block rendering. Even with `preconnect`, the browser must complete DNS lookup → TCP connection → fetch CSS → parse CSS → discover font files → fetch fonts before first paint.

**Recommendation**: Migrate to `next/font/google` for automatic optimization:
```tsx
import { Mona_Sans, Inter } from 'next/font/google'

const monaSans = Mona_Sans({
  subsets: ['latin'],
  variable: '--font-mona-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${monaSans.variable} ${inter.variable}`}>
      ...
    </html>
  )
}
```

**Benefits**:
- Self-hosts fonts (no external requests)
- Inlines critical font CSS
- Applies `font-display: swap` automatically
- Eliminates layout shift from font loading

**Impact**: FCP improvement of 200-400ms on first visit.

**Complexity Notes**: Requires updating `globals.css` to use CSS variables for font families. Tailwind v4 theme configuration may need adjustment.

---

#### ~~Issue B-2: Animation Components Could Use Dynamic Imports~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Low |
| **Benefit** | Medium |
| **Rule** | `bundle-dynamic-imports` |
| **Files** | `demo/src/app/page.tsx` |

**Current Pattern** (static imports):
```tsx
import { BlurTransitionText } from '@/components/elements/blur-transition-text'
import { MagneticWrapper } from '@/components/elements/magnetic-wrapper'
import { CursorSpotlight } from '@/components/elements/cursor-spotlight'
import { AuroraBackground } from '@/components/elements/aurora-background'
```

**Problem**: Animation components contain client-side logic not needed until after hydration. They inflate the initial JS bundle.

**Recommendation**: Use `next/dynamic` with `ssr: false` for animation-only components:
```tsx
import dynamic from 'next/dynamic'

const BlurTransitionText = dynamic(
  () => import('@/components/elements/blur-transition-text').then(m => m.BlurTransitionText),
  { ssr: false }
)

const MagneticWrapper = dynamic(
  () => import('@/components/elements/magnetic-wrapper').then(m => m.MagneticWrapper),
  { ssr: false }
)
```

**Components to Consider**:

| Component | Dynamic? | Reason |
|-----------|----------|--------|
| `BlurTransitionText` | ✅ Yes | Animation-only, not needed for initial render |
| `MagneticWrapper` | ✅ Yes | Hover interaction, not critical path |
| `CursorSpotlight` | ✅ Yes | Mouse-following effect, deferred |
| `AuroraBackground` | ✅ Yes | Decorative animation |
| `AnimatedCounter` | ✅ Yes | Scroll-triggered, below fold |
| `GradientBorderWrapper` | ⚠️ Maybe | Used on CTA, may affect perceived quality |
| `Screenshot` | ❌ No | Contains LCP image, must render immediately |

**Impact**: Reduces initial JS bundle by ~15-20KB (gzipped).

**Complexity Notes**: Low risk—fallback is simply no animation until component loads. User won't notice on fast connections.

---

#### ~~Issue B-3: Preload Editor on CTA Hover~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Low |
| **Benefit** | Low |
| **Rule** | `bundle-preload` |
| **File** | `demo/src/app/page.tsx` |

**Current Pattern**: No preloading of destination pages on CTA hover.

**Recommendation**: For dynamically imported components, preload on hover:
```tsx
const preloadAnimation = () => {
  void import('@/components/elements/blur-transition-text')
}

<Button onMouseEnter={preloadAnimation} onFocus={preloadAnimation}>
  Try Bulma free
</Button>
```

**Impact**: Reduces perceived latency for animation appearance.

**Complexity Notes**: Minimal risk. Only beneficial if B-2 is implemented first.

---

### ~~2.3 Server-Side Performance (HIGH)~~ ✅ **COMPLETED**

**Current State**: Excellent—static export eliminates server-side concerns.

---

#### ~~Issue S-1: Add Resource Hints for External Domains~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Low |
| **Benefit** | Low |
| **Rule** | Resource hints (general) |
| **File** | `demo/src/app/layout.tsx` |

**Current Pattern**: `preconnect` only for Google Fonts (which should be removed per B-1).

**Recommendation**: Add hints for remaining external resources:
```tsx
<head>
  <link rel="dns-prefetch" href="https://app.bulma.com.au" />
  <link rel="preconnect" href="https://api-js.mixpanel.com" />
</head>
```

**Impact**: Saves 20-50ms on first navigation to app.bulma.com.au.

**Complexity Notes**: No risk—hints are ignored if not needed.

---

### ~~2.4 Client-Side Data Fetching (MEDIUM-HIGH)~~ ❌ **NOT APPLICABLE**

**Current State**: Not applicable—no client-side data fetching in this static marketing site.

**No issues found.**

---

### ~~2.5 Re-render Optimization (MEDIUM)~~ ✅ **COMPLETED**

**Current State**: Excellent. Proper use of `useCallback` where performance matters. State kept local to animation components.

---

#### ~~Issue R-1: Consider Memoizing Static JSX in Page Components~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Low |
| **Benefit** | Low |
| **Rule** | `rendering-hoist-jsx` |
| **File** | `demo/src/app/page.tsx` |

**Current Pattern**: Static FAQ array and structured data are hoisted correctly:
```tsx
const homeFaqs = [...] // ✅ Already hoisted
const homeStructuredData = [...] // ✅ Already hoisted
```

**Assessment**: The codebase already follows this pattern. No significant improvements needed.

**Impact**: None—already optimized.

---

### ~~2.6 Rendering Performance (MEDIUM)~~ ✅ **COMPLETED**

**Current State**: Good. Animation components use RAF throttling, passive listeners, and GPU acceleration.

---

#### ~~Issue P-1: Hero Images Missing `priority` Attribute~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Low |
| **Benefit** | High |
| **Rule** | LCP optimization |
| **File** | `demo/src/app/page.tsx:149-193` |

**Current Pattern**:
```tsx
<Image
  src="/img/screenshots/1.webp"
  alt={heroScreenshotAlt}
  className="bg-white/75 dark:hidden"
  width={3440}
  height={1990}
/>
```

**Problem**: Hero screenshot is the Largest Contentful Paint (LCP) element but has no `priority` attribute. Browser discovers it late in the render cycle.

**Recommendation**: Add `priority` to above-the-fold images:
```tsx
<Image
  src="/img/screenshots/1.webp"
  priority
  alt={heroScreenshotAlt}
  ...
/>
```

**Also Apply To**:
- All hero screenshot variants in `page.tsx` (lines 149-193)
- Navbar logo images in `layout.tsx` (lines 97-111)

**Impact**: LCP improvement of 100-300ms.

**Complexity Notes**: No risk—`priority` simply adds `fetchpriority="high"` and disables lazy loading.

---

#### ~~Issue P-2: Add `fetchPriority="high"` Explicitly~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Low |
| **Benefit** | Medium |
| **Rule** | Resource prioritization |
| **File** | `demo/src/app/page.tsx` |

**Current Pattern**: No explicit fetch priority hints.

**Recommendation**: Add alongside `priority` for clarity:
```tsx
<Image
  src="/img/screenshots/1.webp"
  priority
  fetchPriority="high"
  alt={heroScreenshotAlt}
  ...
/>
```

**Impact**: Cumulative with P-1; ensures browser prioritizes LCP image over other resources.

**Complexity Notes**: No risk.

---

#### ~~Issue P-3: Add content-visibility to Off-Screen Sections~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | Medium |
| **Benefit** | Medium |
| **Rule** | `rendering-content-visibility` |
| **File** | `demo/src/app/globals.css` |

**Current Pattern**: All sections render fully on initial paint.

**Problem**: Sections below the fold (Features, Stats, Testimonials, FAQs, Pricing, CTA) render even though they're not visible, slowing initial paint.

**Recommendation**: Add CSS utility for deferred rendering:
```css
/* In globals.css */
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

Apply to each below-fold section:
```tsx
<FeaturesTwoColumnWithDemos className="content-visibility-auto" ... />
```

**Sections to Apply**:

| Section | Apply? | Estimated Height |
|---------|--------|------------------|
| Hero | ❌ No | Above fold |
| Features | ✅ Yes | 800px |
| Stats | ✅ Yes | 400px |
| Testimonials | ✅ Yes | 600px |
| FAQs | ✅ Yes | 500px |
| Pricing | ✅ Yes | 700px |
| CTA | ✅ Yes | 300px |

**Impact**: FCP improvement of 30-50ms; faster scrolling on mobile.

**Complexity Notes**: Medium difficulty—requires testing to ensure animations still trigger correctly when sections become visible. May need to adjust IntersectionObserver thresholds.

---

### ~~2.7 JavaScript Performance (LOW-MEDIUM)~~ ✅ **COMPLETED**

**Current State**: Good. Animation logic uses efficient patterns (useCallback, RAF throttling).

---

#### ~~Issue J-1: Multiple Image Variants Loaded via CSS Hiding~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | High |
| **Benefit** | Medium |
| **Rule** | Image optimization (general) |
| **File** | `demo/src/app/page.tsx` |

**Current Pattern**:
```tsx
{/* All images load; CSS just hides some */}
<Image src="/img/screenshots/1-left-1670-top-1408.webp" className="md:hidden" ... />
<Image src="/img/screenshots/1-left-2000-top-1408.webp" className="max-md:hidden max-lg:hidden" ... />
<Image src="/img/screenshots/1.webp" className="max-lg:hidden" ... />
```

**Problem**: Browser downloads ALL image variants regardless of viewport. CSS `display: none` doesn't prevent fetching.

**Recommendation**: Use `<picture>` with `srcset` and `media` attributes:
```tsx
<picture>
  <source
    srcSet="/img/screenshots/1-left-1670-top-1408.webp"
    media="(max-width: 767px)"
  />
  <source
    srcSet="/img/screenshots/1-left-2000-top-1408.webp"
    media="(max-width: 1023px)"
  />
  <img
    src="/img/screenshots/1.webp"
    alt={heroScreenshotAlt}
    width={3440}
    height={1990}
  />
</picture>
```

**Impact**: 200-500KB savings on mobile (only loads appropriate image).

**Complexity Notes**: High difficulty—requires refactoring all responsive image usages. Dark mode support adds another layer (need separate `<source>` for each theme × breakpoint combination). Consider creating a `<ResponsiveScreenshot>` component to encapsulate logic.

---

### ~~2.8 Advanced Patterns (LOW)~~ ✅ **COMPLETED**

**Current State**: Not applicable—advanced patterns are edge cases for complex state management.

---

#### ~~Issue A-1: Consider View Transitions API~~ ✅ **COMPLETED**

| Attribute | Value |
|-----------|-------|
| **Difficulty** | High |
| **Benefit** | Low |
| **Rule** | N/A (cutting-edge) |
| **File** | N/A |

**Current Pattern**: No page transition animations.

**Recommendation**: Implement View Transitions API for smooth navigation:
```tsx
function TransitionLink({ href, children }) {
  const router = useRouter()

  const handleClick = (e) => {
    e.preventDefault()
    if ('startViewTransition' in document) {
      document.startViewTransition(() => router.push(href))
    } else {
      router.push(href)
    }
  }

  return <a href={href} onClick={handleClick}>{children}</a>
}
```

**Impact**: Premium UX on Chrome 111+ (progressive enhancement).

**Complexity Notes**: High difficulty—experimental API, requires progressive enhancement fallback, may conflict with existing animations. Low priority.

---

## 3. Existing Best Practices (No Action Needed)

These patterns are **already correctly implemented**:

| Pattern | Location | Status |
|---------|----------|--------|
| Server Components by default | All page.tsx files | Excellent |
| Client islands for interactivity | `'use client'` only on animation components | Excellent |
| Minimal dependencies | 7 production deps in package.json | Excellent |
| No barrel imports | Icons split into individual files | Excellent |
| `useCallback` for event handlers | `screenshot.tsx`, `magnetic-wrapper.tsx` | Excellent |
| Local state isolation | Animation state kept in component | Excellent |
| RAF throttling | `use-hero-parallax.ts`, `animated-counter.tsx` | Excellent |
| Passive event listeners | Scroll/mouse handlers | Excellent |
| GPU acceleration | `transform-gpu`, `will-change: transform` | Excellent |
| IntersectionObserver cleanup | `observer.disconnect()` after trigger | Excellent |
| Script loading strategy | `strategy="afterInteractive"` for Mixpanel | Excellent |
| SEO metadata | Structured data, OG tags, sitemap | Excellent |
| Static export optimization | `output: 'export'` in next.config.ts | Excellent |

---

## 4. Implementation Priority

### High Priority (Significant Impact)

| # | Issue | Difficulty | Benefit | Status |
|---|-------|------------|---------|--------|
| 1 | ~~P-1: Add `priority` to hero images~~ | Low | High | ✅ |
| 2 | ~~P-2: Add `fetchPriority="high"`~~ | Low | Medium | ✅ |
| 3 | ~~B-1: Migrate to `next/font`~~ | Medium | High | ✅ |

### Medium Priority (Moderate Impact)

| # | Issue | Difficulty | Benefit | Status |
|---|-------|------------|---------|--------|
| 4 | ~~B-2: Dynamic imports for animations~~ | Low | Medium | ✅ |
| 5 | ~~P-3: Add `content-visibility`~~ | Medium | Medium | ✅ |
| 6 | ~~S-1: Resource hints for external domains~~ | Low | Low | ✅ |

### Low Priority (Polish)

| # | Issue | Difficulty | Benefit | Status |
|---|-------|------------|---------|--------|
| 7 | ~~B-3: Preload on hover~~ | Low | Low | ✅ |
| 8 | ~~J-1: Responsive image optimization~~ | High | Medium | ✅ |
| 9 | ~~A-1: View Transitions API~~ | High | Low | ✅ |

---

## 5. Metrics & Verification

### Before Implementation
- Run Lighthouse performance audit on `/` (homepage)
- Record bundle size with `npm run build`
- Measure LCP using Chrome DevTools Performance tab
- Note FCP timing in Lighthouse report

### After Implementation
- Re-run Lighthouse, target performance score 95+
- Verify LCP < 2.5s (Good threshold)
- Verify FCP < 1.8s
- Confirm JS bundle reduction for dynamic imports

### Regression Testing
- `npm run build` completes without errors
- `npm run lint` passes
- Manual test: verify animations trigger correctly
- Test on mobile device (iPhone SE or equivalent)
- Test with network throttling (Fast 3G)

---

## 6. References

- [Vercel React Best Practices Guide](/.claude/skills/react-best-practices/AGENTS.md)
- [How We Optimized Package Imports in Next.js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [next/font Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [next/image priority](https://nextjs.org/docs/app/api-reference/components/image#priority)
- [CSS content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)
