import { clsx } from 'clsx/lite'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { Container } from '../elements/container'
import { AnimatedArrowIcon } from '../icons/animated-arrow-icon'

export function FooterCategory({ title, children, ...props }: { title: ReactNode } & ComponentProps<'div'>) {
  return (
    <div {...props}>
      <h3>{title}</h3>
      <ul role="list" className="mt-2 flex flex-col gap-2">
        {children}
      </ul>
    </div>
  )
}

export function FooterLink({ href, className, ...props }: { href: string } & Omit<ComponentProps<'a'>, 'href'>) {
  return (
    <li className={clsx('text-mist-700 dark:text-mist-400', className)}>
      <Link href={href} className="cursor-pointer" {...props} />
    </li>
  )
}

export function SocialLink({
  href,
  name,
  className,
  ...props
}: {
  href: string
  name: string
} & Omit<ComponentProps<'a'>, 'href'>) {
  const rel = props.rel
    ? Array.from(new Set([...props.rel.split(' '), 'noopener', 'noreferrer'])).join(' ')
    : 'noopener noreferrer'

  return (
    <Link
      href={href}
      target="_blank"
      rel={rel}
      aria-label={name}
      className={clsx('cursor-pointer text-mist-950 *:size-6 dark:text-white', className)}
      {...props}
    />
  )
}

/**
 * @deprecated Footer newsletter signups are deprecated; avoid adding this form to new layouts.
 */
export function NewsletterForm({
  headline,
  subheadline,
  className,
  ...props
}: {
  headline: ReactNode
  subheadline: ReactNode
} & ComponentProps<'form'>) {
  return (
    <form className={clsx('flex max-w-sm flex-col gap-2', className)} {...props}>
      <p>{headline}</p>
      <div className="flex flex-col gap-4 text-mist-700 dark:text-mist-400">{subheadline}</div>
      {/* Label the submission so downstream tooling can distinguish footer newsletter signups. */}
      <input type="hidden" name="form_source" value="footer_newsletter" />
      <div className="flex items-center border-b border-mist-950/20 py-2 has-[input:focus]:border-mist-950 dark:border-white/20 dark:has-[input:focus]:border-white">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email"
          aria-label="Email"
          className="flex-1 text-mist-950 focus:outline-hidden dark:text-white"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="group relative inline-flex size-7 cursor-pointer items-center justify-center rounded-full after:absolute after:-inset-2 hover:bg-mist-950/10 dark:hover:bg-white/10 after:pointer-fine:hidden"
        >
          <AnimatedArrowIcon />
        </button>
      </div>
    </form>
  )
}

export function FooterWithNewsletterFormCategoriesAndSocialIcons({
  cta,
  links,
  fineprint,
  socialLinks,
  className,
  ...props
}: {
  cta?: ReactNode
  links: ReactNode
  fineprint: ReactNode
  socialLinks?: ReactNode
} & ComponentProps<'footer'>) {
  const hasCta = Boolean(cta)

  return (
    <footer className={clsx('pt-16', className)} {...props}>
      <div className="bg-mist-950/2.5 py-16 text-mist-950 dark:bg-white/5 dark:text-white">
        <Container className="flex flex-col gap-16">
          <div
            className={clsx(
              'grid grid-cols-1 gap-x-6 gap-y-16 text-sm/7',
              hasCta ? 'lg:grid-cols-2' : 'lg:grid-cols-1',
            )}
          >
            {cta}
            <nav className="grid grid-cols-2 gap-6 sm:has-[>:last-child:nth-child(3)]:grid-cols-3 sm:has-[>:nth-child(5)]:grid-cols-3 md:has-[>:last-child:nth-child(4)]:grid-cols-4 lg:max-xl:has-[>:last-child:nth-child(4)]:grid-cols-2">
              {links}
            </nav>
          </div>
          <div className="flex items-center justify-between gap-10 text-sm/7">
            <div className="text-mist-600 dark:text-mist-500">{fineprint}</div>
            {socialLinks && <div className="flex items-center gap-4 sm:gap-10">{socialLinks}</div>}
          </div>
        </Container>
      </div>
    </footer>
  )
}
