'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * Configuration for the animated gradient border effect.
 * Adjust these values to fine-tune the visual appearance.
 */
const GRADIENT_CONFIG = {
  // Animation duration for full rotation (ms)
  rotationDuration: 3000,
  // Border width in pixels
  borderWidth: 2,
  // Border radius to match button (Tailwind's rounded-full equivalent)
  borderRadius: 9999,
  // Glow blur radius in pixels
  glowBlur: 8,
  // Glow opacity (0-1)
  glowOpacity: 0.4,
  // Shimmer interval (ms) - how often shimmer repeats
  shimmerInterval: 4000,
  // Shimmer duration (ms) - how long each shimmer takes
  shimmerDuration: 600,
}

interface GradientBorderWrapperProps {
  /** Content to wrap (typically a button) */
  children: ReactNode
  /** Additional class names for the wrapper */
  className?: string
  /** Disable the gradient effect */
  disabled?: boolean
  /** Custom rotation duration in ms */
  rotationDuration?: number
  /** Enable shimmer effect (default: true) */
  shimmer?: boolean
  /** Custom shimmer interval in ms */
  shimmerInterval?: number
}

/**
 * Wrap a button to add an animated rotating gradient border effect.
 * Creates an eye-catching focal point for primary CTAs using a conic
 * gradient that continuously rotates around the element.
 *
 * The gradient uses brand-appropriate colors that work in both light
 * and dark modes, with a subtle glow effect for added depth.
 *
 * Includes an optional shimmer effect - a diagonal shine sweep that
 * periodically crosses the button to draw attention.
 */
export function GradientBorderWrapper({
  children,
  className,
  disabled = false,
  rotationDuration = GRADIENT_CONFIG.rotationDuration,
  shimmer = true,
  shimmerInterval = GRADIENT_CONFIG.shimmerInterval,
}: GradientBorderWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const shimmerRef = useRef<HTMLDivElement>(null)
  // Track visibility to pause animation when scrolled off-screen (performance optimisation)
  const [isVisible, setIsVisible] = useState(true)

  // Set up IntersectionObserver to track when the wrapper enters/exits the viewport.
  // When off-screen, we pause the CSS animation and shimmer to reduce GPU overhead.
  useEffect(() => {
    if (disabled) return
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(wrapper)

    return () => observer.disconnect()
  }, [disabled])

  // Shimmer animation - triggers periodically, but only when visible
  useEffect(() => {
    if (disabled || !shimmer || !shimmerRef.current || !isVisible) return

    const triggerShimmer = () => {
      if (!shimmerRef.current) return
      // Reset and trigger animation
      shimmerRef.current.classList.remove('cta-shimmer-animate')
      // Force reflow to restart animation
      void shimmerRef.current.offsetWidth
      shimmerRef.current.classList.add('cta-shimmer-animate')
    }

    // Initial shimmer after a short delay
    const initialTimeout = setTimeout(triggerShimmer, 1000)

    // Periodic shimmer
    const intervalId = setInterval(triggerShimmer, shimmerInterval)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
    }
  }, [disabled, shimmer, shimmerInterval, isVisible])

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        'gradient-border-wrapper gradient-border-rotating relative inline-flex',
        className
      )}
      style={{
        '--gradient-rotation-duration': `${rotationDuration}ms`,
        padding: `${GRADIENT_CONFIG.borderWidth}px`,
        borderRadius: '9999px',
        // Pause animation when off-screen to save GPU/compositor resources
        animationPlayState: isVisible ? 'running' : 'paused',
      } as CSSProperties}
    >
      {/* Inner content with solid background to reveal border */}
      <div className="relative z-10 overflow-hidden rounded-full bg-mist-100 dark:bg-mist-950">
        {children}
        {/* Shimmer overlay - diagonal shine sweep */}
        {shimmer && (
          <div
            ref={shimmerRef}
            className="cta-shimmer pointer-events-none absolute inset-0 z-20 rounded-full"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
