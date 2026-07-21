import { clsx } from 'clsx/lite'
import Link from 'next/link'
import type { ComponentProps } from 'react'

/**
 * Glass Press primary CTA (design trial, round 2 variant 4 of the primary
 * button prototype in /prototypes/primary-button-prototype.html).
 *
 * Combine the frosted-glass surface (translucent blurred body, hairline
 * border, inset top sheen) with the tactile-press physics: the key rests
 * lifted 2px above a hard offset "ledge" shadow, rises to 3px on hover, and
 * drops onto the ledge when pressed.
 */
const GLASS_PRESS_CLASSES =
  // Shared skeleton: shape, type, blur surface, and press-motion transition
  'relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-xl px-5 py-2 text-sm/7 font-bold backdrop-blur-md backdrop-saturate-150 border transition-[translate,background-color,box-shadow,color] duration-150 ease-out -translate-y-0.5 hover:-translate-y-[3px] active:translate-y-px lg:min-h-10 ' +
  // Light scheme: dark-tinted glass with a dark ledge
  'border-mist-950/25 bg-mist-950/10 text-mist-950 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.4),0_4px_0_0_rgba(20,30,38,0.4)] hover:bg-mist-950/15 hover:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.45),0_5px_0_0_rgba(20,30,38,0.45)] active:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.4),0_1px_0_0_rgba(20,30,38,0.4)] ' +
  // Dark scheme: white-tinted glass with a frosted ledge
  'dark:border-white/30 dark:bg-white/[0.13] dark:text-white dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.35),0_4px_0_0_rgba(255,255,255,0.26)] dark:hover:bg-white/20 dark:hover:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.4),0_5px_0_0_rgba(255,255,255,0.3)] dark:active:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.35),0_1px_0_0_rgba(255,255,255,0.26)] ' +
  // Keyboard focus ring matching the porcelain treatment it replaces
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-700/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-mist-200/70 dark:focus-visible:ring-offset-mist-950'


export function GlassPressButtonLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link className={clsx(GLASS_PRESS_CLASSES, className)} data-glass-press-button="true" {...props}>
      {children}
    </Link>
  )
}
