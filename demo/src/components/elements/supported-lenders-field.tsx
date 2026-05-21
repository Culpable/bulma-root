'use client'

import { supportedLendersByMarketCap, type SupportedLender } from '@/lib/supported-lenders'
import { clsx } from 'clsx/lite'
import type { CSSProperties, FocusEvent as ReactFocusEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

const POINTER_RADIUS = 132
const ACTIVE_PROXIMITY_THRESHOLD = 0.48
const DEFAULT_POINTER_POSITION = '50%'

type SupportedLendersFieldProps = {
  lenders?: SupportedLender[]
  appearance?: 'dark' | 'light'
}

type LenderMetric = {
  slug: string
  element: HTMLButtonElement
  x: number
  y: number
}

// Hero-footer "Supported Lenders" field. Every lender renders at the same size,
// weight, colour and opacity — no per-tier visual hierarchy and no per-tier text
// anywhere in the visible UI. There is no readout/caption beneath the names: the
// active state is conveyed entirely by the lender's own treatment (lift,
// brightness, underline beam) so we don't have to write copy that would either
// repeat the lender name or fake metadata we don't actually have.
export function SupportedLendersField({
  lenders = supportedLendersByMarketCap,
  appearance = 'dark',
}: SupportedLendersFieldProps) {
  const fieldRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const lenderButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  // Tracks the lender pinned by an explicit click/tap/keyboard selection so the
  // active state survives pointer-leave until the user picks something else.
  const selectedSlugRef = useRef<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const hasActive = activeSlug !== null

  useEffect(() => {
    const field = fieldRef.current
    const list = listRef.current

    if (!field || !list) {
      return
    }

    let fieldIsVisible = false
    let listenersAreAttached = false
    let metricsAreStale = true
    let rafId: number | null = null
    let lastPointerX = 0
    let lastPointerY = 0
    let lenderMetrics: LenderMetric[] = []

    const finePointerQuery = window.matchMedia('(pointer: fine)')

    // Reset pointer-only CSS variables so keyboard and touch selection remain stable.
    const resetPointerSurface = () => {
      field.style.setProperty('--lender-pointer-opacity', '0')
      field.style.setProperty('--lender-pointer-x', DEFAULT_POINTER_POSITION)
      field.style.setProperty('--lender-pointer-y', DEFAULT_POINTER_POSITION)

      lenderButtonRefs.current.forEach((button) => {
        button.style.setProperty('--lender-proximity', '0')
        button.style.setProperty('--lender-proximity-brightness', '1')
        button.style.setProperty('--lender-proximity-lift', '0px')
      })
    }

    // Cache viewport-space centres so pointer movement never reads layout in a tight loop.
    const measureLenders = () => {
      lenderMetrics = Array.from(lenderButtonRefs.current.entries()).map(([slug, element]) => {
        const rect = element.getBoundingClientRect()

        return {
          slug,
          element,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
      })

      metricsAreStale = false
    }

    // Apply one RAF-throttled pointer frame and write visual values directly to CSS.
    const applyPointerFrame = () => {
      rafId = null

      if (!fieldIsVisible) {
        return
      }

      if (metricsAreStale) {
        measureLenders()
      }

      const listRect = list.getBoundingClientRect()
      const pointerX = Math.min(Math.max(((lastPointerX - listRect.left) / listRect.width) * 100, 0), 100)
      const pointerY = Math.min(Math.max(((lastPointerY - listRect.top) / listRect.height) * 100, 0), 100)
      let nearestSlug: string | null = null
      let nearestProximity = 0

      field.style.setProperty('--lender-pointer-opacity', '1')
      field.style.setProperty('--lender-pointer-x', `${pointerX}%`)
      field.style.setProperty('--lender-pointer-y', `${pointerY}%`)

      lenderMetrics.forEach((metric) => {
        const distance = Math.hypot(lastPointerX - metric.x, lastPointerY - metric.y)
        const proximity = Math.max(0, 1 - distance / POINTER_RADIUS)

        metric.element.style.setProperty('--lender-proximity', proximity.toFixed(3))
        metric.element.style.setProperty('--lender-proximity-brightness', (1 + proximity * 0.1).toFixed(3))
        metric.element.style.setProperty('--lender-proximity-lift', `${(-1.2 * proximity).toFixed(2)}px`)

        if (proximity > nearestProximity) {
          nearestProximity = proximity
          nearestSlug = metric.slug
        }
      })

      setActiveSlug((currentSlug) => {
        const nextSlug = nearestProximity >= ACTIVE_PROXIMITY_THRESHOLD ? nearestSlug : selectedSlugRef.current

        return currentSlug === nextSlug ? currentSlug : nextSlug
      })
    }

    // Store the latest pointer position, then let RAF batch all DOM writes.
    const handlePointerMove = (event: PointerEvent) => {
      lastPointerX = event.clientX
      lastPointerY = event.clientY

      if (rafId === null) {
        rafId = window.requestAnimationFrame(applyPointerFrame)
      }
    }

    const handlePointerLeave = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }

      resetPointerSurface()
      setActiveSlug(selectedSlugRef.current)
    }

    // Attach pointer work only when the field is visible and the device has a fine pointer.
    const addPointerListeners = () => {
      if (listenersAreAttached || !finePointerQuery.matches || !fieldIsVisible) {
        return
      }

      list.addEventListener('pointermove', handlePointerMove, { passive: true })
      list.addEventListener('pointerleave', handlePointerLeave, { passive: true })
      listenersAreAttached = true
      metricsAreStale = true
    }

    const removePointerListeners = () => {
      if (!listenersAreAttached) {
        return
      }

      list.removeEventListener('pointermove', handlePointerMove)
      list.removeEventListener('pointerleave', handlePointerLeave)
      listenersAreAttached = false
    }

    const handlePointerCapabilityChange = () => {
      metricsAreStale = true

      if (finePointerQuery.matches) {
        addPointerListeners()
      } else {
        removePointerListeners()
        resetPointerSurface()
      }
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        fieldIsVisible = entry.isIntersecting
        field.dataset.lenderFieldVisible = entry.isIntersecting ? 'true' : 'false'

        if (entry.isIntersecting) {
          metricsAreStale = true
          addPointerListeners()
        } else {
          removePointerListeners()
          resetPointerSurface()
        }
      },
      { threshold: 0.2 },
    )

    // Invalidate cached centres whenever wrapping, text metrics, or the viewport changes.
    const resizeObserver = new ResizeObserver(() => {
      metricsAreStale = true
    })

    intersectionObserver.observe(field)
    resizeObserver.observe(list)
    lenderButtonRefs.current.forEach((button) => resizeObserver.observe(button))
    finePointerQuery.addEventListener('change', handlePointerCapabilityChange)

    return () => {
      removePointerListeners()
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      finePointerQuery.removeEventListener('change', handlePointerCapabilityChange)

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const registerLenderButton = (slug: string) => (button: HTMLButtonElement | null) => {
    if (button) {
      lenderButtonRefs.current.set(slug, button)
    } else {
      lenderButtonRefs.current.delete(slug)
    }
  }

  // Pin a lender as the explicit selection (click / tap / keyboard) so it stays
  // active after pointer-leave. There is no readout to update — the active
  // visual treatment on the lender itself is the only feedback.
  const selectLender = (slug: string) => {
    selectedSlugRef.current = slug
    setActiveSlug(slug)
  }

  const handleFieldBlur = (event: ReactFocusEvent<HTMLElement>) => {
    const nextFocusedElement = event.relatedTarget

    if (!(nextFocusedElement instanceof Node) || !event.currentTarget.contains(nextFocusedElement)) {
      setActiveSlug(selectedSlugRef.current)
    }
  }

  return (
    <section
      ref={fieldRef}
      id="supported-lenders"
      className={clsx('supported-lenders-field', appearance === 'light' && 'supported-lenders-field--light')}
      aria-labelledby="supported-lenders-heading"
      data-has-active={hasActive ? 'true' : 'false'}
      onBlur={handleFieldBlur}
    >
      <div className="supported-lenders-field__surface">
        {/* Editorial chapter-marker heading: flanking gradient hairlines bracket a
            tiny outlined diamond ornament on each side of the gradient-filled
            label, giving the section a refined institutional cue without
            competing with the lender names below. The id stays on the outer
            element so aria-labelledby continues to resolve. */}
        <div id="supported-lenders-heading" className="supported-lenders-field__heading">
          <span className="supported-lenders-field__heading-rule" aria-hidden="true" />
          <span className="supported-lenders-field__heading-ornament" aria-hidden="true">
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round">
              <path d="M5 0.8 L9.2 5 L5 9.2 L0.8 5 Z" />
            </svg>
          </span>
          <span className="supported-lenders-field__heading-text">Supported Lenders</span>
          <span className="supported-lenders-field__heading-ornament" aria-hidden="true">
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round">
              <path d="M5 0.8 L9.2 5 L5 9.2 L0.8 5 Z" />
            </svg>
          </span>
          <span className="supported-lenders-field__heading-rule" aria-hidden="true" />
        </div>

        <ul ref={listRef} aria-label="Lenders supported by Bulma" className="supported-lenders-field__list">
          {lenders.map((lender, index) => {
            // Every lender shares the same resting style. Only state distinction
            // is "active" (one lender) vs. "all others when something is active"
            // — no peer/tier visuals.
            const isActive = lender.slug === activeSlug

            return (
              <li
                key={lender.slug}
                className="supported-lenders-field__item"
                style={{ '--lender-index': index } as CSSProperties}
              >
                <button
                  ref={registerLenderButton(lender.slug)}
                  type="button"
                  className={clsx('supported-lenders-field__button', isActive && 'is-active')}
                  data-lender-slug={lender.slug}
                  data-active={isActive ? 'true' : 'false'}
                  aria-label={lender.name}
                  onFocus={() => setActiveSlug(lender.slug)}
                  onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                    if (event.pointerType !== 'mouse') {
                      selectLender(lender.slug)
                    }
                  }}
                  onClick={() => selectLender(lender.slug)}
                >
                  {lender.name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
