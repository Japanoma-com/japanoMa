/**
 * Integration test for the lead capture flow.
 *
 * Requires: the Japanoma Supabase project reachable via .env.local
 * credentials, migrations applied, and INTEGRATION=1 environment variable
 * set when running Jest.
 *
 * Scenarios:
 *  1. First-time interest (creates consent + lead atomically)
 *  2. Subsequent interest on a second area (reuses active consent)
 *  3. Nuclear withdrawal (revokes consent + all leads)
 */

import { db } from '@/lib/db';
import { consentRecords, leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  recordConsentAndCreateLead,
  createLeadWithExistingConsent,
  withdrawAllConsent,
} from './lead-actions';

const RUN = process.env.INTEGRATION === '1';
const describeIfIntegration = RUN ? describe : describe.skip;

// A stable test user id. This test does NOT create a real auth.users row —
// the Supabase mock below pretends the user is authenticated. BUT the
// consent_records / leads FK on auth.users(id) will reject any user_id
// that doesn't exist in auth.users. For this test to pass against a real
// DB, a test auth.users row with this UUID must exist, OR the FK must be
// deferrable. Neither is true right now — this test is wired but will only
// succeed in an environment where a real test user is seeded.
const TEST_USER_ID = '00000000-0000-0000-0000-000000000999';

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: '00000000-0000-0000-0000-000000000999', email: 'it@example.com' } },
      }),
    },
  }),
}));

jest.mock('next/headers', () => ({
  headers: async () => ({
    get: (key: string) => {
      if (key === 'x-forwarded-for') return '127.0.0.1';
      if (key === 'user-agent') return 'IntegrationTest/1.0';
      return null;
    },
  }),
}));

describeIfIntegration('lead capture flow — integration', () => {
  beforeEach(async () => {
    // Reset: delete any leads and consent records for the test user
    await db.delete(leads).where(eq(leads.userId, TEST_USER_ID));
    await db.delete(consentRecords).where(eq(consentRecords.userId, TEST_USER_ID));
  });

  afterAll(async () => {
    await db.delete(leads).where(eq(leads.userId, TEST_USER_ID));
    await db.delete(consentRecords).where(eq(consentRecords.userId, TEST_USER_ID));
  });

  const BASE_PROFILE = {
    types: ['akiya'],
    condition: 'move-in-ready',
    budget: '15-30m',
    summary: 'integration test summary',
    score: 90,
  };

  it('Scenario 1: first-time interest creates consent + lead atomically', async () => {
    const result = await recordConsentAndCreateLead({
      areaSlug: 'hakuba',
      prefectureSlug: 'nagano',
      profileSnapshot: BASE_PROFILE,
      consentTextVersion: 'v1',
    });

    expect(result).toHaveProperty('success', true);

    const consents = await db
      .select()
      .from(consentRecords)
      .where(eq(consentRecords.userId, TEST_USER_ID));
    expect(consents).toHaveLength(1);
    expect(consents[0].consentTextBody).toContain('I consent to Go&C Partners');

    const ls = await db.select().from(leads).where(eq(leads.userId, TEST_USER_ID));
    expect(ls).toHaveLength(1);
    expect(ls[0].areaSlug).toBe('hakuba');
    expect(ls[0].consentRecordId).toBe(consents[0].id);
  });

  it('Scenario 2: subsequent interest reuses active consent', async () => {
    // Seed from Scenario 1 setup
    await recordConsentAndCreateLead({
      areaSlug: 'hakuba',
      prefectureSlug: 'nagano',
      profileSnapshot: BASE_PROFILE,
      consentTextVersion: 'v1',
    });

    const result = await createLeadWithExistingConsent({
      areaSlug: 'nozawa-onsen',
      prefectureSlug: 'nagano',
      profileSnapshot: BASE_PROFILE,
    });

    expect(result).toHaveProperty('success', true);

    const consents = await db
      .select()
      .from(consentRecords)
      .where(eq(consentRecords.userId, TEST_USER_ID));
    expect(consents).toHaveLength(1); // no new consent created

    const ls = await db.select().from(leads).where(eq(leads.userId, TEST_USER_ID));
    expect(ls).toHaveLength(2);
    expect(ls.every((l) => l.consentRecordId === consents[0].id)).toBe(true);
  });

  it('Scenario 3: nuclear withdrawal revokes consent + all leads', async () => {
    await recordConsentAndCreateLead({
      areaSlug: 'hakuba',
      prefectureSlug: 'nagano',
      profileSnapshot: BASE_PROFILE,
      consentTextVersion: 'v1',
    });
    await createLeadWithExistingConsent({
      areaSlug: 'nozawa-onsen',
      prefectureSlug: 'nagano',
      profileSnapshot: BASE_PROFILE,
    });

    const result = await withdrawAllConsent();
    expect(result).toEqual({ success: true, withdrawnLeadCount: 2 });

    // Assert all consent records for this user are withdrawn
    const allConsents = await db
      .select()
      .from(consentRecords)
      .where(eq(consentRecords.userId, TEST_USER_ID));
    expect(allConsents.length).toBeGreaterThan(0);
    expect(allConsents.every((c) => c.withdrawnAt !== null)).toBe(true);

    // Assert all leads for this user are withdrawn
    const allLeads = await db.select().from(leads).where(eq(leads.userId, TEST_USER_ID));
    expect(allLeads.length).toBe(2);
    expect(allLeads.every((l) => l.withdrawnAt !== null)).toBe(true);
    expect(allLeads.every((l) => l.status === 'withdrawn')).toBe(true);
  });
});
