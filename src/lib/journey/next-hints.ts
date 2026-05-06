// src/lib/journey/next-hints.ts
import type { Phase } from './types';

const HINTS: Record<Phase, string> = {
  '0_trigger':       'Take the area quiz',
  '1_decision':      'Take the area quiz',
  '2_budget':        'Try the budget calculator',
  '3_area':          'Save 3+ properties to advance to Shortlist',
  '4_shortlist':     'Compare your shortlist on /compare',
  '5_due_diligence': 'Read the red-flag checklist',
  '6_offer':         'Express interest with Katitas',
  '6_contract':      'Review your contract',
  '7_pre_close':     'Line up your closing-readiness checks',
  '8_closing':       'Confirm registration after handover',
  '9_move_in':       'Activate utilities and run safety checks',
  '10_living':       'Set your maintenance calendar',
  'x_meta':          'Take the area quiz',
};

export function getNextHint(phase: Phase): string {
  return HINTS[phase];
}
