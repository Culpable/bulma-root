'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type ComponentProps } from 'react'

/**
 * Configuration for counting animation behavior.
 * Adjust these values to fine-tune the visual effect.
 */
const COUNTER_CONFIG = {
  // Total animation duration in ms
  duration: 1500,
  // Easing function for count animation (ease-out quad)
  easeOutQuad: (t: number) => t * (2 - t),
  // Frame rate target (60fps)
  frameInterval: 1000 / 60,
}

interface AnimatedCounterProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** Target number to count up to */
  value: number
  /** Prefix before the number (e.g., "$") */
  prefix?: string
  /** Suffix after the number (e.g., "+", "%", "k") */
  suffix?: string
  /** Animation duration in ms (default: 1500) */
  duration?: number
  /** Decimal places to show (default: 0) */
  decimals?: number
  /** Start animation when element is visible (default: true) */
  animateOnView?: boolean
  /** Threshold for intersection observer (default: 0.5) */
  threshold?: number
}

/**
 * Animate a number counting up from 0 to the target value.
 * Triggers automatically when the element scrolls into view.
 *
 * Uses requestAnimationFrame for smooth 60fps animation with
 * ease-out timing for a satisfying deceleration effect.
 */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = COUNTER_CONFIG.duration,
  decimals = 0,
  animateOnView = true,
  threshold = 0.5,
  className,
  ...props
}: AnimatedCounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const animationRef = useRef<number | null>(null)

  // Animate the counter from 0 to target value
  const startAnimation = () => {
    if (hasAnimated) return

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Apply easing function for smooth deceleration
      const easedProgress = COUNTER_CONFIG.easeOutQuad(progress)
      const currentValue = easedProgress * value

      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Ensure we end exactly on the target value
        setDisplayValue(value)
        setHasAnimated(true)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  // Set up intersection observer for scroll-triggered animation
  useEffect(() => {
    if (!animateOnView) {
      startAnimation()
      return
    }

    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          startAnimation()
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animateOnView, threshold, hasAnimated, value, duration])

  // Format the display value with proper decimals
  const formattedValue =
    decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString()

  return (
    <span ref={elementRef} className={clsx('tabular-nums', className)} {...props}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}
