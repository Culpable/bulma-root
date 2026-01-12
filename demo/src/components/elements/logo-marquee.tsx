'use client'

import { clsx } from 'clsx/lite'
import { Children, type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react'

/**
 * Configuration for the logo marquee animation.
 * Adjust these values to fine-tune the visual effect.
 */
const MARQUEE_CONFIG = {
  /** Base duration for one complete scroll cycle (seconds) */
  baseDuration: 30,
  /** Gap between logo items (Tailwind spacing scale) */
  gap: 16,
  /** Pause animation on hover for accessibility */
  pauseOnHover: true,
}

/**
 * Individual logo wrapper for consistent sizing and spacing within the marquee.
 * Maintains aspect ratio and provides hover opacity feedback.
 */
export function MarqueeLogo({
  children,
  className,
  ...props
}: {
  children: ReactNode
} & ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center px-8',
        'opacity-70 transition-opacity duration-300 hover:opacity-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Infinite scrolling logo marquee component.
 *
 * Creates a continuously scrolling horizontal display of logos that loops
 * seamlessly. Logos are duplicated to create the infinite scroll illusion.
 *
 * Features:
 * - Smooth, continuous horizontal scroll animation
 * - Pauses on hover for accessibility
 * - Respects reduced motion preferences
 * - Seamless loop with no visible seam
 *
 * @example
 * ```tsx
 * <LogoMarquee>
 *   <MarqueeLogo><Image src="/logo1.svg" /></MarqueeLogo>
 *   <MarqueeLogo><Image src="/logo2.svg" /></MarqueeLogo>
 * </LogoMarquee>
 * ```
 */
export function LogoMarquee({
  children,
  className,
  speed = 1,
  direction = 'left',
  pauseOnHover = MARQUEE_CONFIG.pauseOnHover,
  ...props
}: {
  children: ReactNode
  /** Speed multiplier (1 = normal, 2 = twice as fast, 0.5 = half speed) */
  speed?: number
  /** Scroll direction */
  direction?: 'left' | 'right'
  /** Whether to pause animation on hover */
  pauseOnHover?: boolean
} & ComponentProps<'div'>) {
  // Track visibility to pause animation when scrolled off-screen (performance optimisation)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Set up IntersectionObserver to track when the marquee enters/exits the viewport.
  // When off-screen, we pause the CSS animation to reduce GPU/compositor overhead.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // Calculate animation duration based on speed multiplier
  const duration = MARQUEE_CONFIG.baseDuration / speed

  // Convert children to array for duplication
  const childArray = Children.toArray(children)

  // Duplicate children to create seamless loop (need at least 2 copies)
  const duplicatedChildren = [...childArray, ...childArray]

  return (
    <div
      ref={containerRef}
      className={clsx(
        'logo-marquee-container relative w-full overflow-hidden',
        // Fade edges for smoother visual blend
        'before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-16 before:bg-gradient-to-r before:from-mist-100 before:to-transparent dark:before:from-mist-950',
        'after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-16 after:bg-gradient-to-l after:from-mist-100 after:to-transparent dark:after:from-mist-950',
        className
      )}
      {...props}
    >
      <div
        className={clsx(
          'logo-marquee-track flex w-max items-center',
          direction === 'left' ? 'logo-marquee-scroll-left' : 'logo-marquee-scroll-right',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
        style={{
          '--marquee-duration': `${duration}s`,
          // Pause animation when off-screen to save compositor resources
          animationPlayState: isVisible ? 'running' : 'paused',
        } as React.CSSProperties}
      >
        {duplicatedChildren}
      </div>
    </div>
  )
}
