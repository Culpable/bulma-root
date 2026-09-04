import { expect, test } from '@playwright/test';

import {
  blockExternalRequests,
  discoverBuiltHtmlRoutes,
} from './agent-accessibility.routes';
import {
  AGENT_READINESS_ROUTES,
  DEFAULT_MAX_MAIN_TEXT_CHARACTERS,
  UNKNOWN_ROUTE,
  USER_TRIGGERED_AGENT_USER_AGENTS,
} from './agent-readiness.config';
import {
  checkPublicDocument,
  checkRecoveryDocument,
  extractMainHtml,
  extractVisibleText,
  scanHiddenInstructionInjection,
} from './content-checks';

const routeConfiguration = new Map(AGENT_READINESS_ROUTES.map((item) => [item.route, item]));

function visibleDocumentEvidence(html: string, contentMarkers: readonly string[] = []) {
  const main = extractMainHtml(html) ?? '';
  const mainText = extractVisibleText(main);
  const h1 = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
  return {
    h1: extractVisibleText(h1),
    contentMarkers: contentMarkers.filter((marker) => mainText.includes(marker)),
  };
}

for (const route of discoverBuiltHtmlRoutes().filter((route) => route !== '/404.html')) {
  test(`${route} is substantive and readable without JavaScript`, async ({ browser, baseURL }) => {
    const requestedUrl = new URL(route, baseURL).toString();
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await blockExternalRequests(page);
    const response = await page.goto(requestedUrl, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const config = routeConfiguration.get(route);
    const findings = checkPublicDocument({
      html,
      requestedUrl,
      responseUrl: response?.url() ?? page.url(),
      status: response?.status() ?? 0,
      canonicalUrl: new URL(route, 'https://bulma.com.au').toString(),
      contentMarkers: config?.contentMarkers,
      maxMainTextCharacters: config?.maxMainTextCharacters ?? DEFAULT_MAX_MAIN_TEXT_CHARACTERS,
    });
    expect(findings, JSON.stringify(findings, null, 2)).toEqual([]);
    expect(scanHiddenInstructionInjection(html, route), 'Every finding requires human review.').toEqual([]);
    await context.close();
  });

  for (const userAgent of USER_TRIGGERED_AGENT_USER_AGENTS) {
    test(`${route} has browser parity for ${userAgent}`, async ({ request, baseURL }) => {
      const requestedUrl = new URL(route, baseURL).toString();
      const config = routeConfiguration.get(route);
      const browserResponse = await request.get(route);
      const agentResponse = await request.get(route, { headers: { 'user-agent': userAgent } });
      expect(agentResponse.status()).toBe(browserResponse.status());
      expect(agentResponse.headers()['content-type']).toBe(browserResponse.headers()['content-type']);
      const browserHtml = await browserResponse.text();
      const agentHtml = await agentResponse.text();
      const documentCheck = {
        requestedUrl,
        canonicalUrl: new URL(route, 'https://bulma.com.au').toString(),
        contentMarkers: config?.contentMarkers,
        maxMainTextCharacters: config?.maxMainTextCharacters ?? DEFAULT_MAX_MAIN_TEXT_CHARACTERS,
      };
      const browserFindings = checkPublicDocument({
        ...documentCheck,
        html: browserHtml,
        responseUrl: browserResponse.url(),
        status: browserResponse.status(),
      });
      const agentFindings = checkPublicDocument({
        ...documentCheck,
        html: agentHtml,
        responseUrl: agentResponse.url(),
        status: agentResponse.status(),
      });
      expect(
        browserFindings,
        JSON.stringify({ userAgent, surface: 'browser', browserFindings }, null, 2),
      ).toEqual([]);
      expect(
        agentFindings,
        JSON.stringify({ userAgent, surface: 'agent', agentFindings }, null, 2),
      ).toEqual([]);
      const browserEvidence = visibleDocumentEvidence(browserHtml, config?.contentMarkers);
      const agentEvidence = visibleDocumentEvidence(agentHtml, config?.contentMarkers);
      expect(browserEvidence.h1, 'The browser response must have a visible H1.').not.toBe('');
      expect(
        agentEvidence,
        'Agent and browser responses must expose the same visible H1 and markers.',
      ).toEqual(browserEvidence);
    });
  }
}

test('an unknown route returns a recoverable real error', async ({ request }) => {
  const response = await request.get(UNKNOWN_ROUTE);
  expect(checkRecoveryDocument(await response.text(), response.status())).toEqual([]);
});
