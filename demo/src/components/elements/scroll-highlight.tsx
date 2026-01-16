'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { useScrollHighlight } from '@/hooks/use-scroll-highlight'

/**
 * Props for ScrollHighlight component.
 */
interface ScrollHighlightProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** Content to highlight */
  children: ReactNode
  /** Index for stagger delay (default: 0) */
  index?: number
  /** Whether to show underline on highlight (default: false) */
  withUnderline?: boolean
  /** Whether highlighting is enabled (default: true) */
  enabled?: boolean
  /** Vertical margin from viewport edges to define "center" zone (default: '40%') */
  centerMargin?: string
}

/**
 * Wrapper component that highlights text when it passes through
 * the viewport center, creating a reading focus guide.
 *
 * Uses IntersectionObserver with rootMargin to detect center-screen position.
 * Applies subtle glow and color intensification effect.
 *
 * @example
 * ```tsx
 * // Basic usage - highlights when in viewport center
 * <p>
 *   Bulma helps brokers{' '}
 *   <ScrollHighlight>find policy answers faster</ScrollHighlight>,
 *   match clients to the right lenders, and close more deals.
 * </p>
 *
 * // With underline effect
 * <ScrollHighlight withUnderline>Key value proposition</ScrollHighlight>
 *
 * // Multiple highlights with stagger
 * <p>
 *   <ScrollHighlight index={0}>First point</ScrollHighlight>,{' '}
 *   <ScrollHighlight index={1}>second point</ScrollHighlight>, and{' '}
 *   <ScrollHighlight index={2}>third point</ScrollHighlight>.
 * </p>
 * ```
 */
export function ScrollHighlight({
  children,
  index = 0,
  withUnderline = false,
  enabled = true,
  centerMargin = '40%',
  className,
  ...props
}: ScrollHighlightProps) {
  const { ref, isHighlighted } = useScrollHighlight({
    centerMargin,
    enabled,
    index,
  })

  // If disabled, render children without highlight wrapper
  if (!enabled) {
    return (
      <span className={className} {...props}>
        {children}
      </span>
    )
  }

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      data-highlighted={isHighlighted}
      data-highlight-index={index}
      className={clsx(
        'scroll-highlight',
        withUnderline && 'with-underline',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * Wrapper component for paragraphs that contain multiple highlights.
 * Provides context for staggered highlight animations.
 *
 * @example
 * ```tsx
 * <HighlightedParagraph>
 *   <ScrollHighlight index={0}>First highlight</ScrollHighlight>{' '}
 *   <ScrollHighlight index={1}>Second highlight</ScrollHighlight>
 * </HighlightedParagraph>
 * ```
 */
export function HighlightedParagraph({
  children,
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p className={clsx('relative', className)} {...props}>
      {children}
    </p>
  )
}
