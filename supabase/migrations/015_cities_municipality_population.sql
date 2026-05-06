-- Migration: 015_cities_municipality_population
-- Per Kaz's 25 Apr taxonomy update — every P1 city now has an
-- official municipality URL (each town gave permission) and a
-- recent population figure. Both are nullable (some smaller P2/P3
-- entries don't have either yet).
--
-- Data lands in migration 016.

BEGIN;

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS municipality_url text,
  ADD COLUMN IF NOT EXISTS population integer;

COMMENT ON COLUMN cities.municipality_url
  IS 'Official town/city homepage URL (with the municipality''s explicit permission to link). Often a translate.goog proxy for accessibility from English.';

COMMENT ON COLUMN cities.population
  IS 'Town/city population as of the CRA-76 update (Apr 2026).';

COMMIT;
