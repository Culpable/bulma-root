'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useState, useRef } from 'react'

/**
 * Configuration for vertical slot animation timing.
 */
const SLOT_CONFIG = {
  // Duration of the slide transition (ms)
  slideDuration: 500,
  // How long each phrase is displayed (ms)
  displayDuration: 3000,
  // Initial delay before starting animation (ms)
  initialDelay: 500,
}

interface VerticalSlotTextProps {
  /** Array of phrases to cycle through */
  phrases: string[]
  /** Additional class names for the container */
  className?: string
}

/**
 * Vertical slot machine text component that slides phrases up/down.
 * Uses a fixed-width container sized to the longest phrase to prevent layout shift.
 * Overflow is hidden to create a slot machine / ticker tape effect.
 */
export function VerticalSlotText({ phrases, className }: VerticalSlotTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
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

  // Handle the slot animation cycle
  useEffect(() => {
    if (!containerWidth) return

    const interval = setInterval(() => {
      // Start animating
      setIsAnimating(true)

      // After animation completes, update index and reset
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length)
        setIsAnimating(false)
      }, SLOT_CONFIG.slideDuration)
    }, SLOT_CONFIG.displayDuration)

    return () => clearInterval(interval)
  }, [phrases.length, containerWidth])

  // Get the next index for the incoming phrase
  const nextIndex = (currentIndex + 1) % phrases.length

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

      {/* Visible container with fixed width and overflow hidden */}
      <span
        className={clsx('relative inline-flex overflow-hidden text-left align-bottom', className)}
        style={{
          width: containerWidth ? `${containerWidth}px` : 'auto',
          height: '1.2em',
        }}
      >
        {/* Current phrase - slides up when animating */}
        <span
          className={clsx(
            'absolute inset-x-0 transition-transform ease-out',
            isAnimating ? '-translate-y-full' : 'translate-y-0'
          )}
          style={{ transitionDuration: `${SLOT_CONFIG.slideDuration}ms` }}
        >
          {phrases[currentIndex]}
        </span>

        {/* Next phrase - slides in from below when animating */}
        <span
          className={clsx(
            'absolute inset-x-0 transition-transform ease-out',
            isAnimating ? 'translate-y-0' : 'translate-y-full'
          )}
          style={{ transitionDuration: `${SLOT_CONFIG.slideDuration}ms` }}
        >
          {phrases[nextIndex]}
        </span>
      </span>
    </>
  )
}
