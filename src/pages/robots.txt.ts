// robots.txt по флагу PUBLIC_INDEXING: на тестовой площадке индексация запрещена целиком.
import type { APIRoute } from 'astro';
import { PUBLIC_INDEXING } from 'astro:env/server';

export const GET: APIRoute = ({ site }) => {
  const body = PUBLIC_INDEXING
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
