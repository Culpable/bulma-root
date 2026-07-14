'use client'

import { clsx } from 'clsx/lite'
import Link from 'next/link'
import { useCallback, type ComponentProps, type MouseEvent } from 'react'
import { preloadAnimationComponents } from '@/lib/preload-animation-components'

const sizes = {
  md: 'min-h-11 min-w-11 px-3 py-1 has-[>svg:last-child]:pr-2.5 lg:min-h-10 lg:min-w-10',
  lg: 'min-h-11 min-w-11 px-4 py-2 has-[>svg:last-child]:pr-3.5 lg:min-h-10 lg:min-w-10',
}

type ButtonInteractionProps = {
  /** Disable only the tactile press scale while preserving hover and focus feedback. */
  static?: boolean
}

// =============================================================================
// BUTTON ENHANCEMENTS - Toggle these on/off by commenting out
// =============================================================================

// #1 TRANSITION: Animate only the properties changed by shared button states.
const TRANSITION = 'transition-[scale,background-color,box-shadow,color] duration-150 ease-out'

// #2 HOVER_SCALE: Disabled - was causing unwanted effect
const HOVER_SCALE = ''

// #3 ACTIVE_PRESS: Scale down on click to simulate physical button press
const ACTIVE_PRESS = 'active:scale-[0.96]'

// #4 SHADOW_LIFT: Shadow appears on hover for primary/solid buttons
const SHADOW_LIFT_PRIMARY = 'hover:shadow-md hover:shadow-mist-950/10 dark:hover:shadow-black/25'
const SHADOW_LIFT_SOFT = 'hover:shadow-sm hover:shadow-mist-950/5 dark:hover:shadow-black/15'

// #5 FOCUS_RING: Visible focus ring for keyboard navigation (accessibility)
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mist-950/50 dark:focus-visible:ring-white/50 dark:focus-visible:ring-offset-mist-950'

// Return enhancements per instance so intentional static controls can opt out
// of press scaling without losing colour, shadow, or keyboard-focus feedback.
const primaryEnhancements = (isStatic: boolean) =>
  clsx(TRANSITION, HOVER_SCALE, !isStatic && ACTIVE_PRESS, SHADOW_LIFT_PRIMARY, FOCUS_RING)
const softEnhancements = (isStatic: boolean) =>
  clsx(TRANSITION, HOVER_SCALE, !isStatic && ACTIVE_PRESS, SHADOW_LIFT_SOFT, FOCUS_RING)
const plainEnhancements = (isStatic: boolean) =>
  clsx(TRANSITION, HOVER_SCALE, !isStatic && ACTIVE_PRESS, FOCUS_RING)

// =============================================================================

export function Button({
  size = 'md',
  type = 'button',
  color = 'dark/light',
  static: isStatic = false,
  className,
  ...props
}: {
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
} & ButtonInteractionProps & ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full text-sm/7 font-medium',
        primaryEnhancements(isStatic),
        color === 'dark/light' &&
          'bg-mist-950 text-white hover:bg-mist-800 dark:bg-mist-300 dark:text-mist-950 dark:hover:bg-mist-200',
        color === 'light' && 'hover bg-white text-mist-950 hover:bg-mist-100 dark:bg-mist-100 dark:hover:bg-white',
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function ButtonLink({
  size = 'md',
  color = 'dark/light',
  className,
  href,
  static: isStatic = false,
  preloadOnHover = false,
  onMouseEnter,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
  /** Preload animation chunks on hover to reduce CTA latency */
  preloadOnHover?: boolean
} & ButtonInteractionProps & Omit<ComponentProps<'a'>, 'href'>) {
  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (preloadOnHover) {
        preloadAnimationComponents()
      }
      onMouseEnter?.(event)
    },
    [preloadOnHover, onMouseEnter]
  )

  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full text-sm/7 font-medium',
        primaryEnhancements(isStatic),
        color === 'dark/light' &&
          'bg-mist-950 text-white hover:bg-mist-800 dark:bg-mist-300 dark:text-mist-950 dark:hover:bg-mist-200',
        color === 'light' && 'hover bg-white text-mist-950 hover:bg-mist-100 dark:bg-mist-100 dark:hover:bg-white',
        sizes[size],
        className,
      )}
      onMouseEnter={handleMouseEnter}
      {...props}
    />
  )
}

export function SoftButton({
  size = 'md',
  type = 'button',
  static: isStatic = false,
  className,
  ...props
}: {
  size?: keyof typeof sizes
} & ButtonInteractionProps & ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-mist-950/10 text-sm/7 font-medium text-mist-950 hover:bg-mist-950/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
        softEnhancements(isStatic),
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function SoftButtonLink({
  size = 'md',
  href,
  static: isStatic = false,
  className,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
} & ButtonInteractionProps & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-mist-950/10 text-sm/7 font-medium text-mist-950 hover:bg-mist-950/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
        softEnhancements(isStatic),
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function PlainButton({
  size = 'md',
  color = 'dark/light',
  type = 'button',
  static: isStatic = false,
  className,
  ...props
}: {
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
} & ButtonInteractionProps & ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm/7 font-medium',
        plainEnhancements(isStatic),
        color === 'dark/light' && 'text-mist-950 hover:bg-mist-950/10 dark:text-white dark:hover:bg-white/10',
        color === 'light' && 'text-white hover:bg-white/15 dark:hover:bg-white/10',
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

export function PlainButtonLink({
  size = 'md',
  color = 'dark/light',
  href,
  static: isStatic = false,
  className,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
} & ButtonInteractionProps & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm/7 font-medium',
        plainEnhancements(isStatic),
        color === 'dark/light' && 'text-mist-950 hover:bg-mist-950/10 dark:text-white dark:hover:bg-white/10',
        color === 'light' && 'text-white hover:bg-white/15 dark:hover:bg-white/10',
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
