/**
 * useViewTransition Hook (A-1)
 *
 * Progressive enhancement hook for the View Transitions API.
 * Provides smooth page transition animations on supporting browsers (Chrome 111+)
 * while gracefully falling back to instant navigation on unsupported browsers.
 *
 * The View Transitions API creates a snapshot of the current page, performs
 * the navigation, then animates between the old and new snapshots.
 *
 * Benefits:
 * - Premium UX with smooth cross-fade transitions
 * - Zero cost for non-supporting browsers (graceful fallback)
 * - Works with Next.js App Router navigation
 *
 * Usage:
 * ```tsx
 * const { navigate } = useViewTransition()
 * onClick={() => navigate('/about')}
 * ```
 */

'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Type guard for View Transitions API support.
 * The API is available as document.startViewTransition in Chrome 111+.
 */
function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === 'function'
  )
}

/**
 * Type for View Transition result object.
 * The native API returns a ViewTransition object with these properties.
 */
interface ViewTransitionResult {
  finished: Promise<void>
  ready: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition: () => void
}

/**
 * Type for document with startViewTransition method.
 * Using a standalone interface to avoid conflicts with native Document types.
 */
interface DocumentWithViewTransition {
  startViewTransition: (callback: () => void | Promise<void>) => ViewTransitionResult
}

/**
 * Hook that provides View Transitions-enhanced navigation.
 *
 * @returns Object with navigate function and isSupported boolean
 */
export function useViewTransition() {
  const router = useRouter()

  /**
   * Navigate to a URL with View Transitions if supported.
   * Falls back to standard Next.js navigation if not supported.
   *
   * @param href - The URL to navigate to
   * @param options - Optional navigation options
   */
  const navigate = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      const performNavigation = () => {
        router.push(href, options)
      }

      // Check for View Transitions API support
      if (supportsViewTransitions()) {
        // Cast to unknown first, then to our interface to avoid type conflicts
        const doc = document as unknown as DocumentWithViewTransition

        // Wrap navigation in view transition for smooth animation
        doc.startViewTransition(() => {
          performNavigation()
        })
      } else {
        // Fallback for unsupported browsers
        performNavigation()
      }
    },
    [router]
  )

  /**
   * Navigate to a URL replacing the current history entry.
   * Uses View Transitions if supported.
   */
  const replace = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      const performNavigation = () => {
        router.replace(href, options)
      }

      if (supportsViewTransitions()) {
        // Cast to unknown first, then to our interface to avoid type conflicts
        const doc = document as unknown as DocumentWithViewTransition
        doc.startViewTransition(() => {
          performNavigation()
        })
      } else {
        performNavigation()
      }
    },
    [router]
  )

  return {
    navigate,
    replace,
    isSupported: supportsViewTransitions(),
  }
}
