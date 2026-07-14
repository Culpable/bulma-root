import { clsx } from 'clsx/lite'
import NextLink from 'next/link'
import type { ComponentProps } from 'react'

/**
 * Styled link component with animated underline hover effect.
 * Features a premium "grow-from-center" underline animation that expands
 * outward from the center on hover, creating a refined interaction.
 *
 * The animation uses the `.link-underline-grow` class defined in globals.css.
 */
export function Link({
  href,
  className,
  size = 'inline',
  ...props
}: {
  href: string
  size?: 'inline' | 'cta'
} & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <NextLink
      href={href}
      className={clsx(
        // Base link styling with w-fit to prevent stretching in flex containers
        'link-underline-grow inline-flex w-fit cursor-pointer items-center gap-2',
        'text-sm/7 font-medium text-mist-950 dark:text-white',
        // Give standalone actions compliant targets while keeping links inside prose compact.
        size === 'cta' && 'min-h-11 lg:min-h-10',
        // Smooth color transition on hover (subtle blue tint in dark mode)
        'transition-colors duration-200 hover:text-mist-800 dark:hover:text-[oklch(95%_0.015_210)]',
        className,
      )}
      {...props}
    />
  )
}
