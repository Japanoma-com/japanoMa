// scripts/journey-backfill/heuristic.ts
// Pure function: proposes (phase, buyerTypes) tags from existing article fields.
// First-match priority order; deterministic.
import type { Phase, BuyerType } from '@/lib/journey/types';

type ArticleSlim = {
  title?: string;
  excerpt?: string;
  areaTags?: { slug?: { current?: string } }[];
  propertyTypeTags?: { slug?: { current?: string } }[];
  useCaseTags?: { slug?: { current?: string } }[];
};

export type Proposal = {
  phase: Phase;
  phaseConfidence: number;
  buyerTypes: BuyerType[];
  buyerTypesConfidence: number;
};

type PhaseRule = { keywords: string[]; phase: Phase; confidence: number };

const PHASE_RULES: PhaseRule[] = [
  { keywords: ['title', 'rights', 'due diligence', 'red flag', 'tax status', 'inspection', 'seismic', 'condition risk'],
    phase: '5_due_diligence', confidence: 0.9 },
  { keywords: ['closing cost', 'ongoing cost', 'tco', 'total cost of ownership', 'budget', 'financing', 'loan', 'mortgage', 'hidden fee'],
    phase: '2_budget', confidence: 0.9 },
  { keywords: ['power of attorney', 'poa', 'remote closing', 'wise', 'transfer fund', 'pre-close', 'insurance'],
    phase: '7_pre_close', confidence: 0.9 },
  { keywords: ['shortlist', 'viewing', 'virtual tour', 'data pack', 'floor plan'],
    phase: '4_shortlist', confidence: 0.9 },
  { keywords: ['handover', 'registration', 'title transfer', 'keys received', 'closing day'],
    phase: '8_closing', confidence: 0.9 },
  { keywords: ['utilities', 'deep clean', 'garbage sorting', 'move-in', 'change locks', 'safety check'],
    phase: '9_move_in', confidence: 0.9 },
  { keywords: ['maintenance calendar', 'house binder', 'annual budget', 'seasonal maintenance', 'local bench'],
    phase: '10_living', confidence: 0.9 },
  { keywords: ['ecosystem area', 'area selection', 'operations feasibility', 'seasonality', 'prefecture', 'subprefecture'],
    phase: '3_area', confidence: 0.85 },
  { keywords: ['offer', 'contract review', 'deposit', 'inclusions list'],
    phase: '6_offer', confidence: 0.85 },
  { keywords: ['why japan', 'purpose', 'decision', 'fit', 'goals', 'non-negotiables'],
    phase: '1_decision', confidence: 0.85 },
  { keywords: ['trigger', 'dreaming', 'fascinated', 'repeat visits', 'friction with travel'],
    phase: '0_trigger', confidence: 0.7 },
];

const BUYER_TYPE_USECASE_MAP: Record<string, { type: BuyerType; confidence: number }> = {
  'investment':    { type: 'remote',     confidence: 0.9 },
  'holiday-home':  { type: 'seasonal',   confidence: 0.9 },
  'ski-lifestyle': { type: 'seasonal',   confidence: 0.9 },
  'retirement':    { type: 'retirement', confidence: 0.95 },
};

const BUYER_TYPE_KEYWORDS: Array<{ keywords: string[]; type: BuyerType; confidence: number }> = [
  { keywords: ['remote', 'absentee', 'from overseas'],                          type: 'remote',     confidence: 0.7 },
  { keywords: ['winter', 'ski', 'snowboard', 'seasonal use', 'holiday home'],   type: 'seasonal',   confidence: 0.7 },
  { keywords: ['retire', 'community integration', 'low-barrier', 'daily-life'], type: 'retirement', confidence: 0.7 },
];

function corpusOf(article: ArticleSlim): string {
  return ((article.title ?? '') + ' ' + (article.excerpt ?? '')).toLowerCase();
}

function pickPhase(article: ArticleSlim): { phase: Phase; confidence: number } {
  const corpus = corpusOf(article);
  for (const rule of PHASE_RULES) {
    if (rule.keywords.some((k) => corpus.includes(k))) {
      return { phase: rule.phase, confidence: rule.confidence };
    }
  }
  if ((article.areaTags ?? []).length > 0) return { phase: '3_area', confidence: 0.5 };
  if ((article.propertyTypeTags ?? []).length > 0) return { phase: '4_shortlist', confidence: 0.5 };
  return { phase: '1_decision', confidence: 0.3 };
}

function pickBuyerTypes(article: ArticleSlim): { types: BuyerType[]; confidence: number } {
  const found = new Set<BuyerType>();
  let maxConfidence = 0;

  for (const tag of article.useCaseTags ?? []) {
    const slug = tag.slug?.current;
    if (slug && BUYER_TYPE_USECASE_MAP[slug]) {
      const { type, confidence } = BUYER_TYPE_USECASE_MAP[slug];
      found.add(type);
      maxConfidence = Math.max(maxConfidence, confidence);
    }
  }

  const corpus = corpusOf(article);
  for (const rule of BUYER_TYPE_KEYWORDS) {
    if (rule.keywords.some((k) => corpus.includes(k))) {
      found.add(rule.type);
      maxConfidence = Math.max(maxConfidence, rule.confidence);
    }
  }

  if (found.size === 0) return { types: ['all'], confidence: 0.3 };
  return { types: [...found], confidence: maxConfidence };
}

export function proposeTags(article: ArticleSlim): Proposal {
  const { phase, confidence: phaseConfidence } = pickPhase(article);
  const { types: buyerTypes, confidence: buyerTypesConfidence } = pickBuyerTypes(article);
  return { phase, phaseConfidence, buyerTypes, buyerTypesConfidence };
}
