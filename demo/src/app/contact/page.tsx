import { StructuredData } from '@/components/elements/structured-data'
import { pageMetadata, siteMetadata } from '@/lib/metadata'
import { buildWebPageSchema, organizationSchema, websiteSchema } from '@/schemas/organization-schema'
import type { Metadata } from 'next'
import { ContactPageContent } from './contact-page-content'

export const metadata: Metadata = {
  title: pageMetadata.contact.title,
  description: pageMetadata.contact.description,
}

/**
 * Render the Bulma contact page with animated scroll-triggered entrance effects.
 * Delegates layout and animations to the client-side ContactPageContent component.
 */
export default function Page() {
  return (
    <>
      <StructuredData
        graph={[
          organizationSchema,
          websiteSchema,
          buildWebPageSchema({
            path: '/contact/',
            name: `${pageMetadata.contact.title} | ${siteMetadata.name}`,
            description: pageMetadata.contact.description,
          }),
        ]}
      />
      <ContactPageContent />
    </>
  )
}
