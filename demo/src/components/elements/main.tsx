import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

/**
 * Isolate and clip page content while route transitions are handled by the
 * View Transition API and the intentional hero entrance sequence.
 */
export function Main({
  children,
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <main className={clsx('isolate overflow-clip', className)} {...props}>
      {children}
    </main>
  )
}
