import { AnnouncementBadge } from '@/components/elements/announcement-badge'
import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { GlassPressButtonLink } from '@/components/elements/glass-press-button-link'
import { HueShiftProvider } from '@/components/elements/hue-shift-provider'
import { Link } from '@/components/elements/link'
import {
  FeatureScreenshotLeft,
  FeatureScreenshotRight,
  HeroScreenshot,
} from '@/components/elements/responsive-screenshot'
import { Screenshot } from '@/components/elements/screenshot'
import { ScrollHighlight } from '@/components/elements/scroll-highlight'
import { SupportedLendersField } from '@/components/elements/supported-lenders-field'
import { AnimatedArrowIcon } from '@/components/icons/animated-arrow-icon'
import { ArrowLeftArrowRightIcon } from '@/components/icons/arrow-left-arrow-right-icon'
import { ChatBubbleCircleEllipsisIcon } from '@/components/icons/chat-bubble-circle-ellipsis-icon'
import { CallToActionSimple } from '@/components/sections/call-to-action-simple'
import { FAQsTwoColumnAccordion, Faq } from '@/components/sections/faqs-two-column-accordion'
import { Feature, FeaturesTwoColumnWithDemos } from '@/components/sections/features-two-column-with-demos'
import { HeroDotPool } from '@/components/sections/hero-dot-pool'
import { Plan, PricingMultiTier } from '@/components/sections/pricing-multi-tier'
import { StatAnimated, StatsAnimatedGraph } from '@/components/sections/stats-animated-graph'
import { TestimonialGlass, TestimonialsGlassmorphism } from '@/components/sections/testimonials-glassmorphism'
import { site } from '@/config/site'
import { homeTestimonials, testimonialMaxRating } from '@/data/testimonials'
import { bulmaCoveredLenderCount, bulmaCoveredLenders, bulmaCoveredLendersAnswer } from '@/lib/supported-lenders'
import {
  buildFaqPageSchema,
  buildWebPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
  type FaqEntry,
} from '@/lib/organization-schema'
import { BlurTransitionText } from '@/components/elements/blur-transition-text'
import { LuminanceSweep } from '@/components/elements/luminance-sweep'
import { MagneticWrapper } from '@/components/elements/magnetic-wrapper'
import type { ReactNode } from 'react'

const homeSeoAltContext =
  'Bulma AI assistant for Australian mortgage brokers focused on scenario planning, credit assessment, policy matching, and lender selection'
const homeAlt = (text: string) => `${text} - ${homeSeoAltContext}`
const heroScreenshotAlt = homeAlt('Bulma Policy Advisor workspace with suggested lender policy questions')
const policyQaScreenshotAlt = homeAlt('Bulma policy evidence ledger with lender sources and update dates')
const lenderComparisonScreenshotAlt = homeAlt('Bulma comparison table for lender maximum LVR policies')
const homeTestimonialAlt = (name: string) => homeAlt(`Portrait of ${name}`)
const trackMyTrailHomePricingUrl = 'https://trackmytrail.com.au/?utm_source=bulma.com.au&utm_page=home_pricing'
const homePricingPeriods = { Monthly: '/month', Yearly: '/year' }

function TrackMyTrailHomeLink({ children = 'Track My Trail' }: { children?: string }) {
  return (
    <a
      href={trackMyTrailHomePricingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-mist-950 underline underline-offset-2 dark:text-white"
    >
      {children}
    </a>
  )
}

type HomeFaq = {
  id: string
  question: string
  answer: ReactNode
  schemaAnswer?: string
}

const homeFaqs = [
  {
    id: 'faq-0',
    question: 'What can Bulma do for my brokerage?',
    answer:
      'Bulma answers lender policy questions in seconds instead of hours. Ask questions like “<em>What lenders go to 95% LVR?</em>” or “<em>What add-backs does CBA accept?</em>” and get instant, grounded answers that cite the exact policy source. It’s like having a senior broker with encyclopaedic policy knowledge available 24/7.',
  },
  {
    id: 'faq-1',
    question: 'Why should I use Bulma instead of ChatGPT?',
    answer:
      'ChatGPT can make up policy details that sound plausible but don’t exist — a risk you can’t afford when advising clients. Bulma is different: every answer draws directly from current lender policy documents, and we show you the exact source (lender, policy category, last updated date) so you can verify it. You get the speed of AI with the reliability your clients expect.',
  },
  {
    id: 'lenders',
    question: 'Which lenders does Bulma cover?',
    answer: (
      <>
        <p>Bulma currently has policy coverage for the following lenders:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {bulmaCoveredLenders.map((lender) => (
            <li key={lender}>{lender}</li>
          ))}
        </ul>
        <p className="mt-3">We update this list as new lender policies are added and refreshed.</p>
      </>
    ),
    schemaAnswer: bulmaCoveredLendersAnswer,
  },
  {
    id: 'faq-3',
    question: 'Can I compare policies across different lenders?',
    answer:
      'Absolutely. Ask Bulma to compare policies across lenders - for example, ‘Compare the big 4’s LMI requirements for 95% LVR’ - and you’ll get a structured comparison highlighting key differences.',
  },
  {
    id: 'faq-4',
    question: 'Does Bulma provide credit advice?',
    answer:
      'No. Bulma is a research tool that helps you find policy information faster. You remain responsible for all credit advice and suitability assessments. We recommend confirming edge cases with your BDM.',
  },
  {
    id: 'faq-5',
    question: 'Is my data secure with Bulma?',
    answer:
      'Yes. Ask questions like “<em>Who can see my client data?</em>” or “<em>Are my queries shared with lenders?</em>” and we’ll explain the safeguards. We use enterprise-grade encryption (AES-256 at rest, TLS 1.3 in transit) and never share your queries or client information with third parties. Your conversation history is stored securely and only accessible by you.',
  },
] satisfies HomeFaq[]

const homeStructuredFaqs: FaqEntry[] = homeFaqs.map((faq) => ({
  question: faq.question,
  answer: faq.schemaAnswer ?? (typeof faq.answer === 'string' ? faq.answer : ''),
}))

export const homeStructuredData = [
  organizationSchema,
  websiteSchema,
  buildWebPageSchema({
    path: '/',
    name: 'Bulma: AI Assistant for Australian Mortgage Brokers',
    description: site.description,
  }),
  softwareApplicationSchema,
  buildFaqPageSchema({
    path: '/',
    name: 'Bulma FAQs',
    faqs: homeStructuredFaqs,
  }),
]

export type HomeSection = 'hero' | 'features' | 'stats' | 'testimonials' | 'faqs' | 'pricing' | 'cta'

export default function Page({ section }: { section: HomeSection }) {
  return (
    <>
      {/* Hero: Dot Pool Three.js background (see documents/guides/_animations.md, Dot Pool Hero) */}
      {section === 'hero' && (
        <HueShiftProvider>
          <HeroDotPool
        id="hero"
        eyebrow={
          <AnnouncementBadge
            href="#supported-lenders"
            text="Now covering all major Australian lenders"
            cta="See the list"
            // Centre the stacked text and CTA rows on phones to match the centred hero copy
            className="max-sm:items-center max-sm:text-center"
          />
        }
        headline={
          <LuminanceSweep text="Your AI assistant for policy questions." delay={400}>
            Your AI assistant for{' '}
            <BlurTransitionText
              phrases={['policy questions.', 'planning scenarios.', 'credit preparation.', 'comparing lenders.']}
            />
          </LuminanceSweep>
        }
        subheadline={
          <p>
            Bulma helps Australian mortgage brokers get{' '}
            <ScrollHighlight index={0}>instant, source-cited answers</ScrollHighlight> to lender policy questions.{' '}
            <ScrollHighlight index={1}>No more digging through PDFs and portals</ScrollHighlight>.
          </p>
        }
        cta={
          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <GlassPressButtonLink href="https://app.bulma.com.au/register" className="w-full sm:w-auto">
              Try Bulma free
            </GlassPressButtonLink>

            <MagneticWrapper className="w-full sm:w-auto">
              <PlainButtonLink href="/contact" size="lg" className="group w-full sm:w-auto">
                See it in action <AnimatedArrowIcon />
              </PlainButtonLink>
            </MagneticWrapper>
          </div>
        }
        demo={
          <>
            {/* Load the verified Policy Advisor capture eagerly because it is the page's primary product visual. */}
            <Screenshot className="rounded-md lg:rounded-lg" wallpaper="blue" placement="bottom" enableReflection>
              <HeroScreenshot alt={heroScreenshotAlt} loading="eager" fetchPriority="high" />
            </Screenshot>
          </>
        }
        footer={<SupportedLendersField appearance="light" />}
          />
        </HueShiftProvider>
      )}
      {/* Features (P-3: content-visibility for deferred rendering) */}
      {section === 'features' && (
        <FeaturesTwoColumnWithDemos
        id="features"
        className="content-visibility-features"
        eyebrow="Built for brokers"
        headline="Everything you need to navigate lender policies with confidence."
        stickyEyebrow
        sectionHue="features"
        subheadline={
          <p>
            Stop digging through PDFs and portals. Get{' '}
            <ScrollHighlight index={0} withUnderline>
              the policy answers you need in seconds
            </ScrollHighlight>
            , not hours.
          </p>
        }
        features={
          [
            <Feature
              key="policy-qa"
              demo={
                <Screenshot wallpaper="purple" placement="bottom-right">
                  <FeatureScreenshotLeft alt={policyQaScreenshotAlt} />
                </Screenshot>
              }
              icon={<ChatBubbleCircleEllipsisIcon className="size-5" />}
              headline="Policy Q&A"
              subheadline={
                <p>
                  Ask questions the way you&apos;d ask a colleague. Bulma retrieves current policy text and gives you
                  grounded answers with source attribution.
                </p>
              }
              cta={
                <Link href="/contact" size="cta" className="group">
                  Book a walkthrough <AnimatedArrowIcon />
                </Link>
              }
            />,
            <Feature
              key="lender-comparison"
              demo={
                <Screenshot wallpaper="blue" placement="bottom-left">
                  <FeatureScreenshotRight alt={lenderComparisonScreenshotAlt} />
                </Screenshot>
              }
              icon={<ArrowLeftArrowRightIcon className="size-5" />}
              headline="Lender Comparison"
              subheadline={
                <p>
                  Compare policies across lenders side-by-side. Find the best fit for your client&apos;s scenario in
                  seconds.
                </p>
              }
              cta={
                <Link href="#supported-lenders" size="cta" className="group">
                  See covered lenders <AnimatedArrowIcon />
                </Link>
              }
            />,
          ]
        }
        />
      )}
      {/* Stats (P-3: content-visibility for deferred rendering) */}
      {section === 'stats' && (
        <StatsAnimatedGraph
        id="stats"
        className="content-visibility-stats"
        eyebrow="Trusted by brokers"
        headline="The policy assistant Australian brokers rely on."
        stickyEyebrow
        sectionHue="stats"
        subheadline={
          <p>
            Bulma helps mortgage brokers across Australia{' '}
            <ScrollHighlight index={0}>find policy answers faster</ScrollHighlight>,{' '}
            <ScrollHighlight index={1}>match clients to the right lenders</ScrollHighlight>, and{' '}
            <ScrollHighlight index={2}>close more deals with confidence</ScrollHighlight>.
          </p>
        }
      >
        <StatAnimated
          countTo={bulmaCoveredLenderCount}
          text="Major Australian lenders covered, with policies updated regularly."
        />
        <StatAnimated stat="Seconds" text="Average time to answer - compared to hours of manual research." />
        </StatsAnimatedGraph>
      )}
      {/* Testimonials (P-3: content-visibility for deferred rendering) */}
      {section === 'testimonials' && (
        <TestimonialsGlassmorphism
        id="testimonial"
        className="content-visibility-testimonials"
        headline="What brokers are saying"
        sectionHue="testimonials"
        subheadline={
          <p>
            Hear from mortgage brokers who use Bulma{' '}
            <ScrollHighlight index={0}>every day to serve their clients better</ScrollHighlight>.
          </p>
        }
      >
        {homeTestimonials.map((testimonial) => (
          <TestimonialGlass
            key={testimonial.id}
            quote={<p>{testimonial.quote}</p>}
            rating={testimonial.rating}
            maxRating={testimonialMaxRating}
            img={
              <img
                src={testimonial.avatar}
                alt={homeTestimonialAlt(testimonial.name)}
                className="not-dark:bg-white/75 dark:bg-black/75"
                width={160}
                height={160}
              />
            }
            name={testimonial.name}
            byline={testimonial.byline}
          />
        ))}
        </TestimonialsGlassmorphism>
      )}
      {/* FAQs (P-3: content-visibility for deferred rendering) */}
      {section === 'faqs' && (
        <FAQsTwoColumnAccordion
        id="faqs"
        className="content-visibility-faqs"
        headline="Questions & Answers"
        stickyEyebrow
        sectionHue="faqs"
      >
        {homeFaqs.map((faq) => (
          <Faq key={faq.id} id={faq.id} question={faq.question} answer={faq.answer} />
        ))}
        </FAQsTwoColumnAccordion>
      )}
      {/* Pricing (P-3: content-visibility for deferred rendering) */}
      {section === 'pricing' && (
        <PricingMultiTier
        id="pricing"
        className="content-visibility-pricing"
        headline="Simple pricing for every brokerage"
        subheadline={
          <p>
            Choose the plan that fits your team. All plans include unlimited policy questions and full lender coverage.
          </p>
        }
        options={['Monthly', 'Yearly']}
        optionCallout={<p>Get 2 months free on a yearly plan.</p>}
        stickyEyebrow
        sectionHue="pricing"
        plans={
          [
            <Plan
              key="solo"
              name="Solo"
              prices={{ Monthly: '$49', Yearly: '$490' }}
              periods={homePricingPeriods}
              priceNotes={{
                Monthly: 'Switch yearly to save $98',
                Yearly: 'Save $98 compared with monthly',
              }}
              subheadline={<p>For individual brokers getting started</p>}
              features={[
                <span key="policy-questions">Unlimited policy questions</span>,
                <span key="lenders">
                  Policy coverage across{' '}
                  <Link key="lender-count-link" href="#lenders">
                    {bulmaCoveredLenderCount} lenders
                  </Link>
                </span>,
                <span key="comparisons">Cross-lender comparisons</span>,
                <span key="source-attribution">Source attribution on every answer</span>,
                <span key="conversation-history">Conversation history</span>,
                <span key="email-support">Email support</span>,
              ]}
              bonuses={{
                Yearly: (
                  <p>
                    Free 1 month of <TrackMyTrailHomeLink key="track-my-trail" /> for yearly Solo signups.
                  </p>
                ),
              }}
              bonusPrompt={
                <p>
                  Switch to yearly billing to unlock a <TrackMyTrailHomeLink key="track-my-trail" /> signup bonus.
                </p>
              }
              cta={
                <SoftButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Start free trial
                </SoftButtonLink>
              }
            />,
            <Plan
              key="team"
              name="Team"
              prices={{ Monthly: '$99', Yearly: '$990' }}
              periods={homePricingPeriods}
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
                    Free 3 months of <TrackMyTrailHomeLink key="track-my-trail" /> for yearly Team signups.
                  </p>
                ),
              }}
              bonusPrompt={
                <p>
                  Switch to yearly billing to unlock a <TrackMyTrailHomeLink key="track-my-trail" /> signup bonus.
                </p>
              }
              cta={
                <ButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Start free trial
                </ButtonLink>
              }
            />,
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
            />,
          ]
        }
        />
      )}
      {/* Call To Action (P-3: content-visibility for deferred rendering) */}
      {section === 'cta' && (
        <CallToActionSimple
        id="call-to-action"
        className="content-visibility-cta"
        headline="Ready to spend less time on policy research?"
        sectionHue="cta"
        subheadline={
          <p>
            Join brokers across Australia who use Bulma to{' '}
            <ScrollHighlight index={0}>answer policy questions faster</ScrollHighlight>,{' '}
            <ScrollHighlight index={1}>match clients to the right lenders</ScrollHighlight>, and{' '}
            <ScrollHighlight index={2}>close more deals with confidence</ScrollHighlight>.
          </p>
        }
        cta={
          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <GlassPressButtonLink href="https://app.bulma.com.au/register" className="w-full sm:w-auto">
              Try Bulma free
            </GlassPressButtonLink>

            <MagneticWrapper className="w-full sm:w-auto">
              <PlainButtonLink href="/contact" size="lg" className="group w-full sm:w-auto">
                Book a demo <AnimatedArrowIcon />
              </PlainButtonLink>
            </MagneticWrapper>
          </div>
        }
        />
      )}
    </>
  )
}
