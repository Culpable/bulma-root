'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

/**
 * PageTransition provides smooth entrance animations for page content.
 *
 * Wraps page content with a fade-in and subtle slide-up animation that triggers
 * on mount, creating a polished transition feel when navigating between pages.
 *
 * Configuration constants:
 * - Animation duration: 500ms
 * - Animation easing: cubic-bezier(0.22, 1, 0.36, 1) - smooth ease-out
 * - Slide distance: 16px vertical translation
 *
 * The animation uses CSS keyframes defined in globals.css to ensure consistent
 * performance and behavior across all pages.
 *
 * @example
 * ```tsx
 * // In a page component
 * export default function Page() {
 *   return (
 *     <PageTransition>
 *       <HeroSection />
 *       <ContentSection />
 *     </PageTransition>
 *   )
 * }
 * ```
 *
 * To disable: Remove the PageTransition wrapper from the page.
 */
export function PageTransition({
  children,
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        // Apply the page entrance animation
        'page-transition-enter',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
