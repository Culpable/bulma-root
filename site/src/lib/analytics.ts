import mixpanel from './mixpanel-client'

type Properties = Record<string, unknown>

/** Track Bulma marketing events without sending development traffic. */
const analytics = {
  track(eventName: string, properties: Properties = {}) {
    if (!import.meta.env.DEV && typeof window !== 'undefined') mixpanel.track(eventName, properties)
  },
  trackFormSubmission(formName: string, formData: Properties = {}) {
    if (!import.meta.env.DEV && typeof window !== 'undefined') {
      mixpanel.track('Form Submitted', { form_name: formName, ...formData })
    }
  },
  trackButtonClick(buttonName: string, properties: Properties = {}) {
    if (!import.meta.env.DEV && typeof window !== 'undefined') {
      mixpanel.track('Button Clicked', { button_name: buttonName, ...properties })
    }
  },
  trackVideoPlay(videoId: string, properties: Properties = {}) {
    if (!import.meta.env.DEV && typeof window !== 'undefined') {
      mixpanel.track('Video Play', { video_id: videoId, ...properties })
    }
  },
  identifyUser(email: string, userProperties: Properties = {}) {
    if (!import.meta.env.DEV && typeof window !== 'undefined' && email) {
      mixpanel.identify(email)
      mixpanel.people.set({ $email: email, ...userProperties })
    }
  },
  trackFormSubmissionWithIdentification(
    formName: string,
    formData: Properties = {},
    userInfo: { email?: string; name?: string } = {},
  ) {
    if (import.meta.env.DEV || typeof window === 'undefined') return
    mixpanel.track('Form Submitted', { form_name: formName, ...formData })
    if (userInfo.email) {
      analytics.identifyUser(userInfo.email, {
        ...(userInfo.name ? { $name: userInfo.name } : {}),
        first_contact_date: new Date().toISOString(),
        contact_form_submitted: true,
        lead_source: formData.form_source || 'contact_form',
      })
    }
  },
}

export default analytics
