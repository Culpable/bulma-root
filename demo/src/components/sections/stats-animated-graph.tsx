'use client'

import { clsx } from 'clsx/lite'
import { Children, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { AnimatedCounter } from '../elements/animated-counter'
import { Section } from '../elements/section'

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
      className={clsx(
        'relative border-l-2 border-mist-500/40 pl-6 dark:border-mist-400/40',
        // Add subtle gradient highlight on the border (full height for visibility)
        'before:absolute before:left-0 before:top-0 before:h-full before:w-0.5',
        'before:bg-gradient-to-b before:from-mist-500/80 before:via-mist-500/40 before:to-mist-500/20',
        'dark:before:from-mist-400/80 dark:before:via-mist-400/40 dark:before:to-mist-400/20',
        className
      )}
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
 * Stats section with animated SVG graph that draws itself on scroll.
 * Features path animation using stroke-dasharray/dashoffset technique.
 */
export function StatsAnimatedGraph({
  children,
  staggerDelay = 120,
  ...props
}: { staggerDelay?: number } & ComponentProps<typeof Section>) {
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

  // Wrap each stat child with staggered animation
  const animatedStats = Children.map(children, (child, index) => {
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
  })

  // Calculate animation delay for the graph (after stats finish)
  const graphDelay = (Children.count(children) + 1) * staggerDelay

  return (
    <Section {...props}>
      <div ref={containerRef} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
              {Array.from({ length: 14 }, (_, i) => {
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
              })}
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

            {/* Pulsing ring around the end dot */}
            <circle
              cx="1200"
              cy="60"
              r="8"
              fill="none"
              className={clsx(
                'stroke-mist-500/50 dark:stroke-mist-400/50',
                isVisible ? 'animate-[ping_2s_ease-out_infinite]' : 'opacity-0'
              )}
              strokeWidth="2"
              style={{
                animationDelay: `${graphDelay + 1600}ms`,
              }}
            />
          </svg>
        </div>
      </div>
    </Section>
  )
}
