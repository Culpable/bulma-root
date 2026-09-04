const ANALYTICS_IDLE_DELAY = 1200

/** Schedule analytics after load so the page remains the priority. */
function requestAnalyticsIdle(callback: () => void) {
  const schedule = () => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (handler: () => void, options?: { timeout: number }) => number
    }
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(callback, { timeout: 3000 })
    } else {
      globalThis.setTimeout(callback, ANALYTICS_IDLE_DELAY)
    }
  }

  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })
}

requestAnalyticsIdle(async () => {
  const { default: mixpanel, initMixpanel } = await import('../lib/mixpanel-client')
  initMixpanel()
  if (!import.meta.env.DEV) {
    const pathname = window.location.pathname
    mixpanel.track('Page View', { url: pathname, page: pathname })
  }
})

window.addEventListener(
  'load',
  () => {
    const referralScript = document.createElement('script')
    referralScript.src = '/scripts/referral-tracking.js'
    referralScript.async = true
    document.head.appendChild(referralScript)
  },
  { once: true },
)
