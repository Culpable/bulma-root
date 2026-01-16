'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

/**
 * Path direction variants for icon motion.
 * - 'up': Gentle arc upward (default)
 * - 'left': Arc coming from the left
 * - 'right': Arc coming from the right
 * - 'bounce': Vertical bounce with slight overshoot
 */
type PathDirection = 'up' | 'left' | 'right' | 'bounce'

/**
 * Props for IconPathMotion component.
 */
interface IconPathMotionProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Icon element to animate */
  children: ReactNode
  /** Path direction variant (default: 'up') */
  direction?: PathDirection
  /** Animation delay in milliseconds (default: 0) */
  delay?: number
  /** Whether animation is enabled (default: true) */
  enabled?: boolean
  /** IntersectionObserver threshold (default: 0.2) */
  threshold?: number
}

/**
 * Path direction to CSS class mapping
 */
const PATH_CLASS_MAP: Record<PathDirection, string> = {
  up: '',
  left: 'path-left',
  right: 'path-right',
  bounce: 'path-bounce',
}

/**
 * Wrapper component that animates icons along curved bezier paths
 * when they enter the viewport.
 *
 * Uses CSS offset-path for path-following animation with ~75% browser support.
 * Graceful fallback to standard translate animation on unsupported browsers.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <IconPathMotion>
 *   <SparklesIcon className="size-6" />
 * </IconPathMotion>
 *
 * // With direction variant and delay
 * <IconPathMotion direction="left" delay={100}>
 *   <ChartIcon className="size-6" />
 * </IconPathMotion>
 *
 * // In a feature list with staggered delays
 * {features.map((feature, index) => (
 *   <IconPathMotion key={index} delay={index * 80} direction="bounce">
 *     {feature.icon}
 *   </IconPathMotion>
 * ))}
 * ```
 */
export function IconPathMotion({
  children,
  direction = 'up',
  delay = 0,
  enabled = true,
  threshold = 0.2,
  className,
  style,
  ...props
}: IconPathMotionProps) {
  const { containerRef, isVisible } = useScrollAnimation({
    threshold,
    triggerOnce: true,
  })

  // If disabled, render children without animation
  if (!enabled) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      data-visible={isVisible}
      className={clsx(
        'icon-path-motion',
        PATH_CLASS_MAP[direction],
        className
      )}
      style={{
        ...style,
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Utility function to generate staggered delays for a list of icons.
 *
 * @param index - Icon index in the list
 * @param baseDelay - Base delay in milliseconds (default: 80)
 * @param initialDelay - Delay before first icon animates (default: 0)
 */
export function getIconPathDelay(
  index: number,
  baseDelay: number = 80,
  initialDelay: number = 0
): number {
  return initialDelay + index * baseDelay
}
