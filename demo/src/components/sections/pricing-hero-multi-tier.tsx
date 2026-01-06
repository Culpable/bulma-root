'use client'

import { ElTabGroup, ElTabList, ElTabPanels } from '@tailwindplus/elements/react'
import { clsx } from 'clsx/lite'
import { Children, type ComponentProps, type ReactNode } from 'react'
import { Container } from '../elements/container'
import { Heading } from '../elements/heading'
import { Text } from '../elements/text'
import { CheckmarkIcon } from '../icons/checkmark-icon'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

export function Plan({
  name,
  price,
  period,
  subheadline,
  badge,
  features,
  cta,
  className,
}: {
  name: ReactNode
  price: ReactNode
  period?: ReactNode
  subheadline: ReactNode
  badge?: ReactNode
  features: ReactNode[]
  cta: ReactNode
} & ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'flex flex-col justify-between gap-6 rounded-xl bg-mist-950/2.5 p-6 sm:items-start dark:bg-white/5',
        // Hover lift effect with smooth transition
        'transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-mist-950/5 dark:hover:shadow-black/20',
        className,
      )}
    >
      <div className="self-stretch">
        <div className="flex items-center justify-between">
          {badge && (
            <div className="order-last inline-flex rounded-full bg-mist-950/10 px-2 text-xs/6 font-medium text-mist-950 dark:bg-white/10 dark:text-white">
              {badge}
            </div>
          )}

          <h3 className="text-2xl/8 tracking-tight text-mist-950 dark:text-white">{name}</h3>
        </div>
        <p className="mt-1 inline-flex gap-1 text-base/7">
          <span className="text-mist-950 dark:text-white">{price}</span>
          {period && <span className="text-mist-500 dark:text-mist-500">{period}</span>}
        </p>
        <div className="mt-4 flex flex-col gap-4 text-sm/6 text-mist-700 dark:text-mist-400">{subheadline}</div>
        <ul className="mt-4 space-y-2 text-sm/6 text-mist-700 dark:text-mist-400">
          {features.map((feature, index) => (
            <li key={index} className="flex gap-4">
              <CheckmarkIcon className="h-lh shrink-0 stroke-mist-950 dark:stroke-white" />
              <p>{feature}</p>
            </li>
          ))}
        </ul>
      </div>
      {cta}
    </div>
  )
}

export function PricingHeroMultiTier<T extends string>({
  eyebrow,
  headline,
  subheadline,
  options,
  plans,
  footer,
  className,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  options: readonly T[]
  plans: Record<T, ReactNode>
  footer?: ReactNode
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  // Wrap plan cards with staggered animation
  const animatedPlans = Object.fromEntries(
    options.map((option) => [
      option,
      Children.map(plans[option] as ReactNode, (child, index) => (
        <div
          className={clsx(
            'h-full transition-all duration-600 ease-out',
            isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0',
          )}
          style={{ transitionDelay: `${300 + index * 100}ms` }}
        >
          {child}
        </div>
      )),
    ]),
  ) as Record<T, ReactNode>

  return (
    <section ref={containerRef} className={clsx('py-16', className)} {...props}>
      <ElTabGroup>
        <Container className="flex flex-col gap-16">
          {/* Header with slide up animation */}
          <div
            className={clsx(
              'flex flex-col items-center gap-6 transition-all duration-700 ease-out',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            {eyebrow}
            <Heading>{headline}</Heading>
            <Text size="lg" className="flex max-w-xl flex-col gap-4 text-center">
              {subheadline}
            </Text>
            <ElTabList className="flex items-center gap-1 rounded-full bg-mist-950/5 p-1 dark:bg-white/5">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="cursor-pointer rounded-full px-4 py-1 text-sm/7 font-medium text-mist-950 aria-selected:bg-mist-950 aria-selected:text-white dark:text-white dark:aria-selected:bg-white/10 dark:aria-selected:text-white"
                >
                  {option}
                </button>
              ))}
            </ElTabList>
          </div>
          <ElTabPanels>
            {options.map((option) => (
              <div
                key={option}
                className="grid grid-cols-1 gap-2 sm:has-[>:nth-child(5)]:grid-cols-2 sm:max-lg:has-[>:last-child:nth-child(even)]:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none lg:has-[>:nth-child(5)]:grid-flow-row lg:has-[>:nth-child(5)]:grid-cols-3"
              >
                {animatedPlans[option]}
              </div>
            ))}
          </ElTabPanels>
          {footer}
        </Container>
      </ElTabGroup>
    </section>
  )
}
