'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useState, useRef } from 'react'

/**
 * Configuration for morph animation timing.
 */
const MORPH_CONFIG = {
  // Duration of the morph transition (ms)
  morphDuration: 1200,
  // How long each phrase is displayed (ms)
  displayDuration: 3000,
  // Cooldown between morph cycles (ms)
  cooldownDuration: 300,
}

interface MorphTextProps {
  /** Array of phrases to cycle through */
  phrases: string[]
  /** Additional class names for the container */
  className?: string
}

/**
 * Morphing text component that creates a liquid/blur transition between phrases.
 * Uses SVG filters for smooth morphing effect with overlapping blur states.
 * Fixed-width container prevents layout shift.
 */
export function MorphText({ phrases, className }: MorphTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [morphProgress, setMorphProgress] = useState(0)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const hasInitialized = useRef(false)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

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

  // Animate the morph progress
  useEffect(() => {
    if (!containerWidth) return

    let isMorphing = false

    const startMorph = () => {
      isMorphing = true
      startTimeRef.current = Date.now()

      const animate = () => {
        if (!startTimeRef.current) return

        const elapsed = Date.now() - startTimeRef.current
        const progress = Math.min(elapsed / MORPH_CONFIG.morphDuration, 1)

        // Easing function for smoother transition
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

        setMorphProgress(eased)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          // Morph complete - update to next phrase
          setCurrentIndex((prev) => (prev + 1) % phrases.length)
          setMorphProgress(0)
          isMorphing = false
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Schedule the morphs
    const interval = setInterval(() => {
      if (!isMorphing) {
        startMorph()
      }
    }, MORPH_CONFIG.displayDuration + MORPH_CONFIG.morphDuration + MORPH_CONFIG.cooldownDuration)

    return () => {
      clearInterval(interval)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [containerWidth, phrases.length])

  const nextIndex = (currentIndex + 1) % phrases.length

  // Calculate blur and opacity based on morph progress
  const currentBlur = morphProgress * 8
  const nextBlur = (1 - morphProgress) * 8
  const currentOpacity = 1 - morphProgress
  const nextOpacity = morphProgress

  return (
    <>
      {/* SVG filter for smooth morphing effect */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="morph-threshold">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="threshold"
            />
            <feComposite in="SourceGraphic" in2="threshold" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Hidden element used to measure phrase widths */}
      <span
        ref={measureRef}
        className={clsx('invisible absolute whitespace-nowrap', className)}
        aria-hidden="true"
      >
        {phrases[0]}
      </span>

      {/* Visible container with morphing effect */}
      <span
        className={clsx('relative inline-block text-left', className)}
        style={{
          width: containerWidth ? `${containerWidth}px` : 'auto',
          filter: 'url(#morph-threshold)',
        }}
        aria-live="polite"
      >
        {/* Current phrase - fades/blurs out */}
        <span
          className="inline-block transition-none"
          style={{
            opacity: currentOpacity,
            filter: `blur(${currentBlur}px)`,
          }}
        >
          {phrases[currentIndex]}
        </span>

        {/* Next phrase - fades/blurs in (positioned absolutely to overlap) */}
        <span
          className="absolute inset-0 inline-block transition-none"
          style={{
            opacity: nextOpacity,
            filter: `blur(${nextBlur}px)`,
          }}
          aria-hidden="true"
        >
          {phrases[nextIndex]}
        </span>
      </span>
    </>
  )
}
