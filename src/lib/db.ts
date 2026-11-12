import type { DrawnCard, QuestionType, ReadingSummary, ReportProduct, Spread } from './schema';

export interface ReadingRow {
  id: string;
  public_token: string;
  spread: Spread;
  question_type: QuestionType;
  cards_json: string;
  summary_json: string;
  locale: string;
  created_at: string;
  expires_at: string | null;
}

export interface ReportRow {
  id: string;
  reading_id: string;
  public_token: string;
  product: ReportProduct;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  waffo_session_id: string | null;
  waffo_order_id: string | null;
  waffo_payment_id: string | null;
  waffo_refund_ticket_id: string | null;
  ml_visitor_id: string | null;
  ml_session_id: string | null;
  status: 'pending_payment' | 'paid' | 'generating' | 'ready' | 'failed' | 'refund_pending' | 'refunded' | 'refund_failed';
  r2_key: string | null;
  workflow_id: string | null;
  amount_cents: number | null;
  currency: string | null;
  user_summary: string | null;
  error: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  first_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const FREE_READING_TTL_DAYS = 90;
export const REPORT_FILE_TTL_DAYS = 180;

export function nowIso(): string {
  return new Date().toISOString();
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400_000).toISOString();
}

export async function insertReading(
  db: D1Database,
  r: {
    id: string;
    publicToken: string;
    spread: Spread;
    questionType: QuestionType;
    cards: DrawnCard[];
    summary: ReadingSummary;
    locale: string;
    ipHash: string | null;
    idempotencyKey: string;
    utm: Record<string, string> | null;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO readings (id, public_token, spread, question_type, cards_json, summary_json, locale, utm_json, ip_hash, idempotency_key, created_at, expires_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`,
    )
    .bind(
      r.id,
      r.publicToken,
      r.spread,
      r.questionType,
      JSON.stringify(r.cards),
      JSON.stringify(r.summary),
      r.locale,
      r.utm ? JSON.stringify(r.utm) : null,
      r.ipHash,
      r.idempotencyKey,
      nowIso(),
      daysFromNow(FREE_READING_TTL_DAYS),
    )
    .run();
}

export async function getReadingByIdempotency(db: D1Database, key: string): Promise<ReadingRow | null> {
  return db.prepare('SELECT * FROM readings WHERE idempotency_key = ?1').bind(key).first<ReadingRow>();
}

export async function getReadingByToken(db: D1Database, token: string): Promise<ReadingRow | null> {
  return db.prepare('SELECT * FROM readings WHERE public_token = ?1').bind(token).first<ReadingRow>();
}

export async function getReadingById(db: D1Database, id: string): Promise<ReadingRow | null> {
  return db.prepare('SELECT * FROM readings WHERE id = ?1').bind(id).first<ReadingRow>();
}

export async function insertReport(
  db: D1Database,
  r: { id: string; readingId: string; publicToken: string; product: ReportProduct; amountCents: number; currency: string; userSummary: string | null; mlVisitorId?: string | null; mlSessionId?: string | null },
): Promise<void> {
  const ts = nowIso();
  await db
    .prepare(
      `INSERT INTO reports (id, reading_id, public_token, product, status, amount_cents, currency, user_summary, ml_visitor_id, ml_session_id, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, 'pending_payment', ?5, ?6, ?7, ?8, ?9, ?10, ?10)`,
    )
    .bind(r.id, r.readingId, r.publicToken, r.product, r.amountCents, r.currency, r.userSummary, r.mlVisitorId ?? null, r.mlSessionId ?? null, ts)
    .run();
}

export async function getReportById(db: D1Database, id: string): Promise<ReportRow | null> {
  return db.prepare('SELECT * FROM reports WHERE id = ?1').bind(id).first<ReportRow>();
}

export async function getReportByToken(db: D1Database, token: string): Promise<ReportRow | null> {
  return db.prepare('SELECT * FROM reports WHERE public_token = ?1').bind(token).first<ReportRow>();
}

export async function updateReport(db: D1Database, id: string, patch: Partial<Omit<ReportRow, 'id'>>): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;
  const sets = entries.map(([k], i) => `${k} = ?${i + 2}`).join(', ');
  await db
    .prepare(`UPDATE reports SET ${sets}, updated_at = ?1 WHERE id = ?${entries.length + 2}`)
    .bind(nowIso(), ...entries.map(([, v]) => v), id)
    .run();
}

/** Apply a patch only while the row is still in one of the expected states. */
export async function updateReportIfStatus(
  db: D1Database,
  id: string,
  expected: ReportRow['status'][],
  patch: Partial<Omit<ReportRow, 'id'>>,
): Promise<boolean> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (entries.length === 0 || expected.length === 0) return false;
  const sets = entries.map(([k], i) => `${k} = ?${i + 2}`).join(', ');
  const statuses = expected.map((_, i) => `?${entries.length + i + 3}`).join(', ');
  const result = await db
    .prepare(`UPDATE reports SET ${sets}, updated_at = ?1 WHERE id = ?${entries.length + 2} AND status IN (${statuses})`)
    .bind(nowIso(), ...entries.map(([, v]) => v), id, ...expected)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

export async function insertEvent(
  db: D1Database,
  e: { eventName: string; readingId: string | null; locale: string | null; route: string | null; metadata: Record<string, unknown> | null },
): Promise<void> {
  await db
    .prepare('INSERT INTO events (event_name, reading_id, locale, route, metadata_json, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(e.eventName, e.readingId, e.locale, e.route, e.metadata ? JSON.stringify(e.metadata) : null, nowIso())
    .run();
}
