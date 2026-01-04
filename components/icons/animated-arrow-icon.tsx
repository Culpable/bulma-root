import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

export function AnimatedArrowIcon({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      className={clsx('h-[11px] w-[11px] flex-none', className)}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 10 10"
      {...props}
    >
      <path
        className="origin-left scale-x-0 opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover:scale-x-100 group-hover:opacity-100"
        d="M0 5h7"
        strokeLinecap="round"
      />
      <path
        className="transform translate-x-0 transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
        d="M1 1l4 4-4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
