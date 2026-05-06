import { extractQuizContext } from './contact-context';

describe('extractQuizContext', () => {
  it('returns null when answers is empty', () => {
    expect(extractQuizContext({})).toBeNull();
  });

  it('returns null when no quiz IDs are present', () => {
    expect(extractQuizContext({ unknownField: 'foo' })).toBeNull();
  });

  it('extracts a fully answered quiz to labeled output', () => {
    const result = extractQuizContext({
      purpose: 'ski-base',
      ski_season: 'annual',
      family_composition: 'young_family',
      property_type: ['detached', 'akiya'],
      condition: 'inspected',
      budget: '15-30m',
      priority: 'slopes',
    });

    expect(result).toEqual({
      purpose: 'Ski Base',
      skiSeason: 'Annual Pilgrimage',
      familyComposition: 'Family with young kids',
      propertyTypes: ['Detached House', 'Akiya (Vacant Home)'],
      condition: 'Inspected + Warranty',
      budget: 'A$135K to A$270K (¥15M to ¥30M)',
      priority: 'Closest to Slopes',
    });
  });

  it('handles partial answers (only some questions completed)', () => {
    const result = extractQuizContext({
      purpose: 'lifestyle-income',
      budget: '30-50m',
    });

    expect(result).toEqual({
      purpose: 'Lifestyle + Income',
      budget: 'A$270K to A$450K (¥30M to ¥50M)',
    });
  });

  it('skips unknown answer IDs gracefully', () => {
    const result = extractQuizContext({
      purpose: 'made-up-purpose-id',
      budget: '15-30m',
    });

    expect(result).toEqual({
      budget: 'A$135K to A$270K (¥15M to ¥30M)',
    });
  });

  it('returns null when answers contain only unknown IDs', () => {
    expect(extractQuizContext({ purpose: 'made-up' })).toBeNull();
  });

  it('handles property_type as a single string (degenerate case)', () => {
    const result = extractQuizContext({
      property_type: 'detached',
    });

    expect(result).toEqual({
      propertyTypes: ['Detached House'],
    });
  });
});
