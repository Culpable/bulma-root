import { clsx } from 'clsx/lite'
import Link from 'next/link'
import type { ComponentProps } from 'react'

const PRECISION_PORCELAIN_CLASSES =
  'relative inline-flex min-h-11 min-w-11 items-center justify-center overflow-hidden rounded-full border border-mist-950/15 bg-mist-950 px-5 py-2 text-sm/7 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_24px_-14px_rgba(15,23,42,0.75)] transition-[translate,scale,background-color,border-color,box-shadow,color] duration-150 ease-out hover:-translate-y-px hover:bg-mist-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_14px_28px_-14px_rgba(15,23,42,0.85)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-700/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/70 dark:bg-mist-100 dark:text-mist-950 dark:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_24px_-14px_rgba(0,0,0,0.8)] dark:hover:bg-white dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_14px_30px_-14px_rgba(0,0,0,0.9)] dark:focus-visible:ring-mist-200/70 dark:focus-visible:ring-offset-mist-950 lg:min-h-10'

/**
 * Render the selected primary CTA treatment with a stable porcelain surface.
 * Keep the edge uniform and reserve motion for direct hover and press feedback.
 */
export function PrecisionPorcelainButtonLink({
  className,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={clsx(PRECISION_PORCELAIN_CLASSES, className)}
      data-precision-porcelain-button="true"
      {...props}
    >
      {children}
    </Link>
  )
}
