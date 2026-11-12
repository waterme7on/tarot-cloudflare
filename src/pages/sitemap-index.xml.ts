import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE = (import.meta.env.SITE ?? 'https://randomtarot.site').replace(/\/$/, '');

export function urlset(urls: { loc: string; lastmod?: string; priority?: string }[]): Response {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}${u.priority ? `<priority>${u.priority}</priority>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}

export const GET: APIRoute = async () => {
  const maps = ['sitemap-pages.xml', 'sitemap-cards.xml', 'sitemap-spreads.xml', 'sitemap-questions.xml', 'sitemap-guides.xml'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps.map((m) => `  <sitemap><loc>${SITE}/${m}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};

export async function cardUrls() {
  return (await getCollection('cards')).map((c) => ({ loc: `/cards/${c.id}/`, lastmod: c.data.updatedAt }));
}
export async function spreadUrls() {
  return (await getCollection('spreads')).map((c) => ({ loc: `/spreads/${c.id}/`, lastmod: c.data.updatedAt }));
}
export async function questionUrls() {
  return (await getCollection('questions')).map((c) => ({ loc: `/questions/${c.id}/`, lastmod: c.data.updatedAt }));
}
export async function guideUrls() {
  return (await getCollection('guides')).filter((g) => !g.data.noindex).map((c) => ({ loc: `/${c.id}/`, lastmod: c.data.updatedAt }));
}
