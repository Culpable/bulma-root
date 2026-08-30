'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const isDevelopment = process.env.NODE_ENV === 'development'
const analyticsIdleDelay = 1200

function requestAnalyticsIdle(callback) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  let idleId = null
  let timeoutId = null
  let cancelled = false

  const scheduleIdle = () => {
    if (cancelled) return

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(callback, { timeout: 3000 })
      return
    }

    timeoutId = window.setTimeout(callback, analyticsIdleDelay)
  }

  if (document.readyState === 'complete') {
    scheduleIdle()
  } else {
    window.addEventListener('load', scheduleIdle, { once: true })
  }

  return () => {
    if (cancelled) return
    cancelled = true
    window.removeEventListener('load', scheduleIdle)
    if (idleId !== null) window.cancelIdleCallback(idleId)
    if (timeoutId !== null) window.clearTimeout(timeoutId)
  }
}

/**
 * Client component that initializes Mixpanel after load and an idle window.
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
