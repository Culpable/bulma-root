'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initMixpanel } from '@/lib/mixpanelClient'
import mixpanel from '@/lib/mixpanelClient'

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Client component that initializes Mixpanel with Session Replay.
 */
export default function MixpanelProvider() {
  const pathname = usePathname()

  useEffect(() => {
    if (!isDevelopment) {
      console.log('Initializing Mixpanel with Session Replay...')
    }
    initMixpanel()
  }, [])


  useEffect(() => {
    if (isDevelopment) {
      return
    }
    if (pathname) {
      mixpanel.track('Page View', {
        url: pathname,
        page: pathname,
      })
    }
  }, [pathname])

  return null
}
