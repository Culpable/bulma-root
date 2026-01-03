'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initMixpanel } from '@/lib/mixpanelClient'
import mixpanel from '@/lib/mixpanelClient'

/**
 * Client component that initializes Mixpanel with Session Replay.
 */
export default function MixpanelProvider() {
  const pathname = usePathname()

  useEffect(() => {
    console.log('Initializing Mixpanel with Session Replay...')
    initMixpanel()
  }, [])


  useEffect(() => {
    if (pathname) {
      mixpanel.track('Page View', {
        url: pathname,
        page: pathname,
      })
    }
  }, [pathname])

  return null
}
