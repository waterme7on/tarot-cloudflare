import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

describe('mobile-first SEO regression', () => {
  it('keeps the initial reading page in normal mobile document flow', () => {
    const css = source('public/mobile-ritual.css');
    expect(css).toContain('body:has(.ritual-app:not(.ritual-prepare))');
    expect(css).not.toContain('body:has(.ritual-app),');
    expect(css).toContain('.ritual-app.ritual-prepare .ritual-scroll{overflow:visible');
    expect(css).toContain('position:relative;inset:auto');
    expect(css).toContain('.reading-app.ritual-reveal-screen');
  });

  it('preserves server-rendered page content and semantic headings', () => {
    const home = source('src/pages/index.astro');
    const free = source('src/pages/free-tarot-reading.astro');
    expect(home).toContain('<h1>Tarot Card Generator</h1>');
    expect(home).toContain('<section class="prose">');
    expect(home).toContain('What is a tarot card generator?');
    expect(home).toContain('title="Tarot Card Generator – Free Random Tarot Card Draw"');
    expect(home).toContain('How to use the random tarot card generator');
    expect(home).toContain('Are random tarot cards accurate?');
    expect(home).toContain('All 78 tarot card meanings');
    expect(home).toContain('Explore by topic');
    expect(home).toContain('breadcrumbLd(site');
    expect(home).toContain('webAppLd(site)');
    expect(home).toContain('<Faq items={faq} />');
    expect(home).toContain('<SeoLinks');
    expect(free).toContain('<h1>Free Tarot Reading</h1>');
    expect(free).toContain('<section class="prose">');
    expect(free).toContain('breadcrumbLd(site');
    expect(free).toContain('<Faq items={faq} />');
    expect(source('src/components/DrawTool.tsx')).toContain('<div id="result">');
    expect(source('src/components/RitualDraw.tsx')).toContain('<div id="result">');
  });

  it('keeps the production host aligned across build, runtime and robots', () => {
    const host = 'https://randomtarot.site';
    const astro = source('astro.config.mjs');
    const wrangler = source('wrangler.jsonc');
    const robots = source('public/robots.txt');
    const middleware = source('src/middleware.ts');
    expect(astro).toContain(host);
    expect(middleware).toContain("hostname === 'www.randomtarot.site'");
    expect(middleware).toContain("protocol === 'http:'");
    expect(wrangler).toContain(`"SITE_URL": "${host}"`);
    expect(robots).toContain(`Sitemap: ${host}/sitemap-index.xml`);
    for (const file of [astro, wrangler, robots]) expect(file).not.toContain('waterme7on333');
  });

  it('uses one brand mark and icon set across every page', () => {
    const base = source('src/layouts/Base.astro');
    expect(base).toContain('aria-label="RandomTarot home"');
    expect(base).toContain("name: 'RandomTarot'");
    expect(source('README.md')).toContain('# RandomTarot');
    expect(base).toContain('/brand/logo-horizontal-dark.svg');
    expect(base).toContain('/apple-touch-icon.png');
    expect(base).toContain('/favicon.svg');
  });

  it('serves the new topic pages and legacy redirects', () => {
    const reversed = source('src/pages/reversed-tarot-cards.astro');
    const readings = source('src/pages/readings.astro');
    const middleware = source('src/middleware.ts');
    const sitemap = source('src/pages/sitemap-pages.xml.ts');
    expect(reversed).toContain('<h1>Reversed Tarot Cards</h1>');
    expect(readings).toContain('<h1>Deep Tarot Readings</h1>');
    expect(middleware).toContain("'/tarot-card-meanings': '/cards/'");
    expect(middleware).toContain("'/one-card-tarot': '/spreads/one-card/'");
    expect(middleware).toContain("'/three-card-tarot': '/spreads/three-card/'");
    expect(middleware).toContain("'/love-tarot': '/questions/love/'");
    expect(sitemap).toContain('/reversed-tarot-cards/');
    expect(sitemap).toContain('/readings/');
  });

  it('ships the short-URL redirects and the new reading pages', () => {
    const middleware = source('src/middleware.ts');
    for (const [from, to] of [['/tarot-card-meanings', '/cards/'], ['/one-card-tarot', '/spreads/one-card/'], ['/three-card-tarot', '/spreads/three-card/'], ['/love-tarot', '/questions/love/']]) {
      expect(middleware).toContain(`'${from}': '${to}'`);
    }
    const reversed = source('src/pages/reversed-tarot-cards.astro');
    expect(reversed).toContain('<h1>Reversed Tarot Cards</h1>');
    expect(reversed).toContain('five ways');
    const readings = source('src/pages/readings.astro');
    expect(readings).toContain('<h1>Deep Tarot Readings</h1>');
    expect(readings).toContain('$4.99');
    const sitemap = source('src/pages/sitemap-pages.xml.ts');
    expect(sitemap).toContain('/reversed-tarot-cards/');
    expect(sitemap).toContain('/readings/');
    const home = source('src/pages/index.astro');
    expect(home).toContain('href="/one-card-tarot/"');
    expect(home).toContain('href="/reversed-tarot-cards/"');
  });

  it('loads Minilytics only in production and allows it in the CSP', () => {
    const base = source('src/layouts/Base.astro');
    const middleware = source('src/middleware.ts');
    const privacy = source('src/content/guides/privacy.md');
    expect(base).toContain('data-website-id="5j036o0j5i5t5x2g"');
    expect(base).toContain('!isPreview && import.meta.env.PROD');
    expect(middleware).toContain('https://analytics.yololab.cc');
    expect(privacy).toContain('Minilytics');
    expect(privacy).toContain('ml_vid');
    const draw = source('src/components/DrawTool.tsx');
    const ritual = source('src/components/RitualDraw.tsx');
    const result = source('src/components/CardResult.tsx');
    expect(draw).toContain("'goal', 'draw'");
    expect(ritual).toContain("'goal', 'draw'");
    expect(result).toContain('data-ml-goal="report_unlock"');
    expect(result).toContain('attribution?.ml_visitor_id');
    expect(source('src/pages/api/v1/webhooks/waffo.ts')).toContain('recordMinilyticsPayment');
  });

  it('retains canonical, robots, structured data and sitemap paths', () => {
    const base = source('src/layouts/Base.astro');
    expect(base).toContain('<title>{title}</title>');
    expect(base).toContain('<link rel="canonical" href={canonicalUrl} />');
    expect(base).toContain('noindex, nofollow');
    expect(base).toContain('application/ld+json');
    expect(base).toContain('<meta name="description" content={description} />');
    const sitemap = source('src/pages/sitemap-index.xml.ts');
    expect(sitemap).toContain('sitemap-cards.xml');
    expect(sitemap).toContain('sitemap-pages.xml');
    expect(sitemap).toContain('sitemap-questions.xml');
    const robots = source('public/robots.txt');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Disallow: /reading/');
    expect(robots).toContain('Sitemap: https://randomtarot.site/sitemap-index.xml');
  });
});
