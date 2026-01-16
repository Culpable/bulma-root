/**
 * ResponsiveScreenshot Component (J-1)
 *
 * Optimized responsive image component using <picture> with srcset and media queries.
 * Solves the problem of CSS-hidden images still being downloaded by the browser.
 *
 * Key benefits:
 * - Only downloads the appropriate image for the current viewport and color scheme
 * - Uses native browser image selection via media queries
 * - Saves 200-500KB on mobile by not downloading desktop images
 * - Supports dark mode via prefers-color-scheme media queries
 *
 * Implementation notes:
 * - Uses standard <img> inside <picture> instead of next/image for proper srcset support
 * - Images must be pre-optimized WebP files (no runtime optimization)
 * - Lazy loading enabled by default, disable with loading="eager" for LCP images
 */

import { clsx } from 'clsx/lite'
import type { ComponentProps, JSX } from 'react'

/**
 * Breakpoint definition for responsive images.
 * Media queries are applied in order - first matching source wins.
 */
interface ResponsiveBreakpoint {
  /** CSS media query (e.g., "(max-width: 767px)", "(min-width: 768px)") */
  media: string
  /** Light mode image source path */
  srcLight: string
  /** Dark mode image source path */
  srcDark: string
  /** Image width in pixels (for aspect ratio calculation) */
  width: number
  /** Image height in pixels (for aspect ratio calculation) */
  height: number
}

interface ResponsiveScreenshotProps extends Omit<ComponentProps<'img'>, 'src' | 'srcSet'> {
  /** Alt text for accessibility (required) */
  alt: string
  /** Array of breakpoint configurations, ordered by media query priority */
  breakpoints: ResponsiveBreakpoint[]
  /** Fallback image source (used when no breakpoint matches) */
  fallbackSrc: string
  /** Fallback dark mode image source */
  fallbackSrcDark: string
  /** Fallback image width */
  fallbackWidth: number
  /** Fallback image height */
  fallbackHeight: number
  /** Loading strategy - "lazy" (default) or "eager" for LCP images */
  loading?: 'lazy' | 'eager'
  /** Fetch priority hint for LCP optimization */
  fetchPriority?: 'high' | 'low' | 'auto'
  /** Additional className for the img element */
  className?: string
  /** Background color class for image container (applies to light mode) */
  bgLight?: string
  /** Background color class for image container (applies to dark mode) */
  bgDark?: string
}

/**
 * Generates <source> elements for each breakpoint with light/dark mode variants.
 *
 * For each breakpoint, we create two source elements:
 * 1. Dark mode source (with prefers-color-scheme: dark)
 * 2. Light mode source (default, no color scheme preference)
 *
 * Media query order matters - first matching source is used.
 */
function generateSources(breakpoints: ResponsiveBreakpoint[]) {
  const sources: JSX.Element[] = []

  breakpoints.forEach((bp, index) => {
    // Dark mode source (checked first due to specificity)
    // Combine viewport media query with color scheme preference
    sources.push(
      <source
        key={`${index}-dark`}
        srcSet={bp.srcDark}
        media={`${bp.media} and (prefers-color-scheme: dark)`}
        type="image/webp"
        width={bp.width}
        height={bp.height}
      />
    )

    // Light mode source (default)
    sources.push(
      <source
        key={`${index}-light`}
        srcSet={bp.srcLight}
        media={bp.media}
        type="image/webp"
        width={bp.width}
        height={bp.height}
      />
    )
  })

  return sources
}

export function ResponsiveScreenshot({
  alt,
  breakpoints,
  fallbackSrc,
  fallbackSrcDark,
  fallbackWidth,
  fallbackHeight,
  loading = 'lazy',
  fetchPriority,
  className,
  bgLight = 'bg-white/75',
  bgDark = 'bg-black/75',
  ...props
}: ResponsiveScreenshotProps) {
  return (
    <picture>
      {/* Generate source elements for each breakpoint */}
      {generateSources(breakpoints)}

      {/* Fallback sources for viewports that don't match any breakpoint */}
      {/* Dark mode fallback (checked before light mode due to media query) */}
      <source
        srcSet={fallbackSrcDark}
        media="(prefers-color-scheme: dark)"
        type="image/webp"
        width={fallbackWidth}
        height={fallbackHeight}
      />

      {/* Fallback img element - used when no source matches or as default */}
      <img
        src={fallbackSrc}
        alt={alt}
        width={fallbackWidth}
        height={fallbackHeight}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={clsx(
          // Apply background color based on color scheme
          // Note: Since <picture> handles the source selection, the img always shows
          // the correct image. The background provides a placeholder during load.
          bgLight,
          `dark:${bgDark}`,
          className
        )}
        {...props}
      />
    </picture>
  )
}

/**
 * Pre-configured hero screenshot component with all breakpoint configurations.
 *
 * Breakpoint strategy:
 * - Mobile (<768px): 1670px wide crop, optimized for narrow viewports
 * - Tablet (768px-1023px): 2000px wide crop, balanced for medium screens
 * - Desktop (≥1024px): Full 3440px image for high-resolution displays
 *
 * Each breakpoint has light and dark mode variants using the color-mist theme.
 */
interface HeroScreenshotProps extends Omit<ComponentProps<'img'>, 'src' | 'srcSet'> {
  /** Alt text for accessibility */
  alt: string
  /** Loading strategy - use "eager" for hero images */
  loading?: 'lazy' | 'eager'
  /** Fetch priority - use "high" for LCP images */
  fetchPriority?: 'high' | 'low' | 'auto'
  /** Additional className */
  className?: string
}

export function HeroScreenshot({
  alt,
  loading = 'lazy',
  fetchPriority,
  className,
  ...props
}: HeroScreenshotProps) {
  return (
    <ResponsiveScreenshot
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
      // Mobile breakpoint: narrow crop for small screens
      // Tablet breakpoint: medium crop for tablet screens
      // Desktop uses fallback (no explicit breakpoint needed)
      breakpoints={[
        {
          // Mobile: max-width 767px (before md breakpoint)
          media: '(max-width: 767px)',
          srcLight: '/img/screenshots/1-left-1670-top-1408.webp',
          srcDark: '/img/screenshots/1-color-mist-left-1670-top-1408.webp',
          width: 1670,
          height: 1408,
        },
        {
          // Tablet: 768px to 1023px (md to lg breakpoint)
          media: '(min-width: 768px) and (max-width: 1023px)',
          srcLight: '/img/screenshots/1-left-2000-top-1408.webp',
          srcDark: '/img/screenshots/1-color-mist-left-2000-top-1408.webp',
          width: 2000,
          height: 1408,
        },
      ]}
      // Desktop fallback: full-size image for lg+ screens
      fallbackSrc="/img/screenshots/1.webp"
      fallbackSrcDark="/img/screenshots/1-color-mist.webp"
      fallbackWidth={3440}
      fallbackHeight={1990}
      bgLight="bg-white/75"
      bgDark="bg-black/75"
      {...props}
    />
  )
}

/**
 * Pre-configured feature screenshot component for Policy Q&A section.
 *
 * Breakpoint strategy:
 * - Mobile (<640px): 1000x800 crop
 * - Tablet (640px-1023px): 1800x660 crop
 * - Desktop-md (1024px-1279px): 1300x1300 crop
 * - Desktop-lg (≥1280px): 1800x1250 crop (fallback)
 */
interface FeatureScreenshotLeftProps extends Omit<ComponentProps<'img'>, 'src' | 'srcSet'> {
  alt: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  className?: string
}

export function FeatureScreenshotLeft({
  alt,
  loading = 'lazy',
  fetchPriority,
  className,
  ...props
}: FeatureScreenshotLeftProps) {
  return (
    <ResponsiveScreenshot
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
      breakpoints={[
        {
          // Mobile: max-width 639px
          media: '(max-width: 639px)',
          srcLight: '/img/screenshots/1-left-1000-top-800.webp',
          srcDark: '/img/screenshots/1-color-mist-left-1000-top-800.webp',
          width: 1000,
          height: 800,
        },
        {
          // Tablet: 640px to 1023px
          media: '(min-width: 640px) and (max-width: 1023px)',
          srcLight: '/img/screenshots/1-left-1800-top-660.webp',
          srcDark: '/img/screenshots/1-color-mist-left-1800-top-660.webp',
          width: 1800,
          height: 660,
        },
        {
          // Desktop-md: 1024px to 1279px
          media: '(min-width: 1024px) and (max-width: 1279px)',
          srcLight: '/img/screenshots/1-left-1300-top-1300.webp',
          srcDark: '/img/screenshots/1-color-mist-left-1300-top-1300.webp',
          width: 1300,
          height: 1300,
        },
      ]}
      // Desktop-lg fallback
      fallbackSrc="/img/screenshots/1-left-1800-top-1250.webp"
      fallbackSrcDark="/img/screenshots/1-color-mist-left-1800-top-1250.webp"
      fallbackWidth={1800}
      fallbackHeight={1250}
      bgLight="bg-white/75"
      bgDark="bg-black/75"
      {...props}
    />
  )
}

/**
 * Pre-configured feature screenshot component for Lender Comparison section.
 * Similar breakpoint strategy to FeatureScreenshotLeft but with right-side crops.
 */
interface FeatureScreenshotRightProps extends Omit<ComponentProps<'img'>, 'src' | 'srcSet'> {
  alt: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  className?: string
}

export function FeatureScreenshotRight({
  alt,
  loading = 'lazy',
  fetchPriority,
  className,
  ...props
}: FeatureScreenshotRightProps) {
  return (
    <ResponsiveScreenshot
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
      breakpoints={[
        {
          // Mobile: max-width 639px
          media: '(max-width: 639px)',
          srcLight: '/img/screenshots/1-right-1000-top-800.webp',
          srcDark: '/img/screenshots/1-color-mist-right-1000-top-800.webp',
          width: 1000,
          height: 800,
        },
        {
          // Tablet: 640px to 1023px
          media: '(min-width: 640px) and (max-width: 1023px)',
          srcLight: '/img/screenshots/1-right-1800-top-660.webp',
          srcDark: '/img/screenshots/1-color-mist-right-1800-top-660.webp',
          width: 1800,
          height: 660,
        },
        {
          // Desktop-md: 1024px to 1279px
          media: '(min-width: 1024px) and (max-width: 1279px)',
          srcLight: '/img/screenshots/1-right-1300-top-1300.webp',
          srcDark: '/img/screenshots/1-color-mist-right-1300-top-1300.webp',
          width: 1300,
          height: 1300,
        },
      ]}
      // Desktop-lg fallback
      fallbackSrc="/img/screenshots/1-right-1800-top-1250.webp"
      fallbackSrcDark="/img/screenshots/1-color-mist-right-1800-top-1250.webp"
      fallbackWidth={1800}
      fallbackHeight={1250}
      bgLight="bg-white/75"
      bgDark="bg-black/75"
      {...props}
    />
  )
}
