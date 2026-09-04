import assert from 'node:assert/strict';
import test from 'node:test';

import { htmlDocumentResponse, HTML_CONTENT_TYPE } from '../src/lib/agent-readable-http/document-response.ts';

test('HTML responses add the UTF-8 charset without dropping source validators', async () => {
  const request = new Request('https://example.com/');
  const source = new Response('<!doctype html><title>Example</title>', {
    headers: {
      'content-type': 'text/html',
      etag: '"asset-validator"',
    },
  });

  const response = htmlDocumentResponse(request, source);

  assert.equal(response.headers.get('content-type'), HTML_CONTENT_TYPE);
  assert.equal(response.headers.get('etag'), '"asset-validator"');
  assert.match(response.headers.get('vary') ?? '', /Accept/i);
  assert.equal(await response.text(), '<!doctype html><title>Example</title>');
});
