-- Migration: 008_lead_capture
-- Creates the lead capture + cross-border consent schema.
--
-- Four structural pieces:
--   1. consent_text_versions — canonical registry of every version of
--      the legal text ever presented to users. Immutable rows; mutations
--      via new migrations only.
--   2. consent_records — one row per consent event. Denormalizes the
--      verbatim text body + SHA-256 hash at capture time for legal
--      self-containment. Withdrawal columns are the only mutable fields.
--   3. leads — one row per user × area expression of interest. FK to
--      consent_records enforces the "no lead without consent" invariant.
--   4. pgcrypto extension — required for digest() used in the seed.
--
-- The listings table (referenced by leads.listing_id) does not yet exist.
-- leads.listing_id is nullable with no FK in MVP; the FK will be added in
-- the v1.1 migration that creates listings.
--
-- See docs/superpowers/specs/2026-04-09-account-lead-capture-design.md

BEGIN;

-- Step 1: Enable pgcrypto for digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: consent_text_versions
CREATE TABLE consent_text_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  body text NOT NULL,
  body_hash text NOT NULL,
  scope text NOT NULL,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Step 3: consent_records
CREATE TABLE consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_text_version text NOT NULL REFERENCES consent_text_versions(version),
  consent_text_body text NOT NULL,
  consent_text_hash text NOT NULL,
  scope text NOT NULL,
  ip_hash text,
  user_agent text,
  captured_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  withdrawal_reason text
);

CREATE INDEX idx_consent_records_user ON consent_records(user_id);
CREATE INDEX idx_consent_records_captured_at ON consent_records(captured_at);
CREATE INDEX idx_consent_records_active
  ON consent_records(user_id)
  WHERE withdrawn_at IS NULL;

-- Step 4: leads
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_record_id uuid NOT NULL REFERENCES consent_records(id),
  area_slug text NOT NULL,
  prefecture_slug text NOT NULL,
  profile_snapshot jsonb NOT NULL,
  listing_id uuid,  -- FK deferred to v1.1 migration
  status text NOT NULL DEFAULT 'new',
  status_updated_at timestamptz NOT NULL DEFAULT now(),
  katitas_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz
);

CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_leads_consent ON leads(consent_record_id);
CREATE INDEX idx_leads_status ON leads(status) WHERE withdrawn_at IS NULL;
CREATE UNIQUE INDEX idx_leads_user_area_active
  ON leads(user_id, area_slug)
  WHERE withdrawn_at IS NULL AND status NOT IN ('withdrawn', 'completed');

-- Step 5: Seed v1 consent text
--
-- CURATED PLACEHOLDER pending Kaz's lawyer review.
--
-- Paragraphs 1-3 are the verbatim cross-border-sharing language Kaz
-- provided from his initial legal research. Paragraphs 4-7 are curated
-- by Craefto on 2026-04-09, drawing on the protective-disclaimer
-- framework documented in the Domain & AkiyaHub T&Cs reference doc
-- (Australian Consumer Law / Section 18 "Misleading or Deceptive
-- Conduct" exposure for AU-targeted platforms selling JP property):
--
--   ¶4 No warranty / information-only nature (reduces Section 18 risk)
--   ¶5 Independent advice safe harbour — Shiho-shoshi, Kenzai, AU tax
--   ¶6 Split jurisdiction — NSW for the platform, Japan for the deed
--   ¶7 Withdrawal right (confirms the in-product Withdraw controls)
--
-- The text must be reviewed by Kaz's lawyer before the feature flips
-- live to real user traffic. Paragraphs 4-7 may need refinement or
-- replacement. This seed stays as 'v1' because no consent_records
-- reference it yet.
--
-- body_hash is computed inline so it can never drift from body.
-- The CTE binds the string once so the two references are byte-identical.
WITH v1_body AS (
  SELECT $V1$I consent to Go&C Partners Pty Ltd collecting and using my personal information for the purpose of supporting my search for property in Japan, and disclosing my personal information to selected real estate businesses and related service providers in Japan.

I also consent to those Japanese businesses sharing back with Go&C Partners Pty Ltd my inquiry status, viewing status, negotiation status, contract status, and whether my transaction completed, for service operation, lead attribution, billing verification, analytics, and service improvement purposes.

I understand that my personal information may be disclosed to recipients located in Japan, and that the data protection laws in Japan may differ from those in Australia. This cross-border disclosure is made under the Australian Privacy Principles (APP 8) and Japan's Act on the Protection of Personal Information (APPI).

I understand that Japanoma is an information-only decision-aid platform. Go&C Partners Pty Ltd is not a licensed real estate agent in Japan, is not a financial advisor, and is not a legal advisor. Japanoma does not verify, warrant, or guarantee the accuracy, completeness, or fitness-for-purpose of any property listing, area information, cost model, or other content on the site. All content is provided for decision-support purposes only.

I acknowledge that before entering into any property transaction in Japan I am strictly advised to engage an independent licensed Judicial Scrivener (Shiho-shoshi) to verify title; conduct an independent building inspection (Kenzai) before signing a contract; and consult an Australian tax professional about foreign asset ownership. By proceeding, I confirm that I am not relying on Go&C Partners Pty Ltd or any Japanese partner introduced through Japanoma for professional legal, financial, or tax advice.

I understand that my use of the Japanoma website, and any dispute arising from the information or services provided by Go&C Partners Pty Ltd, is governed by the laws of New South Wales, Australia. The physical purchase and transfer of property in Japan is governed exclusively by the laws of Japan and the jurisdiction of Japanese courts.

I understand that I may withdraw this consent at any time using the Withdraw controls in my Japanoma account. Withdrawal will revoke my active expressions of interest but will not delete the record of this consent, which is retained as a legal audit trail.$V1$ AS body
)
INSERT INTO consent_text_versions (version, body, body_hash, scope)
SELECT 'v1', body, encode(digest(body, 'sha256'), 'hex'), 'japanese_partner_lead_sharing'
FROM v1_body;

-- Step 6: RLS
-- consent_text_versions has RLS enabled with NO policies: the server action
-- getActiveConsentTextVersion() reads it via the service role (RLS-bypassing),
-- and clients never hit this table directly over PostgREST.
ALTER TABLE consent_text_versions ENABLE ROW LEVEL SECURITY;

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY consent_records_select_own ON consent_records
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_select_own ON leads
  FOR SELECT USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies. All writes go through server actions
-- using the service role via Drizzle — the server action IS the
-- authorization boundary.

COMMIT;
