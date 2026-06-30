'use client'

import { clsx } from 'clsx/lite'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { BorderBeam } from './border-beam'

interface CardSpotlightProps {
  /** Content to render within the spotlight card */
  children: ReactNode
  /** Size of the spotlight gradient in pixels (default: 300) */
  size?: number
  /** Base opacity of the spotlight effect (default: 0.15) */
  opacity?: number
  /** Whether this card should have a persistent ambient glow (e.g., for "featured" cards) */
  featured?: boolean
  /** Additional class names for the outer wrapper */
  className?: string
}

/**
 * Wrap a card to add a cursor-following spotlight effect on hover.
 * Creates a radial gradient that tracks the mouse position within the card,
 * producing a premium, tactile interaction feel.
 *
 * The spotlight uses CSS custom properties for smooth performance and
 * integrates with the existing mist color palette.
 */
export function CardSpotlight({
  children,
  size = 300,
  opacity = 0.15,
  featured = false,
  className,
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const applySpotlightFrame = useCallback(() => {
    frameRef.current = null

    const container = containerRef.current
    const spotlight = spotlightRef.current
    if (!container || !spotlight) return

    const rect = container.getBoundingClientRect()
    const x = pointerRef.current.x - rect.left - size / 2
    const y = pointerRef.current.y - rect.top - size / 2

    spotlight.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }, [size])

  // Track mouse position relative to the card
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      pointerRef.current = { x: e.clientX, y: e.clientY }

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(applySpotlightFrame)
      }
    },
    [applySpotlightFrame]
  )

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={clsx('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cursor-following spotlight gradient */}
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl',
          'transition-opacity duration-300 ease-out',
          isHovering ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      >
        <div
          ref={spotlightRef}
          className="absolute top-0 left-0 transition-transform duration-75 ease-out"
          style={{
            width: size,
            height: size,
            transform: 'translate3d(-9999px, -9999px, 0)',
            // Radial gradient using mist palette colors
            // Light mode: cool blue-gray glow
            // Dark mode: softer, warmer glow
            background: `radial-gradient(
              circle at center,
              oklch(56% 0.021 213.5 / ${opacity}) 0%,
              oklch(72.3% 0.014 214.4 / ${opacity * 0.5}) 30%,
              transparent 70%
            )`,
          }}
        />
      </div>

      {/* Featured card ambient glow - always visible but subtle */}
      {featured && (
        <div
          className={clsx(
            'pointer-events-none absolute -inset-px z-0 overflow-hidden rounded-xl',
            'opacity-40 transition-opacity duration-500',
            isHovering && 'opacity-70'
          )}
          aria-hidden="true"
        >
          {/* Animated gradient border for featured cards */}
          <div
            className={clsx(
              'absolute inset-0 rounded-xl',
              'bg-gradient-to-br from-mist-400/15 via-transparent to-mist-500/15',
              'dark:from-mist-300/8 dark:to-mist-400/8'
            )}
          />
          {/* Inner glow pulse */}
          <div
            className={clsx(
              'absolute inset-0 rounded-xl',
              'bg-gradient-to-t from-mist-500/3 to-transparent',
              'dark:from-mist-400/3'
            )}
          />
        </div>
      )}

      {/* Border beam effect - traveling light around featured card perimeter */}
      {featured && (
        <BorderBeam
          duration={8000}
          size={100}
          borderRadius={12}
          className="opacity-50 dark:opacity-35"
        />
      )}

      {/* Card content */}
      <div className="relative z-[5] h-full">{children}</div>
    </div>
  )
}
