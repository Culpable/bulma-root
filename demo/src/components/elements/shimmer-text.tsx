'use client'

import { clsx } from 'clsx/lite'

interface ShimmerTextProps {
  /** The static text to display */
  text: string
  /** Additional class names for the container */
  className?: string
}

/**
 * Static text component with an animated gradient shimmer effect.
 * The shimmer sweeps across the text continuously, adding visual interest
 * without any layout shift or text changes.
 *
 * Uses CSS background-clip: text with an animated gradient position.
 * The gradient uses explicit colors rather than currentColor because
 * text-transparent makes currentColor resolve to transparent.
 */
export function ShimmerText({ text, className }: ShimmerTextProps) {
  return (
    <span
      className={clsx(
        'inline-block bg-clip-text text-transparent',
        // Extended gradient width for smooth animation
        'bg-[length:200%_100%]',
        // Animation for the shimmer sweep
        'animate-[shimmer_3s_ease-in-out_infinite]',
        className
      )}
      style={{
        // Gradient with explicit colors: base text color with a bright shimmer highlight
        // Uses dark gray for light mode, with the shimmer providing contrast
        // In dark mode contexts, the parent should set appropriate colors via CSS
        backgroundImage:
          'linear-gradient(90deg, #1f2937 0%, #1f2937 40%, #60a5fa 50%, #1f2937 60%, #1f2937 100%)',
      }}
    >
      {text}
    </span>
  )
}
