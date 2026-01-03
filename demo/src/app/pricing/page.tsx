import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { Logo, LogoGrid } from '@/components/elements/logo-grid'
import { ChevronIcon } from '@/components/icons/chevron-icon'
import { pageMetadata } from '@/lib/metadata'
import { CallToActionSimpleCentered } from '@/components/sections/call-to-action-simple-centered'
import { FAQsAccordion, Faq } from '@/components/sections/faqs-accordion'
import { PlanComparisonTable } from '@/components/sections/plan-comparison-table'
import { Plan, PricingHeroMultiTier } from '@/components/sections/pricing-hero-multi-tier'
import { TestimonialTwoColumnWithLargePhoto } from '@/components/sections/testimonial-two-column-with-large-photo'
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: pageMetadata.pricing.title,
  description: pageMetadata.pricing.description,
}

function plans(option: string) {
  return (
    <>
      <Plan
        name="Solo"
        price={option === 'Monthly' ? '$49' : '$490'}
        period={option === 'Monthly' ? '/month' : '/year'}
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
        price={option === 'Monthly' ? '$99' : '$990'}
        period={option === 'Monthly' ? '/month' : '/year'}
        subheadline={<p>For growing brokerages with multiple users</p>}
        badge="Most popular"
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
        price="Custom"
        period=""
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
  )
}

export default function Page() {
  return (
    <>
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
        plans={{ Monthly: plans('Monthly'), Yearly: plans('Yearly') }}
        footer={
          <LogoGrid>
            <Logo>
              <Image
                src="/img/logos/9-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={51}
                height={32}
              />
              <Image
                src="/img/logos/9-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={51}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/10-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={70}
                height={32}
              />
              <Image
                src="/img/logos/10-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={70}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/11-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={100}
                height={32}
              />
              <Image
                src="/img/logos/11-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={100}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/12-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={85}
                height={32}
              />
              <Image
                src="/img/logos/12-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={85}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/13-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={75}
                height={32}
              />
              <Image
                src="/img/logos/13-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
                width={75}
                height={32}
              />
            </Logo>
            <Logo>
              <Image
                src="/img/logos/8-color-black-height-32.svg"
                className="dark:hidden"
                alt=""
                width={85}
                height={32}
              />
              <Image
                src="/img/logos/8-color-white-height-32.svg"
                className="not-dark:hidden"
                alt=""
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
            policy question — it's saved us countless hours.
          </p>
        }
        img={
          <Image
            src="/img/avatars/16-h-1000-w-1400.webp"
            alt=""
            className="not-dark:bg-white/75 dark:bg-black/75"
            width={1400}
            height={1000}
          />
        }
        name="James Mitchell"
        byline="Principal Broker, Adelaide"
      />
      {/* FAQs */}
      <FAQsAccordion id="faqs" headline="Questions & Answers">
        <Faq
          id="faq-1"
          question="Is there a free trial?"
          answer="Yes, all plans come with a 14-day free trial. No credit card required to get started — just sign up and start asking policy questions right away."
        />
        <Faq
          id="faq-2"
          question="Can I upgrade or downgrade my plan?"
          answer="Absolutely. You can change your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, the change takes effect at your next billing cycle."
        />
        <Faq
          id="faq-3"
          question="What happens if I exceed my team member limit?"
          answer="On the Team plan, you can add additional team members beyond the included 5 for an extra per-seat fee. Contact us for details, or consider the Enterprise plan for unlimited team members."
        />
        <Faq
          id="faq-4"
          question="Do you offer discounts for aggregators?"
          answer="Yes, we offer volume discounts for aggregators and large brokerages. Get in touch with our sales team to discuss pricing that works for your organisation."
        />
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

            <PlainButtonLink href="/contact" size="lg">
              Book a demo <ChevronIcon />
            </PlainButtonLink>
          </div>
        }
      />
    </>
  )
}
