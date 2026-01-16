'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { Container } from '../elements/container'
import { Eyebrow } from '../elements/eyebrow'
import { Subheading } from '../elements/subheading'
import { Text } from '../elements/text'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

export function CallToActionSimple({
  eyebrow,
  headline,
  subheadline,
  cta,
  className,
  sectionHue,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline?: ReactNode
  cta?: ReactNode
  /** Section hue identifier for smooth color transitions (Recommendation 9) */
  sectionHue?: 'hero' | 'features' | 'stats' | 'testimonials' | 'pricing' | 'faqs' | 'cta'
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section ref={containerRef} className={clsx('py-16', sectionHue && 'hue-shift-bg', className)} data-section-hue={sectionHue} {...props}>
      <Container className="flex flex-col gap-10">
        {/* Headline and subheadline with slide-up animation */}
        <div
          className={clsx(
            'flex flex-col gap-6 transition-all duration-700 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="flex max-w-4xl flex-col gap-2">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Subheading>{headline}</Subheading>
          </div>
          {subheadline && <Text className="flex max-w-3xl flex-col gap-4 text-pretty">{subheadline}</Text>}
        </div>
        {/* CTA with delayed scale-up animation */}
        {cta && (
          <div
            className={clsx(
              'transition-all duration-600 ease-out',
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
            )}
            style={{ transitionDelay: '150ms' }}
          >
            {cta}
          </div>
        )}
      </Container>
    </section>
  )
}
