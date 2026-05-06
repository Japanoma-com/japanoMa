/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeactivateAccountModal } from './deactivate-account-modal';

jest.mock('../actions', () => ({
  deactivateAccount: jest.fn(async () => ({ redirectTo: '/?deactivated=true' })),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe('DeactivateAccountModal', () => {
  it('renders the deactivate primary action enabled (no type-to-confirm gate)', () => {
    render(<DeactivateAccountModal isOpen={true} onClose={jest.fn()} />);
    const confirmBtn = screen.getByRole('button', { name: /^deactivate account$/i });
    expect(confirmBtn).toBeEnabled();
  });

  it('Escape key calls onClose', () => {
    const onClose = jest.fn();
    render(<DeactivateAccountModal isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('is not in the DOM when isOpen is false', () => {
    render(<DeactivateAccountModal isOpen={false} onClose={jest.fn()} />);
    expect(
      screen.queryByRole('button', { name: /^deactivate account$/i })
    ).not.toBeInTheDocument();
  });

  it('clicking the backdrop calls onClose', () => {
    const onClose = jest.fn();
    render(<DeactivateAccountModal isOpen={true} onClose={onClose} />);
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('focuses the confirm button when opened', async () => {
    render(<DeactivateAccountModal isOpen={true} onClose={jest.fn()} />);
    // Initial focus is deferred by one tick via setTimeout(0)
    await new Promise((resolve) => setTimeout(resolve, 10));
    const btn = screen.getByRole('button', { name: /^deactivate account$/i });
    expect(document.activeElement).toBe(btn);
  });

  it('explains data is preserved and reactivation is automatic on sign-in', () => {
    render(<DeactivateAccountModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText(/keep them for you in case you choose to come back/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in again with the same email/i)).toBeInTheDocument();
  });
});
