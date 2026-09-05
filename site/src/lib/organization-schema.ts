import { site } from '../config/site.ts'
import type { OrganizationIdentityFacts, PrimaryIdentity } from './site-identity.ts'
import { pricingCurrency, pricingPlanOffers } from '../data/pricing-plans.ts'
import { homeTestimonials, testimonialMaxRating, testimonialMinRating } from '../data/testimonials.ts'

const BASE_URL = 'https://bulma.com.au'
const SITE_URL = `${BASE_URL}/`
const APP_URL = 'https://app.bulma.com.au/'
const PRICING_URL = `${BASE_URL}/pricing/`

const ORGANIZATION_ID = `${SITE_URL}#organization`
const WEBSITE_ID = `${SITE_URL}#website`
const SOFTWARE_APPLICATION_ID = `${SITE_URL}#software-application`

/**
 * Resolve a site-relative asset path against the production origin.
 *
 * Structured data must carry absolute URLs, while `config/site.ts` stores the same
 * assets as root-relative paths for the markup that renders them.
 */
function toAbsoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

/**
 * Read the Organization facts that `config/site.ts` owns.
 *
 * Narrowing here keeps the schema module free of its own copy of the identity. If the
 * site is ever reconfigured as a Person, this throws at build time instead of silently
 * publishing an Organization node with no verified facts behind it.
 */
function requireOrganizationIdentity(identity: PrimaryIdentity): OrganizationIdentityFacts {
  if (identity.type === 'Person') {
    throw new Error('organizationSchema requires an Organization or LocalBusiness primary identity.')
  }
  return identity
}

// Pass the configured identity as a parameter so the guard is checked against the wide
// union rather than against the narrow `as const` literal, which would make the optional
// identity fields unreadable here.
const organizationIdentity = requireOrganizationIdentity(site.primaryIdentity)

/**
 * Define Bulma's Organization schema so search engines understand the brand entity.
 *
 * Every value is derived from `config/site.ts`, which owns the public identity facts.
 * Never restate an address, contact method, or profile URL here: a second copy drifts
 * without failing any check.
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': organizationIdentity.type,
  '@id': ORGANIZATION_ID,
  name: site.name,
  ...(organizationIdentity.alternateName ? { alternateName: [...organizationIdentity.alternateName] } : {}),
  url: SITE_URL,
  ...(organizationIdentity.logo ? { logo: toAbsoluteUrl(organizationIdentity.logo) } : {}),
  ...(organizationIdentity.image ? { image: toAbsoluteUrl(organizationIdentity.image) } : {}),
  ...(organizationIdentity.description ? { description: organizationIdentity.description } : {}),
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: organizationIdentity.contactPoint.contactType,
      ...(organizationIdentity.contactPoint.email ? { email: organizationIdentity.contactPoint.email } : {}),
      ...(organizationIdentity.contactPoint.telephone
        ? { telephone: organizationIdentity.contactPoint.telephone }
        : {}),
      ...(organizationIdentity.areaServed
        ? { areaServed: { '@type': 'Country', name: organizationIdentity.areaServed } }
        : {}),
      ...(organizationIdentity.contactPoint.availableLanguage
        ? { availableLanguage: [...organizationIdentity.contactPoint.availableLanguage] }
        : {}),
    },
  ],
  ...(organizationIdentity.areaServed
    ? { areaServed: { '@type': 'Country', name: organizationIdentity.areaServed } }
    : {}),
  // Omit `sameAs` entirely while no authoritative third-party profile exists. An empty
  // array would publish a claim of "no known profiles" rather than staying silent.
  ...(site.officialProfiles.length > 0 ? { sameAs: [...site.officialProfiles] } : {}),
  address: {
    '@type': 'PostalAddress',
    streetAddress: organizationIdentity.address.streetAddress,
    addressLocality: organizationIdentity.address.addressLocality,
    ...(organizationIdentity.address.addressRegion
      ? { addressRegion: organizationIdentity.address.addressRegion }
      : {}),
    postalCode: organizationIdentity.address.postalCode,
    addressCountry: organizationIdentity.address.addressCountry,
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
  // Name the marketing page that publishes the plans and reviews below. The app host
  // serves no structured data, so pointing `url` there asserted a canonical location
  // that could not corroborate the entity. The app itself is the `installUrl`.
  url: PRICING_URL,
  installUrl: APP_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: site.description,
  inLanguage: 'en-AU',
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
    // Use a fragment so the node identifier can never collide with the bare document
    // URL, which is also the WebSite node's `url`.
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-AU',
  }
}


/**
 * Resolve the WebPage node identifier for a route.
 *
 * Exported so a FAQPage on the same route can point at the WebPage that contains it
 * rather than floating beside it as an unlinked node.
 */
export function webPageIdForPath(path: string) {
  const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}/`
  const url = normalizedPath === '/' ? SITE_URL : `${BASE_URL}${normalizedPath}`
  return `${url}#webpage`
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
    // Identify the node and tie it to the site and to the page that renders it. Without
    // these links the FAQPage sits beside the WebPage for the same URL as an unrelated
    // entity, and a crawler cannot tell that one contains the other.
    '@id': `${url}#faq`,
    name,
    url,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@id': webPageIdForPath(normalizedPath) },
    inLanguage: 'en-AU',
    mainEntity,
  }
}
