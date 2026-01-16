'use client'

import { clsx } from 'clsx/lite'
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Wrapper component that triggers staggered fade-up animations when children enter the viewport.
 *
 * Uses IntersectionObserver to detect when the container becomes visible, then applies
 * animation classes to each child with staggered delays.
 */
export function AnimatedReveal({
  children,
  className,
  threshold = 0.15,
  staggerDelay = 75,
  ...props
}: {
  children: ReactNode
  className?: string
  /** Intersection threshold (0-1) for triggering animation. Default: 0.15 */
  threshold?: number
  /** Delay between each child animation in ms. Default: 75 */
  staggerDelay?: number
} & React.HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger once when entering viewport
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [threshold])

  // Clone children and add animation classes with stagger delays
  const animatedChildren = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child

    const delay = index * staggerDelay

    return cloneElement(child as React.ReactElement<{ className?: string; style?: React.CSSProperties; 'data-animate'?: string }>, {
      className: clsx((child.props as { className?: string }).className, 'animate-fade-up'),
      style: {
        ...(child.props as { style?: React.CSSProperties }).style,
        animationDelay: `${delay}ms`,
      },
      'data-animate': isVisible ? 'visible' : undefined,
    })
  })

  return (
    <div ref={containerRef} className={className} {...props}>
      {animatedChildren}
    </div>
  )
}
