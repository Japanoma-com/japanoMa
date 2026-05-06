-- Migration: 014_cities_hero_image
-- Adds a hero_image_path column to cities so the Areas directory card
-- and city detail page can render per-area hero imagery. Path is
-- relative to the public/ directory (e.g. "/areas/iiyama.avif") so the
-- column stays portable if we later move images to a CDN.
--
-- Nullable — cards gracefully fall back to the kanji-backdrop
-- treatment when the path is absent.

BEGIN;

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS hero_image_path text;

COMMENT ON COLUMN cities.hero_image_path
  IS 'Relative URL to the area hero image (e.g. /areas/iiyama.avif). Null = use kanji backdrop fallback on the Areas directory.';

COMMIT;
