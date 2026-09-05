/**
 * Own the published homepage testimonials as one typed fact set.
 *
 * The homepage renders these entries as testimonial cards, and
 * `lib/organization-schema.ts` derives the SoftwareApplication `review` and
 * `aggregateRating` nodes from the same entries. Keeping one owner guarantees that
 * every rating a crawler reads is also a rating a visitor can see on the page,
 * which is the visibility condition Google places on review markup.
 *
 * Add an entry here only for a review a real customer gave. Never publish a rating
 * that has no customer behind it.
 */
export interface Testimonial {
  /** Stable identifier used for React keys and the Review node `@id` fragment. */
  readonly id: string
  /** Plain review text. The card supplies the surrounding quotation marks in CSS. */
  readonly quote: string
  readonly name: string
  readonly byline: string
  /** Public path to the pre-sized avatar asset. */
  readonly avatar: string
  /** Rating the customer gave, out of `testimonialMaxRating`. */
  readonly rating: number
}


/** Upper bound of the rating scale, published as `bestRating` in the Review markup. */
export const testimonialMaxRating = 5


/** Lower bound of the rating scale, published as `worstRating` in the Review markup. */
export const testimonialMinRating = 1


export const homeTestimonials = [
  {
    id: 'liam-oconnor',
    quote:
      'I used to spend hours checking lender portals for policy details. Now I just ask Bulma and get an answer in seconds - with the source right there so I can verify it.',
    name: "Liam O'Connor",
    byline: 'Credit Adviser, Sydney',
    avatar: '/img/avatars/10-size-160.webp',
    rating: 5,
  },
  {
    id: 'emily-carter',
    quote:
      'The cross-lender comparison feature is brilliant. I can instantly see which lenders will accept my client’s scenario without opening five different PDFs.',
    name: 'Emily Carter',
    byline: 'Senior Broker, Melbourne',
    avatar: '/img/avatars/15-size-160.webp',
    rating: 5,
  },
  {
    id: 'neil-kapoor',
    quote:
      'For complex scenarios with casual employment or self-employed clients, Bulma saves me from making embarrassing mistakes. It knows the policy nuances I might miss.',
    name: 'Neil Kapoor',
    byline: 'Mortgage Broker, Brisbane',
    avatar: '/img/avatars/13-size-160.webp',
    rating: 5,
  },
  {
    id: 'mark-davidson',
    quote:
      'Bulma understands broker terminology. I can ask about LMI thresholds, genuine savings, or income shading and get a precise answer without having to explain what I mean.',
    name: 'Mark Davidson',
    byline: 'Credit Adviser, Perth',
    avatar: '/img/avatars/12-size-160.webp',
    rating: 5,
  },
  {
    id: 'jake-miller',
    quote:
      'My team uses Bulma as our first stop for policy questions. It’s like having a senior broker on call 24/7 who never forgets a policy update.',
    name: 'Jake Miller',
    byline: 'Principal Broker, Adelaide',
    avatar: '/img/avatars/11-size-160.webp',
    rating: 5,
  },
  {
    id: 'matt-lawson',
    quote:
      'The source attribution is what sold me. I can see exactly which lender policy and category the answer came from, and when it was last updated. That transparency matters.',
    name: 'Matt Lawson',
    byline: 'Lending Specialist, Gold Coast',
    avatar: '/img/avatars/14-size-160.webp',
    rating: 5,
  },
] as const satisfies readonly Testimonial[]
