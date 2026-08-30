import { clsx } from 'clsx/lite'
import type { ComponentProps, ReactNode } from 'react'
import { NavbarController } from './navbar-controller'

/**
 * Render the global navigation as server markup and hydrate only its controller.
 */
export function NavbarWithLinksActionsAndCenteredLogo({
  links,
  logo,
  mobileLinks,
  mobileLogo,
  actions,
  mobileActions,
  className,
  ...props
}: {
  links: ReactNode
  logo: ReactNode
  mobileLinks?: ReactNode
  mobileLogo?: ReactNode
  actions: ReactNode
  mobileActions?: ReactNode
} & ComponentProps<'header'>) {
  const navbarId = props.id ?? 'navbar'

  return (
    <header
      data-navbar-root
      className={clsx(
        'sticky top-0 z-10 bg-mist-100 transition-[background-color,backdrop-filter,box-shadow] duration-300 dark:bg-mist-950',
        className,
      )}
      {...props}
      id={navbarId}
    >
      <style>{`:root { --scroll-padding-top: 5.25rem }`}</style>
      <NavbarController navbarId={navbarId} />
      <nav>
        <div className="mx-auto flex h-(--scroll-padding-top) max-w-7xl items-center gap-4 px-6 lg:px-10">
          <div className="flex flex-1 gap-8 max-lg:hidden">{links}</div>
          <div className="flex items-center">{logo}</div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="flex shrink-0 items-center gap-5">{actions}</div>

            <button
              type="button"
              aria-label="Open menu"
              aria-controls="mobile-menu"
              aria-expanded="false"
              data-open-mobile-menu
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-mist-950 transition-colors duration-200 hover:bg-mist-950/10 lg:hidden dark:text-white dark:hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M3.748 8.248a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75ZM3.748 15.75a.75.75 0 0 1 .75-.751h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <dialog id="mobile-menu" className="mobile-menu-dialog backdrop:bg-transparent lg:hidden">
          <div
            data-mobile-menu-panel
            aria-labelledby="mobile-menu-title"
            className="mobile-menu-panel fixed inset-0 flex min-h-dvh flex-col overflow-y-auto bg-mist-100/90 px-6 py-6 backdrop-blur-xl backdrop-saturate-150 lg:px-10 dark:bg-mist-950/90"
          >
            <h2 id="mobile-menu-title" className="sr-only">
              Mobile navigation
            </h2>
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex" data-close-mobile-menu-on-link>
                {mobileLogo ?? logo}
              </div>
              <button
                type="button"
                aria-label="Close menu"
                data-close-mobile-menu
                className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-mist-950 transition-colors duration-200 hover:bg-mist-950/10 dark:text-white dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mobile-menu-close-icon size-6"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mobile-menu-links mt-6 flex flex-col gap-6" data-close-mobile-menu-on-link>
              {mobileLinks ?? links}
            </div>
            {mobileActions && (
              <div className="mobile-menu-actions mt-auto grid gap-3 pt-10" data-close-mobile-menu-on-link>
                {mobileActions}
              </div>
            )}
          </div>
        </dialog>
      </nav>
      <span className="navbar-glow" aria-hidden="true" />
    </header>
  )
}
