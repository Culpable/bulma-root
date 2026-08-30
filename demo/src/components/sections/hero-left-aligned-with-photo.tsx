import { clsx } from 'clsx/lite'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { Container } from '../elements/container'
import { Heading } from '../elements/heading'
import { Text } from '../elements/text'

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
  return (
    <section className={clsx('py-16', className)} {...props}>
      <Container className="flex flex-col gap-16">
        <div className="flex flex-col gap-32">
          {/* Keep critical hero copy visible while the transform-only entrance runs. */}
          <div className="above-fold-slide-up flex flex-col items-start gap-6">
            {eyebrow}
            <Heading className="max-w-5xl">{headline}</Heading>
            <Text size="lg" className="flex max-w-3xl flex-col gap-4">
              {subheadline}
            </Text>
            {cta}
          </div>
          {/* Keep the LCP photo paintable during its delayed transform-only entrance. */}
          <div
            className="above-fold-slide-up overflow-hidden rounded-xl [&_img]:outline [&_img]:-outline-offset-1 [&_img]:outline-black/10 dark:[&_img]:outline-white/10"
            style={{ '--above-fold-slide-delay': '150ms' } as CSSProperties}
          >
            {photo}
          </div>
        </div>
        {footer}
      </Container>
    </section>
  )
}
