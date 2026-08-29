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
 *
 * Width reservation is pure CSS: every phrase is stacked in the same grid
 * cell as an invisible sizer, so the box is always as wide (and as tall) as
 * the longest phrase from the very first server-rendered paint. No
 * measurement runs on the client, which means:
 *
 * - No hydration re-layout. A measured width applied after hydration used to
 *   widen the box, re-wrap the heading (`text-balance` pulled the preceding
 *   word onto the phrase line at narrow widths), and shift the phrase.
 * - Font-swap safe. A width measured before the display font arrived was
 *   too narrow once it swapped in and made long phrases wrap mid-cycle.
 *
 * The sizers draw their text through `before:content-[attr(data-text)]`, so
 * the phrases never enter the DOM text content: the heading's `textContent` stays the single visible
 * phrase for search engines and assistive tech.
 */
export function BlurTransitionText({ phrases, className }: BlurTransitionTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isBlurred, setIsBlurred] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const containerRef = useRef<HTMLSpanElement>(null)
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
    if (phrases.length < 2) return

    if (!isVisible) {
      clearTimers()
      // Reset blur on the next frame so the effect cleanup stays side-effect-free.
      requestAnimationFrame(() => setIsBlurred(false))
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
  }, [phrases.length, isVisible])

  // Inline grid: every child shares cell 1/1, so the box takes the widest phrase's width and the
  // tallest phrase's height. `max-w-full` caps it at the heading width; when capped, each sizer and
  // the visible phrase wrap inside the same cell, so the reserved height still covers the longest.
  return (
    <span ref={containerRef} className="relative inline-grid max-w-full align-baseline">
      {/* Invisible sizers: one per phrase, text drawn by ::before so it stays out of the DOM text */}
      {phrases.map((phrase) => (
        <span
          key={phrase}
          className={clsx('blur-phrase-sizer invisible [grid-area:1/1] text-center before:content-[attr(data-text)]', className)}
          data-text={phrase}
          aria-hidden="true"
        />
      ))}

      {/* Visible animated text, centred on the heading's axis inside the reserved box */}
      <span
        className={clsx('[grid-area:1/1] text-center transition-[transform,opacity,filter] ease-out', className)}
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
