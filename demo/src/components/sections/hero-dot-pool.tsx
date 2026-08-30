'use client'

import { clsx } from 'clsx/lite'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Container } from '../elements/container'
import { Heading } from '../elements/heading'
import { Text } from '../elements/text'

// The WebGL pool is client-only and code-split; the copy still server-renders for SEO.
const DotPoolBackground = dynamic(() => import('../elements/dot-pool-background').then((m) => m.DotPoolBackground), {
  ssr: false,
})

/**
 * "Take the stage" tunables for the product screenshot (large viewports only).
 *
 * - `minScale`: scale of the frame when it first pins.
 * - `growEnd`: fraction of the track's scroll range over which the frame grows to full size.
 * - `slideStartVh`: how far below centre (in viewport heights) the frame starts before it rises.
 * - `minOpacity`: opacity at the start of the growth.
 */
export const STAGE_CONFIG = {
  minScale: 0.72,
  growEnd: 0.6,
  slideStartVh: 0.42,
  minOpacity: 0.75,
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)
const LARGE_QUERY = '(min-width: 1024px)'

/**
 * Homepage hero with the Dot Pool background and the "Take the stage" screenshot.
 *
 * Flow on large viewports: the copy block is centred in a 100svh stage above
 * the pool; the product screenshot then pins in the viewport for 200svh of
 * scroll, sliding up from low in the viewport and growing from 72% to full
 * width while the pool calms to still water beneath it; once released it
 * scrolls away and the supported-lenders field follows, where the water fades.
 * Below `lg` the copy stage is top-aligned at its natural height (no 100svh
 * minimum: with the 84px sticky navbar a centred full-viewport stage pushed the
 * CTAs under the fold on phones), the headline scales at 9vw under `sm` so
 * every cycling phrase fits on one line on every phone width, the subheadline
 * steps down to base/7, the screenshot is a normal centred frame, and the water
 * still lingers behind the lenders field. A page-colour scrim anchored to the copy
 * block keeps the headline, subheadline, and CTAs clean where the pool's
 * horizon crosses them.
 */
export function HeroDotPool({
  eyebrow,
  headline,
  subheadline,
  cta,
  demo,
  footer,
  className,
  ...props
}: {
  eyebrow?: ReactNode
  headline: ReactNode
  subheadline: ReactNode
  cta?: ReactNode
  demo?: ReactNode
  footer?: ReactNode
} & ComponentProps<'section'>) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [poolReady, setPoolReady] = useState(false)

  // Keep the three.js chunk off the LCP critical path. Mount the unchanged Dot Pool only
  // after the document has loaded and the browser has an idle window.
  useEffect(() => {
    let idleId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const schedulePool = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setPoolReady(true), { timeout: 2000 })
        return
      }

      timeoutId = setTimeout(() => setPoolReady(true), 200)
    }

    if (document.readyState === 'complete') {
      schedulePool()
    } else {
      window.addEventListener('load', schedulePool, { once: true })
    }

    return () => {
      window.removeEventListener('load', schedulePool)
      if (idleId !== null) window.cancelIdleCallback(idleId)
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }
  }, [])

  // Scroll-driven stage: write the frame's transform/opacity straight to the element from one
  // rAF-throttled scroll handler (no React state on scroll). Progress is the track's scrolled-through
  // fraction: 0 when the sticky panel pins, 1 when the track releases it.
  useEffect(() => {
    const track = trackRef.current
    const frame = frameRef.current
    if (!track || !frame) return
    const largeQuery = window.matchMedia(LARGE_QUERY)
    let raf: number | null = null

    const apply = () => {
      raf = null
      if (!largeQuery.matches) {
        frame.style.transform = ''
        frame.style.opacity = ''
        return
      }
      const vh = window.innerHeight
      const rect = track.getBoundingClientRect()
      const progress = rect.height > vh ? clamp01(-rect.top / (rect.height - vh)) : 1
      const grow = easeOut(progress / STAGE_CONFIG.growEnd)
      const scale = STAGE_CONFIG.minScale + (1 - STAGE_CONFIG.minScale) * grow
      // Slide arrival: start low in the viewport and rise to centre as the frame grows.
      const lift = vh * STAGE_CONFIG.slideStartVh * (1 - grow)
      frame.style.transform = `translateY(${lift.toFixed(1)}px) scale(${scale.toFixed(4)})`
      frame.style.opacity = String(STAGE_CONFIG.minOpacity + (1 - STAGE_CONFIG.minOpacity) * grow)
    }
    const schedule = () => {
      if (raf === null) raf = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    largeQuery.addEventListener('change', schedule)
    return () => {
      if (raf !== null) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      largeQuery.removeEventListener('change', schedule)
      frame.style.transform = ''
      frame.style.opacity = ''
    }
  }, [])

  return (
    <section ref={sectionRef} className={clsx('relative', className)} {...props}>
      {/* Sticky pool layer: pinned for the whole hero so the still water reads under the pinned screenshot */}
      <div className="sticky top-0 z-0 -mb-[100svh] h-[100svh]" aria-hidden="true">
        <div className="absolute inset-0">{poolReady && <DotPoolBackground sectionRef={sectionRef} />}</div>
      </div>

      <div className="relative z-10">
        {/* Copy stage: natural height and top-aligned below lg; full viewport with the copy centred from lg */}
        <div className="relative flex flex-col lg:min-h-[100svh]">
          <Container className="relative isolate z-10 flex flex-1 flex-col items-center justify-center gap-6 pt-10 pb-10 text-center sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16">
            {/* Page-colour scrim anchored to the copy block */}
            <div
              className={clsx(
                'pointer-events-none absolute -inset-x-[2%] -inset-y-6 -z-10',
                'bg-[radial-gradient(ellipse_at_center,var(--color-mist-100)_0%,var(--color-mist-100)_30%,transparent_66%)] dark:bg-[radial-gradient(ellipse_at_center,var(--color-mist-950)_0%,var(--color-mist-950)_30%,transparent_66%)]',
                'max-lg:-inset-x-6 max-lg:bg-[linear-gradient(to_bottom,var(--color-mist-100)_0%,var(--color-mist-100)_55%,transparent_92%)] max-lg:dark:bg-[linear-gradient(to_bottom,var(--color-mist-950)_0%,var(--color-mist-950)_55%,transparent_92%)]',
              )}
              aria-hidden="true"
            />
            {/* Announcement badge - first to appear */}
            {eyebrow && <div className="hero-animate hero-delay-0">{eyebrow}</div>}
            {/* Headline - appears second */}
            {/* Headline: fluid 9vw under sm (28-36px) keeps the longest cycling phrase (~82vw) on one line down to ~270px */}
            <Heading className="hero-animate hero-delay-1 max-w-5xl max-sm:text-[clamp(1.75rem,9vw,2.25rem)]/[1.1] lg:text-[4.5rem]/[1.05]!">
              {headline}
            </Heading>
            {/* Subheadline - appears third */}
            <Text
              size="lg"
              className="hero-animate hero-delay-2 flex max-w-2xl flex-col items-center gap-4 text-center max-sm:text-base/7"
            >
              {subheadline}
            </Text>
            {/* CTA buttons - appear fourth */}
            {cta && <div className="hero-animate hero-delay-3 flex w-full justify-center">{cta}</div>}
          </Container>
        </div>

        {/* Stage track: pins the screenshot for 100svh of extra scroll on large viewports. The negative top
            margin lets the panel pin while the CTAs are still leaving, so the pool is never shown empty. */}
        {demo && (
          <div ref={trackRef} className="relative pt-6 lg:-mt-[30svh]">
            <div className="flex items-center justify-center px-6 lg:sticky lg:top-0 lg:h-[100svh] lg:px-10">
              {/* Frame: sized by viewport (1152px from xl, 1440px from 2xl) and always capped to fit inside 100svh */}
              <div
                ref={frameRef}
                className="w-full max-w-5xl origin-center will-change-transform lg:max-w-[min(1152px,calc((100svh-6rem)*1.45))] 2xl:max-w-[min(1440px,72vw,calc((100svh-6rem)*1.45))]"
              >
                {demo}
              </div>
            </div>
            <div className="hidden lg:block lg:h-[100svh]" aria-hidden="true" />
          </div>
        )}

        {/* Supported lenders: airy rhythm after the released frame; the still water fades here */}
        {footer && (
          <Container className="relative pt-16 pb-24 lg:pt-24 lg:pb-28">
            <div className="hero-animate hero-delay-5">{footer}</div>
          </Container>
        )}
      </div>
    </section>
  )
}
