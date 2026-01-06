'use client'

import clsx from 'clsx'
import { Container } from '@/components/elements/container'
import { Eyebrow } from '@/components/elements/eyebrow'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { ContactDetails } from './contact-details'
import { ContactForm } from './contact-form'

/**
 * Render the animated contact page content with scroll-triggered entrance animations.
 * Separates client-side animation logic from the server component page.tsx.
 */
export function ContactPageContent() {
  // Initialize scroll animation observers for hero and grid sections.
  const { containerRef: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.15 })
  const { containerRef: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section className="py-16">
      <Container>
        {/* Hero section with slide-up entrance animation. */}
        <div
          ref={heroRef}
          className={clsx(
            'max-w-2xl transition-all duration-600 ease-out',
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <Eyebrow>Contact</Eyebrow>
          <Heading className="mt-2">Talk to the Bulma team.</Heading>
          <Text className="mt-4" size="lg">
            Whether you need help with lender policy research, broker onboarding, or pricing, we are here to help you
            move faster with confidence.
          </Text>
        </div>

        {/* Two-column layout with staggered slide animations for each card. */}
        <div ref={gridRef} className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ContactDetails slides in from left. */}
          <div
            className={clsx(
              'h-full transition-all duration-600 ease-out',
              gridVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            )}
          >
            <ContactDetails />
          </div>

          {/* ContactForm slides in from right with staggered delay. */}
          <div
            className={clsx(
              'h-full transition-all duration-600 ease-out',
              gridVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            )}
            style={{ transitionDelay: '150ms' }}
          >
            <ContactForm />
          </div>
        </div>
      </Container>
    </section>
  )
}
