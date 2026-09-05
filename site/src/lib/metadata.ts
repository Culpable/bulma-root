import { site } from '../config/site.ts';
import type { PageStructuredEntity } from './structured-data.ts';

/**
 * `composed` - every page except the home page: page title + separator + site name.
 * `prefixed` - the HOME PAGE ONLY: site name + prefix separator + short descriptor.
 * `absolute` - a deliberate exact title that escapes central composition entirely.
 */
export type TitleMode = 'composed' | 'prefixed' | 'absolute';

export interface SiteTitleConfig {
  readonly name: string;
  readonly titleSeparator: string;
  readonly titlePrefixSeparator: string;
}

export interface SiteMetadataConfig extends SiteTitleConfig {
  readonly language: string;
  /**
   * Open Graph locale in `language_TERRITORY` form. Kept separate from `language`
   * because the document language tag and the social locale use different syntax.
   */
  readonly openGraphLocale?: string;
  readonly readiness: 'draft' | 'production';
  readonly defaultSocialImage?: SocialImageMetadata;
}

export interface SocialImageMetadata {
  src: string;
  alt: string;
  /** Set only after the referenced asset exists and its preview has been reviewed. */
  verified: boolean;
  width?: number;
  height?: number;
  type?: string;
}

export interface PageMetadataInput {
  title: string;
  description: string;
  titleMode?: TitleMode;
  /** Set to null only for error pages that must not declare a canonical URL. */
  canonicalPath?: string | null;
  robots?: string;
  contentType?: 'website' | 'article';
  socialImage?: SocialImageMetadata;
  structuredEntity?: PageStructuredEntity;
}

export interface ResolvedPageMetadata extends PageMetadataInput {
  pageTitle: string;
  documentTitle: string;
  description: string;
  titleMode: TitleMode;
  contentType: 'website' | 'article';
}

function requireNonEmpty(value: string, field: string): string {
  const normalised = value.trim();
  if (!normalised) throw new Error(`${field} must not be empty.`);
  return normalised;
}

const UNRESOLVED_TEMPLATE_TOKEN = /\{\{[^{}]+\}\}/;

export function requireResolvedMetadataFact(value: string | undefined, field: string): string {
  const normalised = requireNonEmpty(value ?? '', field);
  if (UNRESOLVED_TEMPLATE_TOKEN.test(normalised)) {
    throw new Error(`${field} contains unresolved template metadata.`);
  }
  return normalised;
}

function assertNoUnresolvedTemplateMetadata(value: unknown, path: string): void {
  if (typeof value === 'string') {
    if (UNRESOLVED_TEMPLATE_TOKEN.test(value)) {
      throw new Error(`Production readiness found unresolved template metadata at ${path}.`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoUnresolvedTemplateMetadata(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      assertNoUnresolvedTemplateMetadata(item, `${path}.${key}`);
    }
  }
}

function validateSiteTitleConfig(config: SiteTitleConfig): SiteTitleConfig {
  requireNonEmpty(config.name, 'Site name');
  requireNonEmpty(config.titleSeparator, 'Title separator');
  requireNonEmpty(config.titlePrefixSeparator, 'Title prefix separator');
  return config;
}

export function requireBcp47Language(value: string): string {
  const language = requireNonEmpty(value, 'Site language');
  // Bounded syntax gate. Owner review still confirms that the tag is the real
  // project language and not merely a syntactically valid starter value.
  if (!/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(language)) {
    throw new Error('Site language must be a valid BCP 47 language tag.');
  }
  return language;
}


function requireOpenGraphLocale(value: string): string {
  const locale = requireNonEmpty(value, 'Open Graph locale');
  // Require the Open Graph `language_TERRITORY` form rather than the BCP 47
  // language tag emitted by the separate HTML `lang` attribute.
  if (!/^[a-z]{2}_[A-Z]{2}$/.test(locale)) {
    throw new Error('Open Graph locale must use language_TERRITORY syntax.');
  }
  return locale;
}


export function composeDocumentTitle(
  title: string,
  titleMode: TitleMode = 'composed',
  config: SiteTitleConfig = site,
): string {
  const pageTitle = requireNonEmpty(title, 'Page title');
  validateSiteTitleConfig(config);

  if (titleMode === 'absolute') return pageTitle;

  // Home page only. Any other route reaching this branch is a mistake the
  // reviewer has to catch: the resolver cannot know which route called it.
  if (titleMode === 'prefixed') {
    const prefix = `${config.name}${config.titlePrefixSeparator}`;
    if (pageTitle.startsWith(prefix)) {
      throw new Error('Pass an uncomposed page title; the metadata resolver adds the site prefix.');
    }

    return `${prefix}${pageTitle}`;
  }

  const suffix = `${config.titleSeparator}${config.name}`;
  if (pageTitle.endsWith(suffix)) {
    throw new Error('Pass an uncomposed page title; the metadata resolver adds the site suffix.');
  }

  return `${pageTitle}${suffix}`;
}

export function resolvePageMetadata(
  input: PageMetadataInput,
  config: SiteTitleConfig & Partial<SiteMetadataConfig> = site,
): ResolvedPageMetadata {
  const titleMode = input.titleMode ?? 'composed';
  const pageTitle = requireNonEmpty(input.title, 'Page title');
  const description = requireNonEmpty(input.description, 'Page description');
  const selectedSocialImage = input.socialImage ?? config.defaultSocialImage;
  const socialImage = selectedSocialImage
    ? {
        ...selectedSocialImage,
        src: requireNonEmpty(selectedSocialImage.src, 'Social image source'),
        alt: requireNonEmpty(selectedSocialImage.alt, 'Social image alternative text'),
      }
    : undefined;

  return {
    ...input,
    pageTitle,
    documentTitle: composeDocumentTitle(pageTitle, titleMode, config),
    description,
    titleMode,
    contentType: input.contentType ?? 'website',
    socialImage,
  };
}

export function assertProductionMetadataReady(
  metadata: ResolvedPageMetadata,
  config: SiteMetadataConfig,
): void {
  requireBcp47Language(config.language);
  if (config.openGraphLocale !== undefined) requireOpenGraphLocale(config.openGraphLocale);
  if (config.readiness !== 'production') return;

  // Scan the resolved route input and the complete runtime config. The config
  // also contains structured identity fields beyond SiteMetadataConfig's
  // narrow metadata contract, so no JSON-LD-bound template token can pass.
  assertNoUnresolvedTemplateMetadata({ config, metadata }, 'metadata');
  if (!metadata.socialImage) {
    throw new Error('Production readiness requires a real default or route social image.');
  }
  if (metadata.socialImage.verified !== true) {
    throw new Error('Production readiness requires the selected social image asset to be verified.');
  }
}
