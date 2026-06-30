import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'

function GiftIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12v7.25A1.75 1.75 0 0 1 18.25 21H5.75A1.75 1.75 0 0 1 4 19.25V12m16 0H4m16 0v-1.75A2.25 2.25 0 0 0 17.75 8H6.25A2.25 2.25 0 0 0 4 10.25V12m8 9V8m0 0H9.25A2.75 2.75 0 1 1 12 5.25V8Zm0 0h2.75A2.75 2.75 0 1 0 12 5.25V8Z"
      />
    </svg>
  )
}

export function PricingOptionCallout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'flex max-w-sm items-center gap-2 rounded-lg border border-mist-950/10 bg-white/70 px-4 py-2 text-sm/6 font-medium text-mist-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-mist-300',
        className,
      )}
    >
      <GiftIcon className="size-4 shrink-0 text-mist-950 dark:text-white" />
      <div>{children}</div>
    </div>
  )
}

export function PricingPriceNote({ children }: { children: ReactNode }) {
  return (
    <span className="ml-2 inline-flex rounded-full bg-mist-950/7 px-2.5 py-1 text-xs/5 font-medium text-mist-700 dark:bg-white/8 dark:text-mist-300">
      {children}
    </span>
  )
}

export function PricingBonusPanel({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-mist-950/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 border-b border-mist-950/10 bg-mist-950/5 px-3 py-2 dark:border-white/10 dark:bg-white/10">
        <GiftIcon className="size-4 shrink-0 text-mist-950 dark:text-white" />
        <p className="text-xs/5 font-semibold tracking-wide text-mist-950 dark:text-white">Bonuses</p>
      </div>
      <div className="px-3 py-3 text-sm/6 text-mist-700 dark:text-mist-300">{children}</div>
    </div>
  )
}

export function PricingBonusPrompt({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-mist-950/10 bg-mist-950/5 px-3 py-2.5 text-sm/6 text-mist-700 dark:border-white/10 dark:bg-white/5 dark:text-mist-300">
      <GiftIcon className="mt-0.5 size-4 shrink-0 text-mist-950 dark:text-white" />
      <div>{children}</div>
    </div>
  )
}
