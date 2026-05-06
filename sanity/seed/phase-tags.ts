// sanity/seed/phase-tags.ts
// Seed data for phaseTag + buyerTypeTag documents.
// Run via: npx tsx scripts/seed-sanity-tags.ts (requires SANITY_WRITE_TOKEN)

export const PHASE_TAG_SEED = [
  { phaseId: '0_trigger',       title: '0 Trigger',       userLabel: 'Decide First',  order: 0,
    description: 'Falling in love with Japan; recurring travel friction prompts the question of buying a base.' },
  { phaseId: '1_decision',      title: '1 Decision',      userLabel: 'Decide First',  order: 1,
    description: 'Define your purpose: live, seasonal, retire, rent, renovate. Set non-negotiables.' },
  { phaseId: '2_budget',        title: '2 Budget',        userLabel: 'Choose Area',   order: 2,
    description: 'Build your full cost model: purchase, closing, ongoing, financing.' },
  { phaseId: '3_area',          title: '3 Area',          userLabel: 'Choose Area',   order: 3,
    description: 'Choose 2–4 ecosystem areas. Score each on access, services, year-round livability.' },
  { phaseId: '4_shortlist',     title: '4 Shortlist',     userLabel: 'Shortlist Homes', order: 4,
    description: 'Request property data packs, run red-flag filters, schedule virtual viewings.' },
  { phaseId: '5_due_diligence', title: '5 Due Diligence', userLabel: 'Check Risks',   order: 5,
    description: 'Title, inspections, condition risks, tax status, seismic. Pause if pressured.' },
  { phaseId: '6_offer',         title: '6 Offer',         userLabel: 'Make Offer',    order: 6,
    description: 'Submit the offer with conditions. Avoid extreme lowball assumptions.' },
  { phaseId: '6_contract',      title: '6 Contract',      userLabel: 'Make Offer',    order: 6,
    description: 'Bilingual contract review. Document deposit rules and inclusions.' },
  { phaseId: '7_pre_close',     title: '7 Pre-close',     userLabel: 'Prepare Closing', order: 7,
    description: 'Legal coordination, POA, payments plan, insurance, post-close team.' },
  { phaseId: '8_closing',       title: '8 Closing',       userLabel: 'Prepare Closing', order: 8,
    description: 'Handover day, balance paid, title transfer, keys received.' },
  { phaseId: '9_move_in',       title: '9 Move-in',       userLabel: 'Prepare Closing', order: 9,
    description: 'Utilities, security, deep clean, local rules. (Owner Mode — out of scope for v1)' },
  { phaseId: '10_living',       title: '10 Living',       userLabel: 'Prepare Closing', order: 10,
    description: 'Annual budget, maintenance calendar, local bench. (Owner Mode — out of scope for v1)' },
  { phaseId: 'x_meta',          title: 'X Meta',          userLabel: 'Decide First',  order: -1,
    description: 'Cross-cutting lessons-learned content not tied to a specific phase.' },
];

export const BUYER_TYPE_TAG_SEED = [
  { buyerTypeId: 'all',        title: 'All',
    description: 'General audience. No specific operational profile.' },
  { buyerTypeId: 'remote',     title: 'Remote',
    description: 'Owner who will spend most of the year overseas; needs absentee infrastructure.' },
  { buyerTypeId: 'seasonal',   title: 'Seasonal',
    description: 'Holiday-home buyer who uses the property primarily for ski/snow seasons.' },
  { buyerTypeId: 'retirement', title: 'Retirement',
    description: 'Buyer planning daily-life use of the property in retirement.' },
];
