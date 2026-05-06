// src/lib/journey/inference.ts
import { PHASE_RANK } from './phase-mapping';
import type { Phase, SignalType } from './types';

export const SIGNAL_TO_PHASE: Record<SignalType, Phase> = {
  quiz_started:                '1_decision',
  budget_calc_used:            '2_budget',
  quiz_completed:              '3_area',
  area_saved:                  '3_area',
  property_saved:              '4_shortlist',
  comparison_viewed:           '4_shortlist',
  red_flag_panel_viewed:       '5_due_diligence',
  inspection_requested:        '5_due_diligence',
  lead_submitted:              '6_offer',
  closing_readiness_completed: '7_pre_close',
  purchase_self_reported:      '9_move_in',
};

export function inferNextPhase(current: Phase, signalType: SignalType): Phase {
  const target = SIGNAL_TO_PHASE[signalType];
  return PHASE_RANK[target] > PHASE_RANK[current] ? target : current;
}
