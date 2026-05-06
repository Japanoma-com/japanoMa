// src/lib/journey/__tests__/inference.test.ts
import { inferNextPhase } from '../inference';
import { PHASE_ORDER, SIGNAL_TYPES, type Phase } from '../types';

describe('inferNextPhase', () => {
  it('advances 0_trigger → 1_decision on quiz_started', () => {
    expect(inferNextPhase('0_trigger', 'quiz_started')).toBe('1_decision');
  });

  it('advances 0_trigger → 3_area on quiz_completed (skipping)', () => {
    expect(inferNextPhase('0_trigger', 'quiz_completed')).toBe('3_area');
  });

  it('advances 3_area → 4_shortlist on property_saved', () => {
    expect(inferNextPhase('3_area', 'property_saved')).toBe('4_shortlist');
  });

  it('advances 4_shortlist → 6_offer on lead_submitted (skipping)', () => {
    expect(inferNextPhase('4_shortlist', 'lead_submitted')).toBe('6_offer');
  });

  it('does NOT regress: 6_offer + quiz_completed stays at 6_offer', () => {
    expect(inferNextPhase('6_offer', 'quiz_completed')).toBe('6_offer');
  });

  it('does NOT regress: 5_due_diligence + area_saved stays', () => {
    expect(inferNextPhase('5_due_diligence', 'area_saved')).toBe('5_due_diligence');
  });

  it('handles same-rank: 6_offer + lead_submitted stays at 6_offer', () => {
    expect(inferNextPhase('6_offer', 'lead_submitted')).toBe('6_offer');
  });

  // Cartesian smoke test: every (phase, signal) pair returns a valid phase
  describe('Cartesian validity', () => {
    for (const phase of PHASE_ORDER) {
      for (const signal of SIGNAL_TYPES) {
        it(`${phase} + ${signal} → valid phase`, () => {
          const result = inferNextPhase(phase as Phase, signal);
          expect(PHASE_ORDER).toContain(result);
        });
      }
    }
  });
});
