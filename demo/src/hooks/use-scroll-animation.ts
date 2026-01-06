'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Hook for scroll-triggered animations using IntersectionObserver.
 * Returns a ref to attach to the container and visibility state.
 *
 * @param options - IntersectionObserver options
 * @param options.threshold - Visibility threshold to trigger animation (default: 0.1)
 * @param options.rootMargin - Margin around root element (default: '0px')
 * @param options.triggerOnce - Only trigger animation once (default: true)
 */
export function useScrollAnimation({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}: {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return { containerRef, isVisible }
}


/**
 * Utility to generate staggered animation delay style.
 *
 * @param index - Item index in the list
 * @param baseDelay - Base delay in milliseconds (default: 100)
 */
export function getStaggerDelay(index: number, baseDelay: number = 100): React.CSSProperties {
  return { transitionDelay: `${index * baseDelay}ms` }
}
