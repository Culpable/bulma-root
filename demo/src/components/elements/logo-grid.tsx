'use client'

import { clsx } from 'clsx/lite'
import { Children, cloneElement, isValidElement, useEffect, useState, type ComponentProps } from 'react'

export function Logo({ className, ...props }: ComponentProps<'span'>) {
  return <span className={clsx('flex h-8 items-stretch', className)} {...props} />
}

export function LogoGrid({
  className,
  children,
  animated = true,
  baseDelay = 400,
  staggerDelay = 50,
  ...props
}: {
  /** Enable staggered fade-in animation. Default: true */
  animated?: boolean
  /** Initial delay before first logo animates (ms). Default: 400 */
  baseDelay?: number
  /** Delay between each logo animation (ms). Default: 50 */
  staggerDelay?: number
} & ComponentProps<'div'>) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    // Trigger animation shortly after mount (allows hero content to animate first)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Clone children and add animation styles
  const animatedChildren = animated
    ? Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child

        const delay = baseDelay + index * staggerDelay

        return cloneElement(child as React.ReactElement<{ className?: string; style?: React.CSSProperties; 'data-animate'?: string }>, {
          className: clsx((child.props as { className?: string }).className, 'animate-fade-up'),
          style: {
            ...(child.props as { style?: React.CSSProperties }).style,
            animationDelay: `${delay}ms`,
          },
          'data-animate': isVisible ? 'visible' : undefined,
        })
      })
    : children

  return (
    <div
      className={clsx(
        'mx-auto grid w-full grid-cols-2 place-items-center gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-10 lg:mx-auto lg:inline-grid lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-1 lg:gap-12',
        className,
      )}
      {...props}
    >
      {animatedChildren}
    </div>
  )
}
