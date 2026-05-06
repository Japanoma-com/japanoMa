import { signIn, signUp, updatePassword } from './actions';

// Mock the Supabase server client
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  })),
}));

jest.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

jest.mock('next/headers', () => ({
  headers: async () => ({ get: (key: string) => (key === 'host' ? 'localhost:3000' : null) }),
  cookies: async () => ({ get: () => undefined }),
}));

describe('signUp', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  it('calls supabase.auth.signUp with email, password, and name metadata', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

    await signUp({
      email: 'new@example.com',
      password: 'validpass123',
      name: 'Sara Tanaka',
      acknowledgePolicies: true,
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'validpass123',
      options: {
        data: { name: 'Sara Tanaka' },
        emailRedirectTo: expect.stringContaining('/auth/confirm?next=/account'),
      },
    });
  });

  it('returns redirectTo /verify-email on success', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

    const result = await signUp({
      email: 'new@example.com',
      password: 'validpass123',
      name: 'Sara Tanaka',
      acknowledgePolicies: true,
    });

    expect(result).toEqual({ redirectTo: '/verify-email' });
  });

  it('returns an error object when password is too short', async () => {
    const result = await signUp({
      email: 'new@example.com',
      password: 'short',
      name: 'Sara',
      acknowledgePolicies: true,
    });

    expect(result).toEqual({ error: expect.stringContaining('at least 8 characters') });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns an error object when email is invalid', async () => {
    const result = await signUp({
      email: 'not-an-email',
      password: 'validpass123',
      name: 'Sara',
      acknowledgePolicies: true,
    });

    expect(result).toEqual({ error: expect.stringContaining('valid email') });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns an error object when name is empty', async () => {
    const result = await signUp({
      email: 'new@example.com',
      password: 'validpass123',
      name: '',
      acknowledgePolicies: true,
    });

    expect(result).toEqual({ error: expect.stringContaining('Name is required') });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('rejects when policies have not been acknowledged', async () => {
    const result = await signUp({
      email: 'new@example.com',
      password: 'validpass123',
      name: 'Sara',
      acknowledgePolicies: false as unknown as true,
    });
    expect(result).toEqual({ error: expect.stringContaining('acknowledge') });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('returns the Supabase error message when signUp fails', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    const result = await signUp({
      email: 'existing@example.com',
      password: 'validpass123',
      name: 'Sara',
      acknowledgePolicies: true,
    });

    expect(result).toEqual({ error: 'User already registered' });
  });
});

describe('updatePassword', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
  });

  it('calls supabase.auth.updateUser with the new password', async () => {
    mockUpdateUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

    await updatePassword({
      password: 'newvalidpass123',
      confirmPassword: 'newvalidpass123',
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newvalidpass123' });
  });

  it('returns redirectTo /login with password-updated flash on success', async () => {
    mockUpdateUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });

    const result = await updatePassword({
      password: 'newvalidpass123',
      confirmPassword: 'newvalidpass123',
    });

    expect(result).toEqual({ redirectTo: '/login?message=password-updated' });
  });

  it('returns an error object when password is too short', async () => {
    const result = await updatePassword({
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result).toEqual({ error: expect.stringContaining('at least 8 characters') });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('returns an error object when passwords do not match', async () => {
    const result = await updatePassword({
      password: 'validpass123',
      confirmPassword: 'differentpass123',
    });

    expect(result).toEqual({ error: expect.stringContaining("don't match") });
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('returns the Supabase error message when updateUser fails', async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Token expired' },
    });

    const result = await updatePassword({
      password: 'newvalidpass123',
      confirmPassword: 'newvalidpass123',
    });

    expect(result).toEqual({ error: 'Token expired' });
  });
});

describe('signIn next-param sanitization', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset();
    // Default: a clean sign-in (no deactivated_at flag) so the auto-
    // reactivate code path is skipped. Tests that exercise reactivation
    // override this in their own beforeEach.
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1', user_metadata: {} }, session: null },
      error: null,
    });
  });

  const cases: Array<[string | null | undefined, string]> = [
    [undefined, '/'],
    [null, '/'],
    ['', '/'],
    ['/', '/'],
    ['/account', '/account'],
    ['/saved', '/saved'],
    ['//evil.com', '/'],
    ['/\\evil.com', '/'],
    ['http://evil.com', '/'],
    ['https://evil.com', '/'],
    ['evil.com', '/'],
    ['\\\\evil.com', '/'],
  ];

  it.each(cases)('next=%p returns redirectTo %p', async (next, expected) => {
    const result = await signIn({ email: 'user@example.com', password: 'validpass123' }, next);
    expect(result).toEqual({ redirectTo: expected });
  });
});
