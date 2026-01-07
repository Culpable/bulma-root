import mixpanel from './mixpanelClient'

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Analytics utility functions for tracking user interactions.
 */
const analytics = {
  /**
   * Track a custom event with properties.
   */
  track: (eventName, properties = {}) => {
    if (isDevelopment) {
      return
    }
    if (typeof window !== 'undefined') {
      mixpanel.track(eventName, properties)
    }
  },


  /**
   * Track form submission events.
   */
  trackFormSubmission: (formName, formData = {}) => {
    if (isDevelopment) {
      return
    }
    if (typeof window !== 'undefined') {
      mixpanel.track('Form Submitted', {
        form_name: formName,
        ...formData,
      })
    }
  },


  /**
   * Track button click events.
   */
  trackButtonClick: (buttonName, properties = {}) => {
    if (isDevelopment) {
      return
    }
    if (typeof window !== 'undefined') {
      mixpanel.track('Button Clicked', {
        button_name: buttonName,
        ...properties,
      })
    }
  },


  /**
   * Track video play events.
   */
  trackVideoPlay: (videoId, properties = {}) => {
    if (isDevelopment) {
      return
    }
    if (typeof window !== 'undefined') {
      mixpanel.track('Video Play', {
        video_id: videoId,
        ...properties,
      })
    }
  },


  /**
   * Identify a user and set their properties in Mixpanel People.
   */
  identifyUser: (email, userProperties = {}) => {
    if (isDevelopment) {
      return
    }
    if (typeof window !== 'undefined' && email) {
      mixpanel.identify(email)

      mixpanel.people.set({
        $email: email,
        ...userProperties,
      })
    }
  },


  /**
   * Track form submission with user identification.
   */
  trackFormSubmissionWithIdentification: (formName, formData = {}, userInfo = {}) => {
    if (isDevelopment) {
      return
    }
    if (typeof window !== 'undefined') {
      mixpanel.track('Form Submitted', {
        form_name: formName,
        ...formData,
      })

      if (userInfo.email) {
        const userProperties = {}

        if (userInfo.name) {
          userProperties.$name = userInfo.name
        }

        userProperties.first_contact_date = new Date().toISOString()
        userProperties.contact_form_submitted = true
        userProperties.lead_source = formData.form_source || 'contact_form'

        analytics.identifyUser(userInfo.email, userProperties)
      }
    }
  },
}

export default analytics
