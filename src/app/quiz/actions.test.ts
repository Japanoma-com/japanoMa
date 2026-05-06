/** @jest-environment node */
import { submitQuiz } from './actions';

// Mock Supabase server client
const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

// Mock next/headers cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn((key: string) =>
      key === 'jt_session' ? { value: 'test-session-uuid' } : undefined
    ),
  })),
}));

// Mock scoring
jest.mock('@/lib/quiz/scoring', () => ({
  scoreQuiz: jest.fn(async () => ({
    results: [{ citySlug: 'hakuba', score: 92 }],
    profile: { types: ['apartment'], condition: 'good', budget: 'mid' },
  })),
}));

// Capture db.insert calls
const mockInsert = jest.fn(() => ({ values: jest.fn(async () => undefined) }));
jest.mock('@/lib/db', () => ({
  db: { insert: (...args: unknown[]) => mockInsert(...args) },
}));

describe('submitQuiz', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes userId when user is authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    });

    const valuesSpy = jest.fn(async () => undefined);
    mockInsert.mockImplementation(() => ({ values: valuesSpy }));

    await submitQuiz({ q1: 'a', q2: 'b' });

    const quizInsertCall = valuesSpy.mock.calls[0]?.[0];
    expect(quizInsertCall).toMatchObject({
      sessionId: 'test-session-uuid',
      userId: 'user-123',
      quizType: 'lifestyle-v2',
    });
  });

  it('writes null userId when user is anonymous', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const valuesSpy = jest.fn(async () => undefined);
    mockInsert.mockImplementation(() => ({ values: valuesSpy }));

    await submitQuiz({ q1: 'a', q2: 'b' });

    const quizInsertCall = valuesSpy.mock.calls[0]?.[0];
    expect(quizInsertCall).toMatchObject({
      sessionId: 'test-session-uuid',
      userId: null,
      quizType: 'lifestyle-v2',
    });
  });

  it('persists with null userId when auth lookup fails', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('auth service unavailable'));

    const valuesSpy = jest.fn(async () => undefined);
    mockInsert.mockImplementation(() => ({ values: valuesSpy }));

    // Should not throw — outer try/catch would otherwise swallow and we would
    // lose the insert, which is what this regression guards against.
    await submitQuiz({ q1: 'a', q2: 'b' });

    const quizInsertCall = valuesSpy.mock.calls[0]?.[0];
    expect(quizInsertCall).toMatchObject({
      sessionId: 'test-session-uuid',
      userId: null,
      quizType: 'lifestyle-v2',
    });
  });
});
