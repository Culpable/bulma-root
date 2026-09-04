import {
  requireResolvedMetadataFact,
  type ResolvedPageMetadata,
} from './metadata.ts';

export interface ContactPointFacts {
  readonly contactType: string;
  readonly email?: string;
  readonly telephone?: string;
}

export interface PostalAddressFacts {
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion?: string;
  readonly postalCode: string;
  readonly addressCountry: string;
}

export type PrimaryIdentity =
  | {
      readonly type: 'Organization' | 'LocalBusiness';
      readonly contactPoint: ContactPointFacts;
      readonly address: PostalAddressFacts;
      readonly logo?: string;
    }
  | {
      readonly type: 'Person';
      readonly jobTitle?: string;
    };

export interface SiteStructuredDataConfig {
  readonly name: string;
  readonly description: string;
  readonly officialProfiles: readonly string[];
  readonly primaryIdentity: PrimaryIdentity;
}

export type PageStructuredEntity =
  | {
      readonly type: 'SoftwareApplication';
      readonly name: string;
      readonly description: string;
      readonly applicationCategory: string;
      readonly operatingSystem: string;
      readonly offers?: { readonly price: string; readonly priceCurrency: string };
    }
  | { readonly type: 'Product' | 'Service'; readonly name: string; readonly description: string }
  | { readonly type: 'Article'; readonly headline: string; readonly authorName: string }
  | { readonly type: 'FAQPage'; readonly questions: readonly { question: string; answer: string }[] };

export interface StructuredDataGraph {
  '@context': 'https://schema.org';
  '@graph': Record<string, unknown>[];
}

function required(value: string | undefined, field: string): string {
  try {
    return requireResolvedMetadataFact(value, field);
  } catch (error) {
    if (error instanceof Error && error.message.includes('must not be empty')) {
      throw new Error(`${field} must be a verified non-empty public fact.`);
    }
    throw error;
  }
}

function officialProfiles(profiles: readonly string[]): string[] | undefined {
  const values = profiles.map((profile) => {
    const url = new URL(required(profile, 'Official profile URL'));
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Official profiles must use HTTP(S).');
    return url.toString();
  });
  return values.length > 0 ? values : undefined;
}

function buildIdentityNode(config: SiteStructuredDataConfig, origin: URL): Record<string, unknown> {
  const identity = config.primaryIdentity;
  const id = new URL(identity.type === 'Person' ? '#person' : '#organization', origin).toString();
  const base: Record<string, unknown> = {
    '@type': identity.type,
    '@id': id,
    name: required(config.name, 'Identity name'),
    description: required(config.description, 'Identity description'),
    url: origin.toString(),
    sameAs: officialProfiles(config.officialProfiles),
  };

  if (identity.type === 'Person') {
    if (identity.jobTitle) base.jobTitle = required(identity.jobTitle, 'Person job title');
    return removeUndefined(base);
  }

  const email = identity.contactPoint.email
    ? required(identity.contactPoint.email, 'ContactPoint email')
    : undefined;
  const telephone = identity.contactPoint.telephone
    ? required(identity.contactPoint.telephone, 'ContactPoint telephone')
    : undefined;
  if (!email && !telephone) {
    throw new Error('Organization ContactPoint requires a verified email or telephone.');
  }
  base.contactPoint = removeUndefined({
    '@type': 'ContactPoint',
    contactType: required(identity.contactPoint.contactType, 'ContactPoint contactType'),
    email: email || undefined,
    telephone: telephone || undefined,
  });
  base.address = removeUndefined({
    '@type': 'PostalAddress',
    streetAddress: required(identity.address.streetAddress, 'PostalAddress streetAddress'),
    addressLocality: required(identity.address.addressLocality, 'PostalAddress addressLocality'),
    addressRegion: identity.address.addressRegion
      ? required(identity.address.addressRegion, 'PostalAddress addressRegion')
      : undefined,
    postalCode: required(identity.address.postalCode, 'PostalAddress postalCode'),
    addressCountry: required(identity.address.addressCountry, 'PostalAddress addressCountry'),
  });
  if (identity.logo) base.logo = new URL(required(identity.logo, 'Identity logo'), origin).toString();
  return removeUndefined(base);
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

function buildPageEntity(
  entity: PageStructuredEntity,
  pageUrl: URL,
  identityId: string,
): Record<string, unknown> {
  if (entity.type === 'SoftwareApplication') {
    return removeUndefined({
      '@type': entity.type,
      '@id': new URL('#software-application', pageUrl).toString(),
      name: required(entity.name, 'SoftwareApplication name'),
      description: required(entity.description, 'SoftwareApplication description'),
      url: pageUrl.toString(),
      applicationCategory: required(entity.applicationCategory, 'Application category'),
      operatingSystem: required(entity.operatingSystem, 'Operating environment'),
      provider: { '@id': identityId },
      offers: entity.offers
        ? {
            '@type': 'Offer',
            price: required(entity.offers.price, 'Offer price'),
            priceCurrency: required(entity.offers.priceCurrency, 'Offer currency'),
          }
        : undefined,
    });
  }
  if (entity.type === 'Article') {
    return {
      '@type': entity.type,
      '@id': new URL('#article', pageUrl).toString(),
      headline: required(entity.headline, 'Article headline'),
      author: { '@type': 'Person', name: required(entity.authorName, 'Article author') },
      url: pageUrl.toString(),
    };
  }
  if (entity.type === 'FAQPage') {
    return {
      '@type': entity.type,
      '@id': new URL('#faq', pageUrl).toString(),
      mainEntity: entity.questions.map(({ question, answer }) => ({
        '@type': 'Question',
        name: required(question, 'FAQ question'),
        acceptedAnswer: { '@type': 'Answer', text: required(answer, 'FAQ answer') },
      })),
    };
  }
  return {
    '@type': entity.type,
    '@id': new URL(`#${entity.type.toLowerCase()}`, pageUrl).toString(),
    name: required(entity.name, `${entity.type} name`),
    description: required(entity.description, `${entity.type} description`),
    url: pageUrl.toString(),
    provider: { '@id': identityId },
  };
}

export function buildStructuredData(input: {
  config: SiteStructuredDataConfig;
  metadata: ResolvedPageMetadata;
  canonicalUrl: URL;
}): StructuredDataGraph {
  const origin = new URL('/', input.canonicalUrl);
  const identity = buildIdentityNode(input.config, origin);
  const identityId = String(identity['@id']);
  const websiteId = new URL('#website', origin).toString();
  const webpageId = new URL('#webpage', input.canonicalUrl).toString();
  const graph: Record<string, unknown>[] = [
    identity,
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: origin.toString(),
      name: required(input.config.name, 'Website name'),
      description: required(input.config.description, 'Website description'),
      publisher: { '@id': identityId },
    },
    {
      '@type': 'WebPage',
      '@id': webpageId,
      url: input.canonicalUrl.toString(),
      name: required(input.metadata.documentTitle, 'WebPage name'),
      description: required(input.metadata.description, 'WebPage description'),
      isPartOf: { '@id': websiteId },
      about: { '@id': identityId },
      primaryImageOfPage: input.metadata.socialImage
        ? {
            '@type': 'ImageObject',
            url: new URL(
              required(input.metadata.socialImage.src, 'WebPage primary image'),
              origin,
            ).toString(),
          }
        : undefined,
    },
  ].map(removeUndefined);

  if (input.metadata.structuredEntity) {
    graph.push(buildPageEntity(input.metadata.structuredEntity, input.canonicalUrl, identityId));
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function serialiseJsonLd(graph: unknown): string {
  return JSON.stringify(graph)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
