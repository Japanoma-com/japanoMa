// scripts/journey-backfill/__tests__/heuristic.test.ts
import { proposeTags } from '../heuristic';

type Article = {
  title: string;
  excerpt?: string;
  areaTags?: { slug: { current: string } }[];
  propertyTypeTags?: { slug: { current: string } }[];
  useCaseTags?: { slug: { current: string } }[];
};

describe('proposeTags', () => {
  it('detects due diligence from "title and rights"', () => {
    const r = proposeTags({ title: 'What to check on title and rights before signing' });
    expect(r.phase).toBe('5_due_diligence');
    expect(r.phaseConfidence).toBeGreaterThanOrEqual(0.85);
  });

  it('detects budget from "ongoing costs" in excerpt', () => {
    const r = proposeTags({
      title: 'Owning a home in Japan',
      excerpt: 'A breakdown of the ongoing costs you should expect.',
    });
    expect(r.phase).toBe('2_budget');
  });

  it('detects pre_close from "power of attorney"', () => {
    expect(proposeTags({ title: 'Setting up power of attorney for closing' }).phase)
      .toBe('7_pre_close');
  });

  it('maps useCaseTag=investment → buyerType=remote', () => {
    expect(proposeTags({
      title: 'Generic article',
      useCaseTags: [{ slug: { current: 'investment' } }],
    }).buyerTypes).toContain('remote');
  });

  it('maps useCaseTag=retirement → buyerType=retirement', () => {
    expect(proposeTags({
      title: 'Generic article',
      useCaseTags: [{ slug: { current: 'retirement' } }],
    }).buyerTypes).toContain('retirement');
  });

  it('falls back to 1_decision with low confidence when no signals match', () => {
    const r = proposeTags({ title: 'Some random article about Tokyo trains' });
    expect(r.phase).toBe('1_decision');
    expect(r.phaseConfidence).toBeLessThan(0.5);
  });

  it('returns [all] for buyerTypes when no signals', () => {
    expect(proposeTags({ title: 'Generic article' }).buyerTypes).toEqual(['all']);
  });

  it('detects retirement keyword in body', () => {
    const r = proposeTags({
      title: 'Quiet living',
      excerpt: 'A guide for those planning to retire and join community integration.',
    });
    expect(r.buyerTypes).toContain('retirement');
  });

  it('areaTag-only article lands in 3_area at 0.5 confidence', () => {
    const r = proposeTags({
      title: 'Hakuba snapshot',
      areaTags: [{ slug: { current: 'hakuba' } }],
    });
    expect(r.phase).toBe('3_area');
    expect(r.phaseConfidence).toBe(0.5);
  });
});
