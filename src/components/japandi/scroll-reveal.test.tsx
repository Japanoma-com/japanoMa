/** @jest-environment jsdom */
import { render } from '@testing-library/react';
import { ScrollReveal } from './scroll-reveal';

// Mock observeReveal to avoid IntersectionObserver setup
jest.mock('@/lib/motion/scroll-reveal', () => ({
  observeReveal: jest.fn(() => () => {}),
}));

describe('ScrollReveal', () => {
  it('applies no custom delay when neither delay nor index is set', () => {
    const { container } = render(<ScrollReveal>content</ScrollReveal>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.getPropertyValue('--reveal-delay')).toBe('');
  });

  it('applies the fixed delay when only delay is set', () => {
    const { container } = render(<ScrollReveal delay={200}>content</ScrollReveal>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.getPropertyValue('--reveal-delay')).toBe('200ms');
  });

  it('applies index * 80ms stagger when only index is set', () => {
    const { container } = render(<ScrollReveal index={3}>content</ScrollReveal>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.getPropertyValue('--reveal-delay')).toBe('240ms');
  });

  it('combines delay and index stagger when both are set', () => {
    const { container } = render(
      <ScrollReveal delay={100} index={2}>
        content
      </ScrollReveal>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.getPropertyValue('--reveal-delay')).toBe('260ms');
  });
});
