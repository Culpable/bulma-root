'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * IntersectionObserver threshold array - hoisted to module level to avoid
 * recreating on every effect run.
 */
const HUE_SHIFT_THRESHOLDS: number[] = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]

/**
 * Section identifiers and their corresponding hue shifts.
 * Positive values shift toward warmer colors, negative toward cooler.
 */
const SECTION_HUE_MAP: Record<string, number> = {
  hero: 0,
  features: 3,
  stats: 5,
  testimonials: 2,
  pricing: -2,
  faqs: 1,
  cta: 0,
}

/**
 * Configuration for hue shift behavior
 */
interface UseHueShiftOptions {
  /** Whether to enable hue shift (default: true) */
  enabled?: boolean
  /** Transition duration in ms (default: 500) */
  transitionDuration?: number
  /** Section IDs to track (default: all sections in SECTION_HUE_MAP) */
  sections?: string[]
}

/**
 * Hook that tracks scroll position and updates CSS custom property
 * --accent-hue-shift based on which section is currently active.
 *
 * Creates subtle sense of journey through page by shifting accent colors.
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * // In layout or page component
 * useHueShift({ enabled: true })
 *
 * // Sections use data-section-hue attribute
 * <section data-section-hue="features" className="hue-shift-bg">
 *   ...
 * </section>
 * ```
 */
export function useHueShift({
  enabled = true,
  transitionDuration = 500,
  sections = Object.keys(SECTION_HUE_MAP),
}: UseHueShiftOptions = {}) {
  // Store current active section to avoid unnecessary updates
  const activeSectionRef = useRef<string | null>(null)
  // Store section elements for intersection observation
  const sectionElementsRef = useRef<Map<string, Element>>(new Map())

  // Update the CSS custom property
  const updateHueShift = useCallback((sectionId: string | null) => {
    if (!enabled) return
    if (sectionId === activeSectionRef.current) return

    activeSectionRef.current = sectionId
    const hueShift = sectionId ? (SECTION_HUE_MAP[sectionId] ?? 0) : 0

    // Set the CSS custom property on document root
    document.documentElement.style.setProperty(
      '--accent-hue-shift',
      `${hueShift}deg`
    )

    // Update data-hue-active attribute on sections
    sectionElementsRef.current.forEach((element, id) => {
      if (id === sectionId) {
        element.setAttribute('data-hue-active', 'true')
      } else {
        element.removeAttribute('data-hue-active')
      }
    })
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    // Find all sections with data-section-hue attribute
    const sectionElements = document.querySelectorAll('[data-section-hue]')
    sectionElements.forEach((element) => {
      const sectionId = element.getAttribute('data-section-hue')
      if (sectionId && sections.includes(sectionId)) {
        sectionElementsRef.current.set(sectionId, element)
      }
    })

    // Create intersection observer to track which section is most visible
    const observer = new IntersectionObserver(
      (entries) => {
        // Single-pass algorithm to find most visible section
        // Avoids filter → map → sort chain that creates intermediate arrays
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

        // Only update if section is significantly visible (threshold check)
        if (mostVisibleId && maxRatio > 0.2) {
          updateHueShift(mostVisibleId)
        }
      },
      {
        // Multiple thresholds for smoother detection (hoisted to module level)
        threshold: HUE_SHIFT_THRESHOLDS,
        // Adjust root margin to favor sections near viewport center
        rootMargin: '-20% 0px -20% 0px',
      }
    )

    // Observe all section elements
    sectionElementsRef.current.forEach((element) => {
      observer.observe(element)
    })

    // Set CSS transition duration
    document.documentElement.style.setProperty(
      '--hue-transition-duration',
      `${transitionDuration}ms`
    )

    return () => {
      observer.disconnect()
      sectionElementsRef.current.clear()
      // Reset hue shift on cleanup
      document.documentElement.style.removeProperty('--accent-hue-shift')
    }
  }, [enabled, sections, transitionDuration, updateHueShift])

  return {
    /** Get the hue shift value for a specific section */
    getHueForSection: (sectionId: string) => SECTION_HUE_MAP[sectionId] ?? 0,
    /** Section IDs being tracked */
    trackedSections: sections,
  }
}
