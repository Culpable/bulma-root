# Performance Optimisation Plan

<important_note>
> **IMPORTANT NOTE:** Each step includes a "How to Test" section with specific locations and verification instructions. This allows testing in a fresh context without prior conversation history.
</important_note>

## 1. Goal

Improve frontend performance by eliminating unnecessary CPU/GPU usage from animations and effects while maintaining 100% visual parity. The site currently has several components that consume resources even when not visible or not being interacted with, causing unnecessary battery drain and competing with legitimate animations for frame budget.

**Success Criteria:**
- All infinite/continuous animations pause when off-screen
- No permanent GPU layer promotion via `will-change` on idle elements
- Remove invisible effects that consume resources for no visual benefit
- Zero visual regression on any component

---

## 2. Current State Analysis

### 2.1 Current Implementation Overview

The site has several animation effects that run continuously regardless of visibility or interaction state:

| Component | File | Issue |
|-----------|------|-------|
| DotMatrix | `demo/src/components/sections/stats-animated-graph.tsx` | Invisible effect consuming CPU (2.5% opacity - imperceptible) |
| MagneticWrapper | `demo/src/app/globals.css` | Permanent `will-change: transform` on all instances |
| LogoMarquee | `demo/src/components/elements/logo-marquee.tsx` | CSS animation runs when scrolled off-screen |
| GradientBorderWrapper | `demo/src/components/elements/gradient-border-wrapper.tsx` | Rotating gradient runs when off-screen |
| Stats ping animation | `demo/src/components/sections/stats-animated-graph.tsx` | Infinite ping runs forever once triggered |

### 2.2 The Core Problem

**DotMatrix:** Was running continuous `requestAnimationFrame` for an effect so subtle (2.5% opacity dots) that it was invisible to users. Removed entirely.

**Other animations:** CSS animations with `animation: ... infinite` continue running even when scrolled out of view, wasting compositor time.

### 2.3 Existing Infrastructure That Can Be Reused

The codebase already has the correct pattern implemented in `blur-transition-text.tsx`:

```tsx
// Track visibility so the animation pauses when the hero scrolls out of view.
useEffect(() => {
  const container = containerRef.current
  if (!container) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setIsVisible(entry.isIntersecting)
    },
    { threshold: 0.1 }
  )

  observer.observe(container)

  return () => observer.disconnect()
}, [])
```

This pattern should be applied consistently across all continuous animations.

---

## 3. Desired State

### 3.1 Desired State Requirements

- **REQ-1 (MUST)**: Remove DotMatrix from stats section (invisible, wasting resources)
- **REQ-2 (MUST)**: MagneticWrapper only applies `will-change` during hover/focus, not permanently
- **REQ-3 (MUST)**: LogoMarquee pauses CSS animation when scrolled off-screen
- **REQ-4 (MUST)**: GradientBorderWrapper pauses rotation when scrolled off-screen
- **REQ-5 (MUST)**: Stats ping animation limited to 3 iterations instead of infinite
- **REQ-6 (MUST NOT)**: No visual regression on any component
- **REQ-7 (SHOULD)**: Use IntersectionObserver consistently for visibility detection

### 3.2 Verification Checklist

**Functional:**
- [x] Stats section renders correctly without DotMatrix
- [x] Logo marquee scrolls smoothly when visible
- [x] Gradient border rotates on CTA buttons when visible
- [x] Magnetic effect works on buttons when hovered
- [x] Stats graph animates correctly on scroll-into-view

**Performance:**
- [x] No DotMatrix RAF loop running
- [x] No `will-change` applied to magnetic buttons when not interacting
- [x] Logo marquee animation paused when off-screen
- [x] Gradient border animation paused when off-screen

---

## 4. Implementation Plan

### ~~Step 1: Remove DotMatrix from Stats Section~~ ✅ **COMPLETED**

**Objective:** Remove invisible effect that was consuming CPU for no visual benefit

**Files Changed:**
- `demo/src/components/sections/stats-animated-graph.tsx` - Removed DotMatrix import and usage

**What Was Done:**
- Removed `DotMatrix` import from stats-animated-graph.tsx
- Removed `<DotMatrix>` component from the section JSX
- The effect was set to 2.5% base opacity / 12% max opacity - too subtle to see
- Component file `dot-matrix.tsx` retained (may be useful elsewhere with higher opacity)

#### How to Test

**Location:** Homepage → scroll to "Trusted by brokers" section

| Element | How to Find |
|---------|-------------|
| Section ID | `#stats` |
| Eyebrow | "Trusted by brokers" |
| Headline | "The policy assistant Australian brokers rely on." |
| Stats | "30+" and "Seconds" with descriptions |
| Graph | Curved line chart at bottom of section |

**Verification:**
1. Section should render identically (the effect was invisible anyway)
2. No visual change expected - this was purely a performance fix
3. CPU usage should be lower when viewing this section

---

### ~~Step 2: MagneticWrapper - Conditional will-change~~ ✅ **COMPLETED**

**Objective:** Only promote to GPU layer during active interaction

**Files Changed:**
- `demo/src/app/globals.css` - Added `:hover` and `:focus-within` conditions for `will-change`
- `demo/src/components/elements/magnetic-wrapper.tsx` - Added `magnetic-wrapper` class to component (was missing)

**What Was Done:**
1. Removed permanent `will-change: transform` from `.magnetic-wrapper` base class
2. Added `will-change: transform` only on `:hover` and `:focus-within` states
3. Fixed component to actually use the `magnetic-wrapper` CSS class (previously only used `inline-block`)

**Coverage:** All 4 MagneticWrapper usages in the app (homepage hero CTAs + footer CTAs) now benefit from this optimisation.

#### How to Test

**Location:** Homepage → Hero section CTA buttons, and bottom CTA section

| Element | How to Find |
|---------|-------------|
| Hero CTAs | "Try Bulma free" (primary) and "See it in action" buttons at top of page |
| Footer CTAs | "Try Bulma free" and "Book a demo" buttons in the "Ready to spend less time..." section near bottom |

**What the Magnetic Effect Does:**
- When you hover near these buttons, they subtly "pull" toward your cursor (max 6px offset)
- When you move away, they spring back to original position

**Verification:**
1. Hover over "Try Bulma free" button - it should pull slightly toward your cursor
2. Move cursor around the button - button follows slightly
3. Move cursor away - button springs back to center
4. Effect should feel identical to before (smooth, responsive)

---

### ~~Step 3: LogoMarquee - Pause When Off-Screen~~ ✅ **COMPLETED**

**Objective:** Stop CSS animation when not visible

**File:** `demo/src/components/elements/logo-marquee.tsx`

**What Was Done:**
1. Added `useRef`, `useState`, and `useEffect` imports from React
2. Added `containerRef` to track the marquee container element
3. Added `isVisible` state (defaults to `true` to avoid flash of paused state on mount)
4. Added IntersectionObserver effect with `threshold: 0.1` to track when marquee enters/exits viewport
5. Added `animationPlayState: isVisible ? 'running' : 'paused'` inline style to the track div
6. Animation now pauses when scrolled off-screen, reducing GPU/compositor overhead

#### How to Test

**Location:** Homepage → Hero section footer (below the main CTA buttons)

| Element | How to Find |
|---------|-------------|
| Section | Below the hero screenshot, above "Built for brokers" features section |
| Content | Horizontally scrolling row of lender logos (bank logos) |
| Behaviour | Logos continuously scroll left in an infinite loop |

**Verification:**
1. Scroll to hero section - logos should be scrolling smoothly
2. Scroll down past the logos until they're off-screen
3. Scroll back up - logos should resume scrolling seamlessly
4. Effect should look identical when visible

---

### ~~Step 4: GradientBorderWrapper - Pause When Off-Screen~~ ✅ **COMPLETED**

**Objective:** Stop gradient rotation when not visible

**File:** `demo/src/components/elements/gradient-border-wrapper.tsx`

**What Was Done:**
1. Added `useState` import for visibility tracking
2. Added `isVisible` state (defaults to `true` to avoid flash on mount)
3. Added IntersectionObserver effect with `threshold: 0.1` to track when wrapper enters/exits viewport
4. Added `animationPlayState: isVisible ? 'running' : 'paused'` to the wrapper style
5. Updated shimmer effect to also pause interval when off-screen (added `isVisible` to dependency array)

#### How to Test

**Location:** Homepage → Hero CTAs and Footer CTAs

| Element | How to Find |
|---------|-------------|
| Hero CTA | "Try Bulma free" button at top of page - has animated gradient border |
| Footer CTA | "Try Bulma free" button in "Ready to spend less time..." section |
| Effect | Subtle rotating gradient around the button border |

**Verification:**
1. Look at "Try Bulma free" button - border gradient should rotate smoothly
2. Scroll down until button is off-screen
3. Scroll back up - gradient should still be rotating
4. Speed up on hover (border rotates faster when hovering)

---

### ~~Step 5: Stats Ping - Limit Iterations~~ ✅ **COMPLETED**

**Objective:** Stop ping animation after visual effect is established

**File:** `demo/src/components/sections/stats-animated-graph.tsx`

**What Was Done:**
1. Changed `animate-[ping_2s_ease-out_infinite]` to `animate-[ping_2s_ease-out_3]`
2. Animation now plays 3 times then stops, reducing ongoing GPU overhead

#### How to Test

**Location:** Homepage → "Trusted by brokers" stats section → graph

| Element | How to Find |
|---------|-------------|
| Section ID | `#stats` |
| Graph | Curved ascending line chart at bottom of section |
| Ping dot | Small pulsing circle at the top-right end of the graph line |

**Verification:**
1. Scroll down to the stats section - graph should animate in
2. Watch the dot at the end of the graph line
3. It should pulse/ping 3 times and then stop
4. Previously it pulsed infinitely - now stops after 3 to save resources

---

## 5. Testing Plan

### 5.1 Visual Regression Tests

| Test Case | Component | Expected Result |
|-----------|-----------|-----------------|
| Stats section | StatsAnimatedGraph | Section renders identically (DotMatrix was invisible) |
| Marquee scroll | LogoMarquee | Logos scroll left smoothly when section visible |
| Gradient rotation | GradientBorderWrapper | Border rotates on CTA buttons when visible |
| Magnetic pull | MagneticWrapper | Buttons pull toward cursor on hover |
| Stats entrance | StatsAnimatedGraph | Graph draws, ping pulses 3 times, stops |

### 5.2 Performance Tests

1. **Magnetic button GPU layers**
   - Action: Inspect elements in DevTools → Layers panel
   - Expected: Magnetic buttons only promoted to GPU layer on hover
   - Verify: No permanent `will-change` on idle buttons

2. **Off-screen animation pausing**
   - Action: Scroll past logo marquee to features section
   - Expected: Marquee animation paused (verify via DevTools animation panel)
   - Verify: Animation resumes when scrolled back into view
