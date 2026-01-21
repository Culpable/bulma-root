'use client'

import { clsx } from 'clsx/lite'
import dynamic from 'next/dynamic'
import { Children, useEffect, useId, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Section } from '../elements/section'

// Dynamic import for AnimatedCounter - not needed for initial paint since it only
// renders after user scrolls to the stats section. SSR enabled for SEO (renders "0").
const AnimatedCounter = dynamic(
  () => import('../elements/animated-counter').then((m) => m.AnimatedCounter),
  { ssr: true }
)

interface StatAnimatedProps extends ComponentProps<'div'> {
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

/**
 * Stat component with enhanced visual styling.
 */
export function StatAnimated({
  stat,
  text,
  countTo,
  countPrefix = '',
  countSuffix = '',
  countDuration = 1500,
  className,
  ...props
}: StatAnimatedProps) {
  const useAnimatedCounter = typeof countTo === 'number'

  return (
    <div
      className={clsx('relative', className)}
      {...props}
    >
      <div className="text-3xl/10 font-semibold tracking-tight text-mist-950 dark:text-white">
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
      <p className="mt-2 text-sm/7 text-mist-600 dark:text-mist-400">{text}</p>
    </div>
  )
}

/**
 * The main curve path for the graph - extracted for reuse.
 */
const GRAPH_PATH = 'M 0 383 C 396 362.7936732276819, 804 264.31672304481856, 1200 60'
const GRAPH_FILL_PATH = 'M 0 400 L 0 383 C 396 362.7936732276819, 804 264.31672304481856, 1200 60 L 1200 60 L 1200 400 Z'

/**
 * Static grid lines for the graph - hoisted to module level to avoid
 * recreating 14 objects on every render.
 */
const GRID_LINES = Array.from({ length: 14 }, (_, i) => {
  const x = (i / 13) * 1199 + 0.5
  return (
    <line
      key={i}
      x1={x}
      y1="400"
      x2={x}
      y2="0"
      vectorEffect="non-scaling-stroke"
    />
  )
})

/**
 * Stats section with animated SVG graph that draws itself on scroll.
 * Features path animation using stroke-dasharray/dashoffset technique.
 */
export function StatsAnimatedGraph({
  children,
  staggerDelay = 120,
  stickyEyebrow,
  sectionHue,
  ...props
}: {
  staggerDelay?: number
  /** Enable sticky eyebrow behavior (Recommendation 8) */
  stickyEyebrow?: boolean
  /** Section hue identifier for smooth color transitions (Recommendation 9) */
  sectionHue?: 'hero' | 'features' | 'stats' | 'testimonials' | 'pricing' | 'faqs' | 'cta'
} & ComponentProps<typeof Section>) {
  const pathId = useId()
  const glowId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [pathLength, setPathLength] = useState(0)
  const pathRef = useRef<SVGPathElement>(null)

  // Animation should only start when BOTH conditions are met:
  // 1. Element is in view (IntersectionObserver triggered)
  // 2. Path length has been measured (prevents dasharray changing mid-animation)
  const isVisible = isInView && pathLength > 0

  // Calculate path length on mount for accurate dash animation
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [])

  // Intersection observer for scroll-triggered animation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // Wrap each stat child with staggered animation.
  // Memoized to prevent recreating inline style objects on every render.
  const animatedStats = useMemo(
    () =>
      Children.map(children, (child, index) => {
        const delay = index * staggerDelay

        return (
          <div
            className={clsx(
              'transition-all duration-700 ease-out',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{ transitionDelay: `${delay}ms` }}
          >
            {child}
          </div>
        )
      }),
    [children, staggerDelay, isVisible]
  )

  // Calculate animation delay for the graph (after stats finish)
  const graphDelay = (Children.count(children) + 1) * staggerDelay

  return (
    <Section stickyEyebrow={stickyEyebrow} sectionHue={sectionHue} {...props} className={clsx('relative isolate', props.className)}>
      <div ref={containerRef} className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 grid grid-cols-2 gap-x-2 gap-y-10 sm:auto-cols-fr sm:grid-flow-col-dense">
          {animatedStats}
        </div>
      </div>

      {/* Graph container with draw animation */}
      <div
        className={clsx(
          'pointer-events-none relative h-48 sm:h-64 lg:h-36 transition-opacity duration-1000 ease-out',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transitionDelay: `${graphDelay}ms` }}
      >
        <div className="absolute bottom-0 left-1/2 w-[150vw] max-w-[calc(var(--container-7xl)-(--spacing(10)*2))] -translate-x-1/2">
          <svg
            className="h-100 w-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Clip path for fill area */}
              <clipPath id={pathId}>
                <path d={GRAPH_FILL_PATH} />
              </clipPath>

              {/* Gradient for the line glow effect */}
              <linearGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(56% 0.021 213.5)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="oklch(72.3% 0.014 214.4)" stopOpacity="1" />
                <stop offset="100%" stopColor="oklch(56% 0.021 213.5)" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Filled area under the curve - fades in */}
            <path
              d={GRAPH_FILL_PATH}
              className={clsx(
                'fill-mist-950/[0.03] dark:fill-white/[0.03]',
                'transition-opacity duration-1000 ease-out',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{ transitionDelay: `${graphDelay + 800}ms` }}
              stroke="none"
            />

            {/* Vertical dashed grid lines - appear after fill */}
            <g
              className={clsx(
                'stroke-mist-950/20 dark:stroke-white/20',
                'transition-opacity duration-700',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              style={{ transitionDelay: `${graphDelay + 1000}ms` }}
              strokeWidth="1"
              strokeDasharray="4 3"
              clipPath={`url(#${pathId})`}
            >
              {GRID_LINES}
            </g>

            {/* Glow effect behind the main line - fades in after line draws */}
            <path
              d={GRAPH_PATH}
              fill="none"
              className={clsx(
                'stroke-mist-400/50 dark:stroke-mist-300/30',
                'transition-opacity duration-700 ease-out',
                isVisible ? 'opacity-100' : 'opacity-0'
              )}
              strokeWidth="6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                filter: 'blur(4px)',
                // Glow fades in after line finishes drawing
                transitionDelay: `${graphDelay + 1400}ms`,
              }}
            />

            {/* Main animated line - draws itself */}
            <path
              ref={pathRef}
              d={GRAPH_PATH}
              fill="none"
              className="stroke-mist-600 dark:stroke-mist-300"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{
                strokeDasharray: pathLength || 2000,
                strokeDashoffset: isVisible ? 0 : pathLength || 2000,
                transition: `stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${graphDelay}ms`,
              }}
            />

            {/* Animated dot at the end of the line */}
            <circle
              cx="1200"
              cy="60"
              r="4"
              className={clsx(
                'fill-mist-600 dark:fill-mist-300',
                'transition-all duration-500',
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              )}
              style={{
                transformOrigin: '1200px 60px',
                transitionDelay: `${graphDelay + 1400}ms`,
              }}
            />

            {/* Ping effect dot - pulses 3 times then stops (performance optimisation) */}
            {isVisible && (
              <circle
                cx="1200"
                cy="60"
                r="4"
                className="fill-mist-600/50 dark:fill-mist-300/50 animate-[ping_2s_ease-out_3]"
                style={{
                  transformOrigin: '1200px 60px',
                  animationDelay: `${graphDelay + 1400}ms`,
                }}
              />
            )}

          </svg>

          {/* Data pulse dots that travel along graph path (Rec 8) */}
          {isVisible && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                // Match the SVG positioning
                bottom: 0,
                left: '50%',
                width: '150vw',
                maxWidth: 'calc(var(--container-7xl) - var(--spacing-10) * 2)',
                transform: 'translateX(-50%)',
              }}
            >
              {/* First pulse - starts after graph draws */}
              <div
                className={clsx(
                  'data-pulse',
                  isVisible && 'active'
                )}
                style={{
                  offsetPath: `path('${GRAPH_PATH}')`,
                  animationDelay: `${graphDelay + 2000}ms`,
                }}
              />
              {/* Second pulse - staggered start */}
              <div
                className={clsx(
                  'data-pulse',
                  isVisible && 'active'
                )}
                style={{
                  offsetPath: `path('${GRAPH_PATH}')`,
                  animationDelay: `${graphDelay + 4000}ms`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
