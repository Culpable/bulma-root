import { Container } from '@/components/elements/container'
import { Eyebrow } from '@/components/elements/eyebrow'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { ContactPageGrid } from './contact-page-grid'

/**
 * Render critical contact copy on the server and hydrate only the interactive cards.
 */
export function ContactPageContent() {
  return (
    <section className="py-16">
      <Container>
        {/* Keep critical hero text visible while its transform-only entrance runs. */}
        <div className="above-fold-slide-up max-w-2xl">
          <Eyebrow>Contact</Eyebrow>
          <Heading className="mt-2">Talk to the Bulma team.</Heading>
          <Text className="mt-4" size="lg">
            Whether you need help with lender policy research, broker onboarding, or pricing, we are here to help you
            move faster with confidence.
          </Text>
        </div>

        <ContactPageGrid />
      </Container>
    </section>
  )
}
