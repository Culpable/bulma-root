'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Configuration for scroll highlight behavior
 */
interface UseScrollHighlightOptions {
  /** Vertical margin from viewport edges to define "center" zone (default: '40%') */
  centerMargin?: string
  /** Whether to enable highlighting (default: true) */
  enabled?: boolean
  /** Index for stagger delay (default: 0) */
  index?: number
}

/**
 * Hook that detects when an element passes through the viewport center,
 * enabling highlight effects for key phrases and important content.
 *
 * Uses IntersectionObserver with rootMargin to detect center-screen position.
 * Creates reading focus guide for important content.
 *
 * @param options - Configuration options
 * @returns Object with ref and highlighted state
 *
 * @example
 * ```tsx
 * function HighlightedText({ children }) {
 *   const { ref, isHighlighted } = useScrollHighlight({ index: 0 })
 *
 *   return (
 *     <span
 *       ref={ref}
 *       className="scroll-highlight"
 *       data-highlighted={isHighlighted}
 *       data-highlight-index={0}
 *     >
 *       {children}
 *     </span>
 *   )
 * }
 * ```
 */
export function useScrollHighlight({
  centerMargin = '40%',
  enabled = true,
  index = 0,
}: UseScrollHighlightOptions = {}) {
  const ref = useRef<HTMLElement>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    // Create observer that only triggers when element is in center zone
    // Using negative margins to create a "center" detection area
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHighlighted(entry.isIntersecting)
      },
      {
        // Negative margins shrink the viewport for intersection
        // This creates a "center" zone where elements are highlighted
        rootMargin: `-${centerMargin} 0px -${centerMargin} 0px`,
        threshold: 0,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [centerMargin, enabled])

  return {
    ref,
    isHighlighted,
    index,
  }
}

/**
 * Hook that manages multiple scroll highlights within a container.
 * Useful for highlighting multiple phrases that should be tracked together.
 *
 * @param count - Number of highlight elements to track
 * @param options - Configuration options
 * @returns Array of refs and highlighted states
 *
 * @example
 * ```tsx
 * function HighlightedParagraph({ phrases }) {
 *   const highlights = useScrollHighlights(phrases.length)
 *
 *   return (
 *     <p>
 *       {phrases.map((phrase, i) => (
 *         <span
 *           key={i}
 *           ref={highlights[i].ref}
 *           className="scroll-highlight"
 *           data-highlighted={highlights[i].isHighlighted}
 *           data-highlight-index={i}
 *         >
 *           {phrase}
 *         </span>
 *       ))}
 *     </p>
 *   )
 * }
 * ```
 */
export function useScrollHighlights(
  count: number,
  options: Omit<UseScrollHighlightOptions, 'index'> = {}
) {
  // Create refs for each highlight element
  const refs = useRef<(HTMLElement | null)[]>(Array(count).fill(null))
  const [highlightedStates, setHighlightedStates] = useState<boolean[]>(
    Array(count).fill(false)
  )

  useEffect(() => {
    if (!options.enabled) return

    const observers: IntersectionObserver[] = []
    const centerMargin = options.centerMargin ?? '40%'

    refs.current.forEach((element, index) => {
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          setHighlightedStates((prev) => {
            const next = [...prev]
            next[index] = entry.isIntersecting
            return next
          })
        },
        {
          rootMargin: `-${centerMargin} 0px -${centerMargin} 0px`,
          threshold: 0,
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [count, options.enabled, options.centerMargin])

  return refs.current.map((_, index) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[index] = el
    },
    isHighlighted: highlightedStates[index],
    index,
  }))
}
