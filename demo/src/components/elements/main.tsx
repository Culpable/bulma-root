import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

/**
 * Main content wrapper with automatic page transition animation.
 *
 * Applies a smooth fade + slide-up entrance animation to all page content,
 * creating a polished transition feel when navigating between routes.
 *
 * To disable page transitions: Remove the 'page-transition-enter' class
 * from the inner div, or set enableTransition={false} when calling.
 */
export function Main({
  children,
  className,
  enableTransition = true,
  ...props
}: ComponentProps<'main'> & {
  /** Enable/disable page entrance transition animation (default: true) */
  enableTransition?: boolean
}) {
  return (
    <main className={clsx('isolate overflow-clip', className)} {...props}>
      <div className={clsx(enableTransition && 'page-transition-enter')}>
        {children}
      </div>
    </main>
  )
}
