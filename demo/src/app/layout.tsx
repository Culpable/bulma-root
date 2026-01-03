import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { Main } from '@/components/elements/main'
import {
  FooterCategory,
  FooterLink,
  FooterWithNewsletterFormCategoriesAndSocialIcons,
  NewsletterForm,
} from '@/components/sections/footer-with-newsletter-form-categories-and-social-icons'
import {
  NavbarLink,
  NavbarLogo,
  NavbarWithLinksActionsAndCenteredLogo,
} from '@/components/sections/navbar-with-links-actions-and-centered-logo'
import type { Metadata } from 'next'
import Image from 'next/image'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bulma - AI Policy Assistant for Mortgage Brokers',
  description: 'Ask any lender policy question in plain English. Get instant, grounded answers with source attribution. Built for Australian mortgage brokers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wdth,wght@0,112.5,200..900;1,112.5,200..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <>
          <NavbarWithLinksActionsAndCenteredLogo
            id="navbar"
            links={
              <>
                <NavbarLink href="/pricing">Pricing</NavbarLink>
                <NavbarLink href="/about">About</NavbarLink>
                <NavbarLink href="https://app.bulma.com.au/login" className="sm:hidden">
                  Log in
                </NavbarLink>
              </>
            }
            logo={
              <NavbarLogo href="/">
                <Image
                  src="/img/logos/bulma-logo-dark.svg"
                  alt="Bulma"
                  className="dark:hidden"
                  width={40}
                  height={40}
                />
                <Image
                  src="/img/logos/bulma-logo-light.svg"
                  alt="Bulma"
                  className="not-dark:hidden"
                  width={40}
                  height={40}
                />
              </NavbarLogo>
            }
            actions={
              <>
                <PlainButtonLink href="https://app.bulma.com.au/login" className="max-sm:hidden">
                  Log in
                </PlainButtonLink>
                <ButtonLink href="https://app.bulma.com.au/register">Get started</ButtonLink>
              </>
            }
          />

          <Main>{children}</Main>

          <FooterWithNewsletterFormCategoriesAndSocialIcons
            id="footer"
            cta={
              <NewsletterForm
                headline="Stay in the loop"
                subheadline={
                  <p>
                    Get policy updates, lender insights, and tips to help you close more deals. Straight to your inbox.
                  </p>
                }
                action="/contact"
              />
            }
            links={
              <>
                <FooterCategory title="Product">
                  {/* <FooterLink href="#">Features</FooterLink> */}
                  <FooterLink href="/pricing">Pricing</FooterLink>
                  {/* <FooterLink href="#">Integrations</FooterLink> */}
                </FooterCategory>
                <FooterCategory title="About">
                  <FooterLink href="/about">About</FooterLink>
                  {/* <FooterLink href="#">Careers</FooterLink> */}
                  {/* <FooterLink href="#">Blog</FooterLink> */}
                  {/* <FooterLink href="#">Press Kit</FooterLink> */}
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
