'use client'

import { useEffect } from 'react'

const topClasses = ['bg-mist-100', 'dark:bg-mist-950']
const scrolledClasses = [
  'navbar-scrolled',
  'bg-mist-100/80',
  'backdrop-blur-xl',
  'backdrop-saturate-150',
  'dark:bg-mist-950/80',
  'shadow-sm',
  'shadow-mist-950/5',
  'dark:shadow-black/20',
]

/**
 * Attach scroll and mobile-menu behaviour without hydrating the navbar markup.
 */
export function NavbarController({ navbarId }: { navbarId: string }) {
  useEffect(() => {
    const navbar = document.getElementById(navbarId)
    const dialog = document.getElementById('mobile-menu') as HTMLDialogElement | null
    const panel = dialog?.querySelector<HTMLElement>('[data-mobile-menu-panel]') ?? null
    const openButton = navbar?.querySelector<HTMLButtonElement>('[data-open-mobile-menu]') ?? null
    const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-close-mobile-menu]') ?? null

    if (!navbar || !dialog || !panel || !openButton || !closeButton) return

    let scrollFrame: number | null = null
    let enterFrame: number | null = null
    let settleFrame: number | null = null
    let transitionTimer: number | null = null

    const clearTransitionTimer = () => {
      if (transitionTimer === null) return
      window.clearTimeout(transitionTimer)
      transitionTimer = null
    }

    const updateScrolledState = () => {
      const isScrolled = window.scrollY > 20
      navbar.classList.remove(...(isScrolled ? topClasses : scrolledClasses))
      navbar.classList.add(...(isScrolled ? scrolledClasses : topClasses))
    }

    const scheduleScrolledStateUpdate = () => {
      if (scrollFrame !== null) return

      scrollFrame = window.requestAnimationFrame(() => {
        updateScrolledState()
        scrollFrame = null
      })
    }

    const finishClose = () => {
      if (dialog.open) dialog.close()
      panel.removeAttribute('data-leave')
      panel.removeAttribute('data-closed')
      openButton.setAttribute('aria-expanded', 'false')
      transitionTimer = null
    }

    const closeMobileMenu = () => {
      if (!dialog.open || panel.hasAttribute('data-leave')) return

      clearTransitionTimer()
      panel.removeAttribute('data-enter')
      panel.setAttribute('data-leave', '')
      panel.setAttribute('data-closed', '')
      transitionTimer = window.setTimeout(finishClose, 170)
    }

    const openMobileMenu = () => {
      if (dialog.open) return

      clearTransitionTimer()
      panel.removeAttribute('data-leave')
      panel.setAttribute('data-enter', '')
      panel.setAttribute('data-closed', '')
      dialog.showModal()
      openButton.setAttribute('aria-expanded', 'true')

      enterFrame = window.requestAnimationFrame(() => {
        settleFrame = window.requestAnimationFrame(() => {
          panel.removeAttribute('data-closed')
          transitionTimer = window.setTimeout(() => {
            panel.removeAttribute('data-enter')
            transitionTimer = null
          }, 280)
        })
      })
    }

    const closeWhenLinkIsClicked = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-close-mobile-menu-on-link] a')) closeMobileMenu()
    }

    const handleCancel = (event: Event) => {
      event.preventDefault()
      closeMobileMenu()
    }

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) closeMobileMenu()
    }

    updateScrolledState()
    window.addEventListener('scroll', scheduleScrolledStateUpdate, { passive: true })
    openButton.addEventListener('click', openMobileMenu)
    closeButton.addEventListener('click', closeMobileMenu)
    dialog.addEventListener('click', closeWhenLinkIsClicked)
    dialog.addEventListener('click', handleBackdropClick)
    dialog.addEventListener('cancel', handleCancel)

    return () => {
      window.removeEventListener('scroll', scheduleScrolledStateUpdate)
      openButton.removeEventListener('click', openMobileMenu)
      closeButton.removeEventListener('click', closeMobileMenu)
      dialog.removeEventListener('click', closeWhenLinkIsClicked)
      dialog.removeEventListener('click', handleBackdropClick)
      dialog.removeEventListener('cancel', handleCancel)
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame)
      if (enterFrame !== null) window.cancelAnimationFrame(enterFrame)
      if (settleFrame !== null) window.cancelAnimationFrame(settleFrame)
      clearTransitionTimer()
    }
  }, [navbarId])

  return null
}
