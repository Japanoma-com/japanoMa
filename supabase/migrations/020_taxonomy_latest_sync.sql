-- Migration 020: Sync DB to LATEST TAXONOMY (Kaz, 25 Apr 2026)
--
-- Diff against the prior workbook found five P1 rows where Kaz had
-- expanded the resort lists in the Notes column (more specific than
-- the earlier general region names) and one row where the city name
-- reverted from the streamlined "Shimotakai" back to the more formal
-- "Shimotakai-gun" (gun = 郡 = district).
--
-- Slug stays as 'shimotakai' so existing URLs keep working; only the
-- display name updates.
--
-- One stylistic correction: Kaz's Shinano notes had "ski reosrts" —
-- typo that survived several drafts. We're writing the corrected
-- spelling here ("ski resorts") since it's a clear orthographic error;
-- worth flagging back so Kaz can patch his master sheet.

-- ── Display name: Shimotakai → Shimotakai-gun ─────────────────────────
UPDATE cities SET
  name_en = 'Shimotakai-gun'
WHERE slug = 'shimotakai'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- ── Notes refreshes (P1, all in Nagano) ───────────────────────────────
UPDATE cities SET
  notes = 'Nozawa-Onsen Ski resort, Shiga Kogen, X -JAM Takaifuji, Ryuoo Ski Park, Yomase Onsen Ski Resort, Kitashiga Komaruyama, Kita-Shiga Kogen'
WHERE slug = 'kijimadaira'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

UPDATE cities SET
  notes = 'Shiga Kogen, X -JAM Takaifuji, Ryuoo Ski Park, Yomase Onsen Ski Resort, Kitashiga Komaruyama, Kita-Shiga Kogen'
WHERE slug = 'nakano'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

UPDATE cities SET
  notes = 'Shiga Kogen, X -JAM Takaifuji, Ryuoo Ski Park, Yomase Onsen Ski Resort, Kitashiga Komaruyama, Kita-Shiga Kogen'
WHERE slug = 'yamanouchi'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

UPDATE cities SET
  notes = 'Kurohime Kogen Snow Park, Tangram Ski Circus, Togakushi, Iizuna ski resorts'
WHERE slug = 'shinano'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

UPDATE cities SET
  notes = 'X -JAM Takaifuji, Ryuoo Ski Park, Yomase Onsen Ski Resort, Kitashiga Komaruyama, Kita-Shiga Kogen'
WHERE slug = 'shimotakai'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');
