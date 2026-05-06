#!/usr/bin/env node
/**
 * One-way sync: DB cities → Sanity areaTag documents.
 *
 * The DB is the source of truth for geography (from Kaz's CRA-76
 * taxonomy workbook). Sanity areaTag documents exist so editors can
 * tag articles with an area, and so article filter UIs can show a
 * canonical area label in Sanity Studio.
 *
 * This script:
 *   1. Reads every active city from the DB.
 *   2. For each city, upserts an `areaTag` in Sanity with:
 *        _id:   "areaTag-<city_slug>"   (deterministic → idempotent)
 *        title: city name (EN)
 *        slug:  city slug (matches DB)
 *   3. Reports orphan Sanity areaTags (exist in Sanity but no matching
 *      DB city) — flagged for manual review, not auto-deleted.
 *
 * Usage:   node scripts/sync-sanity-area-tags.mjs
 * Safe to re-run; only changes drift.
 *
 * Requires a Sanity write token — set SANITY_WRITE_TOKEN in .env.local.
 * If absent, the script runs in dry-run mode and only reports drift.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

// Prefer explicit env var; fall back to the Sanity CLI token cache so
// this script "just works" on a machine that's already run `sanity login`.
let writeToken = process.env.SANITY_WRITE_TOKEN;
if (!writeToken) {
  try {
    const cliCfg = JSON.parse(
      readFileSync(`${process.env.HOME}/.config/sanity/config.json`, 'utf8')
    );
    writeToken = cliCfg.authToken;
  } catch {
    // no cli token — dry run only
  }
}

const DRY_RUN = !writeToken || process.argv.includes('--dry-run');
if (DRY_RUN) {
  console.log('⚠ DRY RUN — report only. Pass --apply or set SANITY_WRITE_TOKEN to apply.');
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const sanity = createClient({
  projectId: 'ljeqozrv',
  dataset: 'production',
  apiVersion: '2025-08-15',
  token: writeToken,
  useCdn: false,
});

async function main() {
  console.log('\n== DB cities ==');
  const cities = await sql`
    SELECT c.slug, c.name_en, c.name_ja, c.launch_priority, p.slug AS prefecture_slug, p.name_en AS prefecture_name
    FROM cities c
    INNER JOIN prefectures p ON p.id = c.prefecture_id
    WHERE c.status = 'active' OR c.launch_priority IN ('P1', 'P2')
    ORDER BY p.sort_order, c.slug
  `;
  console.log(`  ${cities.length} active / priority cities`);

  console.log('\n== Sanity areaTag documents ==');
  const existing = await sanity.fetch(
    `*[_type == "areaTag"]{_id, title, "slug": slug.current}`
  );
  const existingBySlug = new Map(existing.map((d) => [d.slug, d]));
  console.log(`  ${existing.length} existing areaTags`);

  const toCreate = [];
  const toUpdate = [];
  for (const city of cities) {
    const found = existingBySlug.get(city.slug);
    if (!found) {
      toCreate.push(city);
    } else if (found.title !== city.name_en) {
      toUpdate.push({ ...city, sanityId: found._id });
    }
  }

  const dbSlugs = new Set(cities.map((c) => c.slug));
  const orphans = existing.filter((d) => d.slug && !dbSlugs.has(d.slug));

  console.log('\n== Sync plan ==');
  console.log(`  + ${toCreate.length} to create`);
  console.log(`  ~ ${toUpdate.length} to update (title drift)`);
  console.log(`  ? ${orphans.length} orphan in Sanity (no DB match)`);

  if (toCreate.length) {
    console.log('\n  Creating:');
    for (const c of toCreate.slice(0, 20)) console.log(`    + ${c.slug}  ${c.name_en}  (${c.prefecture_name}, ${c.launch_priority})`);
    if (toCreate.length > 20) console.log(`    ... and ${toCreate.length - 20} more`);
  }
  if (toUpdate.length) {
    console.log('\n  Updating:');
    for (const c of toUpdate) console.log(`    ~ ${c.slug}  → "${c.name_en}"`);
  }
  if (orphans.length) {
    console.log('\n  Orphans (Sanity has these but no DB city — manual review):');
    for (const o of orphans) console.log(`    ? ${o.slug ?? '(no slug)'}  "${o.title}"  _id=${o._id}`);
  }

  if (DRY_RUN) {
    console.log('\n⚠ Dry run complete. Set SANITY_WRITE_TOKEN to apply changes.');
    await sql.end();
    return;
  }

  console.log('\n== Applying ==');
  for (const c of toCreate) {
    await sanity.createOrReplace({
      _id: `areaTag-${c.slug}`,
      _type: 'areaTag',
      title: c.name_en,
      slug: { _type: 'slug', current: c.slug },
    });
    console.log(`  ✓ created ${c.slug}`);
  }
  for (const c of toUpdate) {
    await sanity.patch(c.sanityId).set({ title: c.name_en }).commit();
    console.log(`  ✓ updated ${c.slug} → ${c.name_en}`);
  }

  console.log(`\n✓ Done. ${toCreate.length + toUpdate.length} change(s) applied.`);
  await sql.end();
}

main().catch((err) => {
  console.error('✘ Sync failed:', err);
  sql.end();
  process.exitCode = 1;
});
