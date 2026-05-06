-- Migration: 012_taxonomy_cra76_refresh_schema
--
-- Schema changes required by the CRA-76 taxonomy refresh (Kaz,
-- Mar 2026). See docs/taxonomy/cra76-gap-analysis-2026-04-23.md for
-- the full diff; this migration handles only the column + table
-- additions. The data seed lives in migration 013.
--
-- Two changes:
--
-- 1. `cities` gains 7 new columns that back the "For Australian
--    buyers" block on Area pages: door-to-door flight time from
--    each capital, average property price (JPY), and an off-season
--    activities score (0–10, higher = stronger year-round appeal).
--
-- 2. New `land_building_details` table — a non-quiz-logic taxonomy
--    (structure type, stories, land rights, zoning, etc.) that
--    sits on individual listings as informational chips. 41 entries
--    in the CRA-76 spec; data landed by migration 013.

BEGIN;

-- 1. City enrichment columns ------------------------------------------------

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS time_from_sydney    text,
  ADD COLUMN IF NOT EXISTS time_from_melbourne text,
  ADD COLUMN IF NOT EXISTS time_from_brisbane  text,
  ADD COLUMN IF NOT EXISTS time_from_perth     text,
  ADD COLUMN IF NOT EXISTS time_from_adelaide  text,
  ADD COLUMN IF NOT EXISTS avg_property_price_jpy bigint,
  ADD COLUMN IF NOT EXISTS off_season_activities_score smallint;

COMMENT ON COLUMN cities.time_from_sydney
  IS 'Door-to-door travel time from Sydney as "HH:MM". Used on Area pages and Compare.';
COMMENT ON COLUMN cities.avg_property_price_jpy
  IS 'Market anchor for the area (JPY). Sourced from Kaz''s market research.';
COMMENT ON COLUMN cities.off_season_activities_score
  IS '0–10 score of non-ski-season appeal. Differentiates pure-ski from year-round lifestyle areas.';

-- 2. Land & Building Details table -----------------------------------------

CREATE TABLE IF NOT EXISTS land_building_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  name_en text NOT NULL,
  name_ja text,
  description text,
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_land_building_details_category
  ON land_building_details (category, sort_order);

COMMIT;
