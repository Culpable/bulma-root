import { ElDisclosure } from '@tailwindplus/elements/react'
import { clsx } from 'clsx/lite'
import { type ComponentProps, type ReactNode, useId } from 'react'
import { Container } from '../elements/container'
import { Subheading } from '../elements/subheading'
import { Text } from '../elements/text'
import { MinusIcon } from '../icons/minus-icon'
import { PlusIcon } from '../icons/plus-icon'

export function Faq({
  id,
  question,
  answer,
  ...props
}: { question: ReactNode; answer: ReactNode } & ComponentProps<'div'>) {
  const autoId = useId()
  id = id || autoId

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
  )
}

export function FAQsTwoColumnAccordion({
  headline,
  subheadline,
  className,
  children,
  ...props
}: {
  headline?: ReactNode
  subheadline?: ReactNode
} & ComponentProps<'section'>) {
  return (
    <section className={clsx('py-16', className)} {...props}>
      <Container className="grid grid-cols-1 gap-x-2 gap-y-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Subheading>{headline}</Subheading>
          {subheadline && <Text className="flex flex-col gap-4 text-pretty">{subheadline}</Text>}
        </div>
        <div className="divide-y divide-mist-950/10 border-y border-mist-950/10 dark:divide-white/10 dark:border-white/10">
          {children}
        </div>
      </Container>
    </section>
  )
}
