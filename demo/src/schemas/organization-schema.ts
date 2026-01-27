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

// Regex patterns for HTML stripping (hoisted to module level for reuse).
// String.replace() handles lastIndex reset internally, so global flags are safe here.
const HTML_TAG_REGEX = /<[^>]*>/g
const WHITESPACE_REGEX = /\s+/g

/**
 * Strip HTML tags from a string and normalize whitespace.
 *
 * This is intentionally conservative: JSON-LD FAQPage `name` and `text` fields should be plain text.
 * (Search engines may ignore or penalize markup inside structured data fields.)
 */
function toPlainText(value: string) {
  // Remove any HTML tags (e.g. "<em>") and collapse whitespace for cleaner schema output.
  const withoutTags = value.replace(HTML_TAG_REGEX, ' ')
  return withoutTags.replace(WHITESPACE_REGEX, ' ').trim()
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
  const mainEntity = faqs
    .map((faq) => {
      const question = toPlainText(faq.question)
      const answer = toPlainText(faq.answer)

      // Skip invalid/empty entries rather than emitting broken schema.
      if (!question || !answer) return null

      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      }
    })
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name,
    url,
    mainEntity,
  }
}
