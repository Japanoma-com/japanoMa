// src/lib/journey/types.ts

export const PHASE_ORDER = [
  '0_trigger',
  '1_decision',
  '2_budget',
  '3_area',
  '4_shortlist',
  '5_due_diligence',
  '6_offer',
  '6_contract',
  '7_pre_close',
  '8_closing',
  '9_move_in',
  '10_living',
  'x_meta',
] as const;

export type Phase = typeof PHASE_ORDER[number];

export const BUYER_TYPES = ['all', 'remote', 'seasonal', 'retirement'] as const;
export type BuyerType = typeof BUYER_TYPES[number];

export const SIGNAL_TYPES = [
  'quiz_started',
  'budget_calc_used',
  'quiz_completed',
  'area_saved',
  'property_saved',
  'comparison_viewed',
  'red_flag_panel_viewed',
  'inspection_requested',
  'lead_submitted',
  'closing_readiness_completed',
  'purchase_self_reported',
] as const;

export type SignalType = typeof SIGNAL_TYPES[number];

export type UserLabel =
  | 'Decide First'
  | 'Choose Area'
  | 'Shortlist Homes'
  | 'Check Risks'
  | 'Make Offer'
  | 'Prepare Closing';

export interface JourneyState {
  phase: Phase;
  userLabel: UserLabel;
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6;
  buyerType: BuyerType | null;
  isOverridden: boolean;
  phaseOverriddenAt: string | null;
  nextHint: string;
}
