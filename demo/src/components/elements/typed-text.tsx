'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Configuration for typewriter animation timing.
 * Adjust these values to fine-tune the typing rhythm.
 */
const TYPING_CONFIG = {
  // Delay between typing each character (ms)
  typeSpeed: 60,
  // Delay between deleting each character (ms)
  deleteSpeed: 40,
  // Pause duration after fully typed before deleting (ms)
  pauseAfterType: 2500,
  // Pause duration after fully deleted before typing next (ms)
  pauseAfterDelete: 300,
  // Initial delay before starting animation (ms)
  initialDelay: 1000,
}

interface TypedTextProps {
  /** Array of phrases to cycle through */
  phrases: string[]
  /** Additional class names for the text span */
  className?: string
  /** Class name for the cursor element */
  cursorClassName?: string
  /** Show blinking cursor (default: true) */
  showCursor?: boolean
  /** Typing speed in ms per character (default: 60) */
  typeSpeed?: number
  /** Delete speed in ms per character (default: 40) */
  deleteSpeed?: number
  /** Pause after typing completes in ms (default: 2500) */
  pauseAfterType?: number
}

/**
 * Animated typewriter text component that cycles through phrases.
 * Creates a typing effect with cursor, perfect for hero headlines
 * that need to communicate multiple value propositions.
 *
 * The cursor blinks using CSS animation for smooth, battery-efficient rendering.
 */
export function TypedText({
  phrases,
  className,
  cursorClassName,
  showCursor = true,
  typeSpeed = TYPING_CONFIG.typeSpeed,
  deleteSpeed = TYPING_CONFIG.deleteSpeed,
  pauseAfterType = TYPING_CONFIG.pauseAfterType,
}: TypedTextProps) {
  // Current displayed text
  const [displayText, setDisplayText] = useState('')
  // Index of current phrase in the array
  const [phraseIndex, setPhraseIndex] = useState(0)
  // Animation phase: 'typing' | 'pausing' | 'deleting' | 'waiting'
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting' | 'waiting'>('waiting')
  // Track if component has mounted (for initial delay)
  const hasStarted = useRef(false)

  // Current target phrase
  const currentPhrase = phrases[phraseIndex]

  /**
   * Handle the typing animation state machine.
   * Cycles through: waiting -> typing -> pausing -> deleting -> waiting -> ...
   */
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    // Initial delay before starting
    if (!hasStarted.current) {
      hasStarted.current = true
      timeout = setTimeout(() => {
        setPhase('typing')
      }, TYPING_CONFIG.initialDelay)
      return () => clearTimeout(timeout)
    }

    switch (phase) {
      case 'typing':
        if (displayText.length < currentPhrase.length) {
          // Type next character
          timeout = setTimeout(() => {
            setDisplayText(currentPhrase.slice(0, displayText.length + 1))
          }, typeSpeed)
        } else {
          // Finished typing, pause before deleting
          setPhase('pausing')
        }
        break

      case 'pausing':
        // Wait before starting to delete
        timeout = setTimeout(() => {
          setPhase('deleting')
        }, pauseAfterType)
        break

      case 'deleting':
        if (displayText.length > 0) {
          // Delete one character
          timeout = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1))
          }, deleteSpeed)
        } else {
          // Finished deleting, move to next phrase
          setPhase('waiting')
        }
        break

      case 'waiting':
        // Brief pause, then start typing next phrase
        timeout = setTimeout(() => {
          setPhraseIndex((prev) => (prev + 1) % phrases.length)
          setPhase('typing')
        }, TYPING_CONFIG.pauseAfterDelete)
        break
    }

    return () => clearTimeout(timeout)
  }, [phase, displayText, currentPhrase, phrases.length, typeSpeed, deleteSpeed, pauseAfterType])

  return (
    <span className={clsx('inline', className)}>
      <span>{displayText}</span>
      {showCursor && (
        <span
          className={clsx(
            // Blinking cursor - inline-block maintains dimensions while flowing inline with text
            'ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.1em]',
            'animate-[cursor-blink_1s_step-end_infinite]',
            'bg-current',
            cursorClassName
          )}
          aria-hidden="true"
        />
      )}
    </span>
  )
}
