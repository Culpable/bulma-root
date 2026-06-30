'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const isDevelopment = process.env.NODE_ENV === 'development'
const analyticsIdleDelay = 1200

function requestAnalyticsIdle(callback) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(callback, { timeout: 3000 })
    return () => window.cancelIdleCallback(idleId)
  }

  const timeoutId = window.setTimeout(callback, analyticsIdleDelay)
  return () => window.clearTimeout(timeoutId)
}

/**
 * Client component that initializes Mixpanel after the page has had idle time.
 */
export default function MixpanelProvider() {
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    const cancelIdle = requestAnalyticsIdle(async () => {
      if (cancelled) {
        return
      }

      const { initMixpanel } = await import('@/lib/mixpanelClient')
      initMixpanel()
    })

    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [])


  useEffect(() => {
    if (isDevelopment) {
      return
    }

    let cancelled = false

    const cancelIdle = requestAnalyticsIdle(async () => {
      if (cancelled || !pathname) {
        return
      }

      const { default: mixpanel } = await import('@/lib/mixpanelClient')
      mixpanel.track('Page View', {
        url: pathname,
        page: pathname,
      })
    })

    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [pathname])

  return null
}
