'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Configuration for scroll velocity tracking.
 */
const VELOCITY_CONFIG = {
  // Sampling interval for velocity calculation (ms)
  sampleInterval: 50,
  // Decay factor for velocity smoothing (0-1, lower = smoother)
  decayFactor: 0.8,
  // Threshold for "fast" scrolling (px/s)
  fastThreshold: 800,
  // Threshold for "slow" scrolling (px/s)
  slowThreshold: 200,
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
 * Returns velocity, intensity level, and intensity multiplier.
 *
 * To disable: Don't use this hook, or don't apply velocity-responsive classes.
 */
export function useScrollVelocity(): UseScrollVelocityReturn {
  const [velocity, setVelocity] = useState(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())
  const velocityRef = useRef(0)

  useEffect(() => {
    let rafId: number | null = null

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

        // Update CSS custom properties on :root
        const intensity = getIntensityMultiplier(velocityRef.current)
        document.documentElement.style.setProperty(
          '--scroll-velocity',
          String(Math.round(velocityRef.current))
        )
        document.documentElement.style.setProperty(
          '--scroll-intensity',
          String(intensity.toFixed(2))
        )
      }

      lastScrollY.current = currentScrollY
      lastTime.current = currentTime
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

    // Decay velocity to zero when not scrolling
    const decayInterval = setInterval(() => {
      if (velocityRef.current > 1) {
        velocityRef.current *= VELOCITY_CONFIG.decayFactor
        setVelocity(velocityRef.current)

        // Update CSS custom properties
        const intensity = getIntensityMultiplier(velocityRef.current)
        document.documentElement.style.setProperty(
          '--scroll-velocity',
          String(Math.round(velocityRef.current))
        )
        document.documentElement.style.setProperty(
          '--scroll-intensity',
          String(intensity.toFixed(2))
        )
      } else if (velocityRef.current !== 0) {
        velocityRef.current = 0
        setVelocity(0)
        document.documentElement.style.setProperty('--scroll-velocity', '0')
        document.documentElement.style.setProperty('--scroll-intensity', '1')
      }
    }, VELOCITY_CONFIG.sampleInterval)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(decayInterval)
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
