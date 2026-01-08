import { AnnouncementBadge } from '@/components/elements/announcement-badge'
import { ButtonLink, PlainButtonLink, SoftButtonLink } from '@/components/elements/button'
import { GradientBorderWrapper } from '@/components/elements/gradient-border-wrapper'
import { Link } from '@/components/elements/link'
import { LogoMarquee, MarqueeLogo } from '@/components/elements/logo-marquee'
import { MagneticWrapper } from '@/components/elements/magnetic-wrapper'
import { Screenshot } from '@/components/elements/screenshot'
import { BlurTransitionText } from '@/components/elements/blur-transition-text'
import { AnimatedArrowIcon } from '@/components/icons/animated-arrow-icon'
import { pageMetadata } from '@/lib/metadata'
import { CallToActionSimple } from '@/components/sections/call-to-action-simple'
import { FAQsTwoColumnAccordion, Faq } from '@/components/sections/faqs-two-column-accordion'
import { Feature, FeaturesTwoColumnWithDemos } from '@/components/sections/features-two-column-with-demos'
import { HeroLeftAlignedWithDemo } from '@/components/sections/hero-left-aligned-with-demo'
import { Plan, PricingMultiTier } from '@/components/sections/pricing-multi-tier'
import { StatAnimated, StatsAnimatedGraph } from '@/components/sections/stats-animated-graph'
import { TestimonialGlass, TestimonialsGlassmorphism } from '@/components/sections/testimonials-glassmorphism'
import {
  buildFaqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from '@/schemas/organization-schema'
import type { Metadata } from 'next'
import Image from 'next/image'
import Script from 'next/script'

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
const homeLenderLogoAlt = homeAlt('Australian lender logo')
const homeTestimonialAlt = (name: string) => homeAlt(`Portrait of ${name}`)

const homeFaqs = [
  {
    id: 'faq-0',
    question: 'What can Bulma do for my brokerage?',
    answer:
      'Bulma answers lender policy questions in seconds instead of hours. Ask questions like "<em>What lenders go to 95% LVR?</em>" or "<em>What add-backs does CBA accept?</em>" and get instant, grounded answers that cite the exact policy source. It’s like having a senior broker with encyclopaedic policy knowledge available 24/7.',
  },
  {
    id: 'faq-1',
    question: 'Why should I use Bulma instead of ChatGPT?',
    answer:
      'ChatGPT can make up policy details that sound plausible but don’t exist — a risk you can’t afford when advising clients. Bulma is different: every answer draws directly from current lender policy documents, and we show you the exact source (lender, policy category, last updated date) so you can verify it. You get the speed of AI with the reliability your clients expect.',
  },
  {
    id: 'faq-2',
    question: 'Which lenders does Bulma cover?',
    answer:
      'Bulma covers all major Australian lenders including the big four banks, plus a growing list of second-tier lenders and non-bank lenders. We regularly update our policy database to reflect the latest changes.',
  },
  {
    id: 'faq-3',
    question: 'Can I compare policies across different lenders?',
    answer:
      "Absolutely. Ask Bulma to compare policies across lenders - for example, 'Compare the big 4’s LMI requirements for 95% LVR' - and you’ll get a structured comparison highlighting key differences.",
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
      'Yes. Ask questions like "<em>Who can see my client data?</em>" or "<em>Are my queries shared with lenders?</em>" and we’ll explain the safeguards. We use enterprise-grade encryption (AES-256 at rest, TLS 1.3 in transit) and never share your queries or client information with third parties. Your conversation history is stored securely and only accessible by you.',
  },
]

const homeStructuredData = [
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  buildFaqPageSchema({
    path: '/',
    name: 'Bulma FAQs',
    faqs: homeFaqs,
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
        eyebrow={<AnnouncementBadge href="#lenders" text="Now covering all major Australian lenders" cta="See the list" />}
        headline={
          <>
            Your AI assistant for{' '}
            <BlurTransitionText
              phrases={[
                'policy questions.',
                'planning scenarios.',
                'credit preparation.',
                'comparing lenders.',
              ]}
            />
          </>
        }
        subheadline={
          <p>
            Bulma helps Australian mortgage brokers get instant, source-cited answers to lender policy questions. No more digging through PDFs and portals.
          </p>
        }
        cta={
          <div className="flex items-center gap-4">
            <MagneticWrapper>
              <GradientBorderWrapper>
                <ButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Try Bulma free
                </ButtonLink>
              </GradientBorderWrapper>
            </MagneticWrapper>

            <MagneticWrapper>
              <PlainButtonLink href="/contact" size="lg" className="group">
                See it in action <AnimatedArrowIcon className="-mr-1 ml-1.5" />
              </PlainButtonLink>
            </MagneticWrapper>
          </div>
        }
        demo={
          <>
            {/* Mobile/tablet screenshot */}
            <Screenshot className="rounded-md lg:hidden" wallpaper="blue" placement="bottom-right">
              <Image
                src="/img/screenshots/1-left-1670-top-1408.webp"
                alt={heroScreenshotAlt}
                width={1670}
                height={1408}
                className="bg-white/75 md:hidden dark:hidden"
              />
              <Image
                src="/img/screenshots/1-color-mist-left-1670-top-1408.webp"
                alt={heroScreenshotAlt}
                width={1670}
                height={1408}
                className="bg-black/75 not-dark:hidden md:hidden"
              />
              <Image
                src="/img/screenshots/1-left-2000-top-1408.webp"
                alt={heroScreenshotAlt}
                width={2000}
                height={1408}
                className="bg-white/75 max-md:hidden dark:hidden"
              />
              <Image
                src="/img/screenshots/1-color-mist-left-2000-top-1408.webp"
                alt={heroScreenshotAlt}
                width={2000}
                height={1408}
                className="bg-black/75 not-dark:hidden max-md:hidden"
              />
            </Screenshot>
            {/* Desktop screenshot */}
            <Screenshot className="rounded-lg max-lg:hidden" wallpaper="blue" placement="bottom">
              <Image
                src="/img/screenshots/1.webp"
                alt={heroScreenshotAlt}
                className="bg-white/75 dark:hidden"
                width={3440}
                height={1990}
              />
              <Image
                className="bg-black/75 not-dark:hidden"
                src="/img/screenshots/1-color-mist.webp"
                alt={heroScreenshotAlt}
                width={3440}
                height={1990}
              />
            </Screenshot>
          </>
        }
        footer={
          <div id="lenders">
            <LogoMarquee speed={0.8}>
              <MarqueeLogo>
                <Image
                  src="/img/logos/9-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={51}
                  height={32}
                />
                <Image
                  src="/img/logos/9-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={51}
                  height={32}
                />
              </MarqueeLogo>
              <MarqueeLogo>
                <Image
                  src="/img/logos/10-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={70}
                  height={32}
                />
                <Image
                  src="/img/logos/10-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={70}
                  height={32}
                />
              </MarqueeLogo>
              <MarqueeLogo>
                <Image
                  src="/img/logos/11-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={100}
                  height={32}
                />
                <Image
                  src="/img/logos/11-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={100}
                  height={32}
                />
              </MarqueeLogo>
              <MarqueeLogo>
                <Image
                  src="/img/logos/12-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={85}
                  height={32}
                />
                <Image
                  src="/img/logos/12-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={85}
                  height={32}
                />
              </MarqueeLogo>
              <MarqueeLogo>
                <Image
                  src="/img/logos/13-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={75}
                  height={32}
                />
                <Image
                  src="/img/logos/13-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={75}
                  height={32}
                />
              </MarqueeLogo>
              <MarqueeLogo>
                <Image
                  src="/img/logos/8-color-black-height-32.svg"
                  className="dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={85}
                  height={32}
                />
                <Image
                  src="/img/logos/8-color-white-height-32.svg"
                  className="not-dark:hidden"
                  alt={homeLenderLogoAlt}
                  width={85}
                  height={32}
                />
              </MarqueeLogo>
            </LogoMarquee>
          </div>
        }
      />
      {/* Features */}
      <FeaturesTwoColumnWithDemos
        id="features"
        eyebrow="Built for brokers"
        headline="Everything you need to navigate lender policies with confidence."
        subheadline={
          <p>
            Stop digging through PDFs and portals. Get the policy answers you need in seconds, not hours.
          </p>
        }
        features={
          <>
            <Feature
              demo={
                <Screenshot wallpaper="purple" placement="bottom-right">
                  <Image
                    src="/img/screenshots/1-left-1000-top-800.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-white/75 sm:hidden dark:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-left-1000-top-800.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-black/75 not-dark:hidden sm:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-left-1800-top-660.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-white/75 max-sm:hidden lg:hidden dark:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-left-1800-top-660.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-black/75 not-dark:hidden max-sm:hidden lg:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-left-1300-top-1300.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-white/75 max-lg:hidden xl:hidden dark:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-left-1300-top-1300.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-black/75 not-dark:hidden max-lg:hidden xl:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-left-1800-top-1250.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-white/75 max-xl:hidden dark:hidden"
                    width={1800}
                    height={1250}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-left-1800-top-1250.webp"
                    alt={policyQaScreenshotAlt}
                    className="bg-black/75 not-dark:hidden max-xl:hidden"
                    width={1800}
                    height={1250}
                  />
                </Screenshot>
              }
              headline="Policy Q&A"
              subheadline={
                <p>
                  Ask questions the way you'd ask a colleague. Bulma retrieves current policy text and gives you
                  grounded answers with source attribution.
                </p>
              }
              cta={
                <Link href="#pricing" className="group">
                  Learn more <AnimatedArrowIcon className="-mr-1 ml-1.5" />
                </Link>
              }
            />
            <Feature
              demo={
                <Screenshot wallpaper="blue" placement="bottom-left">
                  <Image
                    src="/img/screenshots/1-right-1000-top-800.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-white/75 sm:hidden dark:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-right-1000-top-800.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-black/75 not-dark:hidden sm:hidden"
                    width={1000}
                    height={800}
                  />
                  <Image
                    src="/img/screenshots/1-right-1800-top-660.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-white/75 max-sm:hidden lg:hidden dark:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-right-1800-top-660.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-black/75 not-dark:hidden max-sm:hidden lg:hidden"
                    width={1800}
                    height={660}
                  />
                  <Image
                    src="/img/screenshots/1-right-1300-top-1300.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-white/75 max-lg:hidden xl:hidden dark:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-right-1300-top-1300.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-black/75 not-dark:hidden max-lg:hidden xl:hidden"
                    width={1300}
                    height={1300}
                  />
                  <Image
                    src="/img/screenshots/1-right-1800-top-1250.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-white/75 max-xl:hidden dark:hidden"
                    width={1800}
                    height={1250}
                  />
                  <Image
                    src="/img/screenshots/1-color-mist-right-1800-top-1250.webp"
                    alt={lenderComparisonScreenshotAlt}
                    className="bg-black/75 not-dark:hidden max-xl:hidden"
                    width={1800}
                    height={1250}
                  />
                </Screenshot>
              }
              headline="Lender Comparison"
              subheadline={
                <p>Compare policies across lenders side-by-side. Find the best fit for your client's scenario in seconds.</p>
              }
              cta={
                <Link href="#pricing" className="group">
                  Learn more <AnimatedArrowIcon className="-mr-1 ml-1.5" />
                </Link>
              }
            />
          </>
        }
      />
      {/* Stats */}
      <StatsAnimatedGraph
        id="stats"
        eyebrow="Trusted by brokers"
        headline="The policy assistant Australian brokers rely on."
        subheadline={
          <p>
            Bulma helps mortgage brokers across Australia find policy answers faster, match clients to the right
            lenders, and close more deals with confidence.
          </p>
        }
      >
        <StatAnimated countTo={30} countSuffix="+" text="Major Australian lenders covered, with policies updated regularly." />
        <StatAnimated stat="Seconds" text="Average time to answer - compared to hours of manual research." />
      </StatsAnimatedGraph>
      {/* Testimonials */}
      <TestimonialsGlassmorphism
        id="testimonial"
        headline="What brokers are saying"
        subheadline={<p>Hear from mortgage brokers who use Bulma every day to serve their clients better.</p>}
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
      {/* FAQs */}
      <FAQsTwoColumnAccordion id="faqs" headline="Questions & Answers">
        {homeFaqs.map((faq) => (
          <Faq key={faq.id} id={faq.id} question={faq.question} answer={faq.answer} />
        ))}
      </FAQsTwoColumnAccordion>
      {/* Pricing */}
      <PricingMultiTier
        id="pricing"
        headline="Simple pricing for every brokerage."
        plans={
          <>
            <Plan
              name="Solo"
              price="$49"
              period="/mo"
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
              price="$99"
              period="/mo"
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
        }
      />
      {/* Call To Action */}
      <CallToActionSimple
        id="call-to-action"
        headline="Ready to spend less time on policy research?"
        subheadline={
          <p>
            Join brokers across Australia who use Bulma to answer policy questions faster, match clients to the right
            lenders, and close more deals with confidence.
          </p>
        }
        cta={
          <div className="flex items-center gap-4">
            <MagneticWrapper>
              <GradientBorderWrapper>
                <ButtonLink href="https://app.bulma.com.au/register" size="lg">
                  Try Bulma free
                </ButtonLink>
              </GradientBorderWrapper>
            </MagneticWrapper>

            <MagneticWrapper>
              <PlainButtonLink href="/contact" size="lg" className="group">
                Book a demo <AnimatedArrowIcon className="-mr-1 ml-1.5" />
              </PlainButtonLink>
            </MagneticWrapper>
          </div>
        }
      />
    </>
  )
}
