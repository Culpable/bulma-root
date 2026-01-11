'use client'

import { clsx } from 'clsx/lite'
import { useCallback, useRef, useState, type ComponentProps, type MouseEvent } from 'react'
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
  ...props
}: {
  wallpaper: 'green' | 'blue' | 'purple' | 'brown'
  placement: 'bottom' | 'bottom-left' | 'bottom-right' | 'top' | 'top-left' | 'top-right'
  /** Enable 3D parallax tilt effect on hover */
  enableTilt?: boolean
  /** Enable polished surface reflection effect below screenshot */
  enableReflection?: boolean
} & Omit<ComponentProps<'div'>, 'color'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})
  const [isHovering, setIsHovering] = useState(false)

  /**
   * Calculate 3D tilt transformation based on mouse position.
   * Maps cursor position to rotation angles for parallax effect.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enableTilt || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()

      // Calculate cursor position relative to element center (normalized -1 to 1)
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const mouseX = (e.clientX - centerX) / (rect.width / 2)
      const mouseY = (e.clientY - centerY) / (rect.height / 2)

      // Convert to rotation angles (inverted for natural tilt direction)
      // X-axis rotation based on Y position, Y-axis rotation based on X position
      const rotateX = -mouseY * TILT_CONFIG.maxRotation
      const rotateY = mouseX * TILT_CONFIG.maxRotation

      // Calculate glow position as percentage
      const glowX = ((e.clientX - rect.left) / rect.width) * 100
      const glowY = ((e.clientY - rect.top) / rect.height) * 100

      setTiltStyle({
        transform: `perspective(${TILT_CONFIG.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${TILT_CONFIG.hoverScale})`,
        '--mouse-x': `${glowX}%`,
        '--mouse-y': `${glowY}%`,
      } as React.CSSProperties)
    },
    [enableTilt]
  )

  /**
   * Reset tilt transformation when mouse leaves the element.
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setTiltStyle({
      transform: `perspective(${TILT_CONFIG.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
      transition: `transform ${TILT_CONFIG.resetDuration}ms ease-out`,
    })
  }, [])

  /**
   * Initialize hover state when mouse enters.
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    // Clear the reset transition so movement feels responsive
    setTiltStyle((prev) => ({ ...prev, transition: 'transform 0.1s ease-out' }))
  }, [])

  return (
    <Wallpaper
      color={wallpaper}
      data-placement={placement}
      className={clsx('group', enableReflection && 'screenshot-reflection', className)}
      {...props}
    >
      <div
        ref={containerRef}
        onMouseMove={enableTilt ? handleMouseMove : undefined}
        onMouseEnter={enableTilt ? handleMouseEnter : undefined}
        onMouseLeave={enableTilt ? handleMouseLeave : undefined}
        style={enableTilt ? tiltStyle : undefined}
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
    </Wallpaper>
  )
}
