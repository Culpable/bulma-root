import { Link } from '@/components/elements/link'
import { AnimatedArrowIcon } from '@/components/icons/animated-arrow-icon'
import { pageMetadata } from '@/lib/metadata'
import { HeroSimpleCentered } from '@/components/sections/hero-simple-centered'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: pageMetadata.notFound.title,
  description: pageMetadata.notFound.description,
}

export default function Page() {
  return (
    <>
      <HeroSimpleCentered
        headline="Page not found"
        subheadline={<p>Sorry, but the page you were looking for could not be found.</p>}
        cta={
          <Link href="/" className="group">
            Go back home <AnimatedArrowIcon className="-mr-1 ml-1.5" />
          </Link>
        }
      />
    </>
  )
}
