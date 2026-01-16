import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { Container } from './container'
import { Eyebrow } from './eyebrow'
import { Subheading } from './subheading'
import { Text } from './text'

export function Section({
  eyebrow,
  headline,
  subheadline,
  cta,
  className,
  children,
  stickyEyebrow = false,
  sectionHue,
  ...props
}: {
  eyebrow?: ReactNode
  headline?: ReactNode
  subheadline?: ReactNode
  cta?: ReactNode
  /** Enable sticky eyebrow behavior (Recommendation 8) */
  stickyEyebrow?: boolean
  /** Section hue identifier for smooth color transitions (Recommendation 9) */
  sectionHue?: 'hero' | 'features' | 'stats' | 'testimonials' | 'pricing' | 'faqs' | 'cta'
} & ComponentProps<'section'>) {
  return (
    <section
      className={clsx('py-16', sectionHue && 'hue-shift-bg', className)}
      data-section-hue={sectionHue}
      {...props}
    >
      <Container className="flex flex-col gap-10 sm:gap-16">
        {headline && (
          <div className="flex max-w-2xl flex-col gap-6">
            <div className="flex flex-col gap-2">
              {eyebrow && (
                stickyEyebrow ? (
                  <div className="sticky top-16 z-10 -mx-4 px-4 py-2 transition-all duration-300 [&[data-stuck=true]]:bg-mist-100/85 [&[data-stuck=true]]:backdrop-blur-md [&[data-stuck=true]]:rounded-lg dark:[&[data-stuck=true]]:bg-mist-950/85">
                    <Eyebrow>{eyebrow}</Eyebrow>
                  </div>
                ) : (
                  <Eyebrow>{eyebrow}</Eyebrow>
                )
              )}
              <Subheading>{headline}</Subheading>
            </div>
            {subheadline && <Text className="text-pretty">{subheadline}</Text>}
            {cta}
          </div>
        )}
        <div>{children}</div>
      </Container>
    </section>
  )
}
