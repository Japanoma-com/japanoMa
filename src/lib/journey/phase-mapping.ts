// src/lib/journey/phase-mapping.ts
import { PHASE_ORDER, type Phase, type UserLabel } from './types';

// Two phases at index 6 (offer/contract) collapse to the same user label,
// so we use Math.min/Math.max on duplicate values rather than indexOf.
export const PHASE_RANK: Record<Phase, number> = {
  '0_trigger': 0,
  '1_decision': 1,
  '2_budget': 2,
  '3_area': 3,
  '4_shortlist': 4,
  '5_due_diligence': 5,
  '6_offer': 6,
  '6_contract': 6,
  '7_pre_close': 7,
  '8_closing': 8,
  '9_move_in': 9,
  '10_living': 10,
  'x_meta': -1,
};

const LABEL_MAP: Record<Phase, UserLabel> = {
  '0_trigger': 'Decide First',
  '1_decision': 'Decide First',
  '2_budget': 'Choose Area',
  '3_area': 'Choose Area',
  '4_shortlist': 'Shortlist Homes',
  '5_due_diligence': 'Check Risks',
  '6_offer': 'Make Offer',
  '6_contract': 'Make Offer',
  '7_pre_close': 'Prepare Closing',
  '8_closing': 'Prepare Closing',
  '9_move_in': 'Prepare Closing',  // owner-mode placeholder; not yet rendered
  '10_living': 'Prepare Closing',
  'x_meta': 'Decide First',
};

export function phaseToUserLabel(phase: Phase): UserLabel {
  return LABEL_MAP[phase];
}

const STEP_MAP: Record<UserLabel, 1 | 2 | 3 | 4 | 5 | 6> = {
  'Decide First': 1,
  'Choose Area': 2,
  'Shortlist Homes': 3,
  'Check Risks': 4,
  'Make Offer': 5,
  'Prepare Closing': 6,
};

export function phaseToStepNumber(phase: Phase): 1 | 2 | 3 | 4 | 5 | 6 {
  return STEP_MAP[phaseToUserLabel(phase)];
}

export { PHASE_ORDER };
