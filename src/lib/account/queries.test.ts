/** @jest-environment node */

// Mock drizzle db. Jest allows references to variables prefixed with `mock`
// inside jest.mock factories even though the factory is hoisted.
const mockDb = {
  select: jest.fn(() => ({
    from: jest.fn(() => ({
      where: jest.fn(async () => [{ count: 7 }]),
    })),
  })),
};
jest.mock('@/lib/db', () => ({
  db: mockDb,
}));

import { getUserSavesCount } from './queries';

describe('getUserSavesCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.select.mockImplementation(() => ({
      from: jest.fn(() => ({
        where: jest.fn(async () => [{ count: 7 }]),
      })),
    }));
  });

  it('returns the count for the given user', async () => {
    const count = await getUserSavesCount('user-123');
    expect(count).toBe(7);
  });

  it('returns 0 when no rows match', async () => {
    mockDb.select.mockImplementation(() => ({
      from: jest.fn(() => ({
        where: jest.fn(async () => [{ count: 0 }]),
      })),
    }));
    const count = await getUserSavesCount('user-456');
    expect(count).toBe(0);
  });
});
