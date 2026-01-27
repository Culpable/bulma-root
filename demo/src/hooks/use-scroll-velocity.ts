'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Configuration for scroll velocity tracking.
 */
const VELOCITY_CONFIG = {
  // Interval for decay steps (ms)
  decayInterval: 50,
  // Decay factor for velocity smoothing (0-1, lower = smoother)
  decayFactor: 0.8,
  // Threshold for "fast" scrolling (px/s)
  fastThreshold: 800,
  // Threshold for "slow" scrolling (px/s)
  slowThreshold: 200,
  // Minimum velocity threshold to stop decay loop
  minVelocity: 1,
}

/**
 * Scroll intensity levels based on velocity.
 */
export type ScrollIntensity = 'stopped' | 'slow' | 'normal' | 'fast'

interface UseScrollVelocityReturn {
  /** Current scroll velocity in pixels per second */
  velocity: number
  /** Scroll intensity level (stopped, slow, normal, fast) */
  intensity: ScrollIntensity
  /** Intensity as a number (1 = normal, >1 = fast, <1 = slow) */
  intensityMultiplier: number
}

/**
 * Hook to track scroll velocity for responsive animation timing (Rec 10).
 *
 * Updates CSS custom properties on :root for velocity-responsive elements:
 * - --scroll-velocity: Current velocity in px/s
 * - --scroll-intensity: Multiplier (1 = normal, >1 = fast, <1 = slow)
 *
 * Performance optimised:
 * - Decay loop only runs when velocity > 0 (stops when idle)
 * - Uses timeout-based decay instead of continuous setInterval
 *
 * Returns velocity, intensity level, and intensity multiplier.
 *
 * To disable: Don't use this hook, or don't apply velocity-responsive classes.
 */
export function useScrollVelocity(): UseScrollVelocityReturn {
  const [velocity, setVelocity] = useState(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(0)
  const velocityRef = useRef(0)
  // Track decay timeout to cancel on new scroll or cleanup
  const decayTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Track if decay loop is running to avoid duplicates
  const isDecayingRef = useRef(false)

  useEffect(() => {
    let rafId: number | null = null
    lastTime.current = Date.now()
    lastScrollY.current = window.scrollY

    // Update CSS custom properties helper
    const updateCSSProperties = (vel: number) => {
      const intensity = getIntensityMultiplier(vel)
      document.documentElement.style.setProperty(
        '--scroll-velocity',
        String(Math.round(vel))
      )
      document.documentElement.style.setProperty(
        '--scroll-intensity',
        String(intensity.toFixed(2))
      )
    }

    // Decay velocity to zero - runs only when needed, stops when velocity reaches 0
    const startDecayLoop = () => {
      // Prevent duplicate decay loops
      if (isDecayingRef.current) return
      isDecayingRef.current = true

      const decay = () => {
        if (velocityRef.current > VELOCITY_CONFIG.minVelocity) {
          // Continue decaying
          velocityRef.current *= VELOCITY_CONFIG.decayFactor
          setVelocity(velocityRef.current)
          updateCSSProperties(velocityRef.current)
          // Schedule next decay step
          decayTimeoutRef.current = setTimeout(decay, VELOCITY_CONFIG.decayInterval)
        } else {
          // Velocity reached zero - stop decay loop
          velocityRef.current = 0
          setVelocity(0)
          updateCSSProperties(0)
          isDecayingRef.current = false
          decayTimeoutRef.current = null
        }
      }

      // Start first decay step
      decayTimeoutRef.current = setTimeout(decay, VELOCITY_CONFIG.decayInterval)
    }

    const updateVelocity = () => {
      const currentTime = Date.now()
      const currentScrollY = window.scrollY
      const deltaTime = currentTime - lastTime.current
      const deltaY = Math.abs(currentScrollY - lastScrollY.current)

      if (deltaTime > 0) {
        // Calculate instantaneous velocity (px/s)
        const instantVelocity = (deltaY / deltaTime) * 1000

        // Apply exponential smoothing
        velocityRef.current =
          velocityRef.current * VELOCITY_CONFIG.decayFactor +
          instantVelocity * (1 - VELOCITY_CONFIG.decayFactor)

        setVelocity(velocityRef.current)
        updateCSSProperties(velocityRef.current)
      }

      lastScrollY.current = currentScrollY
      lastTime.current = currentTime

      // Cancel any pending decay timeout since we're actively scrolling
      if (decayTimeoutRef.current !== null) {
        clearTimeout(decayTimeoutRef.current)
        decayTimeoutRef.current = null
        isDecayingRef.current = false
      }

      // Start decay loop (will begin after scrolling stops)
      startDecayLoop()
    }

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateVelocity()
          rafId = null
        })
      }
    }

    // Set up scroll listener with passive option for performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (decayTimeoutRef.current !== null) {
        clearTimeout(decayTimeoutRef.current)
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const intensity = getIntensity(velocity)
  const intensityMultiplier = getIntensityMultiplier(velocity)

  return { velocity, intensity, intensityMultiplier }
}

/**
 * Get intensity level from velocity.
 */
function getIntensity(velocity: number): ScrollIntensity {
  if (velocity < 10) return 'stopped'
  if (velocity < VELOCITY_CONFIG.slowThreshold) return 'slow'
  if (velocity > VELOCITY_CONFIG.fastThreshold) return 'fast'
  return 'normal'
}

/**
 * Get intensity multiplier from velocity.
 * Returns 1 for normal, >1 for fast, <1 for slow.
 */
function getIntensityMultiplier(velocity: number): number {
  if (velocity < VELOCITY_CONFIG.slowThreshold) {
    // Slow: 0.7 - 1.0
    return 0.7 + (velocity / VELOCITY_CONFIG.slowThreshold) * 0.3
  }
  if (velocity > VELOCITY_CONFIG.fastThreshold) {
    // Fast: 1.0 - 1.5 (capped)
    const excess = velocity - VELOCITY_CONFIG.fastThreshold
    return Math.min(1.5, 1 + (excess / 1000) * 0.5)
  }
  return 1
}
