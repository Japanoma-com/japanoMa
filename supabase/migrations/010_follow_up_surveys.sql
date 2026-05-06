-- Migration: 010_follow_up_surveys
-- Creates the follow_up_surveys table for the post-handoff CX survey.
--
-- Each row represents one survey invitation:
--   - token:        unique URL-safe nonce used to authenticate the
--                   survey form without requiring login. 32 bytes base64url.
--   - lead_id:      FK to the lead that triggered the survey. Nullable
--                   because the admin may want to send standalone
--                   surveys to contact-form submitters too.
--   - recipient_*:  denormalised at send time so changes to the user
--                   record don't invalidate historical context.
--   - sent_at:      when the invitation email was dispatched.
--   - completed_at: set when the recipient submits their responses.
--   - responses:    jsonb of the answers. Shape documented in the
--                   /survey/[token] form code — single source of truth.
--
-- Index on token because it's the lookup key from the public form.
-- Index on completed_at IS NULL equivalent is implicit (partial index
-- omitted; small table for the foreseeable future).
--
-- See docs/requirements/scope-boundaries.md §F9 Lead and Conversion —
-- "incentivised survey after lead handoff to JP agents for transaction
-- tracking + CX insights".

BEGIN;

CREATE TABLE follow_up_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  token text NOT NULL UNIQUE,
  recipient_email text NOT NULL,
  recipient_name text,
  context jsonb,
  sent_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  responses jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_follow_up_surveys_lead ON follow_up_surveys(lead_id);
CREATE INDEX idx_follow_up_surveys_completed ON follow_up_surveys(completed_at);

COMMIT;
