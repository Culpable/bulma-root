'use client'

import { clsx } from 'clsx/lite'
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'

/**
 * Configuration for magnetic attraction effect.
 * Adjust these values to fine-tune the pull intensity and feel.
 */
const MAGNETIC_CONFIG = {
  // Maximum offset in pixels when cursor is at element edge
  maxOffset: 6,
  // Activation radius multiplier (1 = element bounds, 1.5 = 50% larger)
  activationRadius: 1.4,
  // Transition duration for return animation (ms)
  returnDuration: 400,
  // Spring easing for natural bounce-back
  springEasing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Ripple animation duration (ms) - Rec C
  rippleDuration: 500,
}

interface MagneticWrapperProps {
  /** Content to wrap with magnetic effect */
  children: ReactNode
  /** Additional class names for the wrapper */
  className?: string
  /** Disable the magnetic effect */
  disabled?: boolean
  /** Maximum offset in pixels (default: 6) */
  maxOffset?: number
  /** Activation radius multiplier (default: 1.4) */
  activationRadius?: number
  /** Enable ripple effect on magnetic field entry (default: true) - Rec C */
  enableRipple?: boolean
}

/**
 * Wrap any element to add a magnetic cursor-attraction effect.
 * The wrapped element subtly pulls toward the cursor when nearby,
 * creating a tactile, interactive feel.
 *
 * Best used on buttons, links, and interactive cards.
 */
export function MagneticWrapper({
  children,
  className,
  disabled = false,
  maxOffset = MAGNETIC_CONFIG.maxOffset,
  activationRadius = MAGNETIC_CONFIG.activationRadius,
  enableRipple = true,
}: MagneticWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<CSSProperties>({})
  // Track if ripple has fired this entry to prevent multiple triggers
  const rippleFiredRef = useRef(false)

  /**
   * Calculate magnetic pull based on cursor distance from element center.
   * Pull strength increases as cursor approaches, maxing at element edge.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (disabled || !wrapperRef.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate cursor offset from center
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      // Normalize to element dimensions for consistent feel across sizes
      const normalizedX = deltaX / (rect.width / 2)
      const normalizedY = deltaY / (rect.height / 2)

      // Apply offset with easing (stronger pull near center, capped at edges)
      const offsetX = normalizedX * maxOffset
      const offsetY = normalizedY * maxOffset

      setTransform({
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: 'transform 0.15s ease-out',
      })
    },
    [disabled, maxOffset]
  )

  /**
   * Reset to original position with spring animation when cursor leaves.
   * Also resets ripple state for next entry.
   */
  const handleMouseLeave = useCallback(() => {
    setTransform({
      transform: 'translate(0px, 0px)',
      transition: `transform ${MAGNETIC_CONFIG.returnDuration}ms ${MAGNETIC_CONFIG.springEasing}`,
    })
    // Reset ripple state so it can fire again on next entry
    rippleFiredRef.current = false
  }, [])

  /**
   * Track cursor entering the activation zone.
   * Triggers ripple effect (Rec C) on first entry.
   */
  const handleMouseEnter = useCallback(() => {
    // Clear any lingering return transition for responsive movement
    setTransform((prev) => ({
      ...prev,
      transition: 'transform 0.15s ease-out',
    }))

    // Trigger ripple effect on entry (Rec C)
    if (enableRipple && rippleRef.current && !rippleFiredRef.current) {
      rippleFiredRef.current = true
      const ripple = rippleRef.current
      // Remove previous animation class if present
      ripple.classList.remove('animate')
      // Force reflow to restart animation
      void ripple.offsetWidth
      // Add animation class
      ripple.classList.add('animate')
      // Remove animation class after completion
      setTimeout(() => {
        ripple.classList.remove('animate')
      }, MAGNETIC_CONFIG.rippleDuration)
    }
  }, [enableRipple])

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={transform}
      className={clsx('magnetic-wrapper magnetic-ripple-container', className)}
    >
      {/* Ripple effect element (Rec C) - animates on magnetic field entry */}
      {enableRipple && (
        <div
          ref={rippleRef}
          className="magnetic-ripple"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}
