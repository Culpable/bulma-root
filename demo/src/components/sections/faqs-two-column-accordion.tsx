'use client'

import { ElDisclosure } from '@tailwindplus/elements/react'
import { clsx } from 'clsx/lite'
import { Children, useCallback, useState, type ComponentProps, type ReactNode, useId } from 'react'
import { Container } from '../elements/container'
import { Subheading } from '../elements/subheading'
import { Text } from '../elements/text'
import { MinusIcon } from '../icons/minus-icon'
import { PlusIcon } from '../icons/plus-icon'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

export function Faq({
  id,
  question,
  answer,
  ...props
}: { question: ReactNode; answer: ReactNode } & ComponentProps<'div'>) {
  const autoId = useId()
  id = id || autoId
  // Track open state for glow trail effect (Rec 9)
  const [isOpen, setIsOpen] = useState(false)

  // Handle toggle to track open state
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  /**
   * Render FAQ strings as HTML so authors can include simple markup (e.g. <em>, <strong>, <a>).
   *
   * IMPORTANT:
   * - Only use this with trusted, developer-authored content (not user input).
   * - Our JSON-LD schema separately strips HTML so structured data remains plain text.
   */
  const renderedAnswer =
    typeof answer === 'string' ? (
      <div dangerouslySetInnerHTML={{ __html: answer }} />
    ) : (
      answer
    )

  return (
    <div id={id} {...props}>
      <button
        type="button"
        id={`${id}-question`}
        command="--toggle"
        commandfor={`${id}-answer`}
        onClick={handleToggle}
        className="group flex w-full cursor-pointer items-start justify-between gap-6 py-4 text-left text-base/7 text-mist-950 dark:text-white"
      >
        {question}
        {/* Icon container with spring rotation animation */}
        <span className="relative flex h-lh w-4 shrink-0 items-center justify-center">
          {/* Plus icon - rotates out with spring overshoot when expanded */}
          <PlusIcon
            className={clsx(
              'absolute h-lh transition-all duration-300',
              // Spring easing curve for overshoot effect
              '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
              // Default state: visible, no rotation
              'opacity-100 rotate-0',
              // Expanded state: hidden, rotated 90deg
              'in-aria-expanded:opacity-0 in-aria-expanded:rotate-90',
            )}
          />
          {/* Minus icon - rotates in with spring overshoot when expanded */}
          <MinusIcon
            className={clsx(
              'absolute h-lh transition-all duration-300',
              // Spring easing curve for overshoot effect
              '[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
              // Default state: hidden, rotated -90deg
              'opacity-0 -rotate-90',
              // Expanded state: visible, no rotation
              'in-aria-expanded:opacity-100 in-aria-expanded:rotate-0',
            )}
          />
        </span>
      </button>
      {/* Glow trail wrapper (Rec 9) - tracks expansion edge */}
      <div
        data-open={isOpen}
        className="faq-glow-trail"
      >
        <ElDisclosure
          id={`${id}-answer`}
          hidden
          className={clsx(
            '-mt-2 flex flex-col gap-2 pr-12 pb-4 text-sm/7 text-mist-700 dark:text-mist-400',
            // Spring animation for content reveal
            'faq-spring-content',
          )}
        >
          {renderedAnswer}
        </ElDisclosure>
      </div>
    </div>
  )
}

export function FAQsTwoColumnAccordion({
  headline,
  subheadline,
  className,
  children,
  staggerDelay = 80,
  ...props
}: {
  headline?: ReactNode
  subheadline?: ReactNode
  staggerDelay?: number
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  // Wrap each FAQ child with staggered animation
  const animatedFaqs = Children.map(children, (child, index) => {
    const delay = index * staggerDelay

    return (
      <div
        className={clsx(
          'transition-all duration-500 ease-out',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {child}
      </div>
    )
  })

  return (
    <section className={clsx('py-16', className)} {...props}>
      <Container className="grid grid-cols-1 gap-x-2 gap-y-8 lg:grid-cols-2">
        {/* Header with slide-in animation */}
        <div
          ref={containerRef}
          className={clsx(
            'flex flex-col gap-6 transition-all duration-600 ease-out',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
          )}
        >
          <Subheading>{headline}</Subheading>
          {subheadline && <Text className="flex flex-col gap-4 text-pretty">{subheadline}</Text>}
        </div>
        {/* FAQ items with staggered fade-in */}
        <div className="divide-y divide-mist-950/10 border-y border-mist-950/10 dark:divide-white/10 dark:border-white/10">
          {animatedFaqs}
        </div>
      </Container>
    </section>
  )
}
