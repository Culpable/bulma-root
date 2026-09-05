/**
 * Own the numeric plan amounts that back the SoftwareApplication `offers` node.
 *
 * The pricing modules present these amounts as display strings in
 * `components/pages/pricing-sections.tsx` and `components/pages/home-sections.tsx`.
 * Update this file together with both modules when a price changes, so the offers a
 * crawler reads always match the prices a visitor is quoted.
 *
 * Enterprise is deliberately absent: it is quoted per customer, so it has no numeric
 * price to publish and must not be given an invented one.
 */
export interface PricingPlanOffer {
  readonly name: string
  /** Amount charged once per month, in `pricingCurrency`. */
  readonly monthlyPrice: number
  /** Amount charged once per year, in `pricingCurrency`. */
  readonly yearlyPrice: number
}


/** ISO 4217 currency for every published Bulma price. */
export const pricingCurrency = 'AUD'


export const pricingPlanOffers = [
  { name: 'Solo', monthlyPrice: 49, yearlyPrice: 490 },
  { name: 'Team', monthlyPrice: 99, yearlyPrice: 990 },
] as const satisfies readonly PricingPlanOffer[]
