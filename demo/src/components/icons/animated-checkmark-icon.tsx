'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type ComponentProps } from 'react'

interface AnimatedCheckmarkIconProps extends ComponentProps<'svg'> {
  /** Whether the checkmark should animate (default: false, shows static) */
  animate?: boolean
  /** Delay before animation starts in milliseconds (default: 0) */
  delay?: number
  /** Duration of the draw animation in milliseconds (default: 400) */
  duration?: number
}

/**
 * AnimatedCheckmarkIcon draws itself in with a satisfying stroke animation.
 * Uses stroke-dasharray/dashoffset technique for the drawing effect.
 *
 * When `animate` is false, displays the static checkmark immediately.
 * When `animate` is true, the checkmark stroke draws itself after the specified delay.
 */
export function AnimatedCheckmarkIcon({
  animate = false,
  delay = 0,
  duration = 400,
  className,
  ...props
}: AnimatedCheckmarkIconProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)
  const [isDrawn, setIsDrawn] = useState(!animate)

  // Measure path length on mount for accurate dash animation
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [])

  // Trigger draw animation after delay
  useEffect(() => {
    if (!animate) return

    // Reset on the next tick so toggling animate=true restarts the draw.
    const resetTimer = setTimeout(() => {
      setIsDrawn(false)
    }, 0)

    const timer = setTimeout(() => {
      setIsDrawn(true)
    }, delay)

    return () => {
      clearTimeout(resetTimer)
      clearTimeout(timer)
    }
  }, [animate, delay])

  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      role="image"
      className={clsx('inline-block', className)}
      {...props}
    >
      <path
        ref={pathRef}
        d="M1.5 6.5L5.5 11.5L11.5 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength || 20,
          strokeDashoffset: animate ? (isDrawn ? 0 : pathLength || 20) : 0,
          transition: animate
            ? `stroke-dashoffset ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : 'none',
        }}
      />
    </svg>
  )
}
