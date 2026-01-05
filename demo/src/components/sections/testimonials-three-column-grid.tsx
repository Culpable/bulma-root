'use client'

import { clsx } from 'clsx/lite'
import { Children, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Section } from '../elements/section'

export function Testimonial({
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
        // h-full ensures testimonial fills its container for consistent grid heights
        'flex h-full flex-col justify-between gap-10 rounded-md bg-mist-950/2.5 p-6 text-sm/7 text-mist-950 dark:bg-white/5 dark:text-white',
        className,
      )}
      {...props}
    >
      <blockquote className="relative flex flex-col gap-4 *:first:before:absolute *:first:before:inline *:first:before:-translate-x-full *:first:before:content-['\201c'] *:last:after:inline *:last:after:content-['\201d']">
        {quote}
      </blockquote>
      <figcaption className="flex items-center gap-4">
        <div className="flex size-12 overflow-hidden rounded-full outline -outline-offset-1 outline-black/5 *:size-full *:object-cover dark:outline-white/5">
          {img}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-mist-700 dark:text-mist-400">{byline}</p>
        </div>
      </figcaption>
    </figure>
  )
}

export function TestimonialThreeColumnGrid({
  children,
  staggerDelay = 100,
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

  // Wrap each child in a div with animation styles
  // h-full ensures wrapper fills grid cell so child testimonials align heights
  const animatedChildren = Children.map(children, (child, index) => {
    const delay = index * staggerDelay

    return (
      <div
        className={clsx(
          'h-full transition-all duration-500 ease-out',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {child}
      </div>
    )
  })

  return (
    <Section {...props}>
      <div
        ref={containerRef}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {animatedChildren}
      </div>
    </Section>
  )
}
