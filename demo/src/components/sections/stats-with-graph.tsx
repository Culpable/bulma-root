'use client'

import { clsx } from 'clsx/lite'
import { Children, useId, type ComponentProps, type ReactNode } from 'react'
import { AnimatedCounter } from '../elements/animated-counter'
import { Section } from '../elements/section'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface StatProps extends ComponentProps<'div'> {
  /** Static text or ReactNode to display as the stat */
  stat?: ReactNode
  /** Description text below the stat */
  text: ReactNode
  /** Numeric value to animate (if provided, animates instead of showing stat) */
  countTo?: number
  /** Prefix before the animated number (e.g., "$") */
  countPrefix?: string
  /** Suffix after the animated number (e.g., "+", "%", "k") */
  countSuffix?: string
  /** Animation duration in ms (default: 1500) */
  countDuration?: number
}

export function Stat({
  stat,
  text,
  countTo,
  countPrefix = '',
  countSuffix = '',
  countDuration = 1500,
  className,
  ...props
}: StatProps) {
  // Determine if we should use animated counter
  const useAnimatedCounter = typeof countTo === 'number'

  return (
    <div className={clsx('border-l border-mist-950/20 pl-6 dark:border-white/20', className)} {...props}>
      <div className="text-2xl/10 tracking-tight text-mist-950 dark:text-white">
        {useAnimatedCounter ? (
          <AnimatedCounter
            value={countTo}
            prefix={countPrefix}
            suffix={countSuffix}
            duration={countDuration}
          />
        ) : (
          stat
        )}
      </div>
      <p className="mt-2 text-sm/7 text-mist-700 dark:text-mist-400">{text}</p>
    </div>
  )
}

export function StatsWithGraph({
  children,
  staggerDelay = 120,
  ...props
}: { staggerDelay?: number } & ComponentProps<typeof Section>) {
  const pathId = useId()
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.2 })

  // Wrap each stat child with staggered animation
  const animatedStats = Children.map(children, (child, index) => {
    const delay = index * staggerDelay

    return (
      <div
        className={clsx(
          'transition-all duration-600 ease-out',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {child}
      </div>
    )
  })

  return (
    <Section {...props}>
      <div ref={containerRef} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 grid grid-cols-2 gap-x-2 gap-y-10 sm:auto-cols-fr sm:grid-flow-col-dense">
          {animatedStats}
        </div>
      </div>
      {/* Graph with fade-in and draw animation */}
      <div
        className={clsx(
          'pointer-events-none relative h-48 sm:h-64 lg:h-36 transition-all duration-1000 ease-out',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
        style={{ transitionDelay: `${(Children.count(children) + 1) * staggerDelay}ms` }}
      >
        <div className="absolute bottom-0 left-1/2 w-[150vw] max-w-[calc(var(--container-7xl)-(--spacing(10)*2))] -translate-x-1/2">
          <svg
            className="h-100 w-full fill-mist-950/2.5 stroke-mist-950/40 dark:fill-white/2.5 dark:stroke-white/40"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id={pathId}>
                <path d="M 0 400 L 0 383 C 396 362.7936732276819, 804 264.31672304481856, 1200 60 L 1200 60 L 1200 400 Z" />
              </clipPath>
            </defs>
            <path
              d="M 0 400 L 0 383 C 396 362.7936732276819, 804 264.31672304481856, 1200 60 L 1200 60 L 1200 400 Z"
              stroke="none"
            />
            <g strokeWidth="1" strokeDasharray="4 3" clipPath={`url(#${pathId})`}>
              <line x1="0.5" y1="400" x2="0.5" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="92.3076923076923" y1="400" x2="92.3076923076923" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="184.6153846153846" y1="400" x2="184.6153846153846" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="276.9230769230769" y1="400" x2="276.9230769230769" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="369.2307692307692" y1="400" x2="369.2307692307692" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="461.53846153846155" y1="400" x2="461.53846153846155" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="553.8461538461538" y1="400" x2="553.8461538461538" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="646.1538461538462" y1="400" x2="646.1538461538462" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="738.4615384615385" y1="400" x2="738.4615384615385" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="830.7692307692307" y1="400" x2="830.7692307692307" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="923.0769230769231" y1="400" x2="923.0769230769231" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="1015.3846153846154" y1="400" x2="1015.3846153846154" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="1107.6923076923076" y1="400" x2="1107.6923076923076" y2="0" vectorEffect="non-scaling-stroke" />
              <line x1="1199.5" y1="400" x2="1199.5" y2="0" vectorEffect="non-scaling-stroke" />
            </g>
            <path
              d="M 0 383 C 396 362.7936732276819, 804 264.31672304481856, 1200 60"
              fill="none"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </Section>
  )
}
