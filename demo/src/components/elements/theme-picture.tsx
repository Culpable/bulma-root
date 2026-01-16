/**
 * ThemePicture Component (J-1)
 *
 * Simple wrapper that uses <picture> to serve different images based on
 * prefers-color-scheme media query. Prevents browser from downloading
 * both dark and light mode image variants.
 *
 * Unlike CSS class-based hiding (e.g., `dark:hidden`), media queries in
 * <source> elements prevent unused images from being downloaded entirely.
 *
 * Savings: ~50% reduction in image bandwidth per image pair.
 */

import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

interface ThemePictureProps extends Omit<ComponentProps<'img'>, 'src' | 'srcSet'> {
  /** Light mode image source */
  srcLight: string
  /** Dark mode image source */
  srcDark: string
  /** Alt text for accessibility (required) */
  alt: string
  /** Image width in pixels */
  width: number
  /** Image height in pixels */
  height: number
  /** Loading strategy - "lazy" (default) or "eager" for LCP images */
  loading?: 'lazy' | 'eager'
  /** Fetch priority hint for LCP optimization */
  fetchPriority?: 'high' | 'low' | 'auto'
  /** Additional className for the img element */
  className?: string
  /** Background color class for light mode */
  bgLight?: string
  /** Background color class for dark mode */
  bgDark?: string
}

export function ThemePicture({
  srcLight,
  srcDark,
  alt,
  width,
  height,
  loading = 'lazy',
  fetchPriority,
  className,
  bgLight = 'bg-white/75',
  bgDark = 'bg-black/75',
  ...props
}: ThemePictureProps) {
  return (
    <picture>
      {/* Dark mode source - only downloaded when prefers-color-scheme: dark */}
      <source
        srcSet={srcDark}
        media="(prefers-color-scheme: dark)"
        type="image/webp"
        width={width}
        height={height}
      />
      {/* Light mode fallback - used when no source matches */}
      <img
        src={srcLight}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={clsx(
          // Background colors for loading placeholder
          bgLight,
          // Dark mode background - applied when dark source is showing
          `dark:${bgDark}`,
          className
        )}
        {...props}
      />
    </picture>
  )
}
