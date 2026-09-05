/**
 * Typed shape of the public identity facts that `config/site.ts` owns.
 *
 * `lib/organization-schema.ts` reads these values to build the published JSON-LD, so
 * the configuration file stays the single owner of the business identity. Do not
 * restate any of these facts in a schema module: a second copy drifts silently,
 * because nothing fails when the two disagree.
 */
export interface ContactPointFacts {
  readonly contactType: string;
  readonly email?: string;
  readonly telephone?: string;
  /** Languages the contact point can be reached in, as plain names. */
  readonly availableLanguage?: readonly string[];
}


export interface PostalAddressFacts {
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion?: string;
  readonly postalCode: string;
  readonly addressCountry: string;
}


export interface OrganizationIdentityFacts {
  readonly type: 'Organization' | 'LocalBusiness';
  readonly contactPoint: ContactPointFacts;
  readonly address: PostalAddressFacts;
  /** Site-relative path to the brand logo. */
  readonly logo?: string;
  /** Site-relative path to a representative image of the business. */
  readonly image?: string;
  /** Other names the business is known by, published as `alternateName`. */
  readonly alternateName?: readonly string[];
  /**
   * Description of the business entity itself. Kept separate from the site
   * description so the Organization and WebSite nodes do not read identically.
   */
  readonly description?: string;
  /** Country the business serves, as a plain name. */
  readonly areaServed?: string;
}


export interface PersonIdentityFacts {
  readonly type: 'Person';
  readonly jobTitle?: string;
}


export type PrimaryIdentity = OrganizationIdentityFacts | PersonIdentityFacts;


export interface SiteStructuredDataConfig {
  readonly name: string;
  readonly description: string;
  /**
   * Authoritative third-party profiles that let a search engine reconcile this
   * business with a known entity, published as `sameAs`. A URL on a domain the site
   * already owns is not a third-party profile and must not be listed here; leave the
   * list empty until a real profile exists rather than self-referencing.
   */
  readonly officialProfiles: readonly string[];
  readonly primaryIdentity: PrimaryIdentity;
}
