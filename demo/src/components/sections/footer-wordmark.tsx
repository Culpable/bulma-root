'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

/**
 * Render the oversized footer brand wordmark and trigger its one-time sheen
 * when the footer enters the viewport.
 */
export function FooterWordmark({ className, ...props }: ComponentProps<'div'>) {
  const { containerRef, isVisible } = useScrollAnimation({
    threshold: 0.01,
    rootMargin: '0px 0px 30% 0px',
  })

  return (
    <div
      ref={containerRef}
      className={clsx('footer-wordmark', className)}
      data-visible={isVisible}
      aria-hidden="true"
      {...props}
    >
      <span className="footer-wordmark__text" data-text="BULMA">
        BULMA
      </span>
    </div>
  )
}
