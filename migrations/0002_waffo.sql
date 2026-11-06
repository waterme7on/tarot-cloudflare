-- Migration number: 0002 	 2026-11-07
ALTER TABLE reports ADD COLUMN waffo_session_id TEXT;
ALTER TABLE reports ADD COLUMN waffo_order_id TEXT;
ALTER TABLE reports ADD COLUMN waffo_payment_id TEXT;
ALTER TABLE reports ADD COLUMN waffo_refund_ticket_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_waffo_order ON reports(waffo_order_id);
