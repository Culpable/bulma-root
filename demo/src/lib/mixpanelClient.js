import mixpanel from 'mixpanel-browser'

// Mixpanel project token - hardcoded for reliability
const MIXPANEL_TOKEN = 'd6d41f4f948512ee3e388559f7b1686e'

/**
 * Initialize Mixpanel with Session Replay and Heatmaps configuration.
 */
export const initMixpanel = () => {
  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: true,
    persistence: 'cookie',
    cross_subdomain_cookie: true,
    record_sessions_percent: 100,
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
}

/**
 * Expose the mixpanel instance for custom event tracking.
 */
export default mixpanel
