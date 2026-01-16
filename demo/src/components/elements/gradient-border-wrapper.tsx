'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type ReactNode } from 'react'

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

// Light mode gradient colors
const LIGHT_GRADIENT = `conic-gradient(
  from var(--gradient-angle),
  oklch(45% 0.017 213.2) 0deg,
  oklch(56% 0.021 213.5) 60deg,
  oklch(72.3% 0.014 214.4) 120deg,
  oklch(56% 0.021 213.5) 180deg,
  oklch(37.8% 0.015 216) 240deg,
  oklch(45% 0.017 213.2) 300deg,
  oklch(45% 0.017 213.2) 360deg
)`

// Dark mode gradient colors (lighter for visibility)
const DARK_GRADIENT = `conic-gradient(
  from var(--gradient-angle),
  oklch(72.3% 0.014 214.4) 0deg,
  oklch(87.2% 0.007 219.6) 60deg,
  oklch(92.5% 0.005 214.3) 120deg,
  oklch(87.2% 0.007 219.6) 180deg,
  oklch(72.3% 0.014 214.4) 240deg,
  oklch(56% 0.021 213.5) 300deg,
  oklch(72.3% 0.014 214.4) 360deg
)`

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

  // Update gradient based on dark mode
  useEffect(() => {
    if (disabled) return
    const updateGradient = () => {
      if (!wrapperRef.current) return
      const isDark = document.documentElement.classList.contains('dark')
      wrapperRef.current.style.background = isDark ? DARK_GRADIENT : LIGHT_GRADIENT
    }

    updateGradient()

    // Watch for dark mode changes
    const observer = new MutationObserver(updateGradient)
    observer.observe(document.documentElement, { attributes: true })

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
        'gradient-border-wrapper relative inline-flex',
        className
      )}
      style={{
        '--gradient-rotation-duration': `${rotationDuration}ms`,
        background: LIGHT_GRADIENT,
        padding: `${GRADIENT_CONFIG.borderWidth}px`,
        borderRadius: '9999px',
        animation: `gradient-border-rotate var(--gradient-rotation-duration) linear infinite`,
        // Pause animation when off-screen to save GPU/compositor resources
        animationPlayState: isVisible ? 'running' : 'paused',
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.animationDuration = `${rotationDuration * 0.5}ms`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.animationDuration = `${rotationDuration}ms`
      }}
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
