import {
  htmlDocumentResponse,
  markdownDocumentResponse,
  markdownNotFound,
  notAcceptableResponse,
  selectForRequest,
} from './document-response.ts';
import {
  INTERNAL_MARKDOWN_PREFIX,
  routeToInternalMarkdownPath,
} from './internal-path.ts';

const FIXED_MACHINE_PATHS = new Set(['/llms.txt', '/robots.txt', '/sitemap.xml']);
const ASSET_EXTENSION = /\.(?:avif|css|gif|ico|jpe?g|js|json|map|mjs|pdf|png|svg|txt|webmanifest|webp|woff2?|xml)$/i;

export interface NegotiatedAssetFetcher {
  (request: Request): Promise<Response>;
}

export function isDocumentPath(pathname: string): boolean {
  return !FIXED_MACHINE_PATHS.has(pathname) && !ASSET_EXTENSION.test(pathname);
}

export async function handleNegotiatedDocument(input: {
  request: Request;
  fetchPublicAsset: NegotiatedAssetFetcher;
  fetchInternalAsset: NegotiatedAssetFetcher;
}): Promise<Response> {
  const url = new URL(input.request.url);
  if (url.pathname.startsWith(INTERNAL_MARKDOWN_PREFIX)) {
    return new Response('Not found\n', { status: 404 });
  }
  if (!['GET', 'HEAD'].includes(input.request.method) || !isDocumentPath(url.pathname)) {
    return input.fetchPublicAsset(input.request);
  }

  const html = await input.fetchPublicAsset(input.request);
  const selection = selectForRequest(input.request);
  if (selection === null) return notAcceptableResponse(input.request);
  if (selection === 'html') return htmlDocumentResponse(input.request, html);

  const internalPath = html.status === 404
    ? `${INTERNAL_MARKDOWN_PREFIX}404.md`
    : routeToInternalMarkdownPath(url.pathname);
  const internalUrl = new URL(internalPath, url);
  const markdownAsset = await input.fetchInternalAsset(new Request(internalUrl, {
    method: 'GET',
  }));
  if (!markdownAsset.ok) {
    const body = markdownNotFound(url.origin);
    return markdownDocumentResponse(input.request, body, 404, html.headers);
  }
  return markdownDocumentResponse(input.request, await markdownAsset.text(), html.status, html.headers);
}
