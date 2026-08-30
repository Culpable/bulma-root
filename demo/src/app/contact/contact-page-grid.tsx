'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import clsx from 'clsx'
import { ContactDetails } from './contact-details'
import { ContactForm } from './contact-form'

/**
 * Render the interactive contact cards after the server-rendered hero.
 */
export function ContactPageGrid() {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <div ref={containerRef} className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Slide the contact details in from the left. */}
      <div
        className={clsx(
          'h-full transition-[translate,opacity] duration-600 ease-out',
          isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0',
        )}
      >
        <ContactDetails />
      </div>

      {/* Slide the contact form in from the right after the details card. */}
      <div
        className={clsx(
          'h-full transition-[translate,opacity] duration-600 ease-out',
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
        )}
        style={{ transitionDelay: '150ms' }}
      >
        <ContactForm />
      </div>
    </div>
  )
}
