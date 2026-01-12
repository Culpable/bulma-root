import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'

/**
 * Animation types available for icons.
 *
 * | Type | Effect | Best For |
 * |------|--------|----------|
 * | wiggle | Rotation back and forth | Notification, settings, warning icons |
 * | pulse | Gentle scale pulse | Heart, star, favorite icons |
 * | bounce | Vertical bounce with squash | Arrow, navigation, action icons |
 * | float | Gentle up-down drift | Cloud, mail, document icons |
 * | spin | Single full rotation | Settings, refresh, loading icons |
 * | sparkle | Scale with brightness pulse | Sparkles, star, magic icons |
 */
export type IconAnimationType = 'wiggle' | 'pulse' | 'bounce' | 'float' | 'spin' | 'sparkle'

/**
 * AnimatedIcon wraps an icon with a hover animation effect.
 *
 * The animation triggers on direct hover or when a parent element with
 * the `.group` class is hovered.
 *
 * @example
 * ```tsx
 * // Direct hover animation
 * <AnimatedIcon animation="pulse">
 *   <HeartIcon className="size-5" />
 * </AnimatedIcon>
 *
 * // Parent group hover animation
 * <button className="group">
 *   <AnimatedIcon animation="bounce">
 *     <ArrowRightIcon className="size-4" />
 *   </AnimatedIcon>
 *   Continue
 * </button>
 * ```
 *
 * To disable: Remove the AnimatedIcon wrapper or set animation to undefined.
 */
export function AnimatedIcon({
  children,
  animation,
  className,
  ...props
}: {
  children: ReactNode
  /** Animation type to apply on hover. Set to undefined to disable. */
  animation?: IconAnimationType
} & Omit<ComponentProps<'span'>, 'children'>) {
  // Map animation type to CSS class
  const animationClass = animation ? `icon-${animation}` : ''

  return (
    <span
      className={clsx(
        'icon-animated',
        animationClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
