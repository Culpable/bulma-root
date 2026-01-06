import { Eyebrow } from '@/components/elements/eyebrow'

/**
 * Render supporting details to set expectations before a broker submits the contact form.
 */
export function ContactDetails() {
  return (
    <div className="h-full rounded-3xl bg-white/70 p-8 shadow-sm ring-1 ring-mist-950/10 dark:bg-white/5 dark:ring-white/10">
      {/* Introduce what the Bulma team can help with. */}
      <div>
        <Eyebrow>What to expect</Eyebrow>
        <h2 className="mt-2 text-2xl/8 font-medium tracking-tight text-mist-950 dark:text-white">
          Fast answers for complex policy questions.
        </h2>
        <p className="mt-4 text-base/7 text-mist-700 dark:text-mist-400">
          Tell us about your brokerage, the lender policies you wrestle with, or the workflows you want to streamline.
          We will respond with practical next steps and a tailored demo plan.
        </p>
      </div>

      {/* Highlight the most common topics we cover in a concise list. */}
      <div className="mt-8">
        <h3 className="text-sm/7 font-semibold text-mist-950 dark:text-white">Common requests</h3>
        <ul className="mt-3 space-y-2 text-base/7 text-mist-700 dark:text-mist-400">
          <li>Policy Q&amp;A coverage for specific lenders or niches.</li>
          <li>Team onboarding, permissions, and shared knowledge.</li>
          <li>Pricing, procurement, and rollout timelines.</li>
        </ul>
      </div>

      {/* Provide a direct email fallback without forcing a form submission. */}
      <div className="mt-8 border-t border-mist-950/10 pt-6 dark:border-white/10">
        <h3 className="text-sm/7 font-semibold text-mist-950 dark:text-white">Prefer email?</h3>
        <p className="mt-2 text-base/7 text-mist-700 dark:text-mist-400">
          Reach us at{' '}
          <a
            className="cursor-pointer font-semibold text-mist-950 underline decoration-mist-950/30 underline-offset-4 hover:text-mist-800 dark:text-white dark:decoration-white/30"
            href="mailto:solutions@bulma.com.au"
          >
            solutions@bulma.com.au
          </a>
          .
        </p>
      </div>
    </div>
  )
}
