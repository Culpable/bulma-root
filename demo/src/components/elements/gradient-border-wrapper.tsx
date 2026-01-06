'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, type ReactNode } from 'react'

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
}

/**
 * Wrap a button to add an animated rotating gradient border effect.
 * Creates an eye-catching focal point for primary CTAs using a conic
 * gradient that continuously rotates around the element.
 *
 * The gradient uses brand-appropriate colors that work in both light
 * and dark modes, with a subtle glow effect for added depth.
 */
export function GradientBorderWrapper({
  children,
  className,
  disabled = false,
  rotationDuration = GRADIENT_CONFIG.rotationDuration,
}: GradientBorderWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  if (disabled) {
    return <>{children}</>
  }

  // Light mode gradient colors
  const lightGradient = `conic-gradient(
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
  const darkGradient = `conic-gradient(
    from var(--gradient-angle),
    oklch(72.3% 0.014 214.4) 0deg,
    oklch(87.2% 0.007 219.6) 60deg,
    oklch(92.5% 0.005 214.3) 120deg,
    oklch(87.2% 0.007 219.6) 180deg,
    oklch(72.3% 0.014 214.4) 240deg,
    oklch(56% 0.021 213.5) 300deg,
    oklch(72.3% 0.014 214.4) 360deg
  )`

  // Update gradient based on dark mode
  useEffect(() => {
    const updateGradient = () => {
      if (!wrapperRef.current) return
      const isDark = document.documentElement.classList.contains('dark')
      wrapperRef.current.style.background = isDark ? darkGradient : lightGradient
    }

    updateGradient()

    // Watch for dark mode changes
    const observer = new MutationObserver(updateGradient)
    observer.observe(document.documentElement, { attributes: true })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        'gradient-border-wrapper relative inline-flex',
        className
      )}
      style={{
        '--gradient-rotation-duration': `${rotationDuration}ms`,
        background: lightGradient,
        padding: `${GRADIENT_CONFIG.borderWidth}px`,
        borderRadius: '9999px',
        animation: `gradient-border-rotate var(--gradient-rotation-duration) linear infinite`,
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.animationDuration = `${rotationDuration * 0.5}ms`
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.animationDuration = `${rotationDuration}ms`
      }}
    >
      {/* Inner content with solid background to reveal border */}
      <div className="relative z-10 rounded-full bg-mist-100 dark:bg-mist-950">
        {children}
      </div>
    </div>
  )
}
