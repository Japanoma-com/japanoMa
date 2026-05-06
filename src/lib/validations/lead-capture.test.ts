import {
  profileSnapshotSchema,
  leadInputSchema,
  recordConsentAndCreateLeadInputSchema,
} from './lead-capture';

const validSnapshot = {
  types: ['akiya', 'modern-cabin'],
  condition: 'move-in-ready',
  budget: '15-30m',
  summary: 'Family-focused buyer seeking a low-maintenance base near powder and onsen.',
  score: 87,
};

const validLeadInput = {
  areaSlug: 'hakuba',
  prefectureSlug: 'nagano',
  profileSnapshot: validSnapshot,
};

describe('profileSnapshotSchema', () => {
  it('accepts a valid snapshot', () => {
    expect(profileSnapshotSchema.safeParse(validSnapshot).success).toBe(true);
  });

  it('rejects score > 100', () => {
    const result = profileSnapshotSchema.safeParse({ ...validSnapshot, score: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects empty types array', () => {
    const result = profileSnapshotSchema.safeParse({ ...validSnapshot, types: [] });
    expect(result.success).toBe(false);
  });

  it('rejects types array longer than 10', () => {
    const result = profileSnapshotSchema.safeParse({
      ...validSnapshot,
      types: Array(11).fill('akiya'),
    });
    expect(result.success).toBe(false);
  });
});

describe('leadInputSchema', () => {
  it('accepts valid input', () => {
    expect(leadInputSchema.safeParse(validLeadInput).success).toBe(true);
  });

  it('rejects areaSlug with uppercase letters', () => {
    const result = leadInputSchema.safeParse({ ...validLeadInput, areaSlug: 'Hakuba' });
    expect(result.success).toBe(false);
  });

  it('rejects areaSlug with spaces', () => {
    const result = leadInputSchema.safeParse({ ...validLeadInput, areaSlug: 'hakuba valley' });
    expect(result.success).toBe(false);
  });

  it('rejects prefectureSlug with underscores', () => {
    const result = leadInputSchema.safeParse({ ...validLeadInput, prefectureSlug: 'nagano_pref' });
    expect(result.success).toBe(false);
  });
});

describe('recordConsentAndCreateLeadInputSchema', () => {
  it("accepts a valid version 'v1'", () => {
    const input = { ...validLeadInput, consentTextVersion: 'v1' };
    expect(recordConsentAndCreateLeadInputSchema.safeParse(input).success).toBe(true);
  });

  it("rejects version 'v' (no digits)", () => {
    const input = { ...validLeadInput, consentTextVersion: 'v' };
    expect(recordConsentAndCreateLeadInputSchema.safeParse(input).success).toBe(false);
  });

  it("rejects version 'version1'", () => {
    const input = { ...validLeadInput, consentTextVersion: 'version1' };
    expect(recordConsentAndCreateLeadInputSchema.safeParse(input).success).toBe(false);
  });
});
