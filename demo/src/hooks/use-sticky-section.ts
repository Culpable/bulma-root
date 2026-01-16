'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Configuration for sticky section behavior
 */
interface UseStickyOptions {
  /** Offset from top of viewport for sticky detection (default: 64px for navbar) */
  topOffset?: number
  /** Threshold for determining when eyebrow is "stuck" (default: 0.1) */
  stuckThreshold?: number
}

/**
 * Hook for sticky section eyebrow labels with scroll-aware state.
 * Detects when a section eyebrow is "stuck" at the top of the viewport
 * and when the section is the active/visible section.
 *
 * @param options - Configuration options
 * @returns Object with ref, stuck state, and active state
 *
 * @example
 * ```tsx
 * const { containerRef, eyebrowRef, isStuck, isActive } = useStickySection()
 *
 * return (
 *   <section ref={containerRef}>
 *     <div ref={eyebrowRef} data-stuck={isStuck} data-active={isActive}>
 *       Section Label
 *     </div>
 *   </section>
 * )
 * ```
 */
export function useStickySection({
  topOffset = 64,
  stuckThreshold = 0.1,
}: UseStickyOptions = {}) {
  // Ref for the section container
  const containerRef = useRef<HTMLElement>(null)
  // Ref for the eyebrow element
  const eyebrowRef = useRef<HTMLDivElement>(null)

  // Track if eyebrow is currently stuck
  const [isStuck, setIsStuck] = useState(false)
  // Track if this section is the active/visible section
  const [isActive, setIsActive] = useState(false)

  // Handle stuck detection using scroll position
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    const eyebrow = eyebrowRef.current
    if (!container || !eyebrow) return

    const containerRect = container.getBoundingClientRect()
    const eyebrowRect = eyebrow.getBoundingClientRect()

    // Check if eyebrow is at the sticky position (within 2px tolerance)
    const isAtStickyPosition = Math.abs(eyebrowRect.top - topOffset) < 2

    // Check if we've scrolled past the eyebrow's natural position
    // and the section is still in view
    const sectionTop = containerRect.top
    const sectionBottom = containerRect.bottom
    const viewportHeight = window.innerHeight

    // Section is considered "in view" if a meaningful portion is visible
    const sectionInView =
      sectionTop < viewportHeight * (1 - stuckThreshold) &&
      sectionBottom > topOffset + 50

    // Eyebrow is stuck if it's at sticky position and section is in view
    setIsStuck(isAtStickyPosition && sectionInView && sectionTop < topOffset)

    // Section is active if it's the most prominent section in viewport
    const sectionVisibleHeight = Math.min(sectionBottom, viewportHeight) -
      Math.max(sectionTop, topOffset)
    const sectionVisibleRatio = sectionVisibleHeight / containerRect.height

    setIsActive(sectionVisibleRatio > 0.3 && sectionTop < viewportHeight * 0.5)
  }, [topOffset, stuckThreshold])

  useEffect(() => {
    // Add scroll listener with passive flag for performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return {
    containerRef,
    eyebrowRef,
    isStuck,
    isActive,
  }
}
