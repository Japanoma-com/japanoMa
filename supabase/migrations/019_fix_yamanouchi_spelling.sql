-- Migration 019: Fix the "Yamanochi" → "Yamanouchi" misspelling.
--
-- Origin: the original CRA-76 taxonomy spreadsheet (signed off by Kaz)
-- had the City (EN) column typed as "Yamanochi" — missing the second
-- 'u'. The Japanese 山ノ内町 reads ya-ma-no-u-chi, so the correct
-- romanisation is "Yamanouchi". Migration 004 imported the spreadsheet
-- value verbatim into name_en. The slug was later corrected to
-- 'yamanouchi' (which is why URLs already work), but name_en kept the
-- typo and rendered everywhere users see it.
--
-- This migration just fixes the display name. The slug stays as-is
-- so existing URLs and bookmarks keep working.

UPDATE cities
SET name_en = 'Yamanouchi'
WHERE slug = 'yamanouchi'
  AND name_en = 'Yamanochi'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');
