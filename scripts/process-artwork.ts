import { readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { getCard } from '../src/data/cards';

// Converts artwork/raw/<slug>.png into public/cards/<slug>.webp (768x1152) and thumbs (240x360).
const RAW = 'artwork/raw';
const OUT = 'public/cards';
await mkdir(join(OUT, 'thumbs'), { recursive: true });

const files = readdirSync(RAW).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
let ok = 0;
for (const f of files) {
  const slug = f.replace(/\.[^.]+$/, '');
  if (!getCard(slug)) {
    console.warn(`skip ${f}: not a card slug`);
    continue;
  }
  const src = sharp(join(RAW, f)).resize(1024, 1536, { fit: 'cover', position: 'centre' });
  await src.clone().resize(768, 1152).webp({ quality: 82 }).toFile(join(OUT, `${slug}.webp`));
  await src.clone().resize(240, 360).webp({ quality: 74 }).toFile(join(OUT, 'thumbs', `${slug}.webp`));
  ok++;
}
console.log(`processed ${ok}/${files.length} card images`);

import { writeFileSync } from 'node:fs';
const slugs = readdirSync(OUT).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')).sort();
writeFileSync('src/data/artwork.json', JSON.stringify(slugs, null, 2) + '\n');
console.log(`artwork manifest: ${slugs.length} slugs`);
