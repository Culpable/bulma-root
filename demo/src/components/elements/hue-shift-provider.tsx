'use client'

import type { ReactNode } from 'react'
import { useHueShift } from '@/hooks/use-hue-shift'

/**
 * Props for HueShiftProvider component.
 */
interface HueShiftProviderProps {
  /** Content to render */
  children: ReactNode
  /** Whether hue shift is enabled (default: true) */
  enabled?: boolean
}

/**
 * Provider component that enables smooth hue shift between sections.
 * Place this at the layout level to track section visibility and
 * update the --accent-hue-shift CSS custom property.
 *
 * Sections should use data-section-hue attribute to participate:
 * - data-section-hue="hero"
 * - data-section-hue="features"
 * - data-section-hue="stats"
 * - data-section-hue="testimonials"
 * - data-section-hue="pricing"
 * - data-section-hue="faqs"
 * - data-section-hue="cta"
 *
 * Elements that should respond to hue shift can use:
 * - class="hue-shift-accent" (applies filter: hue-rotate)
 * - class="hue-shift-bg" (applies background gradient with hue)
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <HueShiftProvider>
 *           <Navbar />
 *           <main>{children}</main>
 *           <Footer />
 *         </HueShiftProvider>
 *       </body>
 *     </html>
 *   )
 * }
 *
 * // In page sections
 * <section data-section-hue="features" className="hue-shift-bg">
 *   ...
 * </section>
 * ```
 */
export function HueShiftProvider({
  children,
  enabled = true,
}: HueShiftProviderProps) {
  // Initialize hue shift tracking
  useHueShift({ enabled })

  return <>{children}</>
}
