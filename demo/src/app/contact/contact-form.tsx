'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/elements/button'
import analytics from '@/lib/analytics'

// Define the Formspree form ID placeholder so it can be swapped once provided.
const FORMSPREE_FORM_ID = 'xojvwybl'
// Build the Formspree action URL from the form ID.
const FORMSPREE_ACTION = `https://formspree.io/f/${FORMSPREE_FORM_ID}`

/**
 * Render a lightweight contact form for broker enquiries.
 */
export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: null as string | null })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ success: false, error: null })

    try {
      const form = event.currentTarget
      const formData = new FormData(form)
      const emailValue = formData.get('email')
      const nameValue = formData.get('name')
      const formSource = formData.get('form_source') || 'contact_page'

      const trackingData = {
        form_source: typeof formSource === 'string' ? formSource : 'contact_page',
        email: typeof emailValue === 'string' ? emailValue : 'not_provided',
      }

      const response = await fetch(FORMSPREE_ACTION, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        let message = 'Form submission failed'
        try {
          const data = await response.json()
          if (data?.error) {
            message = data.error
          }
        } catch {
          // Swallow JSON parsing errors so we can show a friendly message below.
        }
        throw new Error(message)
      }

      setSubmitStatus({ success: true, error: null })

      const userInfo = {
        email: typeof emailValue === 'string' ? emailValue : '',
        name: typeof nameValue === 'string' ? nameValue : '',
      }

      analytics.trackFormSubmissionWithIdentification(
        'Contact Form',
        {
          ...trackingData,
          status: 'success',
        },
        userInfo,
      )

      form.reset()
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitStatus({
        success: false,
        error: 'Sorry, your message failed to send. Please email us directly at solutions@bulma.com.au.',
      })

      analytics.track('Form Error', {
        form_name: 'Contact Form',
        error_type: 'submission_failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-mist-950/10 dark:bg-white/5 dark:ring-white/10">
      {/* Frame the form intent to make it clear what information is needed. */}
      <div>
        <h2 className="text-2xl/8 font-medium tracking-tight text-mist-950 dark:text-white">Send a message</h2>
        <p className="mt-2 text-base/7 text-mist-700 dark:text-mist-400">
          Share a few details and we will get back to you with the right Bulma expert.
        </p>
      </div>

      {/* Collect core contact fields while keeping the form compact and scannable. */}
      <form action={FORMSPREE_ACTION} method="POST" className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <input type="hidden" name="form_source" value="contact_page" />
        <div>
          <label htmlFor="contact-name" className="text-sm/6 font-semibold text-mist-950 dark:text-white">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-2 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-base/7 text-mist-950 placeholder:text-mist-400 shadow-sm focus:border-mist-950 focus:outline-none focus:ring-4 focus:ring-mist-950/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-mist-500 dark:focus:border-white dark:focus:ring-white/10"
            placeholder="Alex Broker"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="text-sm/6 font-semibold text-mist-950 dark:text-white">
            Work email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-base/7 text-mist-950 placeholder:text-mist-400 shadow-sm focus:border-mist-950 focus:outline-none focus:ring-4 focus:ring-mist-950/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-mist-500 dark:focus:border-white dark:focus:ring-white/10"
            placeholder="alex@brokerage.com.au"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="text-sm/6 font-semibold text-mist-950 dark:text-white">
            How can we help?
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            required
            className="mt-2 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-base/7 text-mist-950 placeholder:text-mist-400 shadow-sm focus:border-mist-950 focus:outline-none focus:ring-4 focus:ring-mist-950/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-mist-500 dark:focus:border-white dark:focus:ring-white/10"
            placeholder="Tell us about the policy questions or workflows you want to improve."
          />
        </div>

        {submitStatus.error && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm/6 text-rose-700">
            {submitStatus.error}
          </p>
        )}

        {submitStatus.success && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm/6 text-emerald-700">
            Message sent successfully. We&#39;ll get back to you soon.
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" size="lg" disabled={isSubmitting} className="disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? 'Sending...' : 'Send message'}
          </Button>
        </div>
      </form>
    </div>
  )
}
