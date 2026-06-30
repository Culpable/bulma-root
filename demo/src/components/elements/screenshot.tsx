'use client'

import { clsx } from 'clsx/lite'
import { useCallback, useEffect, useRef, useState, type ComponentProps, type MouseEvent } from 'react'
import { Wallpaper } from './wallpaper'

/**
 * Configuration for parallax tilt effect.
 * Adjust these values to fine-tune the effect intensity.
 */
const TILT_CONFIG = {
  // Maximum rotation angle in degrees
  maxRotation: 8,
  // Perspective depth for 3D effect
  perspective: 1000,
  // Transition duration when mouse leaves (ms)
  resetDuration: 400,
  // Scale factor on hover
  hoverScale: 1.02,
}

export function Screenshot({
  children,
  wallpaper,
  placement,
  className,
  enableTilt = true,
  enableReflection = false,
  enableReveal = false,
  ...props
}: {
  wallpaper: 'green' | 'blue' | 'purple' | 'brown'
  placement: 'bottom' | 'bottom-left' | 'bottom-right' | 'top' | 'top-left' | 'top-right'
  /** Enable 3D parallax tilt effect on hover */
  enableTilt?: boolean
  /** Enable polished surface reflection effect below screenshot */
  enableReflection?: boolean
  /** Enable progressive reveal animation on scroll (Rec D) */
  enableReveal?: boolean
} & Omit<ComponentProps<'div'>, 'color'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isRevealed, setIsRevealed] = useState(!enableReveal) // Start revealed if effect is disabled

  // IntersectionObserver for scroll-triggered reveal (Rec D)
  useEffect(() => {
    if (!enableReveal || !revealRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(revealRef.current)

    return () => observer.disconnect()
  }, [enableReveal])

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const applyTiltFrame = useCallback(() => {
    frameRef.current = null

    const container = containerRef.current
    if (!enableTilt || !container) return

    const rect = container.getBoundingClientRect()
    const { x, y } = pointerRef.current

    // Write transform and glow variables directly so rich tilt stays smooth
    // without forcing a React render for each pointer event.
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = (x - centerX) / (rect.width / 2)
    const mouseY = (y - centerY) / (rect.height / 2)
    const rotateX = -mouseY * TILT_CONFIG.maxRotation
    const rotateY = mouseX * TILT_CONFIG.maxRotation
    const glowX = ((x - rect.left) / rect.width) * 100
    const glowY = ((y - rect.top) / rect.height) * 100

    container.style.transition = 'transform 0.1s ease-out'
    container.style.transform = `perspective(${TILT_CONFIG.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${TILT_CONFIG.hoverScale})`
    container.style.setProperty('--mouse-x', `${glowX}%`)
    container.style.setProperty('--mouse-y', `${glowY}%`)
  }, [enableTilt])

  /**
   * Calculate 3D tilt transformation based on mouse position.
   * Maps cursor position to rotation angles for parallax effect.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enableTilt || !containerRef.current) return

      pointerRef.current = { x: e.clientX, y: e.clientY }

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(applyTiltFrame)
      }
    },
    [applyTiltFrame, enableTilt]
  )

  /**
   * Reset tilt transformation when mouse leaves the element.
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    if (containerRef.current) {
      containerRef.current.style.transition = `transform ${TILT_CONFIG.resetDuration}ms ease-out`
      containerRef.current.style.transform = `perspective(${TILT_CONFIG.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`
    }
  }, [])

  /**
   * Initialize hover state when mouse enters.
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    // Clear the reset transition so movement feels responsive
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.1s ease-out'
    }
  }, [])

  return (
    <Wallpaper
      color={wallpaper}
      data-placement={placement}
      className={clsx('group', enableReflection && 'screenshot-reflection', className)}
      {...props}
    >
      {/* Progressive reveal wrapper (Rec D) */}
      <div
        ref={revealRef}
        data-visible={isRevealed}
        className={clsx(enableReveal && 'screenshot-reveal')}
      >
        <div
          ref={containerRef}
          onMouseMove={enableTilt ? handleMouseMove : undefined}
          onMouseEnter={enableTilt ? handleMouseEnter : undefined}
          onMouseLeave={enableTilt ? handleMouseLeave : undefined}
          style={
            enableTilt
              ? ({
                  '--mouse-x': '50%',
                  '--mouse-y': '50%',
                } as React.CSSProperties)
              : undefined
          }
          className={clsx(
            'relative [--padding:min(10%,--spacing(16))]',
            // Placement-based padding
            'group-data-[placement=bottom]:px-(--padding) group-data-[placement=bottom]:pt-(--padding)',
            'group-data-[placement=bottom-left]:pt-(--padding) group-data-[placement=bottom-left]:pr-(--padding)',
            'group-data-[placement=bottom-right]:pt-(--padding) group-data-[placement=bottom-right]:pl-(--padding)',
            'group-data-[placement=top]:px-(--padding) group-data-[placement=top]:pb-(--padding)',
            'group-data-[placement=top-left]:pr-(--padding) group-data-[placement=top-left]:pb-(--padding)',
            'group-data-[placement=top-right]:pb-(--padding) group-data-[placement=top-right]:pl-(--padding)',
            // Tilt effect base styles
            enableTilt && 'transform-gpu will-change-transform'
          )}
        >
          {/* Glow overlay that follows cursor */}
          {enableTilt && (
            <div
              className={clsx(
                'pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300',
                isHovering && 'opacity-100'
              )}
              style={{
                background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.12) 0%, transparent 50%)`,
              }}
            />
          )}
          <div
            className={clsx(
              '*:relative *:ring-1 *:ring-black/10',
              'group-data-[placement=bottom]:*:rounded-t-sm group-data-[placement=bottom-left]:*:rounded-tr-sm',
              'group-data-[placement=bottom-right]:*:rounded-tl-sm group-data-[placement=top]:*:rounded-b-sm',
              'group-data-[placement=top-left]:*:rounded-br-sm group-data-[placement=top-right]:*:rounded-bl-sm'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </Wallpaper>
  )
}
