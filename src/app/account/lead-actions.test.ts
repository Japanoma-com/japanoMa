import { recordConsentAndCreateLead, createLeadWithExistingConsent } from './lead-actions';

// --- Mocks ----------------------------------------------------------------

const mockGetUser = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockTransaction = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
  }),
}));

jest.mock('@/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

jest.mock('next/headers', () => ({
  headers: async () => ({
    get: (key: string) => {
      if (key === 'x-forwarded-for') return '1.2.3.4';
      if (key === 'user-agent') return 'Jest/Test';
      return null;
    },
  }),
}));

const ORIGINAL_SALT = process.env.CONSENT_IP_HASH_SALT;
beforeEach(() => {
  jest.resetAllMocks();
  process.env.CONSENT_IP_HASH_SALT = 'test-salt';
});
afterAll(() => {
  process.env.CONSENT_IP_HASH_SALT = ORIGINAL_SALT;
});

// --- Fixtures -------------------------------------------------------------

const VALID_INPUT = {
  areaSlug: 'hakuba',
  prefectureSlug: 'nagano',
  profileSnapshot: {
    types: ['akiya'],
    condition: 'move-in-ready',
    budget: '15-30m',
    summary: 'test summary',
    score: 87,
  },
  consentTextVersion: 'v1',
};

const USER = { id: 'user-abc', email: 'test@example.com' };

const V1_VERSION_ROW = {
  version: 'v1',
  body: 'I consent to...',
  bodyHash: 'abc123def456',
  scope: 'japanese_partner_lead_sharing',
};

// Helpers to make the mock db fluent — Drizzle uses builder chains.
function mockSelectReturning(rows: unknown[]) {
  const chain = {
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(rows),
      }),
    }),
  };
  mockSelect.mockReturnValue(chain);
}

// --- Tests ----------------------------------------------------------------

describe('recordConsentAndCreateLead', () => {
  it('returns { error: "not_authenticated" } when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await recordConsentAndCreateLead(VALID_INPUT);
    expect(result).toEqual({ error: 'not_authenticated' });
  });

  it('returns { error: "invalid_input" } when areaSlug contains uppercase', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    const result = await recordConsentAndCreateLead({ ...VALID_INPUT, areaSlug: 'Hakuba' });
    expect(result).toEqual({ error: 'invalid_input' });
  });

  it('returns { error: "invalid_input" } when profileSnapshot.score > 100', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    const result = await recordConsentAndCreateLead({
      ...VALID_INPUT,
      profileSnapshot: { ...VALID_INPUT.profileSnapshot, score: 101 },
    });
    expect(result).toEqual({ error: 'invalid_input' });
  });

  it('returns { error: "consent_version_not_found" } when version is unknown', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockSelectReturning([]); // version lookup returns no rows

    const result = await recordConsentAndCreateLead({ ...VALID_INPUT, consentTextVersion: 'v99' });
    expect(result).toEqual({ error: 'consent_version_not_found' });
  });

  it('creates consent + lead atomically on the happy path', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockSelectReturning([V1_VERSION_ROW]);

    const txInserts: { table: string; values: unknown }[] = [];
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      let insertCallCount = 0;
      const tx = {
        insert: (_table: unknown) => ({
          values: (values: unknown) => ({
            returning: jest.fn().mockImplementation(() => {
              insertCallCount++;
              // First insert is consent_records, second is leads (order guaranteed by impl)
              const tableName = insertCallCount === 1 ? 'consent_records' : 'leads';
              txInserts.push({ table: tableName, values });
              if (tableName === 'consent_records') return Promise.resolve([{ id: 'consent-1' }]);
              if (tableName === 'leads') return Promise.resolve([{ id: 'lead-1' }]);
              return Promise.resolve([]);
            }),
          }),
        }),
      };
      return cb(tx);
    });

    const result = await recordConsentAndCreateLead(VALID_INPUT);

    expect(result).toEqual({ success: true, leadId: 'lead-1', consentRecordId: 'consent-1' });
    expect(txInserts).toHaveLength(2);
  });

  it('accepts v1 even when v2 is now the active version', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    // v1 still exists in history even though v2 is active now
    mockSelectReturning([V1_VERSION_ROW]);

    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      let calls = 0;
      const tx = {
        insert: () => ({
          values: () => ({
            returning: () => {
              calls++;
              return Promise.resolve(calls === 1 ? [{ id: 'consent-1' }] : [{ id: 'lead-1' }]);
            },
          }),
        }),
      };
      return cb(tx);
    });

    const result = await recordConsentAndCreateLead(VALID_INPUT);
    expect(result).toHaveProperty('success', true);
  });

  it("returns { error: 'already_interested' } on unique violation (code 23505)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockSelectReturning([V1_VERSION_ROW]);

    mockTransaction.mockImplementation(async () => {
      const err: Error & { code?: string } = new Error('duplicate key');
      err.code = '23505';
      throw err;
    });

    const result = await recordConsentAndCreateLead(VALID_INPUT);
    expect(result).toEqual({ error: 'already_interested' });
  });

  it("returns { error: 'database_error' } on any other transaction failure", async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockSelectReturning([V1_VERSION_ROW]);

    mockTransaction.mockImplementation(async () => {
      throw new Error('connection refused');
    });

    const result = await recordConsentAndCreateLead(VALID_INPUT);
    expect(result).toEqual({ error: 'database_error' });
  });

  it('throws if CONSENT_IP_HASH_SALT is missing (fail-closed)', async () => {
    delete process.env.CONSENT_IP_HASH_SALT;
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockSelectReturning([V1_VERSION_ROW]);

    await expect(recordConsentAndCreateLead(VALID_INPUT)).rejects.toThrow(/CONSENT_IP_HASH_SALT/);
  });
});

function mockInsertReturning(rows: unknown[]) {
  const chain = {
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue(rows),
    }),
  };
  mockInsert.mockReturnValue(chain);
}

describe('createLeadWithExistingConsent', () => {
  const INPUT = {
    areaSlug: 'nozawa-onsen',
    prefectureSlug: 'nagano',
    profileSnapshot: VALID_INPUT.profileSnapshot,
  };

  it('returns { error: "not_authenticated" } when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await createLeadWithExistingConsent(INPUT);
    expect(result).toEqual({ error: 'not_authenticated' });
  });

  it('returns { error: "invalid_input" } when slugs are malformed', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    const result = await createLeadWithExistingConsent({ ...INPUT, areaSlug: 'NOZAWA' });
    expect(result).toEqual({ error: 'invalid_input' });
  });

  it('returns { error: "no_active_consent" } when user has no active consent', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });

    // The action's select on consentRecords returns an orderBy chain, not a limit
    // chain — we need a slightly different mock shape:
    const chain = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };
    mockSelect.mockReturnValue(chain);

    const result = await createLeadWithExistingConsent(INPUT);
    expect(result).toEqual({ error: 'no_active_consent' });
  });

  it('inserts a single lead row bound to the existing consent', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });

    const chain = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'consent-existing' }]),
          }),
        }),
      }),
    };
    mockSelect.mockReturnValue(chain);

    mockInsertReturning([{ id: 'lead-new' }]);

    const result = await createLeadWithExistingConsent(INPUT);
    expect(result).toEqual({ success: true, leadId: 'lead-new' });
  });

  it('returns { error: "already_interested" } on unique violation', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });

    const selectChain = {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 'consent-existing' }]),
          }),
        }),
      }),
    };
    mockSelect.mockReturnValue(selectChain);

    const insertChain = {
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' })),
      }),
    };
    mockInsert.mockReturnValue(insertChain);

    const result = await createLeadWithExistingConsent(INPUT);
    expect(result).toEqual({ error: 'already_interested' });
  });
});

import { withdrawLead } from './lead-actions';

describe('withdrawLead', () => {
  it('returns { error: "not_authenticated" } when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await withdrawLead('lead-xyz');
    expect(result).toEqual({ error: 'not_authenticated' });
  });

  it('returns { error: "lead_not_found" } when leadId does not exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    // mockSelectReturning builds a select → from → where → limit chain.
    mockSelectReturning([]);

    const result = await withdrawLead('lead-missing');
    expect(result).toEqual({ error: 'lead_not_found' });
  });

  it("returns { error: 'lead_not_owned' } when lead belongs to another user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockSelectReturning([{ id: 'lead-xyz', userId: 'other-user', withdrawnAt: null }]);

    const result = await withdrawLead('lead-xyz');
    expect(result).toEqual({ error: 'lead_not_owned' });
  });

  it('marks the targeted lead as withdrawn', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });
    mockSelectReturning([{ id: 'lead-xyz', userId: USER.id, withdrawnAt: null }]);

    const updateChain = {
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({ rowCount: 1 }),
      }),
    };
    mockUpdate.mockReturnValue(updateChain);

    const result = await withdrawLead('lead-xyz');
    expect(result).toEqual({ success: true });
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ withdrawnAt: expect.any(Date), status: 'withdrawn' })
    );
  });
});

import { withdrawAllConsent } from './lead-actions';

describe('withdrawAllConsent', () => {
  it('returns { error: "not_authenticated" } when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const result = await withdrawAllConsent();
    expect(result).toEqual({ error: 'not_authenticated' });
  });

  it('marks the active consent + all active leads as withdrawn, returns count', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });

    // The action uses a transaction. Track updates ordered by call-count
    // because Drizzle v4 does not expose table names via _?.name (same
    // workaround as Task 8's happy-path test).
    let updateCallCount = 0;
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        update: () => ({
          set: jest.fn().mockReturnValue({
            where: () => {
              updateCallCount += 1;
              // First update in the action is leads, second is consent_records
              if (updateCallCount === 1) return Promise.resolve({ rowCount: 2 });
              return Promise.resolve({ rowCount: 1 });
            },
          }),
        }),
      };
      return cb(tx);
    });

    const result = await withdrawAllConsent();
    expect(result).toEqual({ success: true, withdrawnLeadCount: 2 });
    expect(updateCallCount).toBe(2);
  });

  it('returns { success: true, withdrawnLeadCount: 0 } when there is nothing to withdraw (idempotent)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: USER }, error: null });

    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        update: () => ({
          set: () => ({
            where: () => Promise.resolve({ rowCount: 0 }),
          }),
        }),
      };
      return cb(tx);
    });

    const result = await withdrawAllConsent();
    expect(result).toEqual({ success: true, withdrawnLeadCount: 0 });
  });
});
