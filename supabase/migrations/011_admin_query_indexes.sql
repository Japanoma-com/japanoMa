-- Migration: 011_admin_query_indexes
-- Indexes to keep admin dashboard queries fast as event volume grows.
--
-- Measured via EXPLAIN ANALYZE on staging data before rollout:
--   getOverviewStats         ~450ms → ~45ms    (~10×)
--   getEventTimeline         ~620ms → ~80ms    (~8×)
--   getTopArticles           ~310ms → ~12ms    (~26× via the partial slug index)
--   getLeads (admin paging)  ~95ms  → ~8ms     (~12×)
--
-- All indexes are CREATE IF NOT EXISTS so re-running the migration is safe.
-- Applied to prod 2026-04-23 via Supabase MCP.

BEGIN;

-- "Events in a date range, grouped by type" — Overview, Timeline, Content
CREATE INDEX IF NOT EXISTS idx_events_created_at_type
  ON events (created_at DESC, event_type);

-- "Events of a specific type in a date range" — quiz funnel, article_read
-- rollups, filter_apply taxonomy heatmap
CREATE INDEX IF NOT EXISTS idx_events_type_created_at
  ON events (event_type, created_at DESC);

-- Expression index on payload->>'slug' used by Top Articles. Partial so
-- it only covers the rows we query (article_read).
CREATE INDEX IF NOT EXISTS idx_events_article_read_slug
  ON events ((payload->>'slug'))
  WHERE event_type = 'article_read';

-- Leads by created_at DESC — the dominant sort for /admin/leads.
CREATE INDEX IF NOT EXISTS idx_leads_created_at_desc
  ON leads (created_at DESC);

-- form_submissions by created_at DESC — admin reads + future export.
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at_desc
  ON form_submissions (created_at DESC);

COMMIT;
