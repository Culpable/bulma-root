'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { Container } from '../elements/container'
import { Subheading } from '../elements/subheading'
import { Text } from '../elements/text'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

export function CallToActionSimpleCentered({
  headline,
  subheadline,
  cta,
  className,
  ...props
}: {
  headline: ReactNode
  subheadline?: ReactNode
  cta?: ReactNode
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section ref={containerRef} className={clsx('py-16', className)} {...props}>
      <Container className="flex flex-col items-center gap-10">
        {/* Headline and subheadline with slide up animation */}
        <div
          className={clsx(
            'flex flex-col gap-6 transition-all duration-600 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
        >
          <Subheading className="max-w-4xl text-center">{headline}</Subheading>
          {subheadline && <Text className="flex max-w-3xl flex-col gap-4 text-center text-pretty">{subheadline}</Text>}
        </div>
        {/* CTA with delayed slide up animation */}
        <div
          className={clsx(
            'transition-all duration-600 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          )}
          style={{ transitionDelay: '150ms' }}
        >
          {cta}
        </div>
      </Container>
    </section>
  )
}
