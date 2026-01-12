'use client'

import { clsx } from 'clsx/lite'
import { Children, createContext, useContext, type ComponentProps, type ReactNode } from 'react'
import { CardSpotlight } from '../elements/card-spotlight'
import { Section } from '../elements/section'
import { AnimatedCheckmarkIcon } from '../icons/animated-checkmark-icon'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

/**
 * Context to pass animation state from PricingMultiTier to Plan components.
 * Allows checkmarks to animate in sync with card visibility.
 */
interface PricingAnimationContextValue {
  isVisible: boolean
  baseDelay: number
}

const PricingAnimationContext = createContext<PricingAnimationContextValue>({
  isVisible: false,
  baseDelay: 0,
})

export function Plan({
  name,
  price,
  period,
  subheadline,
  badge,
  features,
  cta,
  featured = false,
  className,
}: {
  name: ReactNode
  price: ReactNode
  period?: ReactNode
  subheadline: ReactNode
  badge?: ReactNode
  features: ReactNode[]
  cta: ReactNode
  /** Whether this is the featured/recommended plan (adds ambient glow) */
  featured?: boolean
} & ComponentProps<'div'>) {
  // Get animation context for staggered checkmark reveals
  const { isVisible, baseDelay } = useContext(PricingAnimationContext)

  // Checkmark animation config: stagger each checkmark by 60ms
  const checkmarkStagger = 60
  // Start checkmark animations after the card has faded in (300ms base)
  const checkmarkBaseDelay = baseDelay + 300

  return (
    <CardSpotlight featured={featured} className="h-full">
      <div
        className={clsx(
          // h-full ensures Plan fills its container for equal height alignment in grids
          'flex h-full flex-col justify-between gap-6 rounded-xl bg-mist-950/2.5 p-6 sm:items-start dark:bg-white/5',
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
                <AnimatedCheckmarkIcon
                  animate={isVisible}
                  delay={checkmarkBaseDelay + index * checkmarkStagger}
                  duration={350}
                  className="h-lh shrink-0 stroke-mist-950 dark:stroke-white"
                />
                <p>{feature}</p>
              </li>
            ))}
          </ul>
        </div>
        {cta}
      </div>
    </CardSpotlight>
  )
}

export function PricingMultiTier({
  plans,
  staggerDelay = 100,
  ...props
}: {
  plans: ReactNode
  staggerDelay?: number
} & ComponentProps<typeof Section>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.15 })

  // Wrap each plan child with staggered animation from left to right
  // h-full ensures wrapper fills grid cell so child Plan components align heights
  // Each plan gets its own context with the appropriate base delay for checkmarks
  // Includes depth stack effect for "pulled from deck" card entrance
  // Includes focus isolation effect (Rec B) - hovering one card dims others
  const animatedPlans = Children.map(plans, (child, index) => {
    const delay = index * staggerDelay

    return (
      <div
        data-animating={isVisible}
        className={clsx(
          // Base styles for animation and layout
          'card-depth-stack pricing-focus-card h-full rounded-xl transition-all duration-600 ease-out',
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.97]'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Provide animation context to Plan component for checkmark staggering */}
        <PricingAnimationContext.Provider value={{ isVisible, baseDelay: delay }}>
          {child}
        </PricingAnimationContext.Provider>
      </div>
    )
  })

  return (
    <Section {...props}>
      {/* pricing-focus-group enables focus isolation (Rec B) - hovering one card dims siblings */}
      <div
        ref={containerRef}
        className="pricing-focus-group grid grid-cols-1 items-stretch gap-2 sm:has-[>:nth-child(5)]:grid-cols-2 sm:max-lg:has-[>:last-child:nth-child(even)]:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none lg:has-[>:nth-child(5)]:grid-flow-row lg:has-[>:nth-child(5)]:grid-cols-3"
      >
        {animatedPlans}
      </div>
    </Section>
  )
}
