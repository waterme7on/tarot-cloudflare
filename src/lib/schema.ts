export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Orientation = 'upright' | 'reversed';
export type YesNo = 'yes' | 'no' | 'maybe';
export type QuestionType = 'general' | 'love' | 'career' | 'money' | 'decision';
export type Spread = 'one-card' | 'three-card' | 'celtic-cross';
export type ReportProduct = 'single' | 'three';

export const QUESTION_TYPES: QuestionType[] = ['general', 'love', 'career', 'money', 'decision'];
export const SPREADS: Spread[] = ['one-card', 'three-card', 'celtic-cross'];
export const SPREAD_SIZES: Record<Spread, number> = { 'one-card': 1, 'three-card': 3, 'celtic-cross': 10 };

export interface OrientationMeaning {
  keywords: string[];
  summary: string;
  action: string;
}

export interface ContextMeaning {
  upright: string;
  reversed: string;
}

export interface CardData {
  id: string;
  slug: string;
  name: string;
  arcana: Arcana;
  suit: Suit | null;
  number: number;
  upright: OrientationMeaning;
  reversed: OrientationMeaning;
  love: ContextMeaning;
  career: ContextMeaning;
  money: ContextMeaning;
  yesNo: YesNo;
}

export interface DrawnCard {
  slug: string;
  name: string;
  orientation: Orientation;
  position: number;
  positionLabel: string;
  keywords: string[];
  summary: string;
}

export interface ReadingSummary {
  headline: string;
  summary: string;
  nextAction: string;
  limitation: string;
  yesNo?: YesNo;
}

export interface DrawRequest {
  spread: Spread;
  questionType: QuestionType;
  locale?: string;
  idempotencyKey: string;
  turnstileToken?: string;
  questionLength?: number;
}

export interface DrawResponse {
  readingId: string;
  publicToken: string;
  spread: Spread;
  questionType: QuestionType;
  cards: DrawnCard[];
  summary: string;
  headline: string;
  nextAction: string;
  limitation: string;
  yesNo?: YesNo;
  createdAt: string;
}

export interface ReportQueueMessage {
  type: 'generate-report' | 'share-image' | 'retry-report';
  reportId?: string;
  readingId?: string;
}

export interface ReportContent {
  title: string;
  introduction: string;
  cards: { name: string; orientation: Orientation; position: string; interpretation: string }[];
  synthesis: string;
  actions: string[];
  reflection: string;
  disclaimer: string;
  generator: 'ai' | 'rules';
  model?: string;
}

export const EVENT_NAMES = [
  'draw_started',
  'draw_completed',
  'share_clicked',
  'report_cta_viewed',
  'checkout_started',
  'checkout_completed',
  'report_ready',
  'report_failed',
  'refund_requested',
  'page_view',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export function isQuestionType(v: unknown): v is QuestionType {
  return typeof v === 'string' && (QUESTION_TYPES as string[]).includes(v);
}
export function isSpread(v: unknown): v is Spread {
  return typeof v === 'string' && (SPREADS as string[]).includes(v);
}
export function isEventName(v: unknown): v is EventName {
  return typeof v === 'string' && (EVENT_NAMES as readonly string[]).includes(v);
}
