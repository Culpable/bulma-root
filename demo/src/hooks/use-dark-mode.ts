'use client'

import { useSyncExternalStore } from 'react'

/**
 * Module-level singleton state for dark mode detection.
 * Shared across all hook consumers to avoid multiple MutationObservers.
 *
 * Before this optimisation: each GradientBorderWrapper instance created its own
 * MutationObserver (4 CTAs on homepage = 4 redundant observers).
 * After: single shared observer for entire application.
 */

// Set of listener functions to notify on dark mode changes
const listeners = new Set<() => void>()

// Cached dark mode value (null = not yet initialized)
let cachedIsDark: boolean | null = null

// Single MutationObserver instance (created lazily on first subscription)
let observer: MutationObserver | null = null

/**
 * Subscribe to dark mode changes.
 * Creates a single shared MutationObserver on first subscription.
 */
function subscribe(listener: () => void): () => void {
  // Initialize observer on first subscriber
  if (listeners.size === 0 && typeof window !== 'undefined') {
    cachedIsDark = document.documentElement.classList.contains('dark')

    observer = new MutationObserver(() => {
      const newIsDark = document.documentElement.classList.contains('dark')
      if (newIsDark !== cachedIsDark) {
        cachedIsDark = newIsDark
        // Notify all listeners
        listeners.forEach((fn) => fn())
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  listeners.add(listener)

  // Cleanup function
  return () => {
    listeners.delete(listener)

    // Disconnect observer when no listeners remain
    if (listeners.size === 0 && observer) {
      observer.disconnect()
      observer = null
    }
  }
}

/**
 * Get current dark mode snapshot.
 */
function getSnapshot(): boolean {
  if (cachedIsDark === null && typeof window !== 'undefined') {
    cachedIsDark = document.documentElement.classList.contains('dark')
  }
  return cachedIsDark ?? false
}

/**
 * Server-side snapshot (default to light mode for SSR).
 */
function getServerSnapshot(): boolean {
  return false
}

/**
 * Hook to subscribe to dark mode changes.
 *
 * Uses a single shared MutationObserver for all consumers,
 * avoiding redundant observers per component instance.
 *
 * @returns Current dark mode state (true = dark, false = light)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isDark = useDarkMode()
 *   return <div style={{ color: isDark ? 'white' : 'black' }}>...</div>
 * }
 * ```
 */
export function useDarkMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
