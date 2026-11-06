export function breadcrumbLd(site: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${site}${it.path}` })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function articleLd(site: string, input: { path: string; headline: string; description: string; updatedAt: string; author: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: `${site}${input.path}`,
    headline: input.headline,
    description: input.description,
    dateModified: input.updatedAt,
    author: { '@type': 'Organization', name: input.author },
    publisher: { '@type': 'Organization', name: 'Tarot Tools', url: site },
  };
}

export function webAppLd(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tarot Card Generator',
    url: site,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Free tarot card generator. Draw one or three cards with cryptographically secure randomness and get upright or reversed meanings instantly.',
  };
}
