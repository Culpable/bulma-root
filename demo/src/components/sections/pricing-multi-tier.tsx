'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { clsx } from 'clsx/lite'
import {
  Children,
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { CardSpotlight } from '../elements/card-spotlight'
import { Section } from '../elements/section'
import { AnimatedCheckmarkIcon } from '../icons/animated-checkmark-icon'
import { PricingBonusPanel, PricingBonusPrompt, PricingOptionCallout, PricingPriceNote } from './pricing-card-shared'

interface PricingOptionContextValue<T extends string = string> {
  selectedOption: T
  options: readonly T[]
}

const PricingOptionContext = createContext<PricingOptionContextValue>({
  selectedOption: '',
  options: [],
})

interface PlanPrices {
  [option: string]: ReactNode
}

interface PlanPeriods {
  [option: string]: ReactNode
}

interface PlanBonuses {
  [option: string]: ReactNode
}

interface PlanPriceNotes {
  [option: string]: ReactNode
}

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

function PricingOptionToggle<T extends string>({
  options,
  selectedIndex,
  onSelect,
}: {
  options: readonly T[]
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Pricing options"
      className="inline-flex w-fit items-center gap-1 rounded-full bg-mist-950/5 p-1 dark:bg-white/5"
    >
      {options.map((option, index) => {
        const isSelected = selectedIndex === index

        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(index)}
            className={clsx(
              'rounded-full px-4 py-1 text-sm/7 font-medium transition-colors duration-200',
              isSelected
                ? 'bg-mist-950 text-white shadow-sm dark:bg-white dark:text-mist-950'
                : 'text-mist-950 hover:bg-mist-950/5 dark:text-white dark:hover:bg-white/10',
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Wrapper component that memoizes context value to prevent cascade re-renders.
 * When isVisible changes, only the wrapper re-renders, not all Plan children
 * (unless their props actually changed).
 */
const PlanWrapper = memo(function PlanWrapper({
  child,
  delay,
  isVisible,
}: {
  child: ReactNode
  delay: number
  isVisible: boolean
}) {
  // Memoize context value to prevent unnecessary re-renders in consumers
  const contextValue = useMemo(() => ({ isVisible, baseDelay: delay }), [isVisible, delay])

  return <PricingAnimationContext.Provider value={contextValue}>{child}</PricingAnimationContext.Provider>
})

export function Plan({
  name,
  price,
  prices,
  period,
  periods,
  priceNote,
  priceNotes,
  subheadline,
  badge,
  features,
  bonus,
  bonuses,
  bonusPrompt,
  cta,
  featured = false,
  className,
}: {
  name: ReactNode
  price?: ReactNode
  prices?: PlanPrices
  period?: ReactNode
  periods?: PlanPeriods | ReactNode
  priceNote?: ReactNode
  priceNotes?: PlanPriceNotes
  subheadline: ReactNode
  badge?: ReactNode
  features: ReactNode[]
  bonus?: ReactNode
  bonuses?: PlanBonuses
  bonusPrompt?: ReactNode
  cta: ReactNode
  /** Whether this is the featured/recommended plan (adds ambient glow) */
  featured?: boolean
} & ComponentProps<'div'>) {
  const { selectedOption } = useContext(PricingOptionContext)

  // Get animation context for staggered checkmark reveals
  const { isVisible, baseDelay } = useContext(PricingAnimationContext)

  // Checkmark animation config: stagger each checkmark by 60ms
  const checkmarkStagger = 60
  // Start checkmark animations after the card has faded in (300ms base)
  const checkmarkBaseDelay = baseDelay + 300

  const currentPrice = prices && selectedOption ? (prices[selectedOption] ?? Object.values(prices)[0]) : price
  const currentPriceNote = priceNotes && selectedOption ? priceNotes[selectedOption] : priceNote
  const currentBonus = bonuses && selectedOption ? bonuses[selectedOption] : bonus
  const renderedFeatures = Children.toArray(features)
  const resolvedPeriod =
    periods && typeof periods === 'object'
      ? ((periods as PlanPeriods)[selectedOption] ?? Object.values(periods as PlanPeriods)[0])
      : (periods ?? period)

  return (
    <CardSpotlight featured={featured} className="h-full">
      <div
        className={clsx(
          // h-full ensures Plan fills its container for equal height alignment in grids
          'flex h-full flex-col gap-6 rounded-xl bg-mist-950/2.5 p-6 sm:items-start dark:bg-white/5',
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
          <p className="mt-1 flex flex-wrap items-baseline gap-y-1 text-base/7">
            <span className="text-mist-950 dark:text-white">{currentPrice}</span>
            {resolvedPeriod && <span className="ml-1 text-mist-500 dark:text-mist-500">{resolvedPeriod}</span>}
            {currentPriceNote && <PricingPriceNote>{currentPriceNote}</PricingPriceNote>}
          </p>
          <div className="mt-4 flex flex-col gap-4 text-sm/6 text-mist-700 dark:text-mist-400">{subheadline}</div>
          <ul className="mt-4 space-y-2 text-sm/6 text-mist-700 dark:text-mist-400">
            {renderedFeatures.map((feature, index) => (
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
        <div className="mt-auto flex w-full flex-col gap-6 self-stretch">
          {currentBonus ? (
            <PricingBonusPanel>{currentBonus}</PricingBonusPanel>
          ) : bonusPrompt ? (
            <PricingBonusPrompt>{bonusPrompt}</PricingBonusPrompt>
          ) : null}
          {cta}
        </div>
      </div>
    </CardSpotlight>
  )
}

export function PricingMultiTier<T extends string = string>({
  plans,
  options,
  optionCallout,
  staggerDelay = 100,
  stickyEyebrow,
  sectionHue,
  cta,
  ...props
}: {
  plans: ReactNode
  options?: readonly T[]
  optionCallout?: ReactNode
  staggerDelay?: number
  /** Enable sticky eyebrow behavior (Recommendation 8) */
  stickyEyebrow?: boolean
  /** Section hue identifier for smooth color transitions (Recommendation 9) */
  sectionHue?: 'hero' | 'features' | 'stats' | 'testimonials' | 'pricing' | 'faqs' | 'cta'
} & ComponentProps<typeof Section>) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedOption = options?.[selectedIndex] ?? ('' as T)
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.15 })

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const sectionCta =
    options || optionCallout || cta ? (
      <div className="flex w-full flex-col items-center gap-4 text-center">
        {cta}
        {options && <PricingOptionToggle options={options} selectedIndex={selectedIndex} onSelect={handleSelect} />}
        {optionCallout && <PricingOptionCallout>{optionCallout}</PricingOptionCallout>}
      </div>
    ) : undefined

  // Wrap each plan child with staggered animation from left to right
  // h-full ensures wrapper fills grid cell so child Plan components align heights
  // Each plan gets its own context with the appropriate base delay for checkmarks
  // Includes depth stack effect for "pulled from deck" card entrance
  // Includes focus isolation effect (Rec B) - hovering one card dims others
  // Uses PlanWrapper to memoize context value and prevent cascade re-renders
  const animatedPlans = Children.map(plans, (child, index) => {
    const delay = index * staggerDelay

    return (
      <div
        key={index}
        data-animating={isVisible}
        className={clsx(
          // Base styles for animation and layout
          'card-depth-stack pricing-focus-card h-full rounded-xl transition-all duration-600 ease-out',
          isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-[0.97] opacity-0',
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* PlanWrapper memoizes context value to prevent cascade re-renders */}
        <PlanWrapper child={child} delay={delay} isVisible={isVisible} />
      </div>
    )
  })

  return (
    <PricingOptionContext.Provider value={{ selectedOption, options: options ?? [] }}>
      <Section
        stickyEyebrow={stickyEyebrow}
        sectionHue={sectionHue}
        cta={sectionCta}
        headerClassName={sectionCta ? '!max-w-none' : undefined}
        {...props}
      >
        {/* pricing-focus-group enables focus isolation (Rec B) - hovering one card dims siblings */}
        <div
          ref={containerRef}
          className="pricing-focus-group grid grid-cols-1 items-stretch gap-2 sm:has-[>:nth-child(5)]:grid-cols-2 sm:max-lg:has-[>:last-child:nth-child(even)]:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none lg:has-[>:nth-child(5)]:grid-flow-row lg:has-[>:nth-child(5)]:grid-cols-3"
        >
          {animatedPlans}
        </div>
      </Section>
    </PricingOptionContext.Provider>
  )
}
