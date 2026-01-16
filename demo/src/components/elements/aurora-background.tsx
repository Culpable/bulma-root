'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState } from 'react'

/**
 * Configuration for the aurora effect.
 * Adjust these values to tune the visual appearance.
 */
const AURORA_CONFIG = {
  /** Whether to pause animation when scrolled out of viewport */
  pauseWhenHidden: true,
  /** IntersectionObserver threshold for visibility detection */
  visibilityThreshold: 0.1,
}

interface AuroraBackgroundProps {
  /** Additional class names for the container */
  className?: string
  /** Disable the aurora effect */
  disabled?: boolean
}

/**
 * Render an ambient aurora background effect with three morphing gradient layers.
 * Creates an organic, living atmosphere in the hero section.
 *
 * The effect uses CSS animations for performance and pauses when scrolled
 * off-screen to conserve resources.
 *
 * To disable: Set `disabled={true}` or remove the component from the hero.
 */
export function AuroraBackground({
  className,
  disabled = false,
}: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle mount animation - fade in after initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Pause animations when scrolled out of viewport
  useEffect(() => {
    if (!AURORA_CONFIG.pauseWhenHidden || disabled) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPaused(!entry.isIntersecting)
      },
      { threshold: AURORA_CONFIG.visibilityThreshold }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [disabled])

  // Don't render if disabled
  if (disabled) return null

  return (
    <div
      ref={containerRef}
      className={clsx(
        'aurora-background',
        // Fade in on mount
        'transition-opacity duration-1000 ease-out',
        isMounted ? 'opacity-100' : 'opacity-0',
        className
      )}
      data-paused={isPaused}
      aria-hidden="true"
    >
      {/* Layer 1 - Primary cool gradient, slowest movement */}
      <div className="aurora-layer aurora-layer-1" />

      {/* Layer 2 - Warmer accent gradient, medium speed */}
      <div className="aurora-layer aurora-layer-2" />

      {/* Layer 3 - Subtle highlight gradient, fastest movement */}
      <div className="aurora-layer aurora-layer-3" />
    </div>
  )
}
