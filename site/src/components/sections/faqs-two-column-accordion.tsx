
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { clsx } from 'clsx/lite'
import { Children, useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Container } from '../elements/container'
import { Subheading } from '../elements/subheading'
import { Text } from '../elements/text'
import { FaqDisclosureController } from './faq-disclosure-controller'

export function Faq({
  id,
  question,
  answer,
  ...props
}: { question: ReactNode; answer: ReactNode } & ComponentProps<'div'>) {
  const autoId = useId()
  const faqId = id || autoId
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isHashTarget, setIsHashTarget] = useState(false)

  useEffect(() => {
    const normalizedHash = `#${faqId}`
    let retryCount = 0
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let clickTimers: ReturnType<typeof setTimeout>[] = []

    // Open the matching FAQ when the current URL hash targets this item.
    const openWhenHashMatches = () => {
      const hashMatches = window.location.hash === normalizedHash

      setIsHashTarget((current) => (current === hashMatches ? current : hashMatches))

      if (!hashMatches) {
        return
      }

      const button = buttonRef.current

      if (!button || button.getAttribute('aria-expanded') === 'true') {
        return
      }

      button.click()

      // Retry briefly while the disclosure wiring finishes booting on first load.
      if (button.getAttribute('aria-expanded') !== 'true' && retryCount < 10) {
        retryCount += 1
        retryTimer = setTimeout(openWhenHashMatches, 100)
      }
    }

    const queueHashCheck = () => {
      clickTimers.forEach((timer) => clearTimeout(timer))

      clickTimers = [0, 50, 150, 350].map((delay) => setTimeout(openWhenHashMatches, delay))
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const anchor = target?.closest<HTMLAnchorElement>('a[href]')

      if (!anchor) {
        return
      }

      const targetUrl = new URL(anchor.href, window.location.href)

      if (!targetUrl.hash || targetUrl.origin !== window.location.origin) {
        return
      }

      // NextLink can update same-page hashes after the click event and without a native hashchange event.
      queueHashCheck()
    }

    openWhenHashMatches()
    window.addEventListener('click', handleDocumentClick, true)
    window.addEventListener('hashchange', openWhenHashMatches)
    window.addEventListener('popstate', openWhenHashMatches)

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer)
      }

      clickTimers.forEach((timer) => clearTimeout(timer))

      window.removeEventListener('click', handleDocumentClick, true)
      window.removeEventListener('hashchange', openWhenHashMatches)
      window.removeEventListener('popstate', openWhenHashMatches)
    }
  }, [faqId])

  /**
   * Render FAQ strings as HTML so authors can include simple markup (e.g. <em>, <strong>, <a>).
   *
   * IMPORTANT:
   * - Only use this with trusted, developer-authored content (not user input).
   * - Our JSON-LD schema separately strips HTML so structured data remains plain text.
   */
  const renderedAnswer = typeof answer === 'string' ? <div dangerouslySetInnerHTML={{ __html: answer }} /> : answer

  return (
    <div id={faqId} data-hash-target={isHashTarget ? 'true' : undefined} {...props}>
      <FaqDisclosureController
        id={faqId}
        question={question}
        answer={renderedAnswer}
        buttonRef={buttonRef}
        glow
      />
    </div>
  )
}

export function FAQsTwoColumnAccordion({
  headline,
  subheadline,
  className,
  children,
  staggerDelay = 80,
  stickyEyebrow: _stickyEyebrow,
  sectionHue,
  ...props
}: {
  headline?: ReactNode
  subheadline?: ReactNode
  staggerDelay?: number
  /** Enable sticky eyebrow behavior (Recommendation 8) - not used in this component */
  stickyEyebrow?: boolean
  /** Section hue identifier for smooth color transitions (Recommendation 9) */
  sectionHue?: 'hero' | 'features' | 'stats' | 'testimonials' | 'pricing' | 'faqs' | 'cta'
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })
  void _stickyEyebrow

  // Wrap each FAQ child with staggered animation
  const animatedFaqs = Children.map(children, (child, index) => {
    const delay = index * staggerDelay

    return (
      <div
        className={clsx(
          // Keep hash-targeted FAQ items visible when deep links land below the section animation sentinel.
          'faq-target-visible',
          'transition-[translate,opacity] duration-500 ease-out',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {child}
      </div>
    )
  })

  return (
    <section
      className={clsx('py-16', sectionHue && 'hue-shift-bg', className)}
      data-section-hue={sectionHue}
      {...props}
    >
      <Container className="grid grid-cols-1 gap-x-2 gap-y-12 lg:grid-cols-2 lg:gap-y-8">
        {/* Header with slide-in animation */}
        <div
          ref={containerRef}
          className={clsx(
            'flex flex-col gap-6 transition-[translate,opacity] duration-600 ease-out',
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0',
          )}
        >
          <Subheading>{headline}</Subheading>
          {subheadline && <Text className="flex flex-col gap-4 text-pretty">{subheadline}</Text>}
        </div>
        {/* FAQ items with staggered fade-in */}
        <div className="divide-y divide-mist-950/10 border-y border-mist-950/10 dark:divide-white/10 dark:border-white/10">
          {animatedFaqs}
        </div>
      </Container>
    </section>
  )
}
