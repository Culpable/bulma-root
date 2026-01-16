'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { useStickySection } from '@/hooks/use-sticky-section'

/**
 * Props for StickyEyebrow component.
 */
interface StickyEyebrowProps extends ComponentProps<'div'> {
  /** Eyebrow label text */
  children: ReactNode
  /** Whether sticky behavior is enabled (default: true) */
  enabled?: boolean
  /** Offset from top of viewport in pixels (default: 64 for navbar) */
  topOffset?: number
}

/**
 * Sticky eyebrow label that becomes fixed at the top of the viewport
 * as the user scrolls through the section. Provides visual context
 * for which section the user is currently viewing.
 *
 * Uses CSS position: sticky with backdrop blur for glassmorphism effect.
 * Shows active indicator when section is prominently in view.
 *
 * @example
 * ```tsx
 * // Basic usage within a section
 * <section>
 *   <StickyEyebrow>Features</StickyEyebrow>
 *   <h2>Our Key Features</h2>
 *   <div>...content...</div>
 * </section>
 *
 * // Disabled sticky behavior
 * <StickyEyebrow enabled={false}>Static Label</StickyEyebrow>
 *
 * // Custom top offset (e.g., larger navbar)
 * <StickyEyebrow topOffset={80}>Features</StickyEyebrow>
 * ```
 */
export function StickyEyebrow({
  children,
  enabled = true,
  topOffset = 64,
  className,
  ...props
}: StickyEyebrowProps) {
  const { containerRef, eyebrowRef, isStuck, isActive } = useStickySection({
    topOffset,
  })

  // If disabled, render simple static eyebrow
  if (!enabled) {
    return (
      <div
        className={clsx(
          'text-sm/7 font-semibold text-mist-700 dark:text-mist-400',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="sticky-section-container"
    >
      <div
        ref={eyebrowRef}
        data-stuck={isStuck}
        data-active={isActive}
        className={clsx(
          'sticky-eyebrow',
          'text-sm/7 font-semibold text-mist-700 dark:text-mist-400',
          className
        )}
        style={{ top: `${topOffset}px` }}
        {...props}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Section wrapper that provides sticky eyebrow context.
 * Use this to wrap sections where you want sticky eyebrow behavior.
 *
 * @example
 * ```tsx
 * <StickySectionWrapper
 *   eyebrow="Features"
 *   sectionId="features"
 *   sectionHue="features"
 * >
 *   <h2>Our Key Features</h2>
 *   <FeatureGrid />
 * </StickySectionWrapper>
 * ```
 */
export function StickySectionWrapper({
  children,
  eyebrow,
  sectionId,
  sectionHue,
  className,
  ...props
}: {
  children: ReactNode
  eyebrow: ReactNode
  sectionId?: string
  sectionHue?: string
} & ComponentProps<'section'>) {
  return (
    <section
      id={sectionId}
      data-section-hue={sectionHue}
      className={clsx('sticky-section-container', className)}
      {...props}
    >
      <StickyEyebrow>{eyebrow}</StickyEyebrow>
      {children}
    </section>
  )
}
