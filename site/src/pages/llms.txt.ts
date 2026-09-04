import type { APIRoute } from 'astro';

import { llmsDocument } from '../config/llms';
import { renderLlmsTxt } from '../lib/llms';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(renderLlmsTxt(llmsDocument), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
