'use client'

import { ElDisclosure } from '@tailwindplus/elements/react'
import { clsx } from 'clsx/lite'
import { Children, type ComponentProps, type ReactNode, useId } from 'react'
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
        {/* Crossfade the contextual icons so rapid toggles remain reversible. */}
        <span className="relative flex h-lh w-4 shrink-0 items-center justify-center">
          <PlusIcon className="faq-context-icon faq-context-icon--plus absolute h-lh" />
          <MinusIcon className="faq-context-icon faq-context-icon--minus absolute h-lh" />
        </span>
      </button>
      <ElDisclosure id={`${id}-answer`} hidden className="faq-disclosure">
        <div className="faq-disclosure__content -mt-2 flex flex-col gap-2 pr-12 pb-4 text-sm/7 text-mist-700 dark:text-mist-400">
          {renderedAnswer}
        </div>
      </ElDisclosure>
    </div>
  )
}

export function FAQsAccordion({
  headline,
  subheadline,
  className,
  children,
  ...props
}: {
  headline?: ReactNode
  subheadline?: ReactNode
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  // Wrap each FAQ item with staggered animation
  const animatedChildren = Children.map(children, (child, index) => (
    <div
      className={clsx(
        'transition-[translate,opacity] duration-500 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
      style={{ transitionDelay: `${200 + index * 80}ms` }}
    >
      {child}
    </div>
  ))

  return (
    <section ref={containerRef} className={clsx('py-16', className)} {...props}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 lg:max-w-5xl lg:px-10">
        {/* Header with slide up animation */}
        <div
          className={clsx(
            'flex flex-col gap-6 transition-[translate,opacity] duration-600 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          )}
        >
          <Subheading>{headline}</Subheading>
          {subheadline && <Text className="flex flex-col gap-4 text-pretty">{subheadline}</Text>}
        </div>
        <div className="divide-y divide-mist-950/10 border-y border-mist-950/10 dark:divide-white/10 dark:border-white/10">
          {animatedChildren}
        </div>
      </div>
    </section>
  )
}
