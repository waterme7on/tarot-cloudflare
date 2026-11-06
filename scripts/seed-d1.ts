import { mkdirSync, writeFileSync } from 'node:fs';
import { ALL_CARDS } from '../src/data/cards';

function q(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

const now = new Date().toISOString();
const rows = ALL_CARDS.map((c) =>
  `INSERT OR REPLACE INTO cards (id, slug, name, arcana, suit, number, upright_json, reversed_json, love_json, career_json, money_json, yes_no, image_key, seo_title, seo_description, content_version, updated_at) VALUES (${[
    q(c.id),
    q(c.slug),
    q(c.name),
    q(c.arcana),
    q(c.suit),
    c.number,
    q(JSON.stringify(c.upright)),
    q(JSON.stringify(c.reversed)),
    q(JSON.stringify(c.love)),
    q(JSON.stringify(c.career)),
    q(JSON.stringify(c.money)),
    q(c.yesNo),
    q(`cards/${c.slug}.png`),
    q(`${c.name} Tarot Card Meaning`),
    q(`${c.name}: ${c.upright.summary}`.slice(0, 160)),
    1,
    q(now),
  ].join(', ')});`,
);

mkdirSync('migrations/seed', { recursive: true });
writeFileSync('migrations/seed/cards.sql', rows.join('\n') + '\n');
console.log(`wrote migrations/seed/cards.sql with ${rows.length} cards`);
