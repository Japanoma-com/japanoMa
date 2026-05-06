import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { DecisionSignal } from './decision-signal';

describe('DecisionSignal', () => {
  it('renders label and context', () => {
    render(
      <DecisionSignal
        score={78}
        label="Base Fit Score"
        context="Hakuba Village · Family · 14 days/yr"
      />
    );
    expect(screen.getByText('Base Fit Score')).toBeInTheDocument();
    expect(screen.getByText('Hakuba Village · Family · 14 days/yr')).toBeInTheDocument();
    expect(screen.getByText('DECISION SIGNAL')).toBeInTheDocument();
  });

  it('applies pine color for score >= 70', () => {
    const { container } = render(
      <DecisionSignal score={78} label="Base Fit Score" context="" />
    );
    const scoreEl = container.querySelector('.score-display');
    expect(scoreEl).toHaveStyle({ color: 'var(--matsu)' });
  });

  it('applies amber color for score 40-69', () => {
    const { container } = render(
      <DecisionSignal score={55} label="Test" context="" />
    );
    const scoreEl = container.querySelector('.score-display');
    expect(scoreEl).toHaveStyle({ color: 'var(--kohaku)' });
  });

  it('applies crimson color for score < 40', () => {
    const { container } = render(
      <DecisionSignal score={25} label="Test" context="" />
    );
    const scoreEl = container.querySelector('.score-display');
    expect(scoreEl).toHaveStyle({ color: 'var(--beni)' });
  });

  it('renders letter grades directly (no animation)', () => {
    render(
      <DecisionSignal
        score="A"
        label="Snow Reliability"
        context="Consistent powder Dec to Mar"
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    const { container } = render(
      <DecisionSignal score="A" label="Test" context="" />
    );
    const scoreEl = container.querySelector('.score-display');
    expect(scoreEl).toHaveStyle({ color: 'var(--ai)' });
  });
});
