import sharp from 'sharp';

// Composes public/og-default.png (1200x630) from three card illustrations on the site's dark gradient.
const cards = ['the-sun', 'the-star', 'the-moon'];
const W = 1200;
const H = 630;
const cardW = 260;
const cardH = 390;
const gap = 40;
const startX = Math.round((W - (cards.length * cardW + (cards.length - 1) * gap)) / 2);

const bg = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1f4a"/><stop offset="1" stop-color="#0f0c1d"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/><text x="600" y="78" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#e8dcc0">Tarot Card Generator</text><text x="600" y="590" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#c9a85c">Free draw · 78 illustrated holographic cards · No sign-up</text></svg>`,
);

const composites = await Promise.all(
  cards.map(async (slug, i) => ({
    input: await sharp(`public/cards/${slug}.webp`).resize(cardW, cardH).png().toBuffer(),
    left: startX + i * (cardW + gap),
    top: 110,
  })),
);
await sharp(bg).composite(composites).png({ quality: 90 }).toFile('public/og-default.png');
console.log('wrote public/og-default.png');
