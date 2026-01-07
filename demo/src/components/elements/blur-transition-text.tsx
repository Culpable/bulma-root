'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useState, useRef } from 'react'

/**
 * Configuration for blur transition animation timing.
 */
const BLUR_CONFIG = {
  // Duration of the blur out/in transition (ms)
  blurDuration: 400,
  // How long each phrase is displayed (ms)
  displayDuration: 3000,
}

interface BlurTransitionTextProps {
  /** Array of phrases to cycle through */
  phrases: string[]
  /** Additional class names for the container */
  className?: string
}

/**
 * Blur transition text component that blurs out the current phrase
 * and blurs in the next phrase for a dreamy, modern effect.
 * Uses a fixed-width container sized to the longest phrase to prevent layout shift.
 *
 * IMPORTANT: Wraps in a single relative container so the absolute-positioned
 * measurement span is properly contained and doesn't interfere with parent
 * text-balance or other layout properties.
 */
export function BlurTransitionText({ phrases, className }: BlurTransitionTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isBlurred, setIsBlurred] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const hasInitialized = useRef(false)
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // Clear any scheduled interval/timeout so the animation can pause cleanly.
  const clearTimers = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // Measure the longest phrase on mount to set fixed container width
  useEffect(() => {
    if (measureRef.current && !hasInitialized.current) {
      const measureEl = measureRef.current
      let maxWidth = 0

      phrases.forEach((phrase) => {
        measureEl.textContent = phrase
        const width = measureEl.getBoundingClientRect().width
        if (width > maxWidth) {
          maxWidth = width
        }
      })

      measureEl.textContent = phrases[0]
      setContainerWidth(Math.ceil(maxWidth))
      hasInitialized.current = true
    }
  }, [phrases])

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

  // Handle the blur transition cycle
  useEffect(() => {
    if (!containerWidth || phrases.length < 2) return

    if (!isVisible) {
      clearTimers()
      setIsBlurred(false)
      return
    }

    clearTimers()

    intervalRef.current = window.setInterval(() => {
      // Blur out
      setIsBlurred(true)

      // After blur out completes, change phrase and blur in
      timeoutRef.current = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length)
        setIsBlurred(false)
      }, BLUR_CONFIG.blurDuration)
    }, BLUR_CONFIG.displayDuration)

    return () => clearTimers()
  }, [phrases.length, containerWidth, isVisible])

  // Single wrapper span with relative positioning to contain the absolute measurement span.
  // This prevents the hidden span from escaping and interfering with parent layout (e.g. text-balance).
  // Uses min() to pick smaller of: fixed width (prevents jumping) OR viewport minus padding (prevents overflow).
  return (
    <span
      ref={containerRef}
      className="relative inline-block align-baseline"
      style={{
        width: containerWidth ? `min(${containerWidth}px, 100vw - 3rem)` : 'auto'
      }}
    >
      {/* Hidden element used to measure phrase widths - absolutely positioned within relative parent */}
      <span
        ref={measureRef}
        className={clsx('pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap', className)}
        aria-hidden="true"
      >
        {phrases[0]}
      </span>

      {/* Visible animated text */}
      <span
        className={clsx('inline-block text-left transition-all ease-out', className)}
        style={{
          transitionDuration: `${BLUR_CONFIG.blurDuration}ms`,
          opacity: isBlurred ? 0 : 1,
          filter: isBlurred ? 'blur(12px)' : 'blur(0)',
          transform: isBlurred ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {phrases[currentIndex]}
      </span>
    </span>
  )
}
