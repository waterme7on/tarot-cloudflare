import slugs from '../data/artwork.json';

const set = new Set<string>(slugs as string[]);

export function hasArt(slug: string): boolean {
  return set.has(slug);
}

export function artUrl(slug: string): string {
  return `/cards/${slug}.webp`;
}

export function thumbUrl(slug: string): string {
  return `/cards/thumbs/${slug}.webp`;
}
