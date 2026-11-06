import type { DrawnCard } from '../lib/schema';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 1200x630 Open Graph image. Never includes the user's question.
export function renderShareSvg(input: { cards: DrawnCard[]; headline: string; siteName: string }): string {
  const cards = input.cards.slice(0, 3);
  const cardW = 180;
  const gap = 24;
  const totalW = cards.length * cardW + (cards.length - 1) * gap;
  const startX = (1200 - totalW) / 2;
  const cardSvg = cards
    .map((c, i) => {
      const x = startX + i * (cardW + gap);
      const rot = c.orientation === 'reversed' ? `rotate(180 ${x + cardW / 2} 300)` : '';
      return `
      <g transform="${rot}">
        <rect x="${x}" y="150" width="${cardW}" height="300" rx="14" fill="#1b1533" stroke="#c9a85c" stroke-width="3"/>
        <circle cx="${x + cardW / 2}" cy="270" r="48" fill="none" stroke="#c9a85c" stroke-width="2"/>
        <text x="${x + cardW / 2}" y="278" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#e8dcc0">${esc(c.name.split(' ').map((w) => w[0]).join(''))}</text>
      </g>
      <text x="${x + cardW / 2}" y="490" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#e8dcc0">${esc(c.name)}</text>
      <text x="${x + cardW / 2}" y="514" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#a99bc9">${esc(c.positionLabel)} · ${c.orientation}</text>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f0c1d"/><stop offset="1" stop-color="#2a1f4a"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="90" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#e8dcc0">${esc(input.headline).slice(0, 60)}</text>
  ${cardSvg}
  <text x="600" y="580" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#c9a85c">${esc(input.siteName)} · Free tarot card generator</text>
</svg>`;
}
