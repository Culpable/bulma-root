import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { Logo, LogoGrid } from '@/components/elements/logo-grid'
import { AnimatedArrowIcon } from '@/components/icons/animated-arrow-icon'
import { pageMetadata } from '@/lib/metadata'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { FAQsAccordion, Faq } from '@/components/sections/faqs-accordion'
import { PlanComparisonTable } from '@/components/sections/plan-comparison-table'
import { Plan, PricingHeroMultiTier } from '@/components/sections/pricing-hero-multi-tier'
import { TestimonialTwoColumnWithLargePhoto } from '@/components/sections/testimonial-two-column-with-large-photo'
import { buildFaqPageSchema } from '@/schemas/organization-schema'
import type { Metadata } from 'next'
import Image from 'next/image'
import Script from 'next/script'

export const metadata: Metadata = {
  title: pageMetadata.pricing.title,
  description: pageMetadata.pricing.description,
}

const pricingSeoAltContext =
  'Bulma pricing for Australian mortgage brokerages with transparent plans and a free trial'
const pricingAlt = (text: string) => `${text} - ${pricingSeoAltContext}`
const pricingLenderLogoAlt = pricingAlt('Australian lender logo')
const pricingTestimonialAlt = pricingAlt('Portrait of Jake Miller')

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
        plans={
          <>
            <Plan
              name="Solo"
              prices={{ Monthly: '$49', Yearly: '$490' }}
              periods={pricingPeriods}
              subheadline={<p>For individual brokers getting started</p>}
              features={[
                'Unlimited policy questions',
                'All major lenders covered',
                'Source attribution on every answer',
                'Conversation history',
                'Email support',
              ]}
              cta={
                <SoftButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Start free trial
                </SoftButtonLink>
              }
            />
            <Plan
              name="Team"
              prices={{ Monthly: '$99', Yearly: '$990' }}
              periods={pricingPeriods}
              subheadline={<p>For growing brokerages with multiple users</p>}
              badge="Most popular"
              featured={true}
              features={[
                'Everything in Solo',
                'Up to 5 team members',
                'Cross-lender comparisons',
                'Priority support',
                'Team usage analytics',
                'Shared conversation history',
              ]}
              cta={
                <ButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Start free trial
                </ButtonLink>
              }
            />
            <Plan
              name="Enterprise"
              prices={{ Monthly: 'Custom', Yearly: 'Custom' }}
              periods=""
              subheadline={<p>For aggregators and large brokerages</p>}
              features={[
                'Everything in Team',
                'Unlimited team members',
                'Custom lender coverage',
                'Dedicated account manager',
                'Custom integrations',
                'Volume discounts',
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
        }
      />
      {/* Plan Comparison Table */}
      <PlanComparisonTable
        id="pricing"
        plans={['Solo', 'Team', 'Enterprise']}
        features={[
          {
            title: 'Policy Q&A',
            features: [
              { name: 'Unlimited policy questions', value: true },
              { name: 'All major lenders covered', value: true },
              { name: 'Source attribution', value: true },
              { name: 'Conversation history', value: true },
              {
                name: 'Cross-lender comparisons',
                value: { Solo: false, Team: true, Enterprise: true },
              },
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
      <TestimonialTwoColumnWithLargePhoto
        id="testimonial"
        quote={
          <p>
            The Team plan paid for itself in the first week. Our whole office now uses Bulma as the first stop for any
            policy question - it's saved us countless hours.
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
        subheadline={
          <p>We're happy to help. Get in touch to discuss how Bulma can work for your brokerage.</p>
        }
        cta={
          <div className="flex items-center gap-4">
            <ButtonLink href="/contact" size="lg">
              Contact sales
            </ButtonLink>

            <PlainButtonLink href="/contact" size="lg" className="group">
              Book a demo <AnimatedArrowIcon className="-mr-1 ml-1.5" />
            </PlainButtonLink>
          </div>
        }
      />
    </>
  )
}
