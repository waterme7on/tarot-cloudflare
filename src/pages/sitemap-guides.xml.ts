import type { APIRoute } from 'astro';
import { urlset, cardUrls, spreadUrls, questionUrls, guideUrls } from './sitemap-index.xml';

export const prerender = true;

export const GET: APIRoute = async () => urlset(await guideUrls());
