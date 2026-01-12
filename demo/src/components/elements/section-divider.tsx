'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type ComponentProps } from 'react'

/**
 * Configuration for the section divider animation.
 */
const DIVIDER_CONFIG = {
  // IntersectionObserver threshold for triggering animation
  threshold: 0.5,
  // Delay before pulse animation starts after line draws (ms)
  pulseDelay: 500,
}

interface SectionDividerProps extends ComponentProps<'div'> {
  /** Additional class names */
  className?: string
  /** Enable pulse effect after line draws (default: true) */
  enablePulse?: boolean
}

/**
 * Animated horizontal divider that draws from center outward (Rec E).
 * Features:
 * - Lines draw from center to edges when scrolled into view
 * - Optional light pulse travels along the line after drawing
 * - Creates visual rhythm and pacing between sections
 *
 * To disable: Remove from page composition or set enablePulse={false} to
 * disable just the pulse effect.
 */
export function SectionDivider({
  className,
  enablePulse = true,
  ...props
}: SectionDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // IntersectionObserver for scroll-triggered animation
  useEffect(() => {
    const divider = dividerRef.current
    if (!divider) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: DIVIDER_CONFIG.threshold }
    )

    observer.observe(divider)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={dividerRef}
      data-visible={isVisible}
      className={clsx('section-divider my-16 sm:my-20 lg:my-24', className)}
      aria-hidden="true"
      {...props}
    >
      {/* Light pulses that travel along the divider after it draws */}
      {enablePulse && (
        <>
          <span className="section-divider-pulse right" />
          <span className="section-divider-pulse left" />
        </>
      )}
    </div>
  )
}
