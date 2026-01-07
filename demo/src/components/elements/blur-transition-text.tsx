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
  const measureRef = useRef<HTMLSpanElement>(null)
  const hasInitialized = useRef(false)

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

  // Handle the blur transition cycle
  useEffect(() => {
    if (!containerWidth) return

    const interval = setInterval(() => {
      // Blur out
      setIsBlurred(true)

      // After blur out completes, change phrase and blur in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length)
        setIsBlurred(false)
      }, BLUR_CONFIG.blurDuration)
    }, BLUR_CONFIG.displayDuration)

    return () => clearInterval(interval)
  }, [phrases.length, containerWidth])

  // Single wrapper span with relative positioning to contain the absolute measurement span.
  // This prevents the hidden span from escaping and interfering with parent layout (e.g. text-balance).
  // Uses width for stability on desktop (prevents jumping) + maxWidth 100% to prevent mobile overflow.
  return (
    <span
      className="relative inline-block align-baseline"
      style={{
        width: containerWidth ? `${containerWidth}px` : 'auto',
        maxWidth: '100%'
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
