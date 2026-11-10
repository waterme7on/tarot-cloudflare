import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_CARDS, getCard } from '../src/data/cards';
import { PUBLISHED_CARD_SLUGS } from '../src/data/card-pages';

const root = 'src/content';
const errors: string[] = [];
const REQUIRED_CARD_SECTIONS = ['## Upright', '## Reversed', '## Love', '## Career', '## Money', '## Yes or No'];
const PLACEHOLDERS = [/lorem ipsum/i, /\bTODO\b/, /\bTBD\b/, /\(Example body/];

function parseFrontmatter(src: string): { fm: string; body: string } {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('missing frontmatter');
  return { fm: m[1]!, body: m[2]! };
}

function listMd(dir: string): string[] {
  return readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(root, dir, f));
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function slugsIn(fm: string, key: string): string[] {
  const m = fm.match(new RegExp(`^${key}:\\s*\\[(.*)\\]`, 'm'));
  if (!m) return [];
  return m[1]!.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

// Deck integrity
if (ALL_CARDS.length !== 78) errors.push(`deck has ${ALL_CARDS.length} cards, expected 78`);
const slugSet = new Set<string>();
for (const c of ALL_CARDS) {
  if (slugSet.has(c.slug)) errors.push(`duplicate slug ${c.slug}`);
  slugSet.add(c.slug);
  for (const o of ['upright', 'reversed'] as const) {
    if (c[o].keywords.length < 3) errors.push(`${c.slug} ${o} needs ≥3 keywords`);
    if (c[o].summary.length < 40) errors.push(`${c.slug} ${o} summary too short`);
    if (c[o].action.length < 20) errors.push(`${c.slug} ${o} action too short`);
  }
  for (const ctx of ['love', 'career', 'money'] as const) {
    if (c[ctx].upright.length < 30 || c[ctx].reversed.length < 30) errors.push(`${c.slug} ${ctx} context too short`);
  }
}

// Artwork
import artwork from '../src/data/artwork.json';
const artSet = new Set(artwork as string[]);
for (const c of ALL_CARDS) if (!artSet.has(c.slug)) errors.push(`missing artwork for ${c.slug}`);

// Card pages
const cardFiles = listMd('cards');
if (cardFiles.length < 30) errors.push(`expected ≥30 card pages, found ${cardFiles.length}`);
for (const file of cardFiles) {
  const slug = file.split('/').pop()!.replace(/\.md$/, '');
  if (!getCard(slug)) errors.push(`${file}: slug not in deck`);
  const { fm, body } = parseFrontmatter(readFileSync(file, 'utf8'));
  const wc = wordCount(body);
  if (wc < 600 || wc > 1100) errors.push(`${file}: body ${wc} words (want 600–1100)`);
  for (const s of REQUIRED_CARD_SECTIONS) if (!body.includes(s)) errors.push(`${file}: missing section "${s}"`);
  for (const p of PLACEHOLDERS) if (p.test(body)) errors.push(`${file}: placeholder text ${p}`);
  const related = slugsIn(fm, 'relatedCards');
  if (related.length < 2) errors.push(`${file}: need ≥2 relatedCards`);
  for (const r of related) if (!getCard(r)) errors.push(`${file}: relatedCards has unknown slug ${r}`);
  if (related.includes(slug)) errors.push(`${file}: links to itself`);
  if (slugsIn(fm, 'relatedSpreads').length < 1) errors.push(`${file}: need ≥1 relatedSpreads`);
  if (slugsIn(fm, 'relatedQuestions').length < 1) errors.push(`${file}: need ≥1 relatedQuestions`);
  if (!/^updatedAt:/m.test(fm)) errors.push(`${file}: missing updatedAt`);
  const desc = fm.match(/^description:\s*"(.*)"/m)?.[1] ?? '';
  if (desc.length < 80 || desc.length > 170) errors.push(`${file}: description ${desc.length} chars`);
}

const pageSlugs = new Set(cardFiles.map((file) => file.split('/').pop()!.replace(/\.md$/, '')));
const linkedSlugs = new Set(PUBLISHED_CARD_SLUGS);
if (linkedSlugs.size !== PUBLISHED_CARD_SLUGS.length) errors.push('card-pages list has duplicate slugs');
for (const slug of pageSlugs) if (!linkedSlugs.has(slug)) errors.push(`card-pages list is missing published page ${slug}`);
for (const slug of linkedSlugs) if (!pageSlugs.has(slug)) errors.push(`card-pages list links to unpublished page ${slug}`);

// Spreads, questions, guides
for (const [dir, min, expected] of [
  ['spreads', 500, 3],
  ['questions', 500, 4],
  ['guides', 200, 6],
] as const) {
  const files = listMd(dir);
  if (files.length < expected) errors.push(`expected ≥${expected} ${dir} pages, found ${files.length}`);
  for (const file of files) {
    const { body } = parseFrontmatter(readFileSync(file, 'utf8'));
    const wc = wordCount(body);
    if (wc < min) errors.push(`${file}: body ${wc} words (want ≥${min})`);
    for (const p of PLACEHOLDERS) if (p.test(body)) errors.push(`${file}: placeholder text ${p}`);
  }
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`Content OK: ${ALL_CARDS.length} cards, ${cardFiles.length} card pages, ${listMd('spreads').length} spreads, ${listMd('questions').length} questions, ${listMd('guides').length} guides`);
