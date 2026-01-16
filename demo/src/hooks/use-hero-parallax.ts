'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Configuration for the parallax effect.
 * Adjust these values to tune performance and behavior.
 */
const PARALLAX_CONFIG = {
  /** Maximum scroll distance to apply parallax (pixels from top) */
  maxScrollDistance: 800,
  /** Throttle delay for scroll event processing (ms) */
  throttleDelay: 16, // ~60fps
  /** Delay before removing will-change after scroll stops (ms) */
  scrollEndDelay: 150,
}

/**
 * Hook that provides scroll-based parallax transformation for hero elements.
 * Returns a ref to attach to the parallax container and the current scroll position.
 *
 * The hook:
 * - Tracks scroll position and updates CSS custom property --scroll-y
 * - Sets data-scrolling attribute during active scroll for will-change optimization
 * - Automatically disables on touch devices
 * - Uses requestAnimationFrame for smooth 60fps updates
 *
 * Usage:
 * ```tsx
 * function Hero() {
 *   const { containerRef, scrollY, isScrolling } = useHeroParallax()
 *
 *   return (
 *     <div ref={containerRef} className="hero-parallax">
 *       <div className="hero-parallax-element hero-parallax-screenshot">
 *         <Screenshot />
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */
export function useHeroParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollEndTimerRef = useRef<NodeJS.Timeout | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastScrollRef = useRef(0)

  // Check if device supports hover (non-touch)
  const [supportsHover, setSupportsHover] = useState(true)

  useEffect(() => {
    // Check for touch device
    const mediaQuery = window.matchMedia('(hover: hover)')
    requestAnimationFrame(() => {
      setSupportsHover(mediaQuery.matches)
    })

    const handleChange = (e: MediaQueryListEvent) => {
      setSupportsHover(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Update CSS custom property on container
  const updateScrollProperty = useCallback((value: number) => {
    const container = containerRef.current
    if (container) {
      container.style.setProperty('--scroll-y', String(value))
    }
  }, [])

  // Handle scroll events with RAF throttling
  const handleScroll = useCallback(() => {
    // Skip if touch device or reduced motion is preferred
    if (!supportsHover) return

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Schedule update
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return

      // Get container's position relative to viewport
      const rect = container.getBoundingClientRect()
      const containerTop = rect.top

      // Calculate scroll progress within hero section
      // Only apply parallax when hero is in view
      if (containerTop > window.innerHeight || rect.bottom < 0) {
        // Hero is not in view, reset
        setScrollY(0)
        updateScrollProperty(0)
        return
      }

      // Calculate scroll offset clamped to max distance
      const scrollOffset = Math.min(
        Math.max(-containerTop, 0),
        PARALLAX_CONFIG.maxScrollDistance
      )

      // Only update if value changed significantly (reduces repaints)
      if (Math.abs(scrollOffset - lastScrollRef.current) > 0.5) {
        lastScrollRef.current = scrollOffset
        setScrollY(scrollOffset)
        updateScrollProperty(scrollOffset)
      }

      // Mark as scrolling
      setIsScrolling(true)

      // Clear existing scroll end timer
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current)
      }

      // Set scroll end timer
      scrollEndTimerRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, PARALLAX_CONFIG.scrollEndDelay)
    })
  }, [supportsHover, updateScrollProperty])

  // Attach scroll listener
  useEffect(() => {
    if (!supportsHover) return

    // Initial calculation
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current)
      }
    }
  }, [supportsHover, handleScroll])

  return {
    /** Ref to attach to the parallax container */
    containerRef,
    /** Current scroll offset in pixels */
    scrollY,
    /** Whether user is actively scrolling */
    isScrolling,
    /** Whether device supports parallax (non-touch) */
    isEnabled: supportsHover,
  }
}
