-- Shimotakai-gun was the only district (-gun / 郡) listing in cities
-- — the rest of the taxonomy is official municipalities (cities,
-- towns, villages). Removing for taxonomic consistency per the
-- 2026-05-06 product directive.
--
-- Saves and leads that reference the slug ('shimotakai') are
-- intentionally left intact so we don't destroy user data; the
-- orphan slugs will surface as 404s if those users open them and
-- the team can outreach if needed. (At time of writing: 1 save,
-- 1 lead.)

DELETE FROM public.cities WHERE slug = 'shimotakai';
