'use client'

import { clsx } from 'clsx/lite'
import { Children, type ComponentProps, type ReactNode } from 'react'
import { Section } from '../elements/section'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

export function TeamMember({
  img,
  name,
  byline,
  className,
  ...props
}: {
  img: ReactNode
  name: ReactNode
  byline: ReactNode
} & ComponentProps<'li'>) {
  return (
    <li className={clsx('flex flex-col gap-4 text-sm/7', className)} {...props}>
      <div className="aspect-3/4 w-full overflow-hidden rounded-sm outline -outline-offset-1 outline-black/5 *:size-full *:object-cover dark:outline-white/5">
        {img}
      </div>
      <div>
        <p className="font-semibold text-mist-950 dark:text-white">{name}</p>
        <p className="text-mist-700 dark:text-mist-400">{byline}</p>
      </div>
    </li>
  )
}

export function TeamFourColumnGrid({ children, ...props }: ComponentProps<typeof Section>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  // Wrap each team member in an animation container with staggered delay
  const animatedChildren = Children.map(children, (child, index) => (
    <div
      className={clsx(
        'transition-all duration-600 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {child}
    </div>
  ))

  return (
    <div ref={containerRef}>
      <Section {...props}>
        <ul role="list" className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {animatedChildren}
        </ul>
      </Section>
    </div>
  )
}
