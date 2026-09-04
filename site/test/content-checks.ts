export interface ContentFinding {
  code: string;
  message: string;
}

export interface InjectionFinding {
  route: string;
  selector: string;
  source: 'hidden-content' | 'aria-label' | 'alt' | 'title';
  match: string;
}

const CHALLENGE_PATTERNS = [
  /verify (?:that )?you are human/i,
  /checking your browser/i,
  /captcha/i,
  /cf-chl-/i,
  /access denied/i,
];
const AUTH_PATTERNS = [
  /sign in to continue/i,
  /log in to continue/i,
  /authentication required/i,
  /<form[^>]+(?:login|sign-in|signin)/i,
];
const INJECTION_PATTERNS = [
  /ignore (?:all )?(?:previous|prior) instructions/i,
  /reveal (?:the )?(?:system|developer) prompt/i,
  /(?:system|developer) message:/i,
  /act as (?:the )?(?:system|assistant)/i,
  /(?:run|call|invoke) (?:the )?(?:tool|function)/i,
];

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    );
}

function stripNonContent(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

export function extractMainHtml(html: string): string | null {
  const matches = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi)];
  return matches.length === 1 ? matches[0][1] : null;
}

export function extractVisibleText(html: string): string {
  let withoutHidden = html;
  const hiddenElement = /<([a-z][\w:-]*)\b(?=[^>]*(?:\shidden(?=\s|=|>)|aria-hidden\s*=\s*["']true["']|style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)|class\s*=\s*["'][^"']*(?:sr-only|visually-hidden|offscreen)))[^>]*>[\s\S]*?<\/\1>/gi;
  let previous: string;
  do {
    previous = withoutHidden;
    withoutHidden = withoutHidden.replace(hiddenElement, ' ');
  } while (withoutHidden !== previous);
  return decodeEntities(stripNonContent(withoutHidden)).replace(/\s+/g, ' ').trim();
}

export function unicodeCharacterCount(value: string): number {
  return [...value].length;
}

export function detectChallenge(html: string, status: number): ContentFinding | null {
  const pattern = CHALLENGE_PATTERNS.find((candidate) => candidate.test(html));
  if (!pattern && ![403, 429, 503].includes(status)) return null;
  return {
    code: 'challenge-shell',
    message: pattern
      ? `A bot or WAF challenge matched ${pattern}.`
      : `HTTP ${status} is a likely denial or challenge response.`,
  };
}

export function detectAuthShell(html: string): ContentFinding | null {
  const pattern = AUTH_PATTERNS.find((candidate) => candidate.test(html));
  return pattern
    ? { code: 'auth-shell', message: `Public content was replaced by an auth shell matching ${pattern}.` }
    : null;
}

export function detectRedirectStub(html: string): ContentFinding | null {
  const hasMetaRefresh = /<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i.test(html);
  const hasScriptRedirect = /(?:window\.)?location(?:\.href|\.replace|\.assign)?\s*[=(]/i.test(html);
  const mainText = extractVisibleText(extractMainHtml(html) ?? '');
  return (hasMetaRefresh || hasScriptRedirect) && unicodeCharacterCount(mainText) < 200
    ? { code: 'redirect-stub', message: 'The route is a thin meta-refresh or JavaScript redirect stub.' }
    : null;
}

function canonicalUrls(html: string): string[] {
  return [...html.matchAll(/<link\b[^>]*rel\s*=\s*["'][^"']*\bcanonical\b[^"']*["'][^>]*>/gi)]
    .map(([tag]) => tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1])
    .filter((value): value is string => Boolean(value));
}

export function checkPublicDocument(input: {
  html: string;
  requestedUrl: string;
  responseUrl: string;
  status: number;
  canonicalUrl?: string;
  contentMarkers?: readonly string[];
  maxMainTextCharacters?: number;
}): ContentFinding[] {
  const findings: ContentFinding[] = [];
  const challenge = detectChallenge(input.html, input.status);
  const auth = detectAuthShell(input.html);
  const redirect = detectRedirectStub(input.html);
  if (challenge) findings.push(challenge);
  if (auth) findings.push(auth);
  if (redirect) findings.push(redirect);

  if (input.status !== 200) {
    findings.push({ code: 'unexpected-status', message: `Expected 200 but received ${input.status}.` });
  }
  const requested = new URL(input.requestedUrl);
  const response = new URL(input.responseUrl);
  if (requested.origin !== response.origin) {
    findings.push({ code: 'cross-origin-hop', message: `The route crossed origin to ${response.origin}.` });
  }
  if (requested.pathname !== response.pathname) {
    findings.push({ code: 'indirect-route', message: `The canonical route resolved indirectly to ${response.pathname}.` });
  }

  const main = extractMainHtml(input.html);
  if (main === null) {
    findings.push({ code: 'main-count', message: 'Expected exactly one main region.' });
    return findings;
  }
  const h1Count = (main.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) findings.push({ code: 'h1-count', message: `Expected one H1 but found ${h1Count}.` });
  const text = extractVisibleText(main);
  if (unicodeCharacterCount(text) < 100) {
    findings.push({ code: 'insubstantial-main', message: 'Visible main content has fewer than 100 characters.' });
  }
  const ceiling = input.maxMainTextCharacters ?? 100_000;
  if (unicodeCharacterCount(text) > ceiling) {
    findings.push({ code: 'text-ceiling', message: `Visible main content exceeds ${ceiling} Unicode characters.` });
  }
  for (const marker of input.contentMarkers ?? []) {
    if (!text.includes(marker)) findings.push({ code: 'missing-marker', message: `Missing main-content marker: ${marker}` });
  }

  const canonicals = canonicalUrls(input.html);
  if (canonicals.length !== 1) {
    findings.push({ code: 'canonical-count', message: `Expected one canonical but found ${canonicals.length}.` });
  } else if (new URL(canonicals[0], requested).toString() !== (input.canonicalUrl ?? requested.toString())) {
    findings.push({ code: 'indirect-canonical', message: `Canonical points to ${canonicals[0]}.` });
  }
  return findings;
}

export function checkRecoveryDocument(
  html: string,
  status: number,
  options: { intentionallyRetired?: boolean } = {},
): ContentFinding[] {
  const findings: ContentFinding[] = [];
  const expectedStatus = options.intentionallyRetired ? 410 : 404;
  if (status !== expectedStatus) {
    findings.push({
      code: 'soft-404',
      message: options.intentionallyRetired
        ? `The intentionally retired route returned ${status}, not 410.`
        : `The unknown route returned ${status}, not 404.`,
    });
  }
  const namedInternalLinks = [...html.matchAll(/<a\b[^>]*href\s*=\s*["'](\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .filter((match) => extractVisibleText(match[2]).length > 0);
  if (namedInternalLinks.length === 0) {
    findings.push({ code: 'missing-recovery-link', message: 'The error page has no named internal recovery link.' });
  }
  return findings;
}

function sourceName(attribute: string): InjectionFinding['source'] {
  if (attribute === 'aria-label') return 'aria-label';
  if (attribute === 'alt') return 'alt';
  if (attribute === 'title') return 'title';
  return 'hidden-content';
}

export function scanHiddenInstructionInjection(html: string, route: string): InjectionFinding[] {
  const candidates: Array<{ selector: string; source: InjectionFinding['source']; value: string }> = [];
  let elementIndex = 0;
  for (const match of html.matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) {
    elementIndex += 1;
    const [, tag, attributes] = match;
    const selector = `${tag.toLowerCase()}:nth-of-type(${elementIndex})`;
    for (const attribute of ['aria-label', 'alt', 'title'] as const) {
      const value = attributes.match(new RegExp(`${attribute}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
      if (value) candidates.push({ selector, source: sourceName(attribute), value: decodeEntities(value) });
    }
  }

  elementIndex = 0;
  for (const match of html.matchAll(/<([a-z][\w:-]*)\b([^>]*(?:\bhidden\b|aria-hidden\s*=\s*["']true["']|display\s*:\s*none|visibility\s*:\s*hidden|sr-only|visually-hidden|offscreen)[^>]*)>([\s\S]*?)<\/\1>/gi)) {
    elementIndex += 1;
    candidates.push({
      selector: `${match[1].toLowerCase()}:hidden-match(${elementIndex})`,
      source: 'hidden-content',
      value: decodeEntities(stripNonContent(match[3])).replace(/\s+/g, ' ').trim(),
    });
  }

  return candidates.flatMap((candidate) =>
    INJECTION_PATTERNS.flatMap((pattern) => {
      const match = candidate.value.match(pattern)?.[0];
      return match ? [{ route, selector: candidate.selector, source: candidate.source, match }] : [];
    }),
  );
}
