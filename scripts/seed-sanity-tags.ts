// scripts/seed-sanity-tags.ts
// Seeds the 13 phase tags + 4 buyer-type tags into Sanity.
// Run: npx tsx scripts/seed-sanity-tags.ts
// Required env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN

import { createClient } from '@sanity/client';
import { PHASE_TAG_SEED, BUYER_TYPE_TAG_SEED } from '../sanity/seed/phase-tags';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing env vars: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

async function run() {
  console.log('Seeding phase tags…');
  const phaseTx = client.transaction();
  for (const seed of PHASE_TAG_SEED) {
    phaseTx.createOrReplace({
      _id: `phaseTag.${seed.phaseId}`,
      _type: 'phaseTag',
      ...seed,
    });
  }
  await phaseTx.commit();
  console.log(`✓ ${PHASE_TAG_SEED.length} phase tags seeded`);

  console.log('Seeding buyer-type tags…');
  const btTx = client.transaction();
  for (const seed of BUYER_TYPE_TAG_SEED) {
    btTx.createOrReplace({
      _id: `buyerTypeTag.${seed.buyerTypeId}`,
      _type: 'buyerTypeTag',
      ...seed,
    });
  }
  await btTx.commit();
  console.log(`✓ ${BUYER_TYPE_TAG_SEED.length} buyer-type tags seeded`);
}

run().catch((err) => { console.error(err); process.exit(1); });
