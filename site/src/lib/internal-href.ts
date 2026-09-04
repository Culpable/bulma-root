/**
 * Normalise an internal link target to the site's `trailingSlash: 'always'` form.
 *
 * The previous Next.js build set `trailingSlash: true`, which rewrote every
 * internal `href` at build time, so page source could write `/contact` and the
 * shipped HTML still carried `/contact/`. Astro performs no such rewrite: a JSX
 * `href` reaches the document exactly as written. Without this normaliser the
 * ported source emits `/contact`, every click costs a `307` round trip to
 * `/contact/`, and the rendered link targets stop matching production.
 *
 * Only root-relative document paths are rewritten. External URLs, protocol
 * links such as `mailto:` and `tel:`, protocol-relative URLs, pure fragments,
 * and paths that already end in a slash or name a file extension are returned
 * untouched. A query string or fragment is preserved and the slash is inserted
 * before it.
 */
export function resolveInternalHref(href: string): string {
  // Leave anything that is not a root-relative path to its own owner.
  if (!href.startsWith('/') || href.startsWith('//')) return href

  const separatorIndex = (() => {
    const query = href.indexOf('?')
    const hash = href.indexOf('#')
    if (query === -1) return hash
    if (hash === -1) return query
    return Math.min(query, hash)
  })()

  const path = separatorIndex === -1 ? href : href.slice(0, separatorIndex)
  const suffix = separatorIndex === -1 ? '' : href.slice(separatorIndex)

  // An empty path means a same-page link such as `/#lenders`; the site root
  // already carries its slash, so only the suffix matters.
  if (path === '' || path.endsWith('/')) return href

  // A final segment containing a dot names a file, not a route. Static assets
  // such as `/img/og/bulma-og-image.png` must never gain a trailing slash.
  const finalSegment = path.slice(path.lastIndexOf('/') + 1)
  if (finalSegment.includes('.')) return href

  return `${path}/${suffix}`
}
