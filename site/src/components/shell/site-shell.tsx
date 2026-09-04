import { PlainButtonLink } from '@/components/elements/button'
import { GlassPressButtonLink } from '@/components/elements/glass-press-button-link'
import {
  FooterCategory,
  FooterLink,
  FooterWithNewsletterFormCategoriesAndSocialIcons,
} from '@/components/sections/footer-with-newsletter-form-categories-and-social-icons'
import { NavbarLink, NavbarLogo, NavbarMobileLink, NavbarMobileLogo } from '@/components/sections/navbar-links'
import { NavbarWithLinksActionsAndCenteredLogo } from '@/components/sections/navbar-with-links-actions-and-centered-logo'
import { NavbarController } from '@/components/sections/navbar-controller'
import { useEffect } from 'react'

const logoAlt = 'Bulma: AI Assistant for Australian Mortgage Brokers logo - AI policy assistant for Australian mortgage brokers'

function LogoPicture() {
  return (
    <picture>
      <img
        src="/img/logos/bulma-logo-light-40.webp"
        srcSet="/img/logos/bulma-logo-light-40.webp 1x, /img/logos/bulma-logo-light-80.webp 2x, /img/logos/bulma-logo-light-160.webp 4x"
        alt={logoAlt}
        width={40}
        height={40}
      />
    </picture>
  )
}

/** Render and hydrate the production navigation shell. */
export function NavbarShell({ currentPath }: { currentPath: string }) {
  return (
    <NavbarWithLinksActionsAndCenteredLogo
      id="navbar"
      links={
        <>
          <NavbarLink href="/pricing" currentPath={currentPath}>Pricing</NavbarLink>
          <NavbarLink href="/contact" currentPath={currentPath}>Contact</NavbarLink>
        </>
      }
      mobileLinks={
        <>
          <NavbarMobileLink href="/pricing" currentPath={currentPath}>Pricing</NavbarMobileLink>
          <NavbarMobileLink href="/contact" currentPath={currentPath}>Contact</NavbarMobileLink>
        </>
      }
      logo={<NavbarLogo href="/"><LogoPicture /></NavbarLogo>}
      mobileLogo={<NavbarMobileLogo href="/"><LogoPicture /></NavbarMobileLogo>}
      actions={
        <>
          <PlainButtonLink href="https://app.bulma.com.au/login" className="max-sm:hidden">Log in</PlainButtonLink>
          <GlassPressButtonLink href="https://app.bulma.com.au/register" className="min-w-[119px]">Get started</GlassPressButtonLink>
        </>
      }
      mobileActions={
        <>
          <GlassPressButtonLink href="https://app.bulma.com.au/register" className="w-full justify-center">Get started</GlassPressButtonLink>
          <PlainButtonLink href="https://app.bulma.com.au/login" className="w-full justify-center">Log in</PlainButtonLink>
        </>
      }
    />
  )
}

/** Render and hydrate the production footer and wordmark animation. */
export function FooterShell() {
  return (
    <FooterWithNewsletterFormCategoriesAndSocialIcons
      id="footer"
      links={
        <>
          <FooterCategory title="Product"><FooterLink href="/pricing/">Pricing</FooterLink></FooterCategory>
          <FooterCategory title="Support"><FooterLink href="/contact/">Contact</FooterLink></FooterCategory>
          <FooterCategory title="Legal"><FooterLink href="/privacy-policy/">Privacy Policy</FooterLink></FooterCategory>
        </>
      }
      fineprint="© 2026 Bulma Pty Ltd"
    />
  )
}

/** Hydrate the global shell behaviour without hydrating its server-rendered markup. */
export function ShellController() {
  useEffect(() => {
    const wordmark = document.querySelector<HTMLElement>('.footer-wordmark')
    if (!wordmark) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        wordmark.dataset.visible = 'true'
        observer.disconnect()
      },
      { threshold: 0.01, rootMargin: '0px 0px 30% 0px' },
    )
    observer.observe(wordmark)
    return () => observer.disconnect()
  }, [])

  return <NavbarController navbarId="navbar" />
}
