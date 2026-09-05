import { site } from '@/config/site'
import { pricingCurrency, pricingPlanOffers } from '@/data/pricing-plans'
import { homeTestimonials, testimonialMaxRating, testimonialMinRating } from '@/data/testimonials'

const BASE_URL = 'https://bulma.com.au'
const SITE_URL = `${BASE_URL}/`
const APP_URL = 'https://app.bulma.com.au'
const PRICING_URL = `${BASE_URL}/pricing/`

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
  image: `${SITE_URL}img/screenshots/bulma-policy-advisor-workspace.webp`,
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
  name: site.name,
  description: site.description,
  inLanguage: 'en-AU',
  publisher: {
    '@id': ORGANIZATION_ID,
  },
}

/** Billing periods published for each plan, keyed by UN/CEFACT unit code. */
const BILLING_PERIODS = [
  { label: 'monthly', unitCode: 'MON' },
  { label: 'yearly', unitCode: 'ANN' },
] as const

/**
 * Format an amount as a schema.org price string.
 *
 * Prices are emitted as fixed two-decimal strings rather than numbers so that a
 * whole-dollar amount cannot be re-serialised without its currency precision.
 */
function toPriceString(amount: number) {
  return amount.toFixed(2)
}

/**
 * Build one Offer node per plan and billing period.
 *
 * Each Offer carries a `UnitPriceSpecification` with a `referenceQuantity` so that the
 * recurring nature of the subscription is explicit. Without it, a yearly price reads as
 * a one-off charge at the same amount as a monthly one.
 */
function buildPlanOffers() {
  return pricingPlanOffers.flatMap((plan) =>
    BILLING_PERIODS.map(({ label, unitCode }) => {
      const amount = label === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice

      return {
        '@type': 'Offer',
        name: `${plan.name} (${label})`,
        price: toPriceString(amount),
        priceCurrency: pricingCurrency,
        url: PRICING_URL,
        availability: 'https://schema.org/InStock',
        category: 'subscription',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: toPriceString(amount),
          priceCurrency: pricingCurrency,
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitCode,
          },
        },
      }
    }),
  )
}

const planOffers = buildPlanOffers()
const planOfferAmounts = pricingPlanOffers.flatMap((plan) => [plan.monthlyPrice, plan.yearlyPrice])

/**
 * Summarise every published plan price as a single AggregateOffer.
 *
 * Enterprise is excluded because it is quoted per customer, so `offerCount` counts only
 * the plans with a price a visitor can read on `/pricing/`.
 */
const aggregateOffer = {
  '@type': 'AggregateOffer',
  priceCurrency: pricingCurrency,
  lowPrice: toPriceString(Math.min(...planOfferAmounts)),
  highPrice: toPriceString(Math.max(...planOfferAmounts)),
  offerCount: planOffers.length,
  url: PRICING_URL,
  offers: planOffers,
}

/**
 * Build one Review node per published testimonial.
 *
 * These are first-party reviews hosted on our own site, so they are attached to the
 * SoftwareApplication entity and never to the Organization entity: Google treats a
 * business rating its own Organization as a self-serving review and disallows it.
 */
const applicationReviews = homeTestimonials.map((testimonial) => ({
  '@type': 'Review',
  '@id': `${SITE_URL}#review-${testimonial.id}`,
  reviewRating: {
    '@type': 'Rating',
    ratingValue: testimonial.rating,
    bestRating: testimonialMaxRating,
    worstRating: testimonialMinRating,
  },
  author: {
    '@type': 'Person',
    name: testimonial.name,
  },
  reviewBody: testimonial.quote,
}))

/**
 * Average the published testimonial ratings.
 *
 * The average is computed from the same entries the homepage renders, so the aggregate
 * can never drift away from the ratings a visitor can count on the page.
 */
const averageRating =
  applicationReviews.length > 0
    ? homeTestimonials.reduce((total, testimonial) => total + testimonial.rating, 0) / homeTestimonials.length
    : 0

/**
 * Highlight the Bulma application as a SoftwareApplication entity.
 *
 * Google's Software App structured data needs at least one of `offers`,
 * `aggregateRating`, or `review` before the entity is eligible for a rich result, so
 * both the plan offers and the published customer reviews belong on this node.
 */
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': SOFTWARE_APPLICATION_ID,
  name: site.name,
  url: APP_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: site.description,
  provider: {
    '@id': ORGANIZATION_ID,
  },
  offers: aggregateOffer,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: averageRating.toFixed(1),
    bestRating: testimonialMaxRating,
    worstRating: testimonialMinRating,
    reviewCount: applicationReviews.length,
  },
  review: applicationReviews,
}

/**
 * Build the route-specific WebPage node that links each page to the shared site identity.
 */
export function buildWebPageSchema({ path, name, description }: { path: string; name: string; description: string }) {
  const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`
  const url = normalizedPath === '/' ? SITE_URL : `${BASE_URL}${normalizedPath}`

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-AU',
  }
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
export function buildFaqPageSchema({ path, name, faqs }: { path: string; name: string; faqs: FaqEntry[] }) {
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
