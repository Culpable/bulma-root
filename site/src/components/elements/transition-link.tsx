import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'
import { resolveInternalHref } from '../../lib/internal-href'

interface TransitionLinkProps extends ComponentProps<'a'> {
  href: string
  onBeforeNavigate?: () => void
  disableTransition?: boolean
}

/**
 * Render a native anchor so Astro can use the browser View Transitions API.
 */
export function TransitionLink({
  href,
  children,
  className,
  onBeforeNavigate,
  disableTransition: _disableTransition,
  onClick,
  ...props
}: TransitionLinkProps) {
  return (
    <a
      href={resolveInternalHref(href)}
      className={className}
      onClick={(event) => {
        onBeforeNavigate?.()
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

/**
 * Render a native link with the shared animated underline treatment.
 */
export function StyledTransitionLink({ href, className, ...props }: TransitionLinkProps) {
  return (
    <TransitionLink
      href={resolveInternalHref(href)}
      className={clsx(
        'link-underline-grow inline-flex w-fit cursor-pointer items-center gap-2',
        'text-sm/7 font-medium text-mist-950 dark:text-white',
        'transition-colors duration-200 hover:text-mist-800 dark:hover:text-[oklch(95%_0.015_210)]',
        className,
      )}
      {...props}
    />
  )
}
