'use client'

import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { AuroraBackground } from '../elements/aurora-background'
import { Container } from '../elements/container'
import { CursorSpotlight } from '../elements/cursor-spotlight'
import { Heading } from '../elements/heading'
import { Text } from '../elements/text'
import { useHeroParallax } from '@/hooks/use-hero-parallax'

export function HeroLeftAlignedWithDemo({
  eyebrow,
  headline,
  subheadline,
  cta,
  demo,
  footer,
  className,
  enableAurora = true,
  enableParallax = true,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  cta?: ReactNode
  demo?: ReactNode
  footer?: ReactNode
  /** Enable aurora background effect */
  enableAurora?: boolean
  /** Enable parallax scroll effect */
  enableParallax?: boolean
} & ComponentProps<'section'>) {
  const { containerRef, isScrolling, isEnabled: parallaxEnabled } = useHeroParallax()

  // Only apply parallax classes if enabled and supported
  const shouldApplyParallax = enableParallax && parallaxEnabled

  return (
    <CursorSpotlight>
      <section
        ref={containerRef}
        className={clsx(
          'relative z-10 py-16',
          shouldApplyParallax && 'hero-parallax',
          className
        )}
        data-scrolling={isScrolling}
        {...props}
      >
        {/* Aurora background effect - behind all content */}
        {enableAurora && <AuroraBackground className="z-0" />}

        <Container className="relative z-10 flex flex-col gap-16">
          <div className="flex flex-col gap-32">
            <div className="flex flex-col items-start gap-6">
              {/* Announcement badge - first to appear */}
              {eyebrow && (
                <div className="hero-animate hero-delay-0">
                  {eyebrow}
                </div>
              )}
              {/* Headline - appears second */}
              <Heading
                className={clsx(
                  'hero-animate hero-delay-1 max-w-6xl',
                  shouldApplyParallax && 'hero-parallax-element hero-parallax-headline'
                )}
              >
                {headline}
              </Heading>
              {/* Subheadline - appears third */}
              <Text size="lg" className="hero-animate hero-delay-2 flex max-w-3xl flex-col gap-4">
                {subheadline}
              </Text>
              {/* CTA buttons - appear fourth */}
              {cta && (
                <div
                  className={clsx(
                    'hero-animate hero-delay-3',
                    shouldApplyParallax && 'hero-parallax-element hero-parallax-cta'
                  )}
                >
                  {cta}
                </div>
              )}
            </div>
            {/* Demo screenshot - appears fifth with scale effect */}
            {demo && (
              <div
                className={clsx(
                  'hero-animate-scale hero-delay-4',
                  shouldApplyParallax && 'hero-parallax-element hero-parallax-screenshot'
                )}
              >
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
