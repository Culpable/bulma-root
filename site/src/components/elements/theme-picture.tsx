/**
 * ThemePicture Component (J-1)
 *
 * Renders the dark-mode variant of an image pair. The site is dark-only for
 * every visitor (see the `dark` class on <html> in app/layout.tsx), so no
 * system-theme switching happens here: only `srcDark` is requested and
 * the light variant is never downloaded.
 *
 * `srcLight` and `bgLight` are retained so existing call sites keep compiling
 * and so a light variant can be reinstated without touching every caller.
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
  // Reference the unused light-mode props so the retained API stays lint-clean.
  void srcLight
  void bgLight

  return (
    <picture>
      {/* Dark-only site: the dark variant is the single source requested */}
      <img
        src={srcDark}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={clsx(
          // Background color for the loading placeholder (dark-only site)
          bgDark,
          className
        )}
        {...props}
      />
    </picture>
  )
}
