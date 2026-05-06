// src/components/journey/phase-filter-primary-row.test.tsx
import { render, screen } from '@testing-library/react';
import { PhaseFilterPrimaryRow } from './phase-filter-primary-row';
import type { JourneyState } from '@/lib/journey/types';

const anonState: JourneyState = {
  phase: '0_trigger',
  userLabel: 'Decide First',
  stepNumber: 1,
  buyerType: null,
  isOverridden: false,
  phaseOverriddenAt: null,
  nextHint: 'Take the area quiz',
};

const inferredState: JourneyState = {
  ...anonState,
  phase: '3_area',
  userLabel: 'Choose Area',
  stepNumber: 2,
};

describe('<PhaseFilterPrimaryRow />', () => {
  it('renders all 6 step pills + "All steps"', () => {
    render(<PhaseFilterPrimaryRow state={anonState} activePhase={null} baseUrl="/content" />);
    expect(screen.getByText('All steps')).toBeTruthy();
    expect(screen.getByText('Decide First')).toBeTruthy();
    expect(screen.getByText('Choose Area')).toBeTruthy();
    expect(screen.getByText('Shortlist Homes')).toBeTruthy();
    expect(screen.getByText('Check Risks')).toBeTruthy();
    expect(screen.getByText('Make Offer')).toBeTruthy();
    expect(screen.getByText('Prepare Closing')).toBeTruthy();
  });

  it('marks the active pill via aria-current', () => {
    render(<PhaseFilterPrimaryRow state={inferredState} activePhase="5_due_diligence" baseUrl="/content" />);
    const active = screen.getByText('Check Risks').closest('a');
    expect(active?.getAttribute('aria-current')).toBe('true');
  });

  it('marks "All steps" as active when no activePhase + state is anonymous default', () => {
    render(<PhaseFilterPrimaryRow state={anonState} activePhase={null} baseUrl="/content" />);
    const all = screen.getByText('All steps').closest('a');
    expect(all?.getAttribute('aria-current')).toBe('true');
  });

  it('falls back to inferred phase when activePhase is null and phase has advanced', () => {
    render(<PhaseFilterPrimaryRow state={inferredState} activePhase={null} baseUrl="/content" />);
    const inferred = screen.getByText('Choose Area').closest('a');
    expect(inferred?.getAttribute('aria-current')).toBe('true');
  });

  it('"All steps" link points at the bare baseUrl', () => {
    render(<PhaseFilterPrimaryRow state={inferredState} activePhase={null} baseUrl="/content" />);
    expect(screen.getByText('All steps').closest('a')?.getAttribute('href')).toBe('/content');
  });
});
