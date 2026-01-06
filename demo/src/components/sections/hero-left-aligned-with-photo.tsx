'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { Container } from '../elements/container'
import { Heading } from '../elements/heading'
import { Text } from '../elements/text'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

export function HeroLeftAlignedWithPhoto({
  eyebrow,
  headline,
  subheadline,
  cta,
  photo,
  footer,
  className,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  cta?: ReactNode
  photo?: ReactNode
  footer?: ReactNode
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section ref={containerRef} className={clsx('py-16', className)} {...props}>
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col gap-32">
          {/* Hero content with slide up animation */}
          <div
            className={clsx(
              'flex flex-col items-start gap-6 transition-all duration-700 ease-out',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            {eyebrow}
            <Heading className="max-w-5xl">{headline}</Heading>
            <Text size="lg" className="flex max-w-3xl flex-col gap-4">
              {subheadline}
            </Text>
            {cta}
          </div>
          {/* Photo with delayed slide up animation */}
          <div
            className={clsx(
              'overflow-hidden rounded-xl outline -outline-offset-1 outline-black/5 transition-all duration-700 ease-out dark:outline-white/5',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
            style={{ transitionDelay: '150ms' }}
          >
            {photo}
          </div>
        </div>
        {footer}
      </Container>
    </section>
  )
}
