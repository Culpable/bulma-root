import type { SiteMetadataConfig } from '../lib/metadata.ts';
import type { SiteStructuredDataConfig } from '../lib/site-identity.ts';

interface BulmaApplicationUrls {
  readonly application: string;
  readonly registration: string;
}

interface BulmaSiteConfig extends SiteMetadataConfig, SiteStructuredDataConfig {
  readonly applicationUrls: BulmaApplicationUrls;
}

/**
 * Store Bulma's repeated public facts in one typed build-time owner.
 */
export const site = {
  name: 'Bulma',
  description:
    'Built for Australian mortgage brokers, Bulma is an AI assistant that helps with scenario planning, credit assessment, policy matching, and lender selection. Ask any policy question in plain English and get instant, grounded answers with source attribution.',
  language: 'en',
  /** Use Open Graph's language_TERRITORY format; keep the separate HTML language unchanged. */
  openGraphLocale: 'en_AU',
  readiness: 'production',
  defaultSocialImage: {
    src: '/img/og/bulma-og-image.png',
    alt: 'Bulma: AI Assistant for Australian Mortgage Brokers',
    verified: true,
    width: 1200,
    height: 630,
    type: 'image/png',
  },
  /**
   * Empty until Bulma has an authoritative third-party profile to publish. The app
   * subdomain used to sit here, but a URL on a domain we already own tells a search
   * engine nothing it cannot already derive, so it is not a `sameAs` reference.
   */
  officialProfiles: [],
  primaryIdentity: {
    type: 'Organization',
    alternateName: ['Bulma: AI Mortgage Broker Assistant', 'Bulma AI Policy Advisor'],
    description:
      'Bulma is an AI assistant for Australian mortgage brokers that answers lender policy questions with source attribution, helping with scenario planning, policy matching, and lender selection.',
    areaServed: 'Australia',
    contactPoint: {
      contactType: 'sales',
      email: 'solutions@bulma.com.au',
      availableLanguage: ['English'],
    },
    address: {
      streetAddress: 'PO Box 155',
      addressLocality: 'Northlands',
      addressRegion: 'WA',
      postalCode: '6905',
      addressCountry: 'AU',
    },
    logo: '/img/logos/bulma-logo-dark.svg',
    image: '/img/screenshots/bulma-policy-advisor-workspace.webp',
  },
  applicationUrls: {
    application: 'https://app.bulma.com.au/',
    registration: 'https://app.bulma.com.au/register',
  },
  /** Join internal page titles to the Bulma name. */
  titleSeparator: ' | ',
  /** Join the Bulma name to the homepage descriptor. */
  titlePrefixSeparator: ': ',
} as const satisfies BulmaSiteConfig;
