import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { Container } from '../elements/container'
import { CursorSpotlight } from '../elements/cursor-spotlight'
import { Heading } from '../elements/heading'
import { Text } from '../elements/text'

export function HeroLeftAlignedWithDemo({
  eyebrow,
  headline,
  subheadline,
  cta,
  demo,
  footer,
  className,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  cta?: ReactNode
  demo?: ReactNode
  footer?: ReactNode
} & ComponentProps<'section'>) {
  return (
    <CursorSpotlight>
      <section className={clsx('py-16', className)} {...props}>
        <Container className="flex flex-col gap-16">
          <div className="flex flex-col gap-32">
            <div className="flex flex-col items-start gap-6">
              {/* Announcement badge - first to appear */}
              {eyebrow && (
                <div className="hero-animate hero-delay-0">
                  {eyebrow}
                </div>
              )}
              {/* Headline - appears second */}
              <Heading className="hero-animate hero-delay-1 max-w-5xl">{headline}</Heading>
              {/* Subheadline - appears third */}
              <Text size="lg" className="hero-animate hero-delay-2 flex max-w-3xl flex-col gap-4">
                {subheadline}
              </Text>
              {/* CTA buttons - appear fourth */}
              {cta && (
                <div className="hero-animate hero-delay-3">
                  {cta}
                </div>
              )}
            </div>
            {/* Demo screenshot - appears fifth with scale effect */}
            {demo && (
              <div className="hero-animate-scale hero-delay-4">
                {demo}
              </div>
            )}
          </div>
          {/* Footer/logos - appears last */}
          {footer && (
            <div className="hero-animate hero-delay-5">
              {footer}
            </div>
          )}
        </Container>
      </section>
    </CursorSpotlight>
  )
}
