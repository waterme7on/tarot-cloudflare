-- Migration number: 0001 	 2026-11-06
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  arcana TEXT NOT NULL,
  suit TEXT,
  number INTEGER,
  upright_json TEXT NOT NULL,
  reversed_json TEXT NOT NULL,
  love_json TEXT NOT NULL,
  career_json TEXT NOT NULL,
  money_json TEXT NOT NULL,
  yes_no TEXT NOT NULL,
  image_key TEXT,
  seo_title TEXT,
  seo_description TEXT,
  content_version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS readings (
  id TEXT PRIMARY KEY,
  public_token TEXT UNIQUE,
  spread TEXT NOT NULL,
  question_type TEXT NOT NULL,
  cards_json TEXT NOT NULL,
  summary_json TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  utm_json TEXT,
  ip_hash TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reading_id TEXT NOT NULL,
  public_token TEXT UNIQUE,
  product TEXT NOT NULL DEFAULT 'single',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL,
  r2_key TEXT,
  workflow_id TEXT,
  amount_cents INTEGER,
  currency TEXT,
  user_summary TEXT,
  error TEXT,
  paid_at TEXT,
  delivered_at TEXT,
  first_viewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  reading_id TEXT,
  locale TEXT,
  route TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_event_stats (
  day TEXT NOT NULL,
  event_name TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (day, event_name)
);

CREATE TABLE IF NOT EXISTS content_versions (
  path TEXT PRIMARY KEY,
  content_hash TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL,
  size_bytes INTEGER,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at);
CREATE INDEX IF NOT EXISTS idx_readings_expires_at ON readings(expires_at);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reading ON reports(reading_id);
CREATE INDEX IF NOT EXISTS idx_events_name_time ON events(event_name, created_at);
