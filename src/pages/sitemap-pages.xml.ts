import type { APIRoute } from 'astro';
import { urlset, cardUrls, spreadUrls, questionUrls, guideUrls } from './sitemap-index.xml';

export const prerender = true;

export const GET: APIRoute = async () => urlset([{ loc: '/', priority: '1.0' }, { loc: '/free-tarot-reading/', priority: '0.9' }, { loc: '/cards/', priority: '0.8' }]);
