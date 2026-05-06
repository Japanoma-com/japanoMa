-- Migration: 009_event_type_additions
-- Adds the remaining event types referenced by scope-boundaries F3 (Event
-- Tracking and Analytics) to the existing event_type enum. The events
-- table itself is unchanged — we already have session_id + user_id
-- (nullable) + event_type + payload (jsonb) + created_at, which covers
-- the full shape the admin dashboard needs.
--
-- New values:
--   article_read     — user viewed an article body past a read threshold
--   bookmark_add     — named counterpart to the legacy "save"
--   bookmark_remove  — named counterpart to the legacy "unsave"
--   compare_add      — item added to comparison tray
--   compare_remove   — item removed from comparison tray
--   filter_apply     — one or more taxonomy filters applied on /content
--
-- The legacy values (save, unsave, contact_form, comparison_view) remain
-- valid so existing historical rows and the migrateAnonymousData backfill
-- path keep working. New logging paths use the names above.
--
-- See docs/requirements/scope-boundaries.md §F3.

BEGIN;

ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'article_read';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'bookmark_add';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'bookmark_remove';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'compare_add';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'compare_remove';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'filter_apply';

COMMIT;
