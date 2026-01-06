'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface CursorSpotlightProps {
  /** Content to render within the spotlight container */
  children: ReactNode
  /** Size of the spotlight gradient in pixels */
  size?: number
  /** Opacity of the spotlight effect (0-1) */
  opacity?: number
  /** Additional class names for the container */
  className?: string
}

/**
 * Create an ambient cursor spotlight effect that follows mouse movement.
 * Renders a subtle radial gradient that tracks the cursor position with
 * smooth easing, creating a "flashlight" illumination effect.
 *
 * Wrap any content to add the spotlight overlay effect.
 */
export function CursorSpotlight({
  children,
  size = 500,
  opacity = 0.08,
  className,
}: CursorSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Track mouse position relative to container
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Spotlight gradient overlay */}
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 z-10 overflow-hidden',
          'transition-opacity duration-500 ease-out',
          isActive ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      >
        <div
          className="absolute transition-transform duration-150 ease-out"
          style={{
            width: size,
            height: size,
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
            // Radial gradient creates the spotlight glow
            // Light mode: bright white glow | Dark mode: softer warm glow
            background: `radial-gradient(
              circle at center,
              rgba(255, 255, 255, ${opacity}) 0%,
              rgba(255, 255, 255, ${opacity * 0.5}) 25%,
              transparent 70%
            )`,
            // Soft light blend creates illumination effect without washing out content
            mixBlendMode: 'soft-light',
          }}
        />
        {/* Secondary subtle glow for depth */}
        <div
          className="absolute hidden dark:block transition-transform duration-150 ease-out"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(
              circle at center,
              rgba(120, 180, 220, ${opacity * 0.4}) 0%,
              transparent 60%
            )`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
      {/* Content */}
      {children}
    </div>
  )
}
