import { siteMetadata } from '@/lib/metadata'

const BASE_URL = siteMetadata.siteUrl.replace(/\/$/, '')
const SITE_URL = `${BASE_URL}/`
const APP_URL = 'https://app.bulma.com.au'

const ORGANIZATION_ID = `${SITE_URL}#organization`
const WEBSITE_ID = `${SITE_URL}#website`
const SOFTWARE_APPLICATION_ID = `${SITE_URL}#software-application`

/**
 * Define Bulma's Organization schema so search engines understand the brand entity.
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Bulma',
  alternateName: ['Bulma: AI Mortgage Broker Assistant', 'Bulma AI Policy Advisor'],
  url: SITE_URL,
  logo: `${SITE_URL}img/logos/bulma-logo-dark.svg`,
  image: `${SITE_URL}img/screenshots/1.webp`,
  description:
    'Bulma is an AI assistant for Australian mortgage brokers that answers lender policy questions with source attribution, helping with scenario planning, policy matching, and lender selection.',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'solutions@bulma.com.au',
      areaServed: {
        '@type': 'Country',
        name: 'Australia',
      },
      availableLanguage: ['English'],
    },
  ],
  areaServed: {
    '@type': 'Country',
    name: 'Australia',
  },
  sameAs: [APP_URL],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'PO Box 155',
    addressLocality: 'Northlands',
    postOfficeBoxNumber: '155',
    postalCode: '6905',
    addressRegion: 'WA',
    addressCountry: 'AU',
  },
}


/**
 * Describe the marketing site as a WebSite entity.
 */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_URL,
  name: siteMetadata.name,
  description: siteMetadata.description,
  inLanguage: siteMetadata.locale,
  publisher: {
    '@id': ORGANIZATION_ID,
  },
}


/**
 * Highlight the Bulma application as a SoftwareApplication entity.
 */
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': SOFTWARE_APPLICATION_ID,
  name: siteMetadata.name,
  url: APP_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: siteMetadata.description,
  provider: {
    '@id': ORGANIZATION_ID,
  },
}


export type FaqEntry = {
  question: string
  answer: string
}

/**
 * Build a FAQPage JSON-LD schema for a given route and FAQ list.
 */
export function buildFaqPageSchema({
  path,
  name,
  faqs,
}: {
  path: string
  name: string
  faqs: FaqEntry[]
}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = normalizedPath === '/' ? SITE_URL : `${BASE_URL}${normalizedPath}`

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name,
    url,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
