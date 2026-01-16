'use client'

import { clsx } from 'clsx/lite'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Configuration for the luminance sweep effect.
 */
const SWEEP_CONFIG = {
  /** Delay before triggering sweep after becoming visible (ms) */
  triggerDelay: 200,
  /** Duration of the sweep animation (ms) - should match CSS */
  animationDuration: 800,
  /** IntersectionObserver threshold for visibility detection */
  visibilityThreshold: 0.3,
}

interface LuminanceSweepProps {
  /** Content to apply the sweep effect to */
  children: ReactNode
  /** Text content for the sweep overlay (must match children text) */
  text: string
  /** Additional class names */
  className?: string
  /** Disable the sweep effect */
  disabled?: boolean
  /** Animation delay in milliseconds */
  delay?: number
}

/**
 * Wrap a heading with a luminance sweep effect that triggers on scroll visibility.
 * Creates a metallic sheen that sweeps across the text when it enters the viewport.
 *
 * The effect uses a pseudo-element overlay with background-clip: text to create
 * the sheen effect without modifying the original text appearance.
 *
 * Usage:
 * ```tsx
 * <LuminanceSweep text="Your headline text here">
 *   <Heading>Your headline text here</Heading>
 * </LuminanceSweep>
 * ```
 *
 * To disable: Set `disabled={true}` or remove the wrapper.
 */
export function LuminanceSweep({
  children,
  text,
  className,
  disabled = false,
  delay = SWEEP_CONFIG.triggerDelay,
}: LuminanceSweepProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldSweep, setShouldSweep] = useState(false)
  const [sweepComplete, setSweepComplete] = useState(false)
  const hasTriggeredRef = useRef(false)

  // Observe visibility and trigger sweep once
  useEffect(() => {
    if (disabled || hasTriggeredRef.current) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true

          // Trigger sweep after delay
          setTimeout(() => {
            setShouldSweep(true)

            // Mark complete after animation finishes
            setTimeout(() => {
              setSweepComplete(true)
            }, SWEEP_CONFIG.animationDuration)
          }, delay)

          // Disconnect since we only trigger once
          observer.disconnect()
        }
      },
      { threshold: SWEEP_CONFIG.visibilityThreshold }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [disabled, delay])

  // If disabled, just render children
  if (disabled) {
    return <>{children}</>
  }

  return (
    <div
      ref={containerRef}
      className={clsx('luminance-sweep', className)}
      data-text={text}
      data-sweep={shouldSweep}
      data-sweep-complete={sweepComplete}
    >
      {children}
    </div>
  )
}
