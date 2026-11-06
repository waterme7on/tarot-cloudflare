import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faq = z.array(z.object({ q: z.string(), a: z.string() })).default([]);

const cards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cards' }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(80).max(170),
    name: z.string(),
    updatedAt: z.string(),
    author: z.string().default('Tarot Tools Editorial'),
    editor: z.string().default('Tarot Tools Editorial'),
    relatedCards: z.array(z.string()).min(2).max(4),
    relatedSpreads: z.array(z.string()).min(1),
    relatedQuestions: z.array(z.string()).min(1),
    faq,
  }),
});

const spreads = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/spreads' }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(80).max(170),
    name: z.string(),
    cardCount: z.number(),
    positions: z.array(z.string()),
    updatedAt: z.string(),
    author: z.string().default('Tarot Tools Editorial'),
    relatedCards: z.array(z.string()).min(2),
    relatedQuestions: z.array(z.string()).min(1),
    faq,
  }),
});

const questions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/questions' }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(80).max(170),
    name: z.string(),
    questionType: z.enum(['general', 'love', 'career', 'money', 'decision']),
    updatedAt: z.string(),
    author: z.string().default('Tarot Tools Editorial'),
    relatedCards: z.array(z.string()).min(2),
    relatedSpreads: z.array(z.string()).min(1),
    faq,
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(80).max(170),
    updatedAt: z.string(),
    author: z.string().default('Tarot Tools Editorial'),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { cards, spreads, questions, guides };
