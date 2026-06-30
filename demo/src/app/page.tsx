import { AnnouncementBadge } from '@/components/elements/announcement-badge'
import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { Link } from '@/components/elements/link'
import { FeatureScreenshotLeft, FeatureScreenshotRight, HeroScreenshot } from '@/components/elements/responsive-screenshot'
import { Screenshot } from '@/components/elements/screenshot'
import { ScrollHighlight } from '@/components/elements/scroll-highlight'
import { SupportedLendersField } from '@/components/elements/supported-lenders-field'
import { AnimatedArrowIcon } from '@/components/icons/animated-arrow-icon'
import { ArrowLeftArrowRightIcon } from '@/components/icons/arrow-left-arrow-right-icon'
import { ChatBubbleCircleEllipsisIcon } from '@/components/icons/chat-bubble-circle-ellipsis-icon'
import { CallToActionSimple } from '@/components/sections/call-to-action-simple'
import { FAQsTwoColumnAccordion, Faq } from '@/components/sections/faqs-two-column-accordion'
import { Feature, FeaturesTwoColumnWithDemos } from '@/components/sections/features-two-column-with-demos'
import { HeroLeftAlignedWithDemo } from '@/components/sections/hero-left-aligned-with-demo'
import { Plan, PricingMultiTier } from '@/components/sections/pricing-multi-tier'
import { StatAnimated, StatsAnimatedGraph } from '@/components/sections/stats-animated-graph'
import { TestimonialGlass, TestimonialsGlassmorphism } from '@/components/sections/testimonials-glassmorphism'
import { pageMetadata } from '@/lib/metadata'
import { bulmaCoveredLenderCount, bulmaCoveredLenders, bulmaCoveredLendersAnswer } from '@/lib/supported-lenders'
import {
  buildFaqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
  type FaqEntry,
} from '@/schemas/organization-schema'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Script from 'next/script'
import type { ReactNode } from 'react'

// =============================================================================
// DYNAMIC IMPORTS FOR ANIMATION COMPONENTS (B-2)
// These components contain client-side animation logic. Dynamic importing
// enables code splitting, reducing initial JS bundle by ~15-20KB (gzipped).
// Components are SSR'd for SEO, then hydrate with interactivity on client.
// =============================================================================

// Blur transition text cycling animation - decorative, not critical for initial render
const BlurTransitionText = dynamic(() =>
  import('@/components/elements/blur-transition-text').then((m) => m.BlurTransitionText),
)

// Magnetic hover effect wrapper - interaction enhancement, deferred
const MagneticWrapper = dynamic(() => import('@/components/elements/magnetic-wrapper').then((m) => m.MagneticWrapper))

// Rotating gradient border animation - decorative CTA enhancement
const GradientBorderWrapper = dynamic(() =>
  import('@/components/elements/gradient-border-wrapper').then((m) => m.GradientBorderWrapper),
)

// Metallic sheen sweep on headlines - decorative entrance animation
const LuminanceSweep = dynamic(() => import('@/components/elements/luminance-sweep').then((m) => m.LuminanceSweep))

// =============================================================================
// PRELOAD FUNCTIONS FOR ANIMATION COMPONENTS (B-3)
// Preload on hover reduces perceived latency when user is about to interact.
// Export for use in client components that need to trigger preloading.
// Usage: Add onMouseEnter={preloadAnimationComponents} to CTA buttons.
// =============================================================================

export const preloadAnimationComponents = () => {
  void import('@/components/elements/blur-transition-text')
  void import('@/components/elements/magnetic-wrapper')
  void import('@/components/elements/gradient-border-wrapper')
  void import('@/components/elements/luminance-sweep')
}

// Homepage uses absolute title to bypass the " | Bulma" suffix from layout template
export const metadata: Metadata = {
  title: {
    absolute: pageMetadata.home.title,
  },
  description: pageMetadata.home.description,
}

const homeSeoAltContext =
  'Bulma AI assistant for Australian mortgage brokers focused on scenario planning, credit assessment, policy matching, and lender selection'
const homeAlt = (text: string) => `${text} - ${homeSeoAltContext}`
const heroScreenshotAlt = homeAlt('Bulma policy Q&A interface screenshot')
const policyQaScreenshotAlt = homeAlt('Bulma policy answers with source attribution')
const lenderComparisonScreenshotAlt = homeAlt('Bulma lender policy comparison view')
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

const homeStructuredData = [
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  buildFaqPageSchema({
    path: '/',
    name: 'Bulma FAQs',
    faqs: homeStructuredFaqs,
  }),
]

export default function Page() {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData),
        }}
      />
      {/* Hero */}
      <HeroLeftAlignedWithDemo
        id="hero"
        eyebrow={
          <AnnouncementBadge
            href="#supported-lenders"
            text="Now covering all major Australian lenders"
            cta="See the list"
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
          <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <MagneticWrapper className="w-full sm:w-auto">
              <GradientBorderWrapper className="w-full sm:w-auto">
                <ButtonLink href="https://app.bulma.com.au/register" size="lg" className="w-full sm:w-auto" preloadOnHover>
                  Try Bulma free
                </ButtonLink>
              </GradientBorderWrapper>
            </MagneticWrapper>

            <MagneticWrapper className="w-full sm:w-auto">
              <PlainButtonLink href="/contact" size="lg" className="group w-full sm:w-auto">
                See it in action <AnimatedArrowIcon className="-mr-1 ml-1.5" />
              </PlainButtonLink>
            </MagneticWrapper>
          </div>
        }
        demo={
          <>
            {/* Use one viewport-aware picture so only the active hero crop is fetched eagerly. */}
            <Screenshot className="rounded-md lg:rounded-lg" wallpaper="blue" placement="bottom" enableReflection>
              <HeroScreenshot alt={heroScreenshotAlt} loading="eager" fetchPriority="high" />
            </Screenshot>
          </>
        }
        footer={<SupportedLendersField appearance="light" />}
      />
      {/* Features (P-3: content-visibility for deferred rendering) */}
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
          <>
            <Feature
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
                <Link href="/contact" className="group">
                  Book a walkthrough <AnimatedArrowIcon className="-mr-1 ml-1.5" />
                </Link>
              }
            />
            <Feature
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
                <Link href="#supported-lenders" className="group">
                  See covered lenders <AnimatedArrowIcon className="-mr-1 ml-1.5" />
                </Link>
              }
            />
          </>
        }
      />
      {/* Stats (P-3: content-visibility for deferred rendering) */}
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
      {/* Testimonials (P-3: content-visibility for deferred rendering) */}
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
        <TestimonialGlass
          quote={
            <p>
              I used to spend hours checking lender portals for policy details. Now I just ask Bulma and get an answer
              in seconds - with the source right there so I can verify it.
            </p>
          }
          img={
            <Image
              src="/img/avatars/10-size-160.webp"
              alt={homeTestimonialAlt("Liam O'Connor")}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Liam O'Connor"
          byline="Credit Adviser, Sydney"
        />
        <TestimonialGlass
          quote={
            <p>
              The cross-lender comparison feature is brilliant. I can instantly see which lenders will accept my
              client’s scenario without opening five different PDFs.
            </p>
          }
          img={
            <Image
              src="/img/avatars/15-size-160.webp"
              alt={homeTestimonialAlt('Emily Carter')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Emily Carter"
          byline="Senior Broker, Melbourne"
        />
        <TestimonialGlass
          quote={
            <p>
              For complex scenarios with casual employment or self-employed clients, Bulma saves me from making
              embarrassing mistakes. It knows the policy nuances I might miss.
            </p>
          }
          img={
            <Image
              src="/img/avatars/13-size-160.webp"
              alt={homeTestimonialAlt('Neil Kapoor')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Neil Kapoor"
          byline="Mortgage Broker, Brisbane"
        />
        <TestimonialGlass
          quote={
            <p>
              Bulma understands broker terminology. I can ask about LMI thresholds, genuine savings, or income shading
              and get a precise answer without having to explain what I mean.
            </p>
          }
          img={
            <Image
              src="/img/avatars/12-size-160.webp"
              alt={homeTestimonialAlt('Mark Davidson')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Mark Davidson"
          byline="Credit Adviser, Perth"
        />
        <TestimonialGlass
          quote={
            <p>
              My team uses Bulma as our first stop for policy questions. It’s like having a senior broker on call 24/7
              who never forgets a policy update.
            </p>
          }
          img={
            <Image
              src="/img/avatars/11-size-160.webp"
              alt={homeTestimonialAlt('Jake Miller')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Jake Miller"
          byline="Principal Broker, Adelaide"
        />
        <TestimonialGlass
          quote={
            <p>
              The source attribution is what sold me. I can see exactly which lender policy and category the answer came
              from, and when it was last updated. That transparency matters.
            </p>
          }
          img={
            <Image
              src="/img/avatars/14-size-160.webp"
              alt={homeTestimonialAlt('Matt Lawson')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={160}
              height={160}
            />
          }
          name="Matt Lawson"
          byline="Lending Specialist, Gold Coast"
        />
      </TestimonialsGlassmorphism>
      {/* FAQs (P-3: content-visibility for deferred rendering) */}
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
      {/* Pricing (P-3: content-visibility for deferred rendering) */}
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
          <>
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
                  Policy coverage across <Link key="lender-count-link" href="#lenders">{bulmaCoveredLenderCount} lenders</Link>
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
            />
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
      />
      {/* Call To Action (P-3: content-visibility for deferred rendering) */}
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
            <MagneticWrapper className="w-full sm:w-auto">
              <GradientBorderWrapper className="w-full sm:w-auto">
                <ButtonLink href="https://app.bulma.com.au/register" size="lg" className="w-full sm:w-auto" preloadOnHover>
                  Try Bulma free
                </ButtonLink>
              </GradientBorderWrapper>
            </MagneticWrapper>

            <MagneticWrapper className="w-full sm:w-auto">
              <PlainButtonLink href="/contact" size="lg" className="group w-full sm:w-auto">
                Book a demo <AnimatedArrowIcon className="-mr-1 ml-1.5" />
              </PlainButtonLink>
            </MagneticWrapper>
          </div>
        }
      />
    </>
  )
}
