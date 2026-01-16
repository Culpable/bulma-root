/**
 * TransitionLink Component (A-1)
 *
 * Enhanced link component that uses the View Transitions API for smooth
 * page transitions on supporting browsers (Chrome 111+).
 *
 * For internal navigation, wraps the navigation in document.startViewTransition()
 * to create a smooth cross-fade animation between pages. Falls back to standard
 * navigation on unsupported browsers.
 *
 * External links (http://, https://, mailto:, tel:) are rendered as standard
 * anchors without View Transitions.
 *
 * Usage:
 * ```tsx
 * <TransitionLink href="/about">About Us</TransitionLink>
 * ```
 *
 * Note: For optimal visual effect, pair with page-level transition CSS:
 * ```css
 * ::view-transition-old(root),
 * ::view-transition-new(root) {
 *   animation-duration: 0.3s;
 * }
 * ```
 */

'use client'

import { clsx } from 'clsx/lite'
import NextLink from 'next/link'
import { useCallback, type ComponentProps, type MouseEvent } from 'react'
import { useViewTransition } from '@/hooks/use-view-transition'

/**
 * Check if a URL is external (starts with http://, https://, mailto:, tel:, etc.)
 */
function isExternalUrl(href: string): boolean {
  return /^(https?:|mailto:|tel:|#)/.test(href)
}

interface TransitionLinkProps extends Omit<ComponentProps<typeof NextLink>, 'onClick'> {
  /** The URL to navigate to */
  href: string
  /** Optional click handler (called before navigation) */
  onBeforeNavigate?: () => void
  /** Disable View Transitions for this link */
  disableTransition?: boolean
}

export function TransitionLink({
  href,
  children,
  className,
  onBeforeNavigate,
  disableTransition = false,
  ...props
}: TransitionLinkProps) {
  const { navigate } = useViewTransition()

  /**
   * Handle click with View Transitions for internal links.
   * External links use default anchor behavior.
   */
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Don't intercept external links
      if (isExternalUrl(href)) {
        return
      }

      // Don't intercept if modifier keys are pressed (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }

      // Don't intercept if middle mouse button (open in new tab)
      if (e.button !== 0) {
        return
      }

      // Allow opt-out of View Transitions
      if (disableTransition) {
        return
      }

      // Prevent default navigation
      e.preventDefault()

      // Call optional pre-navigation handler
      onBeforeNavigate?.()

      // Navigate with View Transitions
      navigate(href)
    },
    [href, navigate, onBeforeNavigate, disableTransition]
  )

  return (
    <NextLink
      href={href}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </NextLink>
  )
}

/**
 * Styled TransitionLink with animated underline effect.
 * Drop-in replacement for the standard Link component with View Transitions.
 */
export function StyledTransitionLink({
  href,
  className,
  ...props
}: TransitionLinkProps) {
  return (
    <TransitionLink
      href={href}
      className={clsx(
        // Base link styling with w-fit to prevent stretching in flex containers
        'link-underline-grow inline-flex w-fit cursor-pointer items-center gap-2',
        'text-sm/7 font-medium text-mist-950 dark:text-white',
        // Smooth color transition on hover (subtle blue tint in dark mode)
        'transition-colors duration-200 hover:text-mist-800 dark:hover:text-[oklch(95%_0.015_210)]',
        className,
      )}
      {...props}
    />
  )
}
