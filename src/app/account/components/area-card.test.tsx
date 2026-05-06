/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AreaCard } from './area-card';

// Mock next/navigation's useRouter — AreaCard now calls router.refresh()
// after successful lead actions to live-update the sidebar Interests stat.
const routerRefreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: routerRefreshMock,
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock InterestHashProvider's useInterestHash hook
jest.mock('./interest-hash-handler', () => ({
  useInterestHash: () => null,
  InterestHashProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lead-actions (not exercising the state machine here)
jest.mock('../lead-actions', () => ({
  recordConsentAndCreateLead: jest.fn(),
  createLeadWithExistingConsent: jest.fn(),
  withdrawLead: jest.fn(),
}));

const baseProps = {
  cityName: 'Hakuba',
  prefectureName: 'Nagano',
  citySlug: 'hakuba',
  prefectureSlug: 'nagano',
  score: 92,
  explanation: 'Strong match for families with reliable snow.',
  heroImagePath: null,
  profileSnapshot: {
    types: ['apartment'],
    condition: 'good',
    budget: 'mid',
    summary: 'Apartment in good condition, mid budget.',
    score: 92,
  },
  hasActiveConsent: false,
  initialLead: null,
  consentVersion: 'v1',
  consentBody: 'Legal text paragraph 1.\n\nLegal text paragraph 2.',
};

describe('AreaCard', () => {
  it('renders hero variant with top-match badge', () => {
    render(<AreaCard {...baseProps} variant="hero" topMatchBadge />);
    expect(screen.getByText(/your top match/i)).toBeInTheDocument();
    expect(screen.getByText('Hakuba')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /express interest/i })).toBeInTheDocument();
  });

  it('renders half variant without badge', () => {
    render(<AreaCard {...baseProps} variant="half" />);
    expect(screen.queryByText(/your top match/i)).not.toBeInTheDocument();
    expect(screen.getByText('Hakuba')).toBeInTheDocument();
  });

  it('shows accent border when initialLead is present (active state)', () => {
    const { container } = render(
      <AreaCard {...baseProps} variant="hero" initialLead={{ id: 'lead-uuid' }} />
    );
    // Active-state styling is `ring-1 ring-ai/40` (no border) since the
    // 2026-04 borderless redesign — assert on the indigo ring class.
    const frame = container.querySelector('[class*="ring-ai"]');
    expect(frame).toBeInTheDocument();
    // And the confirmed block should render
    expect(screen.getByText(/interest recorded/i)).toBeInTheDocument();
  });

  it('express interest → modal → confirm → active state (primary conversion path)', async () => {
    // Mock the success path for recordConsentAndCreateLead
    const { recordConsentAndCreateLead } = jest.requireMock('../lead-actions') as {
      recordConsentAndCreateLead: jest.Mock;
    };
    recordConsentAndCreateLead.mockResolvedValueOnce({
      success: true,
      leadId: 'new-lead-uuid',
      consentRecordId: 'new-consent-uuid',
    });

    render(<AreaCard {...baseProps} variant="hero" topMatchBadge />);

    // 1. Click "Express interest"
    const expressBtn = screen.getByRole('button', { name: /express interest/i });
    fireEvent.click(expressBtn);

    // 2. Consent modal should open (use dialog role — stable across Phase 6 rewrite)
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // 3. Agree to the consent and confirm
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Use a loose regex so this survives Phase 6's modal rewrite.
    // Current label is "Consent and submit →"; Phase 6 will change to "Confirm and share".
    const confirmBtn = screen.getByRole('button', { name: /confirm and share|consent and submit|confirm|submit/i });
    fireEvent.click(confirmBtn);

    // 4. Card should now show the "Interest recorded" confirmation block
    await screen.findByText(/interest recorded/i);

    // 5. Verify the server action was called with the right args
    expect(recordConsentAndCreateLead).toHaveBeenCalledWith(
      expect.objectContaining({
        areaSlug: 'hakuba',
        prefectureSlug: 'nagano',
        consentTextVersion: 'v1',
      })
    );
  });
});
