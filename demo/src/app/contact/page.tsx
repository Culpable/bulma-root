import { Container } from '@/components/elements/container'
import { Eyebrow } from '@/components/elements/eyebrow'
import { Heading } from '@/components/elements/heading'
import { Text } from '@/components/elements/text'
import { ContactDetails } from './contact-details'
import { ContactForm } from './contact-form'

/**
 * Render the Bulma contact page with a simple hero and a two-column contact layout.
 */
export default function Page() {
  return (
    <section className="py-16">
      <Container>
        {/* Present a concise introduction so visitors understand the purpose of this page. */}
        <div className="max-w-2xl">
          <Eyebrow>Contact</Eyebrow>
          <Heading className="mt-2">Talk to the Bulma team.</Heading>
          <Text className="mt-4" size="lg">
            Whether you need help with lender policy research, broker onboarding, or pricing, we are here to help you
            move faster with confidence.
          </Text>
        </div>

        {/* Pair supporting details with the enquiry form to keep the layout balanced. */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ContactDetails />
          <ContactForm />
        </div>
      </Container>
    </section>
  )
}
