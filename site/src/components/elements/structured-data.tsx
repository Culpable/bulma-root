type StructuredDataNode = Record<string, unknown>

/**
 * Serialise JSON-LD without allowing data to terminate or alter the script element.
 */
export function serialiseStructuredData(graph: StructuredDataNode[]) {
  return JSON.stringify(graph)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

/**
 * Emit a static JSON-LD graph that crawlers can parse without JavaScript.
 */
export function StructuredData({ graph }: { graph: StructuredDataNode[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialiseStructuredData(graph) }} />
}
