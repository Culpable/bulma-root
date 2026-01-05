import { clsx } from 'clsx/lite'
import Link from 'next/link'
import type { ComponentProps } from 'react'

const sizes = {
  md: 'px-3 py-1',
  lg: 'px-4 py-2',
}

// =============================================================================
// BUTTON ENHANCEMENTS - Toggle these on/off by commenting out
// =============================================================================

// #1 TRANSITION: Smooth transitions for all state changes (hover, active, focus)
const TRANSITION = 'transition-all duration-150 ease-out'

// #2 HOVER_SCALE: Disabled - was causing unwanted effect
const HOVER_SCALE = ''

// #3 ACTIVE_PRESS: Scale down on click to simulate physical button press
const ACTIVE_PRESS = 'active:scale-[0.98]'

// #4 SHADOW_LIFT: Shadow appears on hover for primary/solid buttons
const SHADOW_LIFT_PRIMARY = 'hover:shadow-md hover:shadow-mist-950/10 dark:hover:shadow-black/25'
const SHADOW_LIFT_SOFT = 'hover:shadow-sm hover:shadow-mist-950/5 dark:hover:shadow-black/15'

// #5 FOCUS_RING: Visible focus ring for keyboard navigation (accessibility)
const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-mist-950/50 dark:focus-visible:ring-white/50 dark:focus-visible:ring-offset-mist-950'

// Combined enhancements for each button type
const PRIMARY_ENHANCEMENTS = clsx(TRANSITION, HOVER_SCALE, ACTIVE_PRESS, SHADOW_LIFT_PRIMARY, FOCUS_RING)
const SOFT_ENHANCEMENTS = clsx(TRANSITION, HOVER_SCALE, ACTIVE_PRESS, SHADOW_LIFT_SOFT, FOCUS_RING)
const PLAIN_ENHANCEMENTS = clsx(TRANSITION, HOVER_SCALE, ACTIVE_PRESS, FOCUS_RING)

// =============================================================================

export function Button({
  size = 'md',
  type = 'button',
  color = 'dark/light',
  className,
  ...props
}: {
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
} & ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full text-sm/7 font-medium',
        PRIMARY_ENHANCEMENTS,
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
  ...props
}: {
  href: string
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
} & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full text-sm/7 font-medium',
        PRIMARY_ENHANCEMENTS,
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

export function SoftButton({
  size = 'md',
  type = 'button',
  className,
  ...props
}: {
  size?: keyof typeof sizes
} & ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-mist-950/10 text-sm/7 font-medium text-mist-950 hover:bg-mist-950/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
        SOFT_ENHANCEMENTS,
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
  className,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
} & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full bg-mist-950/10 text-sm/7 font-medium text-mist-950 hover:bg-mist-950/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
        SOFT_ENHANCEMENTS,
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
  className,
  ...props
}: {
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
} & ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm/7 font-medium',
        PLAIN_ENHANCEMENTS,
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
  className,
  ...props
}: {
  href: string
  size?: keyof typeof sizes
  color?: 'dark/light' | 'light'
} & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-sm/7 font-medium',
        PLAIN_ENHANCEMENTS,
        color === 'dark/light' && 'text-mist-950 hover:bg-mist-950/10 dark:text-white dark:hover:bg-white/10',
        color === 'light' && 'text-white hover:bg-white/15 dark:hover:bg-white/10',
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
