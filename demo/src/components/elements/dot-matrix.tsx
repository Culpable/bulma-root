'use client'

import { clsx } from 'clsx/lite'
import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react'

/**
 * Configuration for the dot matrix background effect.
 */
const DOT_CONFIG = {
  // Size of each dot in pixels
  dotSize: 1,
  // Spacing between dots (center to center) in pixels
  spacing: 24,
  // Base opacity of dots (0-1)
  baseOpacity: 0.03,
  // Maximum opacity when cursor is near (0-1)
  maxOpacity: 0.15,
  // Radius of the cursor effect in pixels
  effectRadius: 150,
  // Smoothing factor for the opacity transition
  smoothing: 0.15,
  // Idle timeout in ms - pause RAF when mouse stops moving
  idleTimeout: 150,
}

interface DotMatrixProps extends ComponentProps<'div'> {
  /** Size of each dot in pixels (default: 1) */
  dotSize?: number
  /** Spacing between dots in pixels (default: 24) */
  spacing?: number
  /** Base opacity of dots (default: 0.03) */
  baseOpacity?: number
  /** Maximum opacity when cursor is near (default: 0.15) */
  maxOpacity?: number
  /** Radius of the cursor effect in pixels (default: 150) */
  effectRadius?: number
  /** Whether the effect is active (default: true) */
  active?: boolean
}

/**
 * DotMatrix creates a subtle dot grid pattern background with cursor proximity effect.
 * Dots near the cursor brighten, creating a wave that follows mouse movement.
 *
 * Uses Canvas for performance with many dots. Falls back to static pattern if
 * canvas is not available.
 *
 * Performance optimisations:
 * - Only runs RAF loop when section is visible (IntersectionObserver)
 * - Pauses animation when mouse stops moving (idle detection)
 * - Renders one final "rest" frame when pausing to ensure clean state
 */
export function DotMatrix({
  dotSize = DOT_CONFIG.dotSize,
  spacing = DOT_CONFIG.spacing,
  baseOpacity = DOT_CONFIG.baseOpacity,
  maxOpacity = DOT_CONFIG.maxOpacity,
  effectRadius = DOT_CONFIG.effectRadius,
  active = true,
  className,
  ...props
}: DotMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const idleTimeoutRef = useRef<number | undefined>(undefined)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isIdle, setIsIdle] = useState(true)

  // Track mouse position relative to container and reset idle timer
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    // Reset idle state - mouse is actively moving
    setIsIdle(false)

    // Clear existing idle timeout and set a new one
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current)
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsIdle(true)
    }, DOT_CONFIG.idleTimeout)
  }, [])

  // Reset mouse position when leaving container
  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 }
    // Clear idle timeout and mark as idle immediately
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current)
    }
    setIsIdle(true)
  }, [])

  // Track visibility with IntersectionObserver - pause animation when off-screen
  useEffect(() => {
    const container = containerRef.current
    if (!container || !active) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [active])

  // Update dimensions on resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateDimensions = () => {
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      })
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  // Set up mouse event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container || !active) return

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      // Clean up idle timeout on unmount
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current)
      }
    }
  }, [handleMouseMove, handleMouseLeave, active])

  // Draw dots on canvas - only runs when visible AND not idle
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || dimensions.width === 0) return

    // Set canvas resolution for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    // Calculate dot grid
    const cols = Math.ceil(dimensions.width / spacing) + 1
    const rows = Math.ceil(dimensions.height / spacing) + 1

    // Draw function that renders current state
    const drawFrame = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      const mouse = mouseRef.current

      // Draw each dot
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing
          const y = row * spacing

          // Calculate distance from cursor
          const dx = x - mouse.x
          const dy = y - mouse.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Calculate opacity based on distance
          let opacity = baseOpacity
          if (distance < effectRadius) {
            const factor = 1 - distance / effectRadius
            // Use easeOutQuad for smooth falloff
            const eased = factor * (2 - factor)
            opacity = baseOpacity + (maxOpacity - baseOpacity) * eased
          }

          // Detect dark mode from document
          const isDark = document.documentElement.classList.contains('dark')
          const dotColor = isDark
            ? `rgba(255, 255, 255, ${opacity})`
            : `rgba(0, 0, 0, ${opacity})`

          ctx.beginPath()
          ctx.arc(x, y, dotSize, 0, Math.PI * 2)
          ctx.fillStyle = dotColor
          ctx.fill()
        }
      }
    }

    // Only run continuous animation loop when visible AND mouse is actively moving
    if (isVisible && !isIdle) {
      const animate = () => {
        drawFrame()
        animationRef.current = requestAnimationFrame(animate)
      }
      animate()
    } else {
      // Render one final frame at rest state (all dots at base opacity)
      // This ensures clean appearance when animation stops
      drawFrame()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, spacing, dotSize, baseOpacity, maxOpacity, effectRadius, isVisible, isIdle])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className={clsx('pointer-events-auto absolute inset-0 overflow-hidden', className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
        aria-hidden="true"
      />
    </div>
  )
}
