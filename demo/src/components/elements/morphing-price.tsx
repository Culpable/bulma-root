'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react'

/**
 * Configuration for the morphing price animation.
 * Adjust these values to fine-tune the mechanical counter effect.
 */
const MORPH_CONFIG = {
  // Duration of each digit's morph animation (ms)
  digitDuration: 350,
  // Stagger delay between digits (ms) - creates left-to-right cascade
  digitStagger: 40,
  // Easing function for the morph (spring-like overshoot)
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Match digit line-height to wrapper height to prevent glyph clipping across fonts.
  digitLineHeight: 1.2,
}

/**
 * Parse a price string into its constituent parts.
 * Handles currency symbols, digits, and suffixes.
 *
 * @example parsePrice('$490') => { prefix: '$', digits: '490', suffix: '' }
 * @example parsePrice('$99/mo') => { prefix: '$', digits: '99', suffix: '/mo' }
 */
function parsePrice(priceStr: string): { prefix: string; digits: string; suffix: string } {
  // Match: optional non-digits (prefix), digits, optional non-digits (suffix)
  const match = priceStr.match(/^([^0-9]*)(\d+)(.*)$/)
  if (!match) return { prefix: '', digits: priceStr, suffix: '' }
  return {
    prefix: match[1],
    digits: match[2],
    suffix: match[3],
  }
}

/**
 * Pad the shorter digit string with leading spaces to match lengths.
 * This ensures smooth transitions when digit counts change (e.g., $49 → $490).
 */
function padDigits(from: string, to: string): { from: string[]; to: string[] } {
  const maxLen = Math.max(from.length, to.length)
  const paddedFrom = from.padStart(maxLen, ' ').split('')
  const paddedTo = to.padStart(maxLen, ' ').split('')
  return { from: paddedFrom, to: paddedTo }
}

interface MorphingDigitProps {
  /** The previous digit (or space for appearing digits) */
  from: string
  /** The new digit to morph to */
  to: string
  /** Stagger delay for this digit's animation (ms) */
  delay: number
  /** Whether the animation is currently active */
  isAnimating: boolean
}

/**
 * Single digit that morphs from one value to another with a slot-machine effect.
 * The old digit slides up and out while the new digit slides up and in.
 */
function MorphingDigit({ from, to, delay, isAnimating }: MorphingDigitProps) {
  // If digits are the same, no animation needed
  if (from === to && !isAnimating) {
    return (
      <span className="inline-block text-center" style={{ minWidth: from === ' ' ? '0' : '0.6em' }}>
        {from === ' ' ? '' : from}
      </span>
    )
  }

  return (
    <span
      className="relative inline-block overflow-hidden text-center"
      style={{ minWidth: to === ' ' ? '0' : '0.6em', height: '1.2em' }}
    >
      {/* Old digit sliding out (upward) */}
      <span
        className={clsx(
          'absolute inset-0 flex items-center justify-center',
          isAnimating ? 'animate-digit-slide-out' : 'opacity-0 pointer-events-none'
        )}
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: `${MORPH_CONFIG.digitDuration}ms`,
          animationTimingFunction: MORPH_CONFIG.easing,
          animationFillMode: 'forwards',
        }}
        aria-hidden="true"
      >
        {from === ' ' ? '\u00A0' : from}
      </span>

      {/* New digit sliding in (from below) */}
      <span
        className={clsx(
          'flex items-center justify-center',
          isAnimating ? 'animate-digit-slide-in' : ''
        )}
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: `${MORPH_CONFIG.digitDuration}ms`,
          animationTimingFunction: MORPH_CONFIG.easing,
          animationFillMode: 'forwards',
        }}
      >
        {to === ' ' ? '' : to}
      </span>
    </span>
  )
}

interface MorphingPriceProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** The price string to display (e.g., "$49", "$490") */
  value: string
  /** Whether to animate changes (default: true) */
  animate?: boolean
}

/**
 * MorphingPrice displays a price with digit-by-digit morph animation when the value changes.
 * Each digit rolls like a mechanical counter, creating a premium slot-machine effect.
 *
 * Features:
 * - Digits slide up and out while new digits slide up from below
 * - Staggered animation creates left-to-right cascade
 * - Handles digit count changes gracefully (e.g., $49 → $490)
 * - Spring easing for natural feel with slight overshoot
 *
 * @example
 * <MorphingPrice value={isMonthly ? '$49' : '$490'} />
 */
export function MorphingPrice({
  value,
  animate = true,
  className,
  style,
  ...props
}: MorphingPriceProps) {
  // Treat non-numeric prices (e.g., "Custom") as plain text to avoid per-character spacing.
  const hasDigits = /\d/.test(value)
  const [displayValue, setDisplayValue] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValueRef = useRef(value)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clean up any pending animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Render non-numeric prices as-is to avoid digit-slot layout quirks.
    if (!hasDigits) {
      setDisplayValue(value)
      setPrevValue(value)
      setIsAnimating(false)
      prevValueRef.current = value
      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current)
        }
      }
    }

    if (value === prevValueRef.current) return

    if (animate) {
      // Store the previous value before updating
      setPrevValue(prevValueRef.current)
      setIsAnimating(true)

      // Update display value immediately so new digits can animate in
      setDisplayValue(value)

      // Calculate total animation duration
      const { digits: newDigits } = parsePrice(value)
      const { digits: oldDigits } = parsePrice(prevValueRef.current)
      const maxDigits = Math.max(newDigits.length, oldDigits.length)
      const totalDuration = MORPH_CONFIG.digitDuration + (maxDigits * MORPH_CONFIG.digitStagger)

      // Reset animation state after all digits have animated
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false)
      }, totalDuration + 50)

      prevValueRef.current = value
    } else {
      setDisplayValue(value)
      setPrevValue(value)
      prevValueRef.current = value
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [value, animate, hasDigits])

  // Render non-numeric prices as standard text.
  if (!hasDigits) {
    return (
      <span className={clsx('inline-flex items-baseline tabular-nums', className)} style={style} {...props}>
        {value}
      </span>
    )
  }

  // Parse current and previous prices
  const currentParsed = useMemo(() => parsePrice(displayValue), [displayValue])
  const prevParsed = useMemo(() => parsePrice(prevValue), [prevValue])

  // Pad digits to equal length for smooth transitions
  const { from: fromDigits, to: toDigits } = useMemo(
    () => padDigits(prevParsed.digits, currentParsed.digits),
    [prevParsed.digits, currentParsed.digits]
  )

  return (
    <span
      className={clsx('inline-flex items-baseline tabular-nums', className)}
      style={{ lineHeight: MORPH_CONFIG.digitLineHeight, ...style }}
      {...props}
    >
      {/* Currency symbol / prefix */}
      {currentParsed.prefix && (
        <span className="inline-block">{currentParsed.prefix}</span>
      )}

      {/* Animated digits container */}
      <span className="relative inline-flex items-baseline">
        {toDigits.map((toDigit, index) => {
          const fromDigit = fromDigits[index]
          const delay = index * MORPH_CONFIG.digitStagger

          return (
            <MorphingDigit
              key={index}
              from={fromDigit}
              to={toDigit}
              delay={delay}
              isAnimating={isAnimating && fromDigit !== toDigit}
            />
          )
        })}
      </span>

      {/* Suffix (if any) */}
      {currentParsed.suffix && (
        <span className="inline-block">{currentParsed.suffix}</span>
      )}
    </span>
  )
}
