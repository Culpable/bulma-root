'use client'

import { clsx } from 'clsx/lite'
import { Children, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Section } from '../elements/section'

/**
 * Enhanced glassmorphism testimonial card with premium visual effects.
 * Features stronger backdrop blur, gradient border glow, and refined hover states.
 */
export function TestimonialGlass({
  quote,
  img,
  name,
  byline,
  className,
  ...props
}: {
  quote: ReactNode
  img: ReactNode
  name: ReactNode
  byline: ReactNode
} & ComponentProps<'figure'>) {
  return (
    <figure
      className={clsx(
        'group relative flex h-full flex-col justify-between gap-10 p-6 text-sm/7 text-mist-950 dark:text-white',
        // Enhanced rounded corners
        'rounded-2xl',
        // Glassmorphism: stronger blur and semi-transparent background
        'bg-gradient-to-br from-white/70 via-white/50 to-white/30',
        'backdrop-blur-xl backdrop-saturate-150',
        // Multi-layer border effect for depth
        'ring-1 ring-white/50',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
        // Dark mode: frosted dark glass
        'dark:from-white/[0.08] dark:via-white/[0.04] dark:to-white/[0.02]',
        'dark:ring-white/10',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
        // Hover: lift and glow
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]',
        'dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]',
        'dark:hover:from-white/[0.12] dark:hover:via-white/[0.06]',
        className,
      )}
      {...props}
    >
      {/* Gradient border overlay - visible on hover */}
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500',
          'bg-gradient-to-br from-mist-400/20 via-transparent to-mist-600/20',
          'group-hover:opacity-100',
          'dark:from-mist-300/10 dark:to-mist-500/10',
        )}
        aria-hidden="true"
      />

      {/* Subtle inner highlight line at top */}
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
        aria-hidden="true"
      />

      {/* Decorative quotation mark with gradient */}
      <div
        className={clsx(
          // Position the decorative quote in the top-right corner (inside the card padding)
          // so the text can "reserve" space and never visually collide with it.
          'pointer-events-none absolute right-2 top-4 select-none font-serif text-7xl leading-none',
          'bg-gradient-to-br from-mist-400/10 to-mist-600/5 bg-clip-text text-transparent',
          'dark:from-white/10 dark:to-white/[0.02]',
        )}
      >
        ”
      </div>

      <blockquote
        className={clsx(
          // Add a subtle right padding so long lines never run underneath the decorative quote mark.
          // Keep this intentionally small so we don't shorten the measure too much.
          'pr-3',
          'relative z-10 flex flex-col gap-4',
          "*:first:before:absolute *:first:before:inline *:first:before:-translate-x-full *:first:before:content-['\\201c']",
          "*:last:after:inline *:last:after:content-['\\201d']",
        )}
      >
        {quote}
      </blockquote>

      <figcaption className="relative z-10 flex items-center gap-4">
        {/* Avatar with ring glow effect */}
        <div
          className={clsx(
            'relative flex size-12 overflow-hidden rounded-full',
            // Outer glow ring
            'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent',
            'shadow-[0_0_0_1px_rgba(0,0,0,0.05)]',
            'dark:ring-white/20',
            // Hover glow
            'transition-all duration-300',
            'group-hover:ring-mist-400/30 group-hover:shadow-[0_0_12px_rgba(0,0,0,0.1)]',
            'dark:group-hover:ring-mist-300/20',
          )}
        >
          <div className="size-full *:size-full *:object-cover">{img}</div>
        </div>
        <div>
          <p className="font-semibold tracking-tight">{name}</p>
          <p className="text-mist-600 dark:text-mist-400">{byline}</p>
        </div>
      </figcaption>
    </figure>
  )
}


/**
 * Glassmorphism testimonials grid with enhanced visual styling.
 * Features staggered scroll-triggered animations and premium card design.
 */
export function TestimonialsGlassmorphism({
  children,
  staggerDelay = 100,
  className,
  ...props
}: {
  staggerDelay?: number
} & ComponentProps<typeof Section>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // Wrap each child in animated container
  const animatedChildren = Children.map(children, (child, index) => {
    const delay = index * staggerDelay

    return (
      <div
        className={clsx(
          'h-full transition-all duration-700 ease-out',
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {child}
      </div>
    )
  })

  return (
    <Section {...props} className={clsx('relative isolate', className)}>
      {/* Background decorative gradient blur */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-mist-400/10 blur-3xl dark:bg-mist-400/5" />
        <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-mist-500/10 blur-3xl dark:bg-mist-500/5" />
      </div>

      <div ref={containerRef} className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {animatedChildren}
      </div>
    </Section>
  )
}
