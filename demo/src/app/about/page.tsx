import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { ChevronIcon } from '@/components/icons/chevron-icon'
import { pageMetadata } from '@/lib/metadata'
import { CallToActionSimple } from '@/components/sections/call-to-action-simple'
import { HeroLeftAlignedWithPhoto } from '@/components/sections/hero-left-aligned-with-photo'
import { Stat, StatsWithGraph } from '@/components/sections/stats-with-graph'
import { TeamFourColumnGrid, TeamMember } from '@/components/sections/team-four-column-grid'
import { TestimonialTwoColumnWithLargePhoto } from '@/components/sections/testimonial-two-column-with-large-photo'
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: pageMetadata.about.title,
  description: pageMetadata.about.description,
}

export default function Page() {
  return (
    <>
      {/* Hero */}
      <HeroLeftAlignedWithPhoto
        id="hero"
        headline="Built by brokers, for brokers."
        subheadline={
          <p>
            We know firsthand how much time gets lost to policy research. Bulma was created to give that time back — so
            you can focus on what matters most: your clients.
          </p>
        }
        photo={
          <Image
            src="/img/photos/1.webp"
            alt=""
            width={1800}
            height={945}
            className="not-dark:bg-white/75 dark:bg-black/75"
          />
        }
      />
      {/* Stats */}
      <StatsWithGraph
        id="stats"
        eyebrow="Growing with brokers"
        headline="The policy assistant Australian brokers rely on."
        subheadline={
          <p>
            Bulma helps mortgage brokers across Australia find policy answers faster, match clients to the right
            lenders, and close more deals with confidence. We're growing every day alongside the brokers who use us.
          </p>
        }
      >
        <Stat stat="30+" text="Major Australian lenders covered, with policies updated regularly." />
        <Stat stat="Seconds" text="Average time to answer — compared to hours of manual research." />
      </StatsWithGraph>
      {/* Testimonial */}
      <TestimonialTwoColumnWithLargePhoto
        id="testimonial"
        quote={
          <p>
            Bulma has genuinely changed how I work. I used to dread the policy research part of complex applications.
            Now it's the fastest part of my day.
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
        name="Sarah Chen"
        byline="Credit Adviser, Sydney"
      />
      {/* Team */}
      <TeamFourColumnGrid
        id="team"
        headline="Our team"
        subheadline={
          <p>
            Bulma's team combines deep expertise in mortgage broking with AI and product development. We understand the
            challenges you face because we've been there ourselves.
          </p>
        }
      >
        <TeamMember
          img={
            <Image
              src="/img/avatars/1-h-1000-w-800.webp"
              alt=""
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
              alt=""
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
              alt=""
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
              alt=""
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
              alt=""
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
              alt=""
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
              alt=""
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
              alt=""
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
          <p>We'd love to hear from you. Get in touch to learn more about how Bulma can help your brokerage.</p>
        }
        cta={
          <div className="flex items-center gap-4">
            <ButtonLink href="/contact" size="lg">
              Contact us
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
