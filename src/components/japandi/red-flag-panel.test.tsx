import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RedFlagPanel } from './red-flag-panel';

describe('RedFlagPanel', () => {
  it('renders title and description', () => {
    render(
      <RedFlagPanel
        title="Winter Access"
        description="This property is 2.3km from the nearest maintained road."
        action="Confirm road maintenance responsibility with the local municipality."
      />
    );
    expect(screen.getByText('Winter Access')).toBeInTheDocument();
    expect(screen.getByText(/2\.3km/)).toBeInTheDocument();
    expect(screen.getByText(/Confirm road maintenance/)).toBeInTheDocument();
  });

  it('has correct semantic role', () => {
    render(
      <RedFlagPanel title="Test" description="Test description" />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('supports warning severity', () => {
    const { container } = render(
      <RedFlagPanel title="Test" description="Test" severity="warning" />
    );
    expect(container.firstChild).toHaveClass('border-l-kohaku');
  });
});
