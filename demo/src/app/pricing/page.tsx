import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { SupportedLendersField } from '@/components/elements/supported-lenders-field'
import { AnimatedArrowIcon } from '@/components/icons/animated-arrow-icon'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { FAQsAccordion, Faq } from '@/components/sections/faqs-accordion'
import { PlanComparisonTable } from '@/components/sections/plan-comparison-table'
import { Plan, PricingHeroMultiTier } from '@/components/sections/pricing-hero-multi-tier'
import { pageMetadata } from '@/lib/metadata'
import { bulmaCoveredLenderCount } from '@/lib/supported-lenders'
// import { TestimonialTwoColumnWithLargePhoto } from '@/components/sections/testimonial-two-column-with-large-photo'
import { buildFaqPageSchema } from '@/schemas/organization-schema'
import type { Metadata } from 'next'
import NextLink from 'next/link'
import Script from 'next/script'

export const metadata: Metadata = {
  title: pageMetadata.pricing.title,
  description: pageMetadata.pricing.description,
}

// const pricingSeoAltContext = 'Bulma pricing for Australian mortgage brokerages with transparent plans and a free trial'
// const pricingAlt = (text: string) => `${text} - ${pricingSeoAltContext}`
// const pricingTestimonialAlt = pricingAlt('Portrait of Jake Miller')

const pricingFaqs = [
  {
    id: 'faq-1',
    question: 'Is there a free trial?',
    answer:
      'Yes, all plans come with a 14-day free trial. No credit card required to get started - just sign up and start asking policy questions right away.',
  },
  {
    id: 'faq-2',
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      "Absolutely. You can change your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, the change takes effect at your next billing cycle.",
  },
  {
    id: 'faq-3',
    question: 'What happens if I exceed my team member limit?',
    answer:
      'On the Team plan, you can add additional team members beyond the included 5 for an extra per-seat fee. Contact us for details, or consider the Enterprise plan for unlimited team members.',
  },
  {
    id: 'faq-4',
    question: 'Do you offer discounts for aggregators?',
    answer:
      'Yes, we offer volume discounts for aggregators and large brokerages. Get in touch with our sales team to discuss pricing that works for your organisation.',
  },
]

const pricingStructuredData = buildFaqPageSchema({
  path: '/pricing/',
  name: 'Bulma Pricing FAQs',
  faqs: pricingFaqs,
})

// Period labels for each pricing option
const pricingPeriods = { Monthly: '/month', Yearly: '/year' }
const trackMyTrailPricingUrl = 'https://trackmytrail.com.au/?utm_source=bulma.com.au&utm_page=pricing'

function TrackMyTrailLink({ children = 'Track My Trail' }: { children?: string }) {
  return (
    <a
      href={trackMyTrailPricingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-mist-950 underline underline-offset-2 dark:text-white"
    >
      {children}
    </a>
  )
}

export default function Page() {
  return (
    <>
      <Script
        id="pricing-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingStructuredData),
        }}
      />
      {/* Hero */}
      <PricingHeroMultiTier
        id="pricing"
        headline="Simple pricing for every brokerage"
        subheadline={
          <p>
            Choose the plan that fits your team. All plans include unlimited policy questions and full lender coverage.
          </p>
        }
        options={['Monthly', 'Yearly']}
        optionCallout={<p>Get 2 months free on a yearly plan.</p>}
        plans={
          <>
            <Plan
              key="solo"
              name="Solo"
              prices={{ Monthly: '$49', Yearly: '$490' }}
              periods={pricingPeriods}
              priceNotes={{
                Monthly: 'Switch yearly to save $98',
                Yearly: 'Save $98 compared with monthly',
              }}
              subheadline={<p>For individual brokers getting started</p>}
              features={[
                <span key="policy-questions">Unlimited policy questions</span>,
                <span key="lenders">
                  Policy coverage across{' '}
                  <NextLink key="lender-count-link" href="/#lenders" className="underline underline-offset-2">
                    {bulmaCoveredLenderCount} lenders
                  </NextLink>
                </span>,
                <span key="comparisons">Cross-lender comparisons</span>,
                <span key="source-attribution">Source attribution on every answer</span>,
                <span key="conversation-history">Conversation history</span>,
                <span key="email-support">Email support</span>,
              ]}
              bonuses={{
                Yearly: (
                  <p>
                    Free 1 month of <TrackMyTrailLink key="track-my-trail" /> for yearly Solo signups.
                  </p>
                ),
              }}
              bonusPrompt={
                <p>
                  Switch to yearly billing to unlock a <TrackMyTrailLink key="track-my-trail" /> signup bonus.
                </p>
              }
              cta={
                <SoftButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Start free trial
                </SoftButtonLink>
              }
            />
            <Plan
              key="team"
              name="Team"
              prices={{ Monthly: '$99', Yearly: '$990' }}
              periods={pricingPeriods}
              priceNotes={{
                Monthly: 'Switch yearly to save $198',
                Yearly: 'Save $198 compared with monthly',
              }}
              subheadline={<p>For growing brokerages with multiple users</p>}
              badge="Most popular"
              featured={true}
              features={[
                <span key="solo-features">Everything in Solo</span>,
                <span key="team-members">Up to 5 team members</span>,
                <span key="priority-support">Priority support</span>,
                <span key="usage-analytics">Team usage analytics</span>,
                <span key="shared-history">Shared conversation history</span>,
              ]}
              bonuses={{
                Yearly: (
                  <p>
                    Free 3 months of <TrackMyTrailLink key="track-my-trail" /> for yearly Team signups.
                  </p>
                ),
              }}
              bonusPrompt={
                <p>
                  Switch to yearly billing to unlock a <TrackMyTrailLink key="track-my-trail" /> signup bonus.
                </p>
              }
              cta={
                <ButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Start free trial
                </ButtonLink>
              }
            />
            <Plan
              key="enterprise"
              name="Enterprise"
              prices={{ Monthly: 'Custom', Yearly: 'Custom' }}
              periods=""
              subheadline={<p>For aggregators and large brokerages</p>}
              features={[
                <span key="team-features">Everything in Team</span>,
                <span key="unlimited-members">Unlimited team members</span>,
                <span key="custom-lender-coverage">Custom lender coverage</span>,
                <span key="account-manager">Dedicated account manager</span>,
                <span key="custom-integrations">Custom integrations</span>,
                <span key="volume-discounts">Volume discounts</span>,
              ]}
              cta={
                <SoftButtonLink href="/contact" size="lg">
                  Contact sales
                </SoftButtonLink>
              }
            />
          </>
        }
        footer={
          <>
            {/*
            <LogoGrid>
              <Logo>
                <Image
                  src="/img/logos/9-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={51}
                  height={32}
                />
                <Image
                  src="/img/logos/9-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={51}
                  height={32}
                />
              </Logo>
              <Logo>
                <Image
                  src="/img/logos/10-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={70}
                  height={32}
                />
                <Image
                  src="/img/logos/10-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={70}
                  height={32}
                />
              </Logo>
              <Logo>
                <Image
                  src="/img/logos/11-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={100}
                  height={32}
                />
                <Image
                  src="/img/logos/11-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={100}
                  height={32}
                />
              </Logo>
              <Logo>
                <Image
                  src="/img/logos/12-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={85}
                  height={32}
                />
                <Image
                  src="/img/logos/12-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={85}
                  height={32}
                />
              </Logo>
              <Logo>
                <Image
                  src="/img/logos/13-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={75}
                  height={32}
                />
                <Image
                  src="/img/logos/13-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={75}
                  height={32}
                />
              </Logo>
              <Logo>
                <Image
                  src="/img/logos/8-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={85}
                  height={32}
                />
                <Image
                  src="/img/logos/8-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={pricingLenderLogoAlt}
                  width={85}
                  height={32}
                />
              </Logo>
            </LogoGrid>
            */}
            <SupportedLendersField appearance="light" />
          </>
        }
      />
      {/* Plan Comparison Table */}
      <PlanComparisonTable
        id="plan-comparison"
        plans={['Solo', 'Team', 'Enterprise']}
        features={[
          {
            title: 'Policy Q&A',
            features: [
              { name: 'Unlimited policy questions', value: true },
              { name: `Policy coverage across ${bulmaCoveredLenderCount} lenders`, value: true },
              { name: 'Source attribution', value: true },
              { name: 'Conversation history', value: true },
              { name: 'Cross-lender comparisons', value: true },
            ],
          },
          {
            title: 'Team Features',
            features: [
              {
                name: 'Team members',
                value: { Solo: '1', Team: 'Up to 5', Enterprise: 'Unlimited' },
              },
              {
                name: 'Shared conversation history',
                value: { Solo: false, Team: true, Enterprise: true },
              },
              {
                name: 'Team usage analytics',
                value: { Solo: false, Team: true, Enterprise: true },
              },
              {
                name: 'Custom lender coverage',
                value: { Solo: false, Team: false, Enterprise: true },
              },
              {
                name: 'Custom integrations',
                value: { Solo: false, Team: false, Enterprise: true },
              },
            ],
          },
          {
            title: 'Support',
            features: [
              { name: 'Email support', value: true },
              {
                name: 'Priority support',
                value: { Solo: false, Team: true, Enterprise: true },
              },
              {
                name: 'Dedicated account manager',
                value: { Solo: false, Team: false, Enterprise: true },
              },
            ],
          },
        ]}
      />
      {/* Testimonial */}
      {/*
      <TestimonialTwoColumnWithLargePhoto
        id="testimonial"
        quote={
          <p>
            The Team plan paid for itself in the first week. Our whole office now uses Bulma as the first stop for any
            policy question - it&apos;s saved us countless hours.
          </p>
        }
        img={
          <Image
            src="/img/avatars/16-h-1000-w-1400.webp"
            alt={pricingTestimonialAlt}
            className="not-dark:bg-white/75 dark:bg-black/75"
            width={1400}
            height={1000}
          />
        }
        name="Jake Miller"
        byline="Principal Broker, Adelaide"
      />
      */}
      {/* FAQs */}
      <FAQsAccordion id="faqs" headline="Questions & Answers">
        {pricingFaqs.map((faq) => (
          <Faq key={faq.id} id={faq.id} question={faq.question} answer={faq.answer} />
        ))}
      </FAQsAccordion>
      {/* Call To Action */}
      <CallToActionSimpleCentered
        id="call-to-action"
        headline="Have more questions?"
        subheadline={<p>We&apos;re happy to help. Get in touch to discuss how Bulma can work for your brokerage.</p>}
        cta={
          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink href="/contact" size="lg" className="w-full sm:w-auto">
              Contact sales
            </ButtonLink>

            <PlainButtonLink href="/contact" size="lg" className="group w-full sm:w-auto">
              Book a demo <AnimatedArrowIcon className="-mr-1 ml-1.5" />
            </PlainButtonLink>
          </div>
        }
      />
    </>
  )
}
