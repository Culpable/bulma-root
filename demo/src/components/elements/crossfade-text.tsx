'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useState, useRef } from 'react'

/**
 * Configuration for crossfade animation timing.
 */
const CROSSFADE_CONFIG = {
  // Duration of the fade transition (ms)
  fadeDuration: 600,
  // How long each phrase is displayed (ms)
  displayDuration: 3000,
  // Initial delay before starting animation (ms)
  initialDelay: 500,
}

interface CrossfadeTextProps {
  /** Array of phrases to cycle through */
  phrases: string[]
  /** Additional class names for the container */
  className?: string
}

/**
 * Crossfade text component that smoothly transitions between phrases.
 * Uses a fixed-width container sized to the longest phrase to prevent layout shift.
 * Phrases fade out and in with opacity transitions for an elegant effect.
 */
export function CrossfadeText({ phrases, className }: CrossfadeTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const hasInitialized = useRef(false)

  // Measure the longest phrase on mount to set fixed container width
  useEffect(() => {
    if (measureRef.current && !hasInitialized.current) {
      const measureEl = measureRef.current
      let maxWidth = 0

      // Temporarily render each phrase to measure its width
      phrases.forEach((phrase) => {
        measureEl.textContent = phrase
        const width = measureEl.getBoundingClientRect().width
        if (width > maxWidth) {
          maxWidth = width
        }
      })

      // Reset to first phrase and set the fixed width
      measureEl.textContent = phrases[0]
      setContainerWidth(Math.ceil(maxWidth))
      hasInitialized.current = true
    }
  }, [phrases])

  // Handle the crossfade animation cycle - single consolidated effect
  useEffect(() => {
    // Wait until width measurement is complete
    if (containerWidth === null) return

    let intervalId: ReturnType<typeof setInterval>
    let fadeTimeoutId: ReturnType<typeof setTimeout>

    // Function to perform one fade cycle
    const performCycle = () => {
      // Fade out current phrase
      setIsVisible(false)

      // After fade out completes, switch phrase and fade back in
      fadeTimeoutId = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length)
        setIsVisible(true)
      }, CROSSFADE_CONFIG.fadeDuration)
    }

    // Start cycling after initial delay
    const initialTimeoutId = setTimeout(() => {
      // Perform first cycle
      performCycle()

      // Set up recurring interval for subsequent cycles
      // Interval = display time + fade out + fade in
      const totalCycleTime =
        CROSSFADE_CONFIG.displayDuration + CROSSFADE_CONFIG.fadeDuration
      intervalId = setInterval(performCycle, totalCycleTime)
    }, CROSSFADE_CONFIG.initialDelay + CROSSFADE_CONFIG.displayDuration)

    // Cleanup all timers on unmount
    return () => {
      clearTimeout(initialTimeoutId)
      clearTimeout(fadeTimeoutId)
      clearInterval(intervalId)
    }
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
          className={clsx(
            'inline-block transition-opacity',
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transitionDuration: `${CROSSFADE_CONFIG.fadeDuration}ms` }}
        >
          {phrases[currentIndex]}
        </span>
      </span>
    </>
  )
}
