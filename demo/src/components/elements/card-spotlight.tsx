'use client'

import { clsx } from 'clsx/lite'
import { useCallback, useRef, useState, type ReactNode } from 'react'
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
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Track mouse position relative to the card
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])
  const handleMouseLeave = useCallback(() => setIsHovering(false), [])

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
          className="absolute transition-transform duration-75 ease-out"
          style={{
            width: size,
            height: size,
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
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
