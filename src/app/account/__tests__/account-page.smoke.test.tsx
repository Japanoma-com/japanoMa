/**
 * Smoke test: renders /account with mocked queries and asserts the new
 * concierge layout (sidebar + main) renders correctly. Does not click
 * buttons — interaction is covered by the integration test.
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AccountPage from '../page';

// --- Mocks ---------------------------------------------------------------

const getUserMock = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: getUserMock,
    },
  }),
}));

const getUserQuizProfileMock = jest.fn();
const getUserSavesCountMock = jest.fn();
const getUserSavesMock = jest.fn();

jest.mock('@/lib/account/queries', () => ({
  getUserQuizProfile: (...args: unknown[]) => getUserQuizProfileMock(...args),
  getUserSavesCount: (...args: unknown[]) => getUserSavesCountMock(...args),
  getUserSaves: (...args: unknown[]) => getUserSavesMock(...args),
}));

jest.mock('@/lib/lead-capture/queries', () => ({
  getActiveConsent: jest.fn().mockResolvedValue(null),
  getActiveLeads: jest.fn().mockResolvedValue([]),
  getActiveConsentTextVersion: jest.fn().mockResolvedValue({
    version: 'v1',
    body: 'I consent to...',
    bodyHash: 'hash',
    scope: 'japanese_partner_lead_sharing',
  }),
}));

// Stub the LocalStorageSync component (client-only, quiz migration)
jest.mock('../local-storage-sync', () => ({ LocalStorageSync: () => null }));

// Stub getJourneyState so the smoke test doesn't need SUPABASE_SERVICE_ROLE_KEY
jest.mock('@/lib/journey/queries', () => {
  const state = {
    phase: '0_trigger',
    userLabel: 'Decide First',
    stepNumber: 1,
    buyerType: null,
    isOverridden: false,
    phaseOverriddenAt: null,
    nextHint: 'Take the area quiz',
  };
  return {
    getJourneyState: jest.fn().mockResolvedValue(state),
    getNotesByPhase: jest.fn().mockResolvedValue([]),
    getNoteCounts: jest.fn().mockResolvedValue({}),
    ANONYMOUS_INITIAL_STATE: state,
  };
});

// Stub journey components that pull in client-only dependencies
jest.mock('@/components/journey/notes-by-phase', () => ({
  NotesByPhase: () => null,
}));
jest.mock('@/components/journey/external-bookmarks', () => ({
  ExternalBookmarks: () => null,
}));
jest.mock('@/components/journey/journey-export', () => ({
  JourneyExport: () => null,
}));

// Stub the AreaCard component — we don't need to exercise its state machine
// here, just verify it receives the props to tell which one is the top match.
jest.mock('../components/area-card', () => ({
  AreaCard: ({
    cityName,
    prefectureName,
    topMatchBadge,
    variant,
  }: {
    cityName: string;
    prefectureName: string;
    topMatchBadge?: boolean;
    variant: 'hero' | 'half';
  }) => (
    <div data-testid={`area-card-${variant}`}>
      <span>
        {cityName}, {prefectureName}
      </span>
      {topMatchBadge && <span>Your top match</span>}
      <button>Express interest</button>
    </div>
  ),
}));

// Stub the InterestHashProvider (client-only hash handler)
jest.mock('../components/interest-hash-handler', () => ({
  InterestHashProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Stub SidebarActions (client-only; uses useRouter etc.)
jest.mock('../components/sidebar-actions', () => ({
  SidebarActions: () => (
    <div data-testid="sidebar-actions">
      <button>Sign out</button>
      <button>Deactivate account</button>
    </div>
  ),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    // Match Next's real behavior — redirect() throws so the server component
    // never continues past it.
    throw new Error('NEXT_REDIRECT');
  }),
}));

// Pull the mocked redirect out so individual tests can assert against it.
import { redirect } from 'next/navigation';
const redirectMock = redirect as jest.Mock;

// --- Test helpers --------------------------------------------------------

const authenticatedUser = {
  data: {
    user: {
      id: 'user-smoke',
      email: 'smoke@example.com',
      user_metadata: { name: 'Sara Tanaka' },
      created_at: '2026-03-01T00:00:00.000Z',
    },
  },
};

const quizProfileFixture = {
  profile: {
    types: ['akiya'],
    condition: 'move-in-ready',
    budget: '15-30m',
    summary: 'Test summary',
  },
  recommendedAreas: [
    {
      citySlug: 'hakuba',
      cityName: 'Hakuba',
      prefectureSlug: 'nagano',
      prefectureName: 'Nagano',
      score: 92,
      explanation: 'Great fit.',
    },
    {
      citySlug: 'nozawa-onsen',
      cityName: 'Nozawa Onsen',
      prefectureSlug: 'nagano',
      prefectureName: 'Nagano',
      score: 85,
      explanation: 'Solid fit.',
    },
  ],
  completedAt: new Date('2026-04-01'),
};

// --- Tests ---------------------------------------------------------------

describe('/account page smoke test', () => {
  beforeEach(() => {
    getUserMock.mockReset();
    getUserQuizProfileMock.mockReset();
    getUserSavesCountMock.mockReset();
    getUserSavesMock.mockReset();
    getUserSavesMock.mockResolvedValue([]);
    redirectMock.mockClear();
    redirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
  });

  it('redirects unauthenticated visitors to /login', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    getUserQuizProfileMock.mockResolvedValue(null);
    getUserSavesCountMock.mockResolvedValue(0);

    // redirect() throws NEXT_REDIRECT in real Next; the mock mirrors this.
    await expect(AccountPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(redirectMock).toHaveBeenCalledWith('/login?next=/account');
  });

  it('renders hero + recommended areas grid when authenticated and quiz complete', async () => {
    getUserMock.mockResolvedValue(authenticatedUser);
    getUserQuizProfileMock.mockResolvedValue(quizProfileFixture);
    getUserSavesCountMock.mockResolvedValue(3);

    const ui = await AccountPage();
    render(ui);

    // Hero uses the user's first name.
    expect(screen.getByText(/welcome back, sara/i)).toBeInTheDocument();

    // Sidebar identity block shows the full name and email.
    expect(screen.getByText(/sara tanaka/i)).toBeInTheDocument();
    expect(screen.getByText(/smoke@example\.com/i)).toBeInTheDocument();

    // Recommended areas section rendered.
    expect(screen.getByText(/recommended areas/i)).toBeInTheDocument();

    // Two area cards — the first is the hero/top match.
    expect(screen.getByTestId('area-card-hero')).toBeInTheDocument();
    expect(screen.getByTestId('area-card-half')).toBeInTheDocument();
    expect(screen.getByText(/your top match/i)).toBeInTheDocument();
    expect(screen.getByText(/hakuba, nagano/i)).toBeInTheDocument();
    expect(screen.getByText(/nozawa onsen, nagano/i)).toBeInTheDocument();

    // Sidebar actions rendered.
    expect(screen.getByTestId('sidebar-actions')).toBeInTheDocument();
  });

  it('renders the quiz empty state when the user has not taken the quiz', async () => {
    getUserMock.mockResolvedValue(authenticatedUser);
    getUserQuizProfileMock.mockResolvedValue(null);
    getUserSavesCountMock.mockResolvedValue(0);

    const ui = await AccountPage();
    render(ui);

    // Hero + empty-state surface a quiz CTA pointing to /quiz.
    const quizLinks = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('href') === '/quiz');
    expect(quizLinks.length).toBeGreaterThan(0);

    // No area cards.
    expect(screen.queryByTestId('area-card-hero')).not.toBeInTheDocument();
    expect(screen.queryByTestId('area-card-half')).not.toBeInTheDocument();
  });
});
