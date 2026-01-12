'use client'

import { ElDialog, ElDialogPanel } from '@tailwindplus/elements/react'
import { clsx } from 'clsx/lite'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'

/**
 * Hook to track whether user has scrolled past a threshold.
 * Returns true when scrollY exceeds the threshold.
 */
function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    // Check initial state
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}

/**
 * Determine if a nav link should be considered active based on the current pathname.
 * Handles exact matches and nested routes.
 */
function useIsActive(href: string) {
  const pathname = usePathname()

  // Skip external links
  if (href.startsWith('http')) {
    return false
  }

  // Exact match for home or short paths
  if (href === '/') {
    return pathname === '/'
  }

  // For other paths, check if pathname starts with href (handles nested routes)
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavbarLink({
  children,
  href,
  className,
  ...props
}: { href: string } & Omit<ComponentProps<'a'>, 'href'>) {
  const isActive = useIsActive(href)

  return (
    <Link
      href={href}
      className={clsx(
        'group relative inline-flex cursor-pointer items-center justify-between gap-2 text-3xl/10 font-medium lg:text-sm/7',
        // Text color: active state is slightly bolder
        isActive
          ? 'text-mist-950 dark:text-white'
          : 'text-mist-700 hover:text-mist-950 dark:text-mist-300 dark:hover:text-white',
        // Transition for smooth color changes
        'transition-colors duration-200',
        className,
      )}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {children}
      {/* Active indicator - animated underline (desktop only) */}
      <span
        className={clsx(
          'absolute -bottom-1 left-0 h-0.5 rounded-full max-lg:hidden',
          // Gradient underline using mist palette
          'bg-gradient-to-r from-mist-500 via-mist-400 to-mist-500',
          'dark:from-mist-400 dark:via-mist-300 dark:to-mist-400',
          // Animation: scale from center
          'origin-center transition-all duration-300 ease-out',
          isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-50',
        )}
        aria-hidden="true"
      />
      {/* Mobile chevron indicator */}
      <span className="inline-flex p-1.5 opacity-0 group-hover:opacity-100 lg:hidden" aria-hidden="true">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </span>
    </Link>
  )
}

export function NavbarLogo({ className, href, ...props }: { href: string } & Omit<ComponentProps<'a'>, 'href'>) {
  return <Link href={href} {...props} className={clsx('inline-flex cursor-pointer items-stretch', className)} />
}

export function NavbarWithLogoActionsAndLeftAlignedLinks({
  links,
  logo,
  actions,
  className,
  ...props
}: {
  logo: ReactNode
  links: ReactNode
  actions: ReactNode
} & ComponentProps<'header'>) {
  const scrolled = useScrolled(20)

  return (
    <header
      className={clsx(
        'sticky top-0 z-10 transition-all duration-300',
        // Base background - solid when at top
        !scrolled && 'bg-mist-100 dark:bg-mist-950',
        // Glassmorphism when scrolled - semi-transparent with blur
        scrolled && 'bg-mist-100/80 backdrop-blur-xl backdrop-saturate-150 dark:bg-mist-950/80',
        // Subtle shadow when scrolled for depth
        scrolled && 'shadow-sm shadow-mist-950/5 dark:shadow-black/20',
        // Add navbar-scrolled class for glow effect (Rec 6)
        scrolled && 'navbar-scrolled',
        className
      )}
      {...props}
    >
      {/* Animated gradient glow line at bottom (Rec 6) */}
      <div className="navbar-glow" aria-hidden="true" />
      <style>{`:root { --scroll-padding-top: 5.25rem }`}</style>
      <nav>
        <div className="mx-auto flex h-(--scroll-padding-top) max-w-7xl items-center gap-4 px-6 lg:px-10">
          <div className="flex flex-1 items-center gap-12">
            <div className="flex items-center">{logo}</div>
            <div className="flex gap-8 max-lg:hidden">{links}</div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex shrink-0 items-center gap-5">{actions}</div>

            <button
              command="show-modal"
              commandfor="mobile-menu"
              aria-label="Toggle menu"
              className="inline-flex cursor-pointer rounded-full p-1.5 text-mist-950 hover:bg-mist-950/10 lg:hidden dark:text-white dark:hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path
                  fillRule="evenodd"
                  d="M3.748 8.248a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75ZM3.748 15.75a.75.75 0 0 1 .75-.751h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <ElDialog className="lg:hidden">
          <dialog id="mobile-menu" className="backdrop:bg-transparent">
            <ElDialogPanel className="fixed inset-0 bg-mist-100 px-6 py-6 lg:px-10 dark:bg-mist-950">
              <div className="flex justify-end">
                <button
                  command="close"
                  commandfor="mobile-menu"
                  aria-label="Toggle menu"
                  className="inline-flex cursor-pointer rounded-full p-1.5 text-mist-950 hover:bg-mist-950/10 dark:text-white dark:hover:bg-white/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-6">{links}</div>
            </ElDialogPanel>
          </dialog>
        </ElDialog>
      </nav>
    </header>
  )
}
