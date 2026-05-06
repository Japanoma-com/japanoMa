import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizContextPanel } from './quiz-context-panel';

describe('QuizContextPanel', () => {
  const fullSnapshot = {
    purpose: 'Ski Base',
    skiSeason: 'Annual Pilgrimage',
    propertyTypes: ['Detached House', 'Akiya (Vacant Home)'],
    condition: 'Inspected + Warranty',
    budget: '¥15M to ¥30M (A$135K to A$270K)',
    priority: 'Closest to Slopes',
  };

  it('renders the overline label', () => {
    render(<QuizContextPanel snapshot={fullSnapshot} onClear={() => {}} />);
    expect(screen.getByText('Pre-filled from your quiz')).toBeInTheDocument();
  });

  it('renders all six labeled fields when fully populated', () => {
    render(<QuizContextPanel snapshot={fullSnapshot} onClear={() => {}} />);
    expect(screen.getByText(/Ski Base/)).toBeInTheDocument();
    expect(screen.getByText(/Annual Pilgrimage/)).toBeInTheDocument();
    expect(screen.getByText(/Detached House, Akiya/)).toBeInTheDocument();
    expect(screen.getByText(/Inspected \+ Warranty/)).toBeInTheDocument();
    expect(screen.getByText(/¥15M to ¥30M/)).toBeInTheDocument();
    expect(screen.getByText(/Closest to Slopes/)).toBeInTheDocument();
  });

  it('only renders fields that are present in the snapshot', () => {
    render(
      <QuizContextPanel
        snapshot={{ purpose: 'Holiday Home', budget: '¥50M+ (A$450K+)' }}
        onClear={() => {}}
      />
    );
    expect(screen.getByText(/Holiday Home/)).toBeInTheDocument();
    expect(screen.getByText(/¥50M\+/)).toBeInTheDocument();
    expect(screen.queryByText(/Property type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Condition/i)).not.toBeInTheDocument();
  });

  it('renders the area name as the first row when areaName is provided', () => {
    render(
      <QuizContextPanel
        snapshot={fullSnapshot}
        areaName="Myoko"
        onClear={() => {}}
      />
    );
    expect(screen.getByText(/Enquiring about/i)).toBeInTheDocument();
    expect(screen.getByText(/Myoko/)).toBeInTheDocument();
  });

  it('does not render the area row when areaName is omitted', () => {
    render(<QuizContextPanel snapshot={fullSnapshot} onClear={() => {}} />);
    expect(screen.queryByText(/Enquiring about/i)).not.toBeInTheDocument();
  });

  it('renders a "Clear pre-filled answers" button', () => {
    render(<QuizContextPanel snapshot={fullSnapshot} onClear={() => {}} />);
    expect(
      screen.getByRole('button', { name: /clear pre-filled answers/i })
    ).toBeInTheDocument();
  });

  it('calls onClear when the button is clicked', () => {
    const onClear = jest.fn();
    render(<QuizContextPanel snapshot={fullSnapshot} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: /clear pre-filled answers/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
