-- Migration: 007_drop_nextauth_use_supabase_auth
-- Drops the custom NextAuth-era users and sessions tables.
-- Repoints application-table foreign keys to auth.users(id).
--
-- Pre-existing data: all test data only (verified by Obi 2026-04-08).
--   - 716 sessions rows (anonymous visitor tracking from dev/testing)
--   - 109 events rows (page_view / quiz_start / quiz_complete analytics)
--   - 25 quiz_responses rows (internal quiz test completions)
--   - 0 users, 0 saves, 0 form_submissions
-- Step 0 truncates this test data so the new architecture starts clean
-- without orphaned session_id values.
--
-- See docs/superpowers/specs/2026-04-08-phase-2-auth-supabase-design.md
-- See docs/superpowers/plans/2026-04-08-phase-2-plan-a-auth-foundation.md

BEGIN;

-- Step 0: Clear test data
-- CASCADE truncates events and quiz_responses which have NOT NULL FKs to sessions
TRUNCATE sessions CASCADE;

-- Step 1: Drop FK constraints that point at sessions and users
ALTER TABLE events DROP CONSTRAINT events_session_id_fkey;
ALTER TABLE events DROP CONSTRAINT events_user_id_fkey;
ALTER TABLE quiz_responses DROP CONSTRAINT quiz_responses_session_id_fkey;
ALTER TABLE quiz_responses DROP CONSTRAINT quiz_responses_user_id_fkey;
ALTER TABLE saves DROP CONSTRAINT saves_user_id_fkey;

-- Step 2: Loosen saves.user_id (was NOT NULL pointing at custom users)
-- Saves can now be anonymous; the migration in Plan B's 2D will backfill
-- user_id for users who sign up after creating saves.
ALTER TABLE saves ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Add new FKs to auth.users(id)
-- Saves: cascade because saved bookmarks are user-owned
-- Events / quiz_responses: set null because analytics outlives identity
ALTER TABLE saves
  ADD CONSTRAINT saves_user_id_auth_users_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE events
  ADD CONSTRAINT events_user_id_auth_users_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE quiz_responses
  ADD CONSTRAINT quiz_responses_user_id_auth_users_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 4: Add user_id column to form_submissions for future authenticated submissions
ALTER TABLE form_submissions
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 5: Drop the now-unreferenced custom tables
DROP TABLE sessions;
DROP TABLE users;

COMMIT;
