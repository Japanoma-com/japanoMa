-- Migration 018: Add geographic coordinates for the Yukiguni Atlas
-- (the new 3D-feel interactive map on /areas).
--
-- Coordinates are town-centre approximations sourced from public
-- municipal data (each town's official site or Wikipedia infobox).
-- Precision is ~3-4 decimals which is plenty for a country/regional
-- zoom map; we're showing town markers, not navigating to addresses.
--
-- Stored as numeric(9,6) (≈ 11cm precision) so future enrichment
-- (e.g. multiple POIs per town for Phase 3) won't need a schema change.

ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS latitude  numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6);

COMMENT ON COLUMN cities.latitude  IS 'Town-centre latitude (WGS84). Used by the Yukiguni Atlas markers.';
COMMENT ON COLUMN cities.longitude IS 'Town-centre longitude (WGS84). Used by the Yukiguni Atlas markers.';

-- Hokkaido
UPDATE cities SET latitude=43.7710, longitude=142.3650 WHERE slug='asahikawa'    AND prefecture_id=(SELECT id FROM prefectures WHERE slug='hokkaido');
UPDATE cities SET latitude=43.7320, longitude=142.5210 WHERE slug='higashikawa'  AND prefecture_id=(SELECT id FROM prefectures WHERE slug='hokkaido');
UPDATE cities SET latitude=43.1900, longitude=140.9940 WHERE slug='otaru'        AND prefecture_id=(SELECT id FROM prefectures WHERE slug='hokkaido');
UPDATE cities SET latitude=43.0640, longitude=141.3470 WHERE slug='sapporo'      AND prefecture_id=(SELECT id FROM prefectures WHERE slug='hokkaido');
UPDATE cities SET latitude=43.0590, longitude=141.9740 WHERE slug='yubari'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='hokkaido');

-- Aomori
UPDATE cities SET latitude=40.8244, longitude=140.7400 WHERE slug='aomori'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='aomori');

-- Iwate
UPDATE cities SET latitude=39.9100, longitude=141.0820 WHERE slug='hachimantai'  AND prefecture_id=(SELECT id FROM prefectures WHERE slug='iwate');
UPDATE cities SET latitude=39.3800, longitude=141.1140 WHERE slug='hanamaki'     AND prefecture_id=(SELECT id FROM prefectures WHERE slug='iwate');
UPDATE cities SET latitude=39.2870, longitude=141.1130 WHERE slug='kitakami'     AND prefecture_id=(SELECT id FROM prefectures WHERE slug='iwate');

-- Akita
UPDATE cities SET latitude=40.2360, longitude=140.3760 WHERE slug='kita-akita'   AND prefecture_id=(SELECT id FROM prefectures WHERE slug='akita');
UPDATE cities SET latitude=39.7150, longitude=140.7300 WHERE slug='semboku'      AND prefecture_id=(SELECT id FROM prefectures WHERE slug='akita');

-- Miyagi
UPDATE cities SET latitude=38.0010, longitude=140.6190 WHERE slug='shiroishi'    AND prefecture_id=(SELECT id FROM prefectures WHERE slug='miyagi');

-- Yamagata
UPDATE cities SET latitude=38.4180, longitude=139.9710 WHERE slug='nishikawa'    AND prefecture_id=(SELECT id FROM prefectures WHERE slug='yamagata');
UPDATE cities SET latitude=38.7270, longitude=139.8240 WHERE slug='tsuruoka'     AND prefecture_id=(SELECT id FROM prefectures WHERE slug='yamagata');
UPDATE cities SET latitude=38.2400, longitude=140.3640 WHERE slug='yamagata'     AND prefecture_id=(SELECT id FROM prefectures WHERE slug='yamagata');

-- Fukushima
UPDATE cities SET latitude=37.5640, longitude=140.1080 WHERE slug='inawashiro'   AND prefecture_id=(SELECT id FROM prefectures WHERE slug='fukushima');

-- Tochigi
UPDATE cities SET latitude=36.9620, longitude=140.0470 WHERE slug='nasushiobara' AND prefecture_id=(SELECT id FROM prefectures WHERE slug='tochigi');

-- Gunma
UPDATE cities SET latitude=36.7810, longitude=138.9990 WHERE slug='minakami'     AND prefecture_id=(SELECT id FROM prefectures WHERE slug='gunma');
UPDATE cities SET latitude=36.6450, longitude=139.0440 WHERE slug='numata'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='gunma');

-- Niigata
UPDATE cities SET latitude=37.8460, longitude=139.1980 WHERE slug='agano'        AND prefecture_id=(SELECT id FROM prefectures WHERE slug='niigata');
UPDATE cities SET latitude=37.7430, longitude=139.1820 WHERE slug='gosen'        AND prefecture_id=(SELECT id FROM prefectures WHERE slug='niigata');
UPDATE cities SET latitude=37.0660, longitude=138.8770 WHERE slug='minamiuonuma' AND prefecture_id=(SELECT id FROM prefectures WHERE slug='niigata');
UPDATE cities SET latitude=36.8900, longitude=138.1840 WHERE slug='myoko'        AND prefecture_id=(SELECT id FROM prefectures WHERE slug='niigata');
UPDATE cities SET latitude=37.9510, longitude=139.3270 WHERE slug='shibata'      AND prefecture_id=(SELECT id FROM prefectures WHERE slug='niigata');
UPDATE cities SET latitude=37.2380, longitude=139.0480 WHERE slug='uonuma'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='niigata');
UPDATE cities SET latitude=36.9370, longitude=138.8060 WHERE slug='yuzawa'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='niigata');

-- Nagano (P1 set)
UPDATE cities SET latitude=36.8520, longitude=138.3680 WHERE slug='iiyama'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='nagano');
UPDATE cities SET latitude=36.7700, longitude=138.1750 WHERE slug='iizuna'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='nagano');
UPDATE cities SET latitude=36.7440, longitude=138.3690 WHERE slug='nakano'       AND prefecture_id=(SELECT id FROM prefectures WHERE slug='nagano');
UPDATE cities SET latitude=36.7900, longitude=138.4150 WHERE slug='shimotakai'   AND prefecture_id=(SELECT id FROM prefectures WHERE slug='nagano');
UPDATE cities SET latitude=36.7920, longitude=138.1960 WHERE slug='shinano'      AND prefecture_id=(SELECT id FROM prefectures WHERE slug='nagano');
UPDATE cities SET latitude=36.7440, longitude=138.4040 WHERE slug='yamanouchi'   AND prefecture_id=(SELECT id FROM prefectures WHERE slug='nagano');
UPDATE cities SET latitude=36.8650, longitude=138.4250 WHERE slug='kijimadaira'  AND prefecture_id=(SELECT id FROM prefectures WHERE slug='nagano');
