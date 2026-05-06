-- Migration: 016_taxonomy_cra76_25apr_data
-- Per Kaz's 25 Apr update: municipality URLs (with permission),
-- population, plus newly populated enrichment for Yubari and
-- other previously-empty rows.

BEGIN;

-- Iiyama (Nagano) ─ pop 17586
UPDATE cities SET
  municipality_url = 'https://www.iiyama-ouendan.net/en/',
  population = 17586,
  avg_property_price_jpy = 6040000,
  off_season_activities_score = 8,
  time_from_sydney = '12:23',
  time_from_melbourne = '13:03',
  time_from_brisbane = '12:08',
  time_from_perth = '12:38',
  time_from_adelaide = '15:13'
WHERE slug = 'iiyama'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- Kijimadaira (Nagano) ─ pop 4375
UPDATE cities SET
  municipality_url = 'https://www-vill-kijimadaira-lg-jp.translate.goog/?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-GB',
  population = 4375,
  avg_property_price_jpy = 5200000,
  off_season_activities_score = 7,
  time_from_sydney = '12:23',
  time_from_melbourne = '13:03',
  time_from_brisbane = '12:08',
  time_from_perth = '12:38',
  time_from_adelaide = '15:13'
WHERE slug = 'kijimadaira'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- Nakano (Nagano) ─ pop 39906
UPDATE cities SET
  municipality_url = 'https://next-level.biz/enmusubi/nakanoshi-iju/',
  population = 39906,
  avg_property_price_jpy = 4150000,
  off_season_activities_score = 7,
  time_from_sydney = '12:40',
  time_from_melbourne = '13:20',
  time_from_brisbane = '12:25',
  time_from_perth = '12:55',
  time_from_adelaide = '15:30'
WHERE slug = 'nakano'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- Yamanouchi (Nagano) ─ pop 11011
UPDATE cities SET
  municipality_url = 'https://www.town.yamanouchi.nagano.jp/index.html',
  population = 11011,
  avg_property_price_jpy = 4150000,
  off_season_activities_score = 7,
  time_from_sydney = '12:40',
  time_from_melbourne = '13:20',
  time_from_brisbane = '12:25',
  time_from_perth = '12:55',
  time_from_adelaide = '15:30'
WHERE slug = 'yamanouchi'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- Shinano (Nagano) ─ pop 7300
UPDATE cities SET
  municipality_url = 'https://www.shinanomachi-nagano.jp/en/index.html',
  population = 7300,
  avg_property_price_jpy = 6200000,
  off_season_activities_score = 8,
  time_from_sydney = '12:40',
  time_from_melbourne = '13:20',
  time_from_brisbane = '12:25',
  time_from_perth = '12:55',
  time_from_adelaide = '15:30'
WHERE slug = 'shinano'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- Iizuna (Nagano) ─ pop 10095
UPDATE cities SET
  municipality_url = 'https://1127.info/sightseeing/experience/',
  population = 10095,
  avg_property_price_jpy = 5600000,
  off_season_activities_score = 7,
  time_from_sydney = '12:40',
  time_from_melbourne = '13:20',
  time_from_brisbane = '12:25',
  time_from_perth = '12:55',
  time_from_adelaide = '15:30'
WHERE slug = 'iizuna'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- Shimotakai-gun (Nagano) ─ pop 18866
UPDATE cities SET
  municipality_url = 'https://nozawakanko.jp/',
  population = 18866,
  avg_property_price_jpy = 4150000,
  off_season_activities_score = 7,
  time_from_sydney = '12:40',
  time_from_melbourne = '13:20',
  time_from_brisbane = '12:25',
  time_from_perth = '12:55',
  time_from_adelaide = '15:30'
WHERE slug = 'shimotakai'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'nagano');

-- Myoko (Niigata) ─ pop 28773
UPDATE cities SET
  municipality_url = 'https://www.city.myoko.niigata.jp/docs/109.html',
  population = 28773,
  avg_property_price_jpy = 9020000,
  off_season_activities_score = 7,
  time_from_sydney = '12:50',
  time_from_melbourne = '13:30',
  time_from_brisbane = '12:35',
  time_from_perth = '13:05',
  time_from_adelaide = '15:40'
WHERE slug = 'myoko'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'niigata');

-- Shibata (Niigata) ─ pop 91500
UPDATE cities SET
  municipality_url = 'https://shibata-info.jp/',
  population = 91500,
  avg_property_price_jpy = 4300000,
  off_season_activities_score = 6,
  time_from_sydney = '12:26',
  time_from_melbourne = '13:06',
  time_from_brisbane = '12:11',
  time_from_perth = '12:41',
  time_from_adelaide = '15:16'
WHERE slug = 'shibata'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'niigata');

-- Agano (Niigata) ─ pop 37500
UPDATE cities SET
  municipality_url = 'https://www-city-agano-niigata-jp.translate.goog/ijuu/index.html?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=ja',
  population = 37500,
  avg_property_price_jpy = 3800000,
  off_season_activities_score = 6,
  time_from_sydney = '12:28',
  time_from_melbourne = '13:08',
  time_from_brisbane = '12:13',
  time_from_perth = '12:43',
  time_from_adelaide = '15:18'
WHERE slug = 'agano'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'niigata');

-- Gosen (Niigata) ─ pop 45500
UPDATE cities SET
  municipality_url = 'https://www-city-gosen-lg-jp.translate.goog/hyande/index.html?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=ja',
  population = 45500,
  avg_property_price_jpy = 3600000,
  off_season_activities_score = 6,
  time_from_sydney = '12:32',
  time_from_melbourne = '13:12',
  time_from_brisbane = '12:17',
  time_from_perth = '12:47',
  time_from_adelaide = '15:22'
WHERE slug = 'gosen'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'niigata');

-- Uonuma (Niigata) ─ pop 32500
UPDATE cities SET
  municipality_url = 'https://iine-uonuma.j-server.com/LUCUONUMAK/ns/tl.cgi/https://www.iine-uonuma.jp/?SLANG=ja&TLANG=en&XMODE=0&XCHARSET=utf-8&XJSID=0',
  population = 32500,
  avg_property_price_jpy = 7800000,
  off_season_activities_score = 7,
  time_from_sydney = '11:56',
  time_from_melbourne = '12:36',
  time_from_brisbane = '11:41',
  time_from_perth = '12:11',
  time_from_adelaide = '14:46'
WHERE slug = 'uonuma'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'niigata');

-- Yuzawa (Niigata) ─ pop 7700
UPDATE cities SET
  municipality_url = 'https://www-town-yuzawa-lg-jp.translate.goog/?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=ja',
  population = 7700,
  avg_property_price_jpy = 11570000,
  off_season_activities_score = 8,
  time_from_sydney = '11:41',
  time_from_melbourne = '12:21',
  time_from_brisbane = '11:26',
  time_from_perth = '11:56',
  time_from_adelaide = '14:31'
WHERE slug = 'yuzawa'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'niigata');

-- Minakami (Gunma) ─ pop 16800
UPDATE cities SET
  municipality_url = 'https://enjoy-minakami.com/en/',
  population = 16800,
  avg_property_price_jpy = 5430000,
  off_season_activities_score = 7,
  time_from_sydney = '12:10',
  time_from_melbourne = '12:50',
  time_from_brisbane = '11:55',
  time_from_perth = '12:25',
  time_from_adelaide = '15:00'
WHERE slug = 'minakami'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'gunma');

-- Numata (Gunma) ─ pop 45000
UPDATE cities SET
  municipality_url = 'https://www.numata-kankou.jp/',
  population = 45000,
  avg_property_price_jpy = 11960000,
  off_season_activities_score = 6,
  time_from_sydney = '12:20',
  time_from_melbourne = '13:00',
  time_from_brisbane = '12:05',
  time_from_perth = '12:35',
  time_from_adelaide = '15:10'
WHERE slug = 'numata'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'gunma');

-- Nasushiobara (Tochigi) ─ pop 114000
UPDATE cities SET
  municipality_url = 'https://nasushiobara-kanko.jp/',
  population = 114000,
  avg_property_price_jpy = 14840000,
  off_season_activities_score = 6,
  time_from_sydney = '11:41',
  time_from_melbourne = '12:21',
  time_from_brisbane = '11:26',
  time_from_perth = '11:56',
  time_from_adelaide = '14:31'
WHERE slug = 'nasushiobara'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'tochigi');

-- Inawashiro (Fukushima) ─ pop 13500
UPDATE cities SET
  municipality_url = 'https://bandaisan.or.jp/ib/en/',
  population = 13500,
  avg_property_price_jpy = 17650000,
  off_season_activities_score = 7,
  time_from_sydney = '12:30',
  time_from_melbourne = '13:10',
  time_from_brisbane = '12:15',
  time_from_perth = '12:45',
  time_from_adelaide = '15:20'
WHERE slug = 'inawashiro'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'fukushima');

-- Shiroishi (Miyagi) ─ pop 31500
UPDATE cities SET
  municipality_url = 'https://shiroishi.ne.jp/',
  population = 31500,
  avg_property_price_jpy = 4940000,
  off_season_activities_score = 6,
  time_from_sydney = '12:32',
  time_from_melbourne = '13:12',
  time_from_brisbane = '12:17',
  time_from_perth = '12:47',
  time_from_adelaide = '15:22'
WHERE slug = 'shiroishi'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'miyagi');

-- Yamagata (Yamagata) ─ pop 241000
UPDATE cities SET
  municipality_url = 'https://translation2.j-server.com/LUCYAMAGAT/ns/tl.cgi/https://www.city.yamagata-yamagata.lg.jp/citypromotion/index.html?SLANG=ja&TLANG=en&XMODE=0&XPARAM=q,&XCHARSET=UTF-8&XPORG=,&XJSID=0',
  population = 241000,
  avg_property_price_jpy = 28580000,
  off_season_activities_score = 9,
  time_from_sydney = '12:57',
  time_from_melbourne = '13:37',
  time_from_brisbane = '12:42',
  time_from_perth = '13:12',
  time_from_adelaide = '15:47'
WHERE slug = 'yamagata'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'yamagata');

-- Nishikawa (Yamagata) ─ pop 4900
UPDATE cities SET
  municipality_url = 'https://www.gassan-info.com/',
  population = 4900,
  avg_property_price_jpy = 4800000,
  off_season_activities_score = 8,
  time_from_sydney = '13:32',
  time_from_melbourne = '14:12',
  time_from_brisbane = '13:17',
  time_from_perth = '13:47',
  time_from_adelaide = '16:22'
WHERE slug = 'nishikawa'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'yamagata');

-- Tsuruoka (Yamagata) ─ pop 116000
UPDATE cities SET
  municipality_url = 'https://www.tsuruokacity.com/',
  population = 116000,
  avg_property_price_jpy = 7600000,
  off_season_activities_score = 9,
  time_from_sydney = '12:48',
  time_from_melbourne = '13:28',
  time_from_brisbane = '12:33',
  time_from_perth = '13:03',
  time_from_adelaide = '15:38'
WHERE slug = 'tsuruoka'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'yamagata');

-- Kitakami (Iwate) ─ pop 91000
UPDATE cities SET
  municipality_url = 'https://www.city.kitakami.iwate.jp/foreignsite/English/index.html',
  population = 91000,
  avg_property_price_jpy = 17500000,
  off_season_activities_score = 7,
  time_from_sydney = '13:25',
  time_from_melbourne = '14:05',
  time_from_brisbane = '13:10',
  time_from_perth = '13:40',
  time_from_adelaide = '16:15'
WHERE slug = 'kitakami'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'iwate');

-- Hanamaki (Iwate) ─ pop 91000
UPDATE cities SET
  municipality_url = 'https://en.visit-hanamaki.travel/',
  population = 91000,
  avg_property_price_jpy = 4300000,
  off_season_activities_score = 6,
  time_from_sydney = '11:23',
  time_from_melbourne = '12:03',
  time_from_brisbane = '11:38',
  time_from_perth = '12:08',
  time_from_adelaide = '14:53'
WHERE slug = 'hanamaki'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'iwate');

-- Hachimantai (Iwate) ─ pop 22800
UPDATE cities SET
  municipality_url = 'https://www.hachimantai.or.jp/trip8/index.html?108',
  population = 22800,
  avg_property_price_jpy = 5200000,
  off_season_activities_score = 7,
  time_from_sydney = '12:08',
  time_from_melbourne = '12:48',
  time_from_brisbane = '11:53',
  time_from_perth = '12:23',
  time_from_adelaide = '15:08'
WHERE slug = 'hachimantai'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'iwate');

-- Semboku (Akita) ─ pop 23000
UPDATE cities SET
  municipality_url = 'https://www.city.semboku.akita.jp/en/',
  population = 23000,
  avg_property_price_jpy = 6100000,
  off_season_activities_score = 9,
  time_from_sydney = '13:35',
  time_from_melbourne = '14:15',
  time_from_brisbane = '13:20',
  time_from_perth = '13:50',
  time_from_adelaide = '16:35'
WHERE slug = 'semboku'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'akita');

-- Kita-Akita (Akita) ─ pop 29500
UPDATE cities SET
  municipality_url = 'https://www.city.kitaakita.akita.jp/genre/kankou',
  population = 29500,
  avg_property_price_jpy = 2700000,
  off_season_activities_score = 6,
  time_from_sydney = '12:02',
  time_from_melbourne = '12:42',
  time_from_brisbane = '12:52',
  time_from_perth = '13:22',
  time_from_adelaide = '14:52'
WHERE slug = 'kita-akita'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'akita');

-- Aomori (Aomori) ─ pop 266000
UPDATE cities SET
  municipality_url = 'https://global.atca.info/',
  population = 266000,
  avg_property_price_jpy = 14440000,
  off_season_activities_score = 7,
  time_from_sydney = '11:43',
  time_from_melbourne = '12:23',
  time_from_brisbane = '12:33',
  time_from_perth = '13:03',
  time_from_adelaide = '14:33'
WHERE slug = 'aomori'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'aomori');

-- Asahikawa (Hokkaido) ─ pop 330000
UPDATE cities SET
  municipality_url = 'https://www.atca.jp/kankou/',
  population = 330000,
  avg_property_price_jpy = 12760000,
  off_season_activities_score = 6,
  time_from_sydney = '12:15',
  time_from_melbourne = '12:55',
  time_from_brisbane = '13:05',
  time_from_perth = '13:35',
  time_from_adelaide = '15:05'
WHERE slug = 'asahikawa'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'hokkaido');

-- Higashikawa (Hokkaido) ─ pop 8648
UPDATE cities SET
  municipality_url = 'https://town.higashikawa.hokkaido.jp/intl/en/',
  population = 8648,
  avg_property_price_jpy = 12760000,
  off_season_activities_score = 5,
  time_from_sydney = '12:05',
  time_from_melbourne = '12:45',
  time_from_brisbane = '12:55',
  time_from_perth = '13:25',
  time_from_adelaide = '14:55'
WHERE slug = 'higashikawa'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'hokkaido');

-- Otaru (Hokkaido) ─ pop 106000
UPDATE cities SET
  municipality_url = 'https://www.visit-otaru-en.info/',
  population = 106000,
  avg_property_price_jpy = 6900000,
  off_season_activities_score = 7,
  time_from_sydney = '12:05',
  time_from_melbourne = '13:15',
  time_from_brisbane = '12:15',
  time_from_perth = '12:45',
  time_from_adelaide = '15:35'
WHERE slug = 'otaru'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'hokkaido');

-- Sapporo (Hokkaido) ─ pop 1967000
UPDATE cities SET
  municipality_url = 'https://visit.sapporo.travel/',
  population = 1967000,
  avg_property_price_jpy = 38040000,
  off_season_activities_score = 7,
  time_from_sydney = '11:23',
  time_from_melbourne = '12:33',
  time_from_brisbane = '11:33',
  time_from_perth = '12:03',
  time_from_adelaide = '14:53'
WHERE slug = 'sapporo'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'hokkaido');

-- Yubari (Hokkaido) ─ pop 6700
UPDATE cities SET
  municipality_url = 'https://www.city.yubari.lg.jp/site/kanko/',
  population = 6700,
  avg_property_price_jpy = 2100000,
  off_season_activities_score = 8,
  time_from_sydney = '11:55',
  time_from_melbourne = '13:05',
  time_from_brisbane = '12:05',
  time_from_perth = '12:35',
  time_from_adelaide = '15:25'
WHERE slug = 'yubari'
  AND prefecture_id = (SELECT id FROM prefectures WHERE slug = 'hokkaido');

COMMIT;
