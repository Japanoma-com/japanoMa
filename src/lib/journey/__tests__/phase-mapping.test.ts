// src/lib/journey/__tests__/phase-mapping.test.ts
import {
  phaseToUserLabel,
  phaseToStepNumber,
  PHASE_RANK,
} from '../phase-mapping';
import type { Phase, UserLabel } from '../types';

describe('phaseToUserLabel', () => {
  const cases: Array<[Phase, UserLabel]> = [
    ['0_trigger', 'Decide First'],
    ['1_decision', 'Decide First'],
    ['2_budget', 'Choose Area'],
    ['3_area', 'Choose Area'],
    ['4_shortlist', 'Shortlist Homes'],
    ['5_due_diligence', 'Check Risks'],
    ['6_offer', 'Make Offer'],
    ['6_contract', 'Make Offer'],
    ['7_pre_close', 'Prepare Closing'],
    ['8_closing', 'Prepare Closing'],
  ];
  it.each(cases)('maps %s → %s', (phase, label) => {
    expect(phaseToUserLabel(phase)).toBe(label);
  });
});

describe('phaseToStepNumber', () => {
  const cases: Array<[Phase, number]> = [
    ['0_trigger', 1], ['1_decision', 1],
    ['2_budget', 2],  ['3_area', 2],
    ['4_shortlist', 3],
    ['5_due_diligence', 4],
    ['6_offer', 5],   ['6_contract', 5],
    ['7_pre_close', 6], ['8_closing', 6],
  ];
  it.each(cases)('maps %s → step %i', (phase, n) => {
    expect(phaseToStepNumber(phase)).toBe(n);
  });
});

describe('PHASE_RANK', () => {
  it('orders 0_trigger < 1_decision < ... < 10_living', () => {
    expect(PHASE_RANK['0_trigger']).toBeLessThan(PHASE_RANK['1_decision']);
    expect(PHASE_RANK['1_decision']).toBeLessThan(PHASE_RANK['2_budget']);
    expect(PHASE_RANK['5_due_diligence']).toBeLessThan(PHASE_RANK['6_offer']);
    expect(PHASE_RANK['6_offer']).toBe(PHASE_RANK['6_contract']);
    expect(PHASE_RANK['9_move_in']).toBeLessThan(PHASE_RANK['10_living']);
  });
});
