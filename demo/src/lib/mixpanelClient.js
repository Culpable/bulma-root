import mixpanel from 'mixpanel-browser'

// Mixpanel project token - hardcoded for reliability
const MIXPANEL_TOKEN = 'd6d41f4f948512ee3e388559f7b1686e'
const isDevelopment = process.env.NODE_ENV === 'development'
let mixpanelInitialized = false

function publishMixpanelReady() {
  window.dispatchEvent(new CustomEvent('bulma:mixpanel-ready', { detail: { mixpanel } }))
}

/**
 * Initialize Mixpanel with Session Replay and Heatmaps configuration.
 */
export const initMixpanel = () => {
  if (isDevelopment) {
    if (typeof window !== 'undefined') {
      window.mixpanelLoaded = false
      window.mixpanelDisabled = true
      window.dispatchEvent(new CustomEvent('bulma:mixpanel-disabled'))
    }
    return
  }

  if (mixpanelInitialized) {
    publishMixpanelReady()
    return
  }

  mixpanel.init(MIXPANEL_TOKEN, {
    // Disable automatic pageview tracking to avoid duplicate initial events; rely on MixpanelProvider for SPA route changes.
    track_pageview: false,
    persistence: 'cookie',
    cross_subdomain_cookie: true,
    record_sessions_percent: 20,
    record_heatmap_data: true,
    record_block_selector: '',
    record_mask_text_selector: '.sensitive-data',
    record_collect_fonts: true,
    record_idle_timeout_ms: 600000,
    record_min_ms: 3000,
  })

  // Explicitly expose mixpanel instance globally for referral tracking
  window.mixpanel = mixpanel
  window.mixpanelLoaded = true
  mixpanelInitialized = true
  publishMixpanelReady()
}

/**
 * Expose the mixpanel instance for custom event tracking.
 */
export default mixpanel
