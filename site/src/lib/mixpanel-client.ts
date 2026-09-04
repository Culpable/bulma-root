import mixpanel from 'mixpanel-browser/src/loaders/loader-module-with-async-recorder'

const MIXPANEL_TOKEN = 'd6d41f4f948512ee3e388559f7b1686e'
let mixpanelInitialized = false

function publishMixpanelReady() {
  window.dispatchEvent(new CustomEvent('bulma:mixpanel-ready', { detail: { mixpanel } }))
}

/** Initialise Mixpanel once after the page has completed loading. */
export function initMixpanel() {
  if (import.meta.env.DEV) {
    window.mixpanelLoaded = false
    window.mixpanelDisabled = true
    window.dispatchEvent(new CustomEvent('bulma:mixpanel-disabled'))
    return
  }

  if (mixpanelInitialized) {
    publishMixpanelReady()
    return
  }

  mixpanel.init(MIXPANEL_TOKEN, {
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

  window.mixpanel = mixpanel
  window.mixpanelLoaded = true
  mixpanelInitialized = true
  publishMixpanelReady()
}

export default mixpanel

declare global {
  interface Window {
    mixpanel?: typeof mixpanel
    mixpanelLoaded?: boolean
    mixpanelDisabled?: boolean
  }
}
