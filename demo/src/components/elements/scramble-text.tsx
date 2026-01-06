'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Configuration for scramble animation timing.
 */
const SCRAMBLE_CONFIG = {
  // Characters to use for scrambling effect
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*',
  // Duration of the scramble/decode effect (ms)
  scrambleDuration: 800,
  // How long each phrase is displayed after decoding (ms)
  displayDuration: 3000,
  // Interval between character updates during scramble (ms)
  updateInterval: 50,
  // Initial delay before starting animation (ms)
  initialDelay: 500,
}

interface ScrambleTextProps {
  /** Array of phrases to cycle through */
  phrases: string[]
  /** Additional class names for the container */
  className?: string
}

/**
 * Scramble text component that decodes phrases with a cipher-like effect.
 * Characters cycle through random values before settling on the target.
 * Uses a fixed-width container sized to the longest phrase to prevent layout shift.
 */
export function ScrambleText({ phrases, className }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(phrases[0])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const hasInitialized = useRef(false)
  const isScrambling = useRef(false)

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

  // Get a random character from the scramble set
  const getRandomChar = useCallback(() => {
    return SCRAMBLE_CONFIG.chars[Math.floor(Math.random() * SCRAMBLE_CONFIG.chars.length)]
  }, [])

  // Scramble animation function
  const scrambleTo = useCallback(
    (targetText: string) => {
      if (isScrambling.current) return
      isScrambling.current = true

      const startTime = Date.now()
      const currentText = displayText.padEnd(targetText.length, ' ')

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / SCRAMBLE_CONFIG.scrambleDuration, 1)

        // Calculate how many characters should be revealed
        const revealedCount = Math.floor(progress * targetText.length)

        // Build the display string
        let result = ''
        for (let i = 0; i < targetText.length; i++) {
          if (i < revealedCount) {
            // Character is revealed - show target
            result += targetText[i]
          } else if (targetText[i] === ' ') {
            // Preserve spaces
            result += ' '
          } else {
            // Character is still scrambling - show random
            result += getRandomChar()
          }
        }

        setDisplayText(result)

        if (progress < 1) {
          setTimeout(animate, SCRAMBLE_CONFIG.updateInterval)
        } else {
          setDisplayText(targetText)
          isScrambling.current = false
        }
      }

      animate()
    },
    [displayText, getRandomChar]
  )

  // Handle the scramble animation cycle
  useEffect(() => {
    if (!containerWidth) return

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % phrases.length
      setCurrentIndex(nextIndex)
      scrambleTo(phrases[nextIndex])
    }, SCRAMBLE_CONFIG.displayDuration + SCRAMBLE_CONFIG.scrambleDuration)

    return () => clearInterval(interval)
  }, [containerWidth, currentIndex, phrases, scrambleTo])

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
        className={clsx('inline-block text-left font-mono', className)}
        style={{ width: containerWidth ? `${containerWidth}px` : 'auto' }}
        aria-live="polite"
      >
        {displayText.split('').map((char, i) => (
          <span
            key={i}
            className={char === ' ' ? 'scramble-char-space' : 'scramble-char'}
          >
            {char}
          </span>
        ))}
      </span>
    </>
  )
}
