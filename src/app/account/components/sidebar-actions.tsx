'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '../../(auth)/actions';
import { withdrawAllConsent } from '../lead-actions';
import { SidebarNameEdit } from './sidebar-name-edit';
import { DeactivateAccountModal } from './deactivate-account-modal';
import { Spinner } from '@/components/japandi/spinner';

type Props = {
  currentName: string;
  hasActiveConsent: boolean;
  activeLeadCount: number;
};

export function SidebarActions({ currentName, hasActiveConsent, activeLeadCount }: Props) {
  const router = useRouter();
  const [nameEditOpen, setNameEditOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    const result = await signOut();
    if (result && 'redirectTo' in result) {
      router.push(result.redirectTo);
      router.refresh();
    } else {
      setIsSigningOut(false);
    }
  }

  async function handleWithdrawAll() {
    const confirmed = window.confirm(
      `Withdraw all ${activeLeadCount} interest${activeLeadCount === 1 ? '' : 's'} and revoke consent? We will not contact you.`
    );
    if (!confirmed) return;
    setWithdrawError(null);
    const result = await withdrawAllConsent();
    if (result && 'success' in result) {
      router.refresh();
    } else if (result && 'error' in result) {
      setWithdrawError(
        result.error === 'not_authenticated'
          ? 'Please sign in to continue.'
          : 'We could not withdraw your consent. Please try again.'
      );
    }
  }

  return (
    <>
      <div>
        <p className="mb-ma-3 text-[10px] font-bold uppercase tracking-[0.15em] text-stone">
          Actions
        </p>
        {nameEditOpen ? (
          <SidebarNameEdit
            currentName={currentName}
            onClose={() => {
              setNameEditOpen(false);
              router.refresh();
            }}
          />
        ) : (
          <div className="flex flex-col gap-ma-2">
            <button
              type="button"
              onClick={() => setNameEditOpen(true)}
              className="text-left text-xs text-stone hover:text-sumi"
            >
              Edit name
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex items-center gap-ma-2 text-left text-xs text-stone hover:text-sumi disabled:opacity-50"
            >
              {isSigningOut && <Spinner size="sm" />}
              <span>{isSigningOut ? 'Signing out…' : 'Sign out'}</span>
            </button>
            {hasActiveConsent && (
              <>
                <button
                  type="button"
                  onClick={handleWithdrawAll}
                  className="text-left text-xs text-stone hover:text-sumi"
                >
                  Withdraw all consent
                </button>
                {withdrawError && (
                  <p className="text-[11px] text-beni">{withdrawError}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-ma-6 pt-ma-6 border-t border-border">
        <button
          type="button"
          onClick={() => setDeactivateModalOpen(true)}
          className="text-[11px] text-stone hover:text-sumi underline underline-offset-[3px] decoration-stone/40 hover:decoration-sumi transition-colors duration-base ease-settle"
        >
          Deactivate account
        </button>
        <p className="mt-ma-1 text-[10px] text-stone/70 leading-relaxed">
          Pauses your account, keeps your data. Sign in again to reactivate.
        </p>
      </div>

      <DeactivateAccountModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
      />
    </>
  );
}
