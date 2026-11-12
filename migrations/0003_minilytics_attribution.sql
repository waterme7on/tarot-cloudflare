-- Migration number: 0003 	 2026-11-12
ALTER TABLE reports ADD COLUMN ml_visitor_id TEXT;
ALTER TABLE reports ADD COLUMN ml_session_id TEXT;
