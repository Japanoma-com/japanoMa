-- Generated 2026-04-24T00:22:53.309Z
UPDATE cities
SET hero_image_path = '/areas/' || slug || '.avif'
WHERE slug IN ('asahikawa', 'higashikawa', 'otaru', 'sapporo', 'yubari', 'iiyama', 'iizuna', 'kijimadaira', 'nakano', 'shinano', 'yamanouchi', 'agano', 'gosen', 'minamiuonuma', 'myoko', 'shibata', 'uonuma', 'yuzawa', 'minakami', 'numata', 'nasushiobara', 'inawashiro', 'shiroishi', 'yamagata', 'nishikawa', 'tsuruoka', 'hachimantai', 'hanamaki', 'kitakami', 'kita-akita', 'semboku', 'aomori');
