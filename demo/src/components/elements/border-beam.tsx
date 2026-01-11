'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

/**
 * Configuration for the border beam effect.
 * A single point of light that continuously travels around the perimeter of an element.
 */
const BEAM_CONFIG = {
  // Duration for one complete revolution (ms)
  duration: 8000,
  // Size of the beam gradient (px)
  size: 100,
  // Delay before animation starts (ms)
  delay: 0,
}

interface BorderBeamProps extends ComponentProps<'div'> {
  /** Duration for one complete revolution in milliseconds (default: 8000) */
  duration?: number
  /** Size of the beam gradient in pixels (default: 100) */
  size?: number
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number
  /** Border radius to match parent element (default: 12px for rounded-xl) */
  borderRadius?: number
  /** Whether the beam is active (default: true) */
  active?: boolean
}

/**
 * BorderBeam creates a traveling light effect around the perimeter of an element.
 * The light traces the border continuously, creating a premium "scan line" effect.
 *
 * Usage: Wrap around or place inside a positioned parent element.
 * The parent should have `position: relative` and `overflow: hidden`.
 *
 * @example
 * ```tsx
 * <div className="relative overflow-hidden rounded-xl">
 *   <BorderBeam />
 *   <div className="relative z-10">Content here</div>
 * </div>
 * ```
 */
export function BorderBeam({
  duration = BEAM_CONFIG.duration,
  size = BEAM_CONFIG.size,
  delay = BEAM_CONFIG.delay,
  borderRadius = 12,
  active = true,
  className,
  ...props
}: BorderBeamProps) {
  if (!active) return null

  return (
    <div
      className={clsx(
        'pointer-events-none absolute inset-0 z-0',
        className
      )}
      style={{ borderRadius }}
      aria-hidden="true"
      {...props}
    >
      {/* The beam element that travels around the perimeter */}
      <div
        className="absolute animate-border-beam"
        style={{
          // Position the beam at top-left initially
          width: size,
          height: size,
          // Create a radial gradient for the beam glow
          background: `radial-gradient(
            circle at center,
            oklch(72.3% 0.014 214.4 / 0.8) 0%,
            oklch(56% 0.021 213.5 / 0.4) 30%,
            transparent 70%
          )`,
          // Animation timing
          animationDuration: `${duration}ms`,
          animationDelay: `${delay}ms`,
          // Use CSS custom property for border radius
          '--border-beam-radius': `${borderRadius}px`,
        } as React.CSSProperties}
      />
      {/* Secondary softer glow that follows the beam */}
      <div
        className="absolute animate-border-beam opacity-50"
        style={{
          width: size * 1.5,
          height: size * 1.5,
          background: `radial-gradient(
            circle at center,
            oklch(87.2% 0.007 219.6 / 0.4) 0%,
            oklch(72.3% 0.014 214.4 / 0.2) 40%,
            transparent 70%
          )`,
          animationDuration: `${duration}ms`,
          animationDelay: `${delay}ms`,
          filter: 'blur(8px)',
          '--border-beam-radius': `${borderRadius}px`,
        } as React.CSSProperties}
      />
    </div>
  )
}
