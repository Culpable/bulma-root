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

  return (
    <>
      {/* Hidden element used to measure phrase widths */}
      <span
        ref={measureRef}
        className={clsx('invisible absolute whitespace-nowrap', className)}
        aria-hidden="true"
      >
        {phrases[0]}
      </span>

      {/* Visible container with fixed width */}
      <span
        className={clsx('inline-block text-left', className)}
        style={{ width: containerWidth ? `${containerWidth}px` : 'auto' }}
      >
        <span
          className="inline-block transition-all ease-out"
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
    </>
  )
}
