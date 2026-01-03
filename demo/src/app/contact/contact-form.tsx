import { Button } from '@/components/elements/button'

// Define the Formspree form ID placeholder so it can be swapped once provided.
const FORMSPREE_FORM_ID = 'xojvwybl'
// Build the Formspree action URL from the form ID.
const FORMSPREE_ACTION = `https://formspree.io/f/${FORMSPREE_FORM_ID}`

/**
 * Render a lightweight contact form for broker enquiries.
 */
export function ContactForm() {
  return (
    <div className="rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-mist-950/10 dark:bg-white/5 dark:ring-white/10">
      {/* Frame the form intent to make it clear what information is needed. */}
      <div>
        <h2 className="text-2xl/8 font-medium tracking-tight text-mist-950 dark:text-white">Send a message</h2>
        <p className="mt-2 text-base/7 text-mist-700 dark:text-mist-400">
          Share a few details and we will get back to you with the right Bulma expert.
        </p>
      </div>

      {/* Collect core contact fields while keeping the form compact and scannable. */}
      <form action={FORMSPREE_ACTION} method="POST" className="mt-6 space-y-5">
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
          <label htmlFor="contact-company" className="text-sm/6 font-semibold text-mist-950 dark:text-white">
            Brokerage
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            className="mt-2 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-base/7 text-mist-950 placeholder:text-mist-400 shadow-sm focus:border-mist-950 focus:outline-none focus:ring-4 focus:ring-mist-950/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-mist-500 dark:focus:border-white dark:focus:ring-white/10"
            placeholder="Brokerage name"
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

        <div className="pt-2">
          <Button type="submit" size="lg">
            Send message
          </Button>
        </div>
      </form>
    </div>
  )
}
