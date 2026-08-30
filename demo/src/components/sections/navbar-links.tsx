'use client'

import { TransitionLink } from '@/components/elements/transition-link'
import { clsx } from 'clsx/lite'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

/**
 * Return whether an internal navigation link matches the active route.
 */
function useIsActive(href: string) {
  const pathname = usePathname()

  if (href.startsWith('http')) return false
  if (href === '/') return pathname === '/'

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavbarLink({ children, href, className, ...props }: ComponentProps<typeof TransitionLink>) {
  const isActive = useIsActive(href)

  return (
    <TransitionLink
      href={href}
      className={clsx(
        'group relative inline-flex min-h-11 cursor-pointer items-center justify-between gap-2 text-3xl/10 font-medium transition-colors duration-200 lg:min-h-10 lg:text-sm/7',
        isActive
          ? 'text-mist-950 dark:text-white'
          : 'text-mist-700 hover:text-mist-950 dark:text-mist-300 dark:hover:text-white',
        className,
      )}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {children}
      <span
        className={clsx(
          'absolute -bottom-1 left-0 h-0.5 origin-center rounded-full bg-gradient-to-r from-mist-500 via-mist-400 to-mist-500 transition-[width,opacity] duration-300 ease-out max-lg:hidden dark:from-mist-400 dark:via-mist-300 dark:to-mist-400',
          isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-50',
        )}
        aria-hidden="true"
      />
      <span className="inline-flex p-1.5 opacity-0 group-hover:opacity-100 lg:hidden" aria-hidden="true">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </span>
    </TransitionLink>
  )
}

export function NavbarLogo({ className, href, ...props }: ComponentProps<typeof TransitionLink>) {
  return (
    <TransitionLink
      href={href}
      {...props}
      className={clsx('inline-flex size-11 cursor-pointer items-center justify-center lg:size-10', className)}
    />
  )
}

/**
 * Render a native mobile link so navigation can finish after the dialog exit.
 */
export function NavbarMobileLink({ children, href, className, ...props }: ComponentProps<'a'> & { href: string }) {
  const isActive = useIsActive(href)

  return (
    <a
      href={href}
      className={clsx(
        'group relative inline-flex min-h-11 cursor-pointer items-center justify-between gap-2 text-3xl/10 font-medium transition-colors duration-200',
        isActive ? 'text-white' : 'text-mist-300 hover:text-white',
        className,
      )}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {children}
      <span className="inline-flex p-1.5 opacity-0 group-hover:opacity-100" aria-hidden="true">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </span>
    </a>
  )
}

export function NavbarMobileLogo({ className, ...props }: ComponentProps<'a'>) {
  return (
    <a
      {...props}
      className={clsx('inline-flex size-11 cursor-pointer items-center justify-center lg:size-10', className)}
    />
  )
}
