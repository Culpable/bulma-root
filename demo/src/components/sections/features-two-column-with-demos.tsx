'use client'

import { clsx } from 'clsx/lite'
import { Children, type ComponentProps, type ReactNode } from 'react'
import { IconPathMotion } from '../elements/icon-path-motion'
import { Section } from '../elements/section'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

export function Feature({
  demo,
  icon,
  headline,
  subheadline,
  cta,
  className,
}: {
  demo: ReactNode
  /** Optional icon that animates along curved path on scroll */
  icon?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  cta: ReactNode
} & Omit<ComponentProps<'div'>, 'children'>) {
  return (
    <div className={clsx('rounded-lg bg-mist-950/2.5 p-2 dark:bg-white/5', className)}>
      <div className="relative overflow-hidden rounded-sm dark:after:absolute dark:after:inset-0 dark:after:rounded-sm dark:after:outline-1 dark:after:-outline-offset-1 dark:after:outline-white/10">
        {demo}
      </div>
      <div className="flex flex-col gap-4 p-6 sm:p-10 lg:p-6">
        <div>
          <div className="flex items-center gap-3">
            {icon && (
              <IconPathMotion direction="bounce" className="shrink-0">
                <div className="flex size-8 items-center justify-center rounded-lg bg-mist-950/5 text-mist-700 dark:bg-white/10 dark:text-mist-300">
                  {icon}
                </div>
              </IconPathMotion>
            )}
            <h3 className="flex h-8 items-center text-base font-medium text-mist-950 dark:text-white">{headline}</h3>
          </div>
          <div className={clsx('mt-2 flex flex-col gap-4 text-sm/7 text-mist-700 dark:text-mist-400', icon && 'ml-11')}>
            {subheadline}
          </div>
        </div>
        {cta && <div className={icon ? 'ml-11' : undefined}>{cta}</div>}
      </div>
    </div>
  )
}

export function FeaturesTwoColumnWithDemos({
  features,
  staggerDelay = 150,
  enableHorizon = true,
  stickyEyebrow,
  sectionHue,
  ...props
}: {
  features: ReactNode
  staggerDelay?: number
  /** Enable animated horizon line at section top */
  enableHorizon?: boolean
  /** Enable sticky eyebrow behavior (Recommendation 8) */
  stickyEyebrow?: boolean
  /** Section hue identifier for smooth color transitions (Recommendation 9) */
  sectionHue?: 'hero' | 'features' | 'stats' | 'testimonials' | 'pricing' | 'faqs' | 'cta'
} & Omit<ComponentProps<typeof Section>, 'children'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.15 })

  // Wrap each feature child with staggered animation
  // First feature slides from left, second slides from right for visual interest
  const animatedFeatures = Children.map(features, (child, index) => {
    const delay = index * staggerDelay
    const isEven = index % 2 === 0

    return (
      <div
        className={clsx(
          'transition-all duration-700 ease-out',
          // Staggered slide direction: left for even, right for odd
          isVisible
            ? 'opacity-100 translate-x-0'
            : isEven
              ? 'opacity-0 -translate-x-8'
              : 'opacity-0 translate-x-8'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {child}
      </div>
    )
  })

  return (
    <Section stickyEyebrow={stickyEyebrow} sectionHue={sectionHue} {...props}>
      {/* Horizon line wrapper - draws animated accent lines at section top */}
      <div
        data-visible={isVisible}
        className={clsx(enableHorizon && 'section-horizon')}
      >
        <div ref={containerRef} className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {animatedFeatures}
        </div>
      </div>
    </Section>
  )
}
