// scripts/journey-backfill/run.ts
// Backfill phase + buyerTypes tags onto every existing article.
// Run dry: npx tsx scripts/journey-backfill/run.ts --dry-run
// Run live: npx tsx scripts/journey-backfill/run.ts
//
// Required env: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN
import { createClient } from '@sanity/client';
import { proposeTags } from './heuristic';

const AUTO_ACCEPT_THRESHOLD = Number(process.env.AUTO_ACCEPT_THRESHOLD ?? '0.85');
const BATCH_SIZE = 50;
const DRY_RUN = process.argv.includes('--dry-run');

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

const phaseRef = (phaseId: string) => ({ _type: 'reference', _ref: `phaseTag.${phaseId}` });
const buyerTypeRef = (id: string) => ({ _type: 'reference', _ref: `buyerTypeTag.${id}`, _key: id });

async function run() {
  console.log(`Backfill mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Auto-accept threshold: ${AUTO_ACCEPT_THRESHOLD}`);

  const articles = await client.fetch(
    `*[_type == "article" && !defined(phase)]{
      _id, title, excerpt,
      areaTags[]->{slug},
      propertyTypeTags[]->{slug},
      useCaseTags[]->{slug}
    }`
  );

  console.log(`Found ${articles.length} untagged articles`);
  if (articles.length === 0) return;

  let acceptedCanonical = 0;
  let suggestedOnly = 0;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const tx = client.transaction();

    for (const a of batch) {
      const proposal = proposeTags(a);
      const phase = phaseRef(proposal.phase);
      const buyerTypes = proposal.buyerTypes.map((t) => buyerTypeRef(t));

      const auto = proposal.phaseConfidence >= AUTO_ACCEPT_THRESHOLD;
      const patch = auto
        ? { phase, buyerTypes }
        : { phaseSuggested: phase, buyerTypesSuggested: buyerTypes };

      if (auto) acceptedCanonical++; else suggestedOnly++;

      if (DRY_RUN) {
        console.log(`  ${auto ? '✓' : '?'} ${a.title} → ${proposal.phase} (${proposal.phaseConfidence.toFixed(2)})`);
      } else {
        tx.patch(a._id, { set: patch });
      }
    }

    if (!DRY_RUN) {
      await tx.commit();
    }
    console.log(`Processed ${Math.min(i + BATCH_SIZE, articles.length)}/${articles.length}`);
    if (!DRY_RUN) await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nSummary:`);
  console.log(`  Auto-accepted (canonical): ${acceptedCanonical}`);
  console.log(`  Suggested (awaiting review): ${suggestedOnly}`);
}

run().catch((err) => { console.error(err); process.exit(1); });
