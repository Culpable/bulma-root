/**
 * Serialise a JSON-LD graph for safe inline embedding in a `<script>` element.
 *
 * Escape the characters that could otherwise close the script element early or break
 * JavaScript string parsing. `<` and `>` prevent an injected `</script>`; `&` prevents
 * HTML entity re-interpretation; U+2028 and U+2029 are line terminators that are legal
 * in JSON but not in a JavaScript string literal.
 */
export function serialiseJsonLd(graph: unknown): string {
  return JSON.stringify(graph)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
