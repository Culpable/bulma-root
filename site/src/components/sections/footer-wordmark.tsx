
import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

/**
 * Render the oversized footer brand wordmark and trigger its one-time sheen
 * when the footer enters the viewport.
 */
export function FooterWordmark({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={clsx('footer-wordmark', className)}
      data-visible="false"
      aria-hidden="true"
      {...props}
    >
      <span className="footer-wordmark__text" data-text="BULMA">
        BULMA
      </span>
    </div>
  )
}
