/**
 * Preload animation-heavy components to reduce interaction latency on CTA hover.
 * Keep this in a shared module so client components can import it safely.
 */
export function preloadAnimationComponents() {
  void import('@/components/elements/blur-transition-text')
  void import('@/components/elements/magnetic-wrapper')
  void import('@/components/elements/gradient-border-wrapper')
  void import('@/components/elements/luminance-sweep')
}
