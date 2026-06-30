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
  const primaryGlowRef = useRef<HTMLDivElement>(null)
  const secondaryGlowRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const applySpotlightFrame = () => {
      frameRef.current = null

      const rect = container.getBoundingClientRect()
      const x = pointerRef.current.x - rect.left
      const y = pointerRef.current.y - rect.top
      const primaryX = x - size / 2
      const primaryY = y - size / 2
      const secondaryX = x - (size * 1.5) / 2
      const secondaryY = y - (size * 1.5) / 2

      if (primaryGlowRef.current) {
        primaryGlowRef.current.style.transform = `translate3d(${primaryX}px, ${primaryY}px, 0)`
      }

      if (secondaryGlowRef.current) {
        secondaryGlowRef.current.style.transform = `translate3d(${secondaryX}px, ${secondaryY}px, 0)`
      }
    }

    // Track mouse position relative to container
    const handleMouseMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY }

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(applySpotlightFrame)
      }
    }

    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => {
      setIsActive(false)

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }

    // Add passive flag to mousemove for better scroll/input performance
    container.addEventListener('mousemove', handleMouseMove, { passive: true })
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [size])

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
          ref={primaryGlowRef}
          className="absolute top-0 left-0 transition-transform duration-150 ease-out"
          style={{
            width: size,
            height: size,
            transform: 'translate3d(-9999px, -9999px, 0)',
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
          ref={secondaryGlowRef}
          className="absolute top-0 left-0 hidden transition-transform duration-150 ease-out dark:block"
          style={{
            width: size * 1.5,
            height: size * 1.5,
            transform: 'translate3d(-9999px, -9999px, 0)',
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
