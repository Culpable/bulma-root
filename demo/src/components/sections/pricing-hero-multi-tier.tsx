'use client'

import { clsx } from 'clsx/lite'
import React, {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { CardSpotlight } from '../elements/card-spotlight'
import { Container } from '../elements/container'
import { Heading } from '../elements/heading'
import { MorphingPrice } from '../elements/morphing-price'
import { Text } from '../elements/text'
import { AnimatedCheckmarkIcon } from '../icons/animated-checkmark-icon'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

// =============================================================================
// PRICING OPTION CONTEXT
// Allows Plan components to react to pricing option changes without re-mounting.
// This enables the MorphingPrice component to animate digit changes smoothly.
// =============================================================================

interface PricingOptionContextValue<T extends string = string> {
  /** Currently selected pricing option (e.g., 'Monthly', 'Yearly') */
  selectedOption: T
  /** All available pricing options */
  options: readonly T[]
}

const PricingOptionContext = createContext<PricingOptionContextValue>({
  selectedOption: '',
  options: [],
})

/**
 * Hook to access the current pricing option from context.
 * Use this in Plan components to get the selected option for MorphingPrice.
 */
export function usePricingOption<T extends string = string>(): PricingOptionContextValue<T> {
  return useContext(PricingOptionContext) as PricingOptionContextValue<T>
}

// =============================================================================
// ANIMATION CONTEXT
// Passes scroll-triggered animation state to child Plan components.
// =============================================================================

interface PricingHeroAnimationContextValue {
  isVisible: boolean
  baseDelay: number
}

const PricingHeroAnimationContext = createContext<PricingHeroAnimationContextValue>({
  isVisible: false,
  baseDelay: 0,
})

// =============================================================================
// ELASTIC TAB TOGGLE
// Tab toggle with sliding pill indicator and spring physics animation.
// =============================================================================

interface ElasticTabToggleProps<T extends string> {
  options: readonly T[]
  selectedIndex: number
  onSelect: (index: number) => void
}

/**
 * Elastic tab toggle with sliding pill indicator.
 * Features spring physics animation with overshoot and settle effect.
 */
function ElasticTabToggle<T extends string>({
  options,
  selectedIndex,
  onSelect,
}: ElasticTabToggleProps<T>) {
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Update pill position when selection changes
  useEffect(() => {
    const container = containerRef.current
    const selectedButton = buttonRefs.current[selectedIndex]
    if (!container || !selectedButton) return

    const containerRect = container.getBoundingClientRect()
    const buttonRect = selectedButton.getBoundingClientRect()

    // Calculate position relative to container
    const left = buttonRect.left - containerRect.left
    const width = buttonRect.width

    setPillStyle({
      left: `${left}px`,
      width: `${width}px`,
    })
  }, [selectedIndex])

  // Handle tab selection with elastic animation
  const handleSelect = (index: number) => {
    if (index === selectedIndex) return

    // Trigger elastic animation
    setIsAnimating(true)
    onSelect(index)

    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1 rounded-full bg-mist-950/5 p-1 dark:bg-white/5"
      role="tablist"
      aria-label="Pricing options"
    >
      {/* Sliding pill indicator */}
      <div
        className={clsx(
          'pricing-toggle-pill absolute top-1 bottom-1 rounded-full',
          'bg-mist-950 shadow-sm dark:bg-white/10',
          // Use spring easing for elastic effect
          isAnimating
            ? '[transition:left_0.4s_cubic-bezier(0.34,1.56,0.64,1),width_0.3s_ease-out]'
            : '[transition:left_0.3s_ease-out,width_0.3s_ease-out]',
        )}
        style={pillStyle}
        aria-hidden="true"
      />

      {/* Tab buttons */}
      {options.map((option, index) => (
        <button
          key={option}
          ref={(el) => {
            buttonRefs.current[index] = el
          }}
          type="button"
          role="tab"
          aria-selected={selectedIndex === index}
          onClick={() => handleSelect(index)}
          className={clsx(
            'relative z-10 cursor-pointer rounded-full px-4 py-1 text-sm/7 font-medium',
            'transition-colors duration-200',
            // Text color based on selection
            selectedIndex === index
              ? 'text-white dark:text-white'
              : 'text-mist-950 hover:text-mist-800 dark:text-white dark:hover:text-mist-200',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// =============================================================================
// PLAN COMPONENT
// Individual pricing plan card with morphing price animation.
// =============================================================================

interface PlanPrices {
  [option: string]: string
}

interface PlanPeriods {
  [option: string]: ReactNode
}

export function Plan<T extends string = string>({
  name,
  prices,
  periods,
  subheadline,
  badge,
  features,
  cta,
  featured = false,
  className,
}: {
  /** Plan name (e.g., "Solo", "Team", "Enterprise") */
  name: ReactNode
  /** Price for each option: { Monthly: '$49', Yearly: '$490' } */
  prices: PlanPrices
  /** Period label for each option: { Monthly: '/month', Yearly: '/year' } or static string */
  periods?: PlanPeriods | ReactNode
  /** Short description of the plan */
  subheadline: ReactNode
  /** Optional badge (e.g., "Most popular") */
  badge?: ReactNode
  /** List of features included in the plan */
  features: ReactNode[]
  /** Call-to-action button */
  cta: ReactNode
  /** Whether this is the featured/recommended plan (adds ambient glow) */
  featured?: boolean
} & ComponentProps<'div'>) {
  // Get current pricing option from context
  const { selectedOption } = usePricingOption<T>()

  // Get animation context for staggered checkmark reveals
  const { isVisible, baseDelay } = useContext(PricingHeroAnimationContext)

  // Checkmark animation config
  const checkmarkStagger = 60
  const checkmarkBaseDelay = baseDelay + 300

  // Get the price for the current option (fallback to first price if option not found)
  const currentPrice = prices[selectedOption] ?? Object.values(prices)[0] ?? ''

  // Resolve period - can be a static value or an object with per-option values
  const resolvedPeriod =
    periods && typeof periods === 'object' && !React.isValidElement(periods)
      ? (periods as PlanPeriods)[selectedOption] ?? Object.values(periods as PlanPeriods)[0]
      : periods

  return (
    <CardSpotlight featured={featured} className="h-full">
      <div
        className={clsx(
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
          {/* Price with morphing animation on option change */}
          <p className="mt-1 inline-flex items-baseline gap-1 text-base/7">
            <MorphingPrice value={currentPrice} className="text-mist-950 dark:text-white" />
            {resolvedPeriod && <span className="text-mist-500 dark:text-mist-500">{resolvedPeriod}</span>}
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

// =============================================================================
// PRICING HERO MULTI-TIER
// Container section with option toggle and persistent plan cards.
// Cards persist across option changes, enabling smooth price morphing animation.
// =============================================================================

export function PricingHeroMultiTier<T extends string>({
  eyebrow,
  headline,
  subheadline,
  options,
  plans,
  footer,
  staggerDelay = 100,
  className,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  /** Available pricing options (e.g., ['Monthly', 'Yearly']) */
  options: readonly T[]
  /** Plan components to render - these persist across option changes for smooth animation */
  plans: ReactNode
  footer?: ReactNode
  /** Delay between each plan card's entrance animation (ms) */
  staggerDelay?: number
} & ComponentProps<'section'>) {
  // Track which option is selected (index-based for ElasticTabToggle)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedOption = options[selectedIndex]

  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  // Handle option selection
  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  // Wrap plan cards with staggered animation and context provider
  // Includes depth stack effect for "pulled from deck" card entrance
  // Includes focus isolation effect - hovering one card dims others
  const animatedPlans = Children.map(plans, (child, index) => {
    const delay = 300 + index * staggerDelay

    return (
      <div
        data-animating={isVisible}
        className={clsx(
          // Base styles for animation and layout
          'card-depth-stack pricing-focus-card h-full rounded-xl transition-all duration-600 ease-out',
          isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0',
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {/* Provide animation context to Plan component for checkmark staggering */}
        <PricingHeroAnimationContext.Provider value={{ isVisible, baseDelay: delay }}>
          {child}
        </PricingHeroAnimationContext.Provider>
      </div>
    )
  })

  return (
    <PricingOptionContext.Provider value={{ selectedOption, options }}>
      <section ref={containerRef} className={clsx('py-16', className)} {...props}>
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
            {/* Enhanced tab toggle with elastic sliding pill indicator */}
            <ElasticTabToggle options={options} selectedIndex={selectedIndex} onSelect={handleSelect} />
          </div>

          {/* Plan cards - persistent across option changes for smooth price morphing */}
          {/* pricing-focus-group enables focus isolation - hovering one card dims siblings */}
          <div className="pricing-focus-group grid grid-cols-1 items-stretch gap-2 sm:has-[>:nth-child(5)]:grid-cols-2 sm:max-lg:has-[>:last-child:nth-child(even)]:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none lg:has-[>:nth-child(5)]:grid-flow-row lg:has-[>:nth-child(5)]:grid-cols-3">
            {animatedPlans}
          </div>

          {footer}
        </Container>
      </section>
    </PricingOptionContext.Provider>
  )
}
