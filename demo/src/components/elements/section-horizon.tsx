'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'

/**
 * SectionHorizon - Animated horizontal accent lines that draw inward from edges.
 *
 * Creates a "curtain reveal" effect with gradient lines that animate from
 * both edges toward the center when the section enters the viewport.
 *
 * @example
 * <SectionHorizon>
 *   <FeatureSection />
 * </SectionHorizon>
 */
export function SectionHorizon({
  children,
  className,
  ...props
}: {
  children: ReactNode
} & ComponentProps<'div'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      data-visible={isVisible}
      className={clsx('section-horizon', className)}
      {...props}
    >
      {children}
    </div>
  )
}
