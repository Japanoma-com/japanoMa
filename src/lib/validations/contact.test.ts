import { contactSchema } from './contact';

describe('contactSchema', () => {
  const validBase = {
    name: 'Sara Tanaka',
    email: 'sara@example.com',
    message: 'Looking for a holiday home in Myoko this winter.',
    consent: true,
  };

  it('accepts a submission with no source context', () => {
    const result = contactSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('accepts a submission with sourceContext.areaSlugs only (existing shape)', () => {
    const result = contactSchema.safeParse({
      ...validBase,
      source: 'area_detail',
      sourceContext: { areaSlugs: ['myoko'] },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a submission with sourceContext.quizContext', () => {
    const result = contactSchema.safeParse({
      ...validBase,
      source: 'quiz',
      sourceContext: {
        areaSlugs: ['myoko'],
        quizContext: {
          purpose: 'Ski Base',
          skiSeason: 'Annual Pilgrimage',
          propertyTypes: ['Detached House', 'Akiya (Vacant Home)'],
          condition: 'Inspected + Warranty',
          budget: '¥15M to ¥30M (A$135K to A$270K)',
          priority: 'Closest to Slopes',
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a submission with a partial quizContext (some fields missing)', () => {
    const result = contactSchema.safeParse({
      ...validBase,
      source: 'quiz',
      sourceContext: {
        quizContext: {
          purpose: 'Holiday Home',
          budget: '¥30M to ¥50M (A$270K to A$450K)',
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects quizContext fields with the wrong type', () => {
    const result = contactSchema.safeParse({
      ...validBase,
      source: 'quiz',
      sourceContext: {
        quizContext: {
          propertyTypes: 'Detached House', // should be string[], not string
        },
      },
    });
    expect(result.success).toBe(false);
  });
});
