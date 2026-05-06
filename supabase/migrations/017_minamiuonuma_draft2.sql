-- Migration 017: Fill in Minamiuonuma (Niigata) from Kaz's Draft (2)
-- of the CRA-76 taxonomy (25 Apr 2026).
--
-- Minamiuonuma was P1 in the original signed-off taxonomy and seeded
-- in migration 004 with placeholder access info, but was missing from
-- the 25 Apr workbook so it never received the AU-buyer enrichment.
-- Draft (2) restored it as a full row.
--
-- This migration:
--   1. Adds the new enrichment fields (municipality URL, population,
--      AU flight times, AUD/JPY avg price, off-season score).
--   2. Corrects access info that the original seed had wrong:
--      - station was Echigo-Yuzawa (a different town); Kaz's authoritative
--        value is Muikamachi (六日町) at 10 min from city centre
--      - airport time, car-to-slope time, and shuttle-bus flag updated
--   3. Replaces the resort-list note with the four resorts that Kaz lists
--      for Minamiuonuma proper (the old list mixed in Yuzawa-town resorts).

UPDATE cities SET
  municipality_url            = 'https://m-uonuma.jp',
  population                  = 51220,
  avg_property_price_jpy      = 11710000,
  off_season_activities_score = 8,
  time_from_sydney            = '12:57',
  time_from_melbourne         = '13:37',
  time_from_brisbane          = '12:42',
  time_from_perth             = '13:12',
  time_from_adelaide          = '15:47',
  notes                       = 'Muikamachi Hakkaisan, Joetsu Kokusai, Ishiuchi Maruyama, Maiko Snow Resort',
  closest_station             = 'Muikamachi (六日町)',
  station_time_min            = 10,
  airport_time_min            = 95,
  car_to_slope_min            = 20,
  bus_to_slope_min            = 25,
  shuttle_bus                 = false
WHERE slug = 'minamiuonuma'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'niigata');
