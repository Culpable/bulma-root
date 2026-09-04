/**
 * Resolve mist palette steps to sRGB triples for WebGL uniforms.
 *
 * `globals.css` owns the colours as oklch custom properties. WebGL needs RGB,
 * so the browser converts through a 2D canvas `fillStyle` round-trip; the
 * precomputed sRGB table is only a fallback for browsers that cannot parse
 * oklch. Keep every shader colour derived from these steps: no off-palette hues.
 */

export type MistStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

// Precomputed sRGB equivalents of the oklch ramp in globals.css (fallback only).
const FALLBACK_HEX: Record<MistStep, string> = {
  50: '#f9fbfb',
  100: '#f1f3f3',
  200: '#e3e7e8',
  300: '#d0d6d8',
  400: '#9ca8ab',
  500: '#67787c',
  600: '#4b585b',
  700: '#394447',
  800: '#22292b',
  900: '#161b1d',
  950: '#090b0c',
}

let probeContext: CanvasRenderingContext2D | null | undefined

// Return the sRGB hex for a mist step, converted live from the CSS token when the browser can.
export function mistHex(step: MistStep): string {
  if (typeof window === 'undefined') return FALLBACK_HEX[step]

  const token = getComputedStyle(document.documentElement).getPropertyValue(`--color-mist-${step}`).trim()
  if (!token) return FALLBACK_HEX[step]

  if (probeContext === undefined) {
    probeContext = document.createElement('canvas').getContext('2d')
  }
  if (!probeContext) return FALLBACK_HEX[step]

  // Canvas normalises any parsable opaque colour to #rrggbb on read-back.
  probeContext.fillStyle = '#000000'
  probeContext.fillStyle = token
  const resolved = probeContext.fillStyle
  return /^#[0-9a-f]{6}$/i.test(resolved) ? resolved : FALLBACK_HEX[step]
}


// Return the mist step as a 0..1 RGB triple.
export function mistRgb(step: MistStep): [number, number, number] {
  const hex = mistHex(step).slice(1)
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ]
}
