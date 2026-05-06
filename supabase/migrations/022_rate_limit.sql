-- 022_rate_limit.sql
-- Lightweight rate limiter using row locking. Avoids adding a Redis dep.
CREATE TABLE rate_limit (
  bucket_key TEXT PRIMARY KEY,
  tokens INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limit_window ON rate_limit(window_start);

ALTER TABLE rate_limit ENABLE ROW LEVEL SECURITY;
-- No public policies — service role only.
