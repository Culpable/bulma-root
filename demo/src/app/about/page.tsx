import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { AnimatedArrowIcon } from '@/components/icons/animated-arrow-icon'
import { pageMetadata } from '@/lib/metadata'
import { CallToActionSimple } from '@/components/sections/call-to-action-simple'
import { HeroLeftAlignedWithPhoto } from '@/components/sections/hero-left-aligned-with-photo'
import { StatAnimated, StatsAnimatedGraph } from '@/components/sections/stats-animated-graph'
import { TeamFourColumnGrid, TeamMember } from '@/components/sections/team-four-column-grid'
import { TestimonialTwoColumnWithLargePhoto } from '@/components/sections/testimonial-two-column-with-large-photo'
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: pageMetadata.about.title,
  description: pageMetadata.about.description,
}

const aboutSeoAltContext =
  'About Bulma and our mission to help Australian mortgage brokers work smarter with AI policy assistance'
const aboutAlt = (text: string) => `${text} - ${aboutSeoAltContext}`
const aboutPortraitAlt = (name: string) => aboutAlt(`Portrait of ${name}`)

export default function Page() {
  return (
    <>
      {/* Hero */}
      <HeroLeftAlignedWithPhoto
        id="hero"
        headline="Built by brokers, for brokers."
        subheadline={
          <p>
            We know firsthand how much time gets lost to policy research. Bulma was created to give that time back - so
            you can focus on what matters most: your clients.
          </p>
        }
        photo={
          <Image
            src="/img/photos/1.webp"
            alt={aboutAlt('Bulma team photo')}
            width={1800}
            height={945}
            className="not-dark:bg-white/75 dark:bg-black/75"
          />
        }
      />
      {/* Stats */}
      <StatsAnimatedGraph
        id="stats"
        eyebrow="Growing with brokers"
        headline="The policy assistant Australian brokers rely on."
        subheadline={
          <p>
            Bulma helps mortgage brokers across Australia find policy answers faster, match clients to the right
            lenders, and close more deals with confidence. We&apos;re growing every day alongside the brokers who use us.
          </p>
        }
      >
        <StatAnimated stat="30+" text="Major Australian lenders covered, with policies updated regularly." />
        <StatAnimated stat="Seconds" text="Average time to answer - compared to hours of manual research." />
      </StatsAnimatedGraph>
      {/* Testimonial */}
      <TestimonialTwoColumnWithLargePhoto
        id="testimonial"
        quote={
          <p>
            Bulma has genuinely changed how I work. I used to dread the policy research part of complex applications.
            Now it&apos;s the fastest part of my day.
          </p>
        }
        img={
          <Image
            src="/img/avatars/16-h-1000-w-1400.webp"
            alt={aboutPortraitAlt("Liam O'Connor")}
            className="not-dark:bg-white/75 dark:bg-black/75"
            width={1400}
            height={1000}
          />
        }
        name="Liam O'Connor"
        byline="Credit Adviser, Sydney"
      />
      {/* Team */}
      <TeamFourColumnGrid
        id="team"
        headline="Our team"
        subheadline={
          <p>
            Bulma&apos;s team combines deep expertise in mortgage broking with AI and product development. We understand the
            challenges you face because we&apos;ve been there ourselves.
          </p>
        }
      >
        <TeamMember
          img={
            <Image
              src="/img/avatars/1-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Leslie Alexander')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Leslie Alexander"
          byline="Co-Founder / CEO"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/2-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Michael Foster')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Michael Foster"
          byline="Co-Founder / CTO"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/7-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Dries Vincent')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Dries Vincent"
          byline="Business Relations"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/4-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Lindsay Walton')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Lindsay Walton"
          byline="Front-end Developer"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/5-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Noor Hasan')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Noor Hasan"
          byline="Designer"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/6-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Tom Cook')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Tom Cook"
          byline="Director of Product"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/8-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Whitney Francis')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Whitney Francis"
          byline="Copywriter"
        />
        <TeamMember
          img={
            <Image
              src="/img/avatars/3-h-1000-w-800.webp"
              alt={aboutPortraitAlt('Leonard Wu')}
              className="not-dark:bg-white/75 dark:bg-black/75"
              width={800}
              height={1000}
            />
          }
          name="Leonard Wu"
          byline="Senior Designer"
        />
      </TeamFourColumnGrid>
      {/* Call To Action */}
      <CallToActionSimple
        id="call-to-action"
        headline="Have questions?"
        subheadline={
          <p>We&apos;d love to hear from you. Get in touch to learn more about how Bulma can help your brokerage.</p>
        }
        cta={
          <div className="flex items-center gap-4">
            <ButtonLink href="/contact" size="lg">
              Contact us
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
