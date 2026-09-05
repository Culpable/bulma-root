import assert from 'node:assert/strict'
import test from 'node:test'

import { site } from '../src/config/site.ts'
import type { PrimaryIdentity } from '../src/lib/site-identity.ts'
import { homeTestimonials, testimonialMaxRating } from '../src/data/testimonials.ts'
import { pricingCurrency, pricingPlanOffers } from '../src/data/pricing-plans.ts'
import {
  buildFaqPageSchema,
  buildWebPageSchema,
  organizationSchema,
  softwareApplicationSchema,
} from '../src/lib/organization-schema.ts'

/**
 * Guard the single-owner contract for published structured data.
 *
 * The Organization node used to restate the identity facts that `config/site.ts` owns.
 * Nothing failed when the two disagreed, so editing the configured address shipped a
 * stale address in the JSON-LD. These assertions compare the published node against the
 * configuration rather than against a hardcoded expectation, so the drift cannot return.
 */
test('Organization node publishes the configured identity facts', () => {
  // Read through the wide union so the guard is a real runtime check rather than a
  // comparison the `as const` literal type has already decided.
  const identity = site.primaryIdentity as PrimaryIdentity
  assert.notEqual(identity.type, 'Person', 'this suite assumes an Organization identity')
  if (identity.type === 'Person') return

  assert.equal(organizationSchema.name, site.name)
  assert.equal(organizationSchema['@type'], identity.type)
  assert.deepEqual(organizationSchema.address, {
    '@type': 'PostalAddress',
    streetAddress: identity.address.streetAddress,
    addressLocality: identity.address.addressLocality,
    addressRegion: identity.address.addressRegion,
    postalCode: identity.address.postalCode,
    addressCountry: identity.address.addressCountry,
  })
  assert.equal(organizationSchema.contactPoint[0].contactType, identity.contactPoint.contactType)
  assert.equal(organizationSchema.contactPoint[0].email, identity.contactPoint.email)
})


test('Organization omits sameAs while no third-party profile is configured', () => {
  // A URL on a domain we already own is not a `sameAs` reference. An empty array would
  // publish a claim of "no known profiles"; the property must be absent instead.
  assert.equal(site.officialProfiles.length, 0)
  assert.equal('sameAs' in organizationSchema, false)
})


test('SoftwareApplication names a page that corroborates the entity', () => {
  // The app host serves no structured data, so it belongs in `installUrl`, not `url`.
  assert.equal(softwareApplicationSchema.url, 'https://bulma.com.au/pricing/')
  assert.equal(softwareApplicationSchema.installUrl, 'https://app.bulma.com.au/')
  assert.equal(softwareApplicationSchema['@id'], 'https://bulma.com.au/#software-application')
})


test('SoftwareApplication offers match the configured plan amounts', () => {
  const offers = softwareApplicationSchema.offers
  const amounts = pricingPlanOffers.flatMap((plan) => [plan.monthlyPrice, plan.yearlyPrice])

  assert.equal(offers['@type'], 'AggregateOffer')
  assert.equal(offers.priceCurrency, pricingCurrency)
  assert.equal(offers.offerCount, amounts.length)
  assert.equal(offers.lowPrice, Math.min(...amounts).toFixed(2))
  assert.equal(offers.highPrice, Math.max(...amounts).toFixed(2))
  for (const offer of offers.offers) {
    assert.equal(offer.priceCurrency, pricingCurrency)
    assert.match(offer.price, /^\d+\.\d{2}$/)
    assert.ok(['MON', 'ANN'].includes(offer.priceSpecification.referenceQuantity.unitCode))
  }
})


test('aggregateRating is derived from the testimonials the homepage renders', () => {
  const rating = softwareApplicationSchema.aggregateRating
  const average = homeTestimonials.reduce((total, entry) => total + entry.rating, 0) / homeTestimonials.length

  assert.equal(rating.reviewCount, homeTestimonials.length)
  assert.equal(rating.ratingValue, average.toFixed(1))
  assert.equal(rating.bestRating, testimonialMaxRating)
  assert.equal(softwareApplicationSchema.review.length, homeTestimonials.length)
})


test('ratings are never attached to the Organization node', () => {
  // Google treats a business rating its own Organization as a self-serving review.
  assert.equal('aggregateRating' in organizationSchema, false)
  assert.equal('review' in organizationSchema, false)
})


test('FAQPage is linked to the WebPage that renders it', () => {
  const webPage = buildWebPageSchema({ path: '/', name: 'Home', description: 'Home page.' })
  const faqPage = buildFaqPageSchema({
    path: '/',
    name: 'FAQs',
    faqs: [{ question: 'Does it link?', answer: 'Yes.' }],
  })

  assert.equal(webPage['@id'], 'https://bulma.com.au/#webpage')
  assert.equal(faqPage['@id'], 'https://bulma.com.au/#faq')
  assert.deepEqual(faqPage.mainEntityOfPage, { '@id': webPage['@id'] })
  assert.deepEqual(faqPage.isPartOf, { '@id': 'https://bulma.com.au/#website' })
})


test('FAQPage on a nested route resolves its own WebPage identifier', () => {
  const webPage = buildWebPageSchema({ path: '/pricing/', name: 'Pricing', description: 'Pricing page.' })
  const faqPage = buildFaqPageSchema({
    path: '/pricing/',
    name: 'Pricing FAQs',
    faqs: [{ question: 'How much?', answer: 'From $49 a month.' }],
  })

  assert.equal(webPage['@id'], 'https://bulma.com.au/pricing/#webpage')
  assert.deepEqual(faqPage.mainEntityOfPage, { '@id': webPage['@id'] })
})
