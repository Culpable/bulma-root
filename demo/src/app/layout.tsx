import { PlainButtonLink } from '@/components/elements/button'
import { GlassPressButtonLink } from '@/components/elements/glass-press-button-link'
import { Main } from '@/components/elements/main'
import {
  FooterCategory,
  FooterLink,
  FooterWithNewsletterFormCategoriesAndSocialIcons,
} from '@/components/sections/footer-with-newsletter-form-categories-and-social-icons'
import {
  NavbarLink,
  NavbarLogo,
  NavbarWithLinksActionsAndCenteredLogo,
} from '@/components/sections/navbar-with-links-actions-and-centered-logo'
import MixpanelProvider from '@/components/MixpanelProvider'
import { siteMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'
import { Mona_Sans, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

// Configure Mona Sans with variable width setting for display text
// Uses --font-mona-sans variable, referenced by Tailwind theme as --font-display
const monaSans = Mona_Sans({
  subsets: ['latin'],
  variable: '--font-mona-sans',
  display: 'swap',
  // Enable variable font axes
  axes: ['wdth'],
})

// Configure Inter for body text
// Uses --font-inter variable, referenced by Tailwind theme as --font-sans
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  // Title template: pages get " | Bulma" suffix; homepage uses absolute to bypass
  title: {
    template: '%s | Bulma',
    default: siteMetadata.title,
  },
  description: siteMetadata.description,

  // Open Graph configuration (inherited by all pages)
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.name,
    images: [
      {
        url: siteMetadata.ogImage,
        width: 1200,
        height: 630,
        alt: siteMetadata.title,
      },
    ],
    locale: siteMetadata.locale,
    type: 'website',
  },

  // Twitter/X card configuration (inherited by all pages)
  twitter: {
    card: siteMetadata.twitter.cardType,
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.ogImage],
  },

  // Additional metadata
  metadataBase: new URL(siteMetadata.siteUrl),
}

const siteLogoAlt = `${siteMetadata.title} logo - AI policy assistant for Australian mortgage brokers`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${monaSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Resource hints for external domains (S-1) */}
        <link rel="dns-prefetch" href="https://app.bulma.com.au" />
        <link rel="dns-prefetch" href="https://api-js.mixpanel.com" />
      </head>
      <body>
        <>
          <Script id="referral-tracking" src="/scripts/referral-tracking.js" strategy="lazyOnload" />
          <MixpanelProvider />
          <NavbarWithLinksActionsAndCenteredLogo
            id="navbar"
            links={
              <>
                <NavbarLink href="/pricing">Pricing</NavbarLink>
                <NavbarLink href="/contact">Contact</NavbarLink>
              </>
            }
            logo={
              <NavbarLogo href="/">
                <picture>
                  <source
                    srcSet="/img/logos/bulma-logo-light-40.webp 1x, /img/logos/bulma-logo-light-80.webp 2x, /img/logos/bulma-logo-light-160.webp 4x"
                    media="(prefers-color-scheme: dark)"
                    width={40}
                    height={40}
                  />
                  <img
                    src="/img/logos/bulma-logo-dark-40.webp"
                    srcSet="/img/logos/bulma-logo-dark-40.webp 1x, /img/logos/bulma-logo-dark-80.webp 2x, /img/logos/bulma-logo-dark-160.webp 4x"
                    alt={siteLogoAlt}
                    width={40}
                    height={40}
                  />
                </picture>
              </NavbarLogo>
            }
            actions={
              <>
                <PlainButtonLink href="https://app.bulma.com.au/login" className="max-sm:hidden">
                  Log in
                </PlainButtonLink>
                <GlassPressButtonLink href="https://app.bulma.com.au/register">Get started</GlassPressButtonLink>
              </>
            }
            mobileActions={
              <>
                <GlassPressButtonLink href="https://app.bulma.com.au/register" className="w-full justify-center">
                  Get started
                </GlassPressButtonLink>
                <PlainButtonLink href="https://app.bulma.com.au/login" className="w-full justify-center">
                  Log in
                </PlainButtonLink>
              </>
            }
          />

          <Main>{children}</Main>

          <FooterWithNewsletterFormCategoriesAndSocialIcons
            id="footer"
            links={
              <>
                <FooterCategory title="Product">
                  {/* <FooterLink href="#">Features</FooterLink> */}
                  <FooterLink href="/pricing">Pricing</FooterLink>
                  {/* <FooterLink href="#">Integrations</FooterLink> */}
                </FooterCategory>
                <FooterCategory title="Support">
                  {/* <FooterLink href="#">Help Center</FooterLink> */}
                  {/* <FooterLink href="#">API Docs</FooterLink> */}
                  {/* <FooterLink href="#">Status</FooterLink> */}
                  <FooterLink href="/contact">Contact</FooterLink>
                </FooterCategory>
                <FooterCategory title="Legal">
                  <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
                  {/* <FooterLink href="#">Terms of Service</FooterLink> */}
                  {/* <FooterLink href="#">Security</FooterLink> */}
                </FooterCategory>
              </>
            }
            fineprint="© 2026 Bulma Pty Ltd"
          />
        </>
      </body>
    </html>
  )
}
