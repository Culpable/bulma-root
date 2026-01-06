import { pageMetadata } from '@/lib/metadata'
import { ContactPageContent } from './contact-page-content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: pageMetadata.contact.title,
  description: pageMetadata.contact.description,
}

/**
 * Render the Bulma contact page with animated scroll-triggered entrance effects.
 * Delegates layout and animations to the client-side ContactPageContent component.
 */
export default function Page() {
  return <ContactPageContent />
}
