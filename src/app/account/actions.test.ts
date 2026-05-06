import { deactivateAccount, migrateAnonymousData } from './actions';

const mockGetUser = jest.fn();
const mockAdminUpdateUserById = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: {
      getUser: () => mockGetUser(),
      signOut: () => mockSignOut(),
    },
  })),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: {
        updateUserById: (id: string, attrs: { user_metadata?: Record<string, unknown> }) =>
          mockAdminUpdateUserById(id, attrs),
      },
    },
  })),
}));

// Mock cookies for migrateAnonymousData (reads jt_session)
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn((key: string) =>
      key === 'jt_session' ? { value: 'test-session-uuid' } : undefined
    ),
  })),
}));

// Mock drizzle db — migrateAnonymousData uses .insert().values().onConflictDoNothing()
// and .update().set().where() chains. Each returns a thenable so awaits resolve.
const mockOnConflictDoNothing = jest.fn(async () => undefined);
const mockInsertValues = jest.fn(() => ({
  onConflictDoNothing: mockOnConflictDoNothing,
}));
const mockUpdateWhere = jest.fn(async () => ({ rowCount: 0 }));
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn(() => ({ values: mockInsertValues })),
    update: jest.fn(() => ({ set: mockUpdateSet })),
  },
}));

describe('deactivateAccount', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockAdminUpdateUserById.mockReset();
    mockSignOut.mockReset();
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  });

  it('flags the user as deactivated, signs them out, and returns redirectTo on success', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', user_metadata: { name: 'Sara' } } },
      error: null,
    });
    mockAdminUpdateUserById.mockResolvedValue({ data: { user: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });

    const result = await deactivateAccount();

    expect(mockAdminUpdateUserById).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        user_metadata: expect.objectContaining({
          name: 'Sara', // existing metadata preserved
          deactivated_at: expect.any(String),
        }),
      })
    );
    expect(mockSignOut).toHaveBeenCalled();
    expect(result).toEqual({ redirectTo: '/?deactivated=true' });
  });

  it('does NOT delete the auth.users row — record is kept for reactivation', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', user_metadata: {} } },
      error: null,
    });
    mockAdminUpdateUserById.mockResolvedValue({ data: { user: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });

    await deactivateAccount();

    // Asserting the action only touches user_metadata via updateUserById,
    // never calls deleteUser. The lock-in here protects the "we keep the
    // record so they can come back" guarantee from drift.
    expect(mockAdminUpdateUserById).toHaveBeenCalledTimes(1);
  });

  it('returns an error when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await deactivateAccount();

    expect(result).toEqual({ error: expect.stringContaining('not authenticated') });
    expect(mockAdminUpdateUserById).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('returns an error when admin.updateUserById fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', user_metadata: {} } },
      error: null,
    });
    mockAdminUpdateUserById.mockResolvedValue({
      data: null,
      error: { message: 'User not found in auth.users' },
    });

    const result = await deactivateAccount();

    expect(result).toEqual({ error: 'User not found in auth.users' });
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', user_metadata: {} } },
      error: null,
    });

    await expect(deactivateAccount()).rejects.toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(mockAdminUpdateUserById).not.toHaveBeenCalled();
  });
});

describe('migrateAnonymousData', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockOnConflictDoNothing.mockClear();
    mockInsertValues.mockClear();
    mockUpdateSet.mockClear();
    mockUpdateWhere.mockClear();
  });

  it('is idempotent — calling twice in a row succeeds both times', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    // First call migrates whatever localStorage saves the client sent up.
    const first = await migrateAnonymousData([
      { contentType: 'city', contentId: 'hakuba' },
    ]);

    // Second call happens on a later /account visit — there's nothing new to
    // migrate, but the action should still resolve cleanly (no throws, no
    // client-surface errors). The server action uses onConflictDoNothing() on
    // saves and WHERE userId IS NULL filters on quiz_responses/events updates,
    // so re-running is safe.
    const second = await migrateAnonymousData([
      { contentType: 'city', contentId: 'hakuba' },
    ]);

    expect(first).not.toHaveProperty('error');
    expect(second).not.toHaveProperty('error');
    // Both calls should report back a result shape (not an error)
    expect(first).toMatchObject({
      savesMigrated: expect.any(Number),
      quizLinked: expect.any(Number),
      eventsLinked: expect.any(Number),
    });
    expect(second).toMatchObject({
      savesMigrated: expect.any(Number),
      quizLinked: expect.any(Number),
      eventsLinked: expect.any(Number),
    });
  });

  it('returns an error when not authenticated (neither call throws)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const first = await migrateAnonymousData([]);
    const second = await migrateAnonymousData([]);

    expect(first).toEqual({ error: 'Not authenticated' });
    expect(second).toEqual({ error: 'Not authenticated' });
  });
});
