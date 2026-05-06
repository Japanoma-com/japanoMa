// src/app/account/components/concierge-sidebar.tsx
// Modernized concierge card. No left-border accent, no bordered dividers —
// shadow + spacing define hierarchy. Sticky on desktop only.
import { IdentityBlock } from './identity-block';
import { StatusBlock } from './status-block';
import { SidebarActions } from './sidebar-actions';
import { PoliciesBlock } from './policies-block';
import type { AcknowledgmentRecord } from '@/lib/policies/queries';

type Props = {
  name: string;
  email: string;
  memberSince: string;
  quizComplete: boolean;
  recommendedCount: number;
  interestCount: number;
  savesCount: number;
  hasActiveConsent: boolean;
  acknowledgments: AcknowledgmentRecord[];
};

export function ConciergeSidebar({
  name,
  email,
  memberSince,
  quizComplete,
  recommendedCount,
  interestCount,
  savesCount,
  hasActiveConsent,
  acknowledgments,
}: Props) {
  return (
    <aside className="bg-kinu rounded-xl shadow-card lg:sticky lg:top-ma-32 overflow-hidden">
      <div className="p-ma-6">
        <IdentityBlock name={name} email={email} memberSince={memberSince} />
      </div>
      <div className="px-ma-6 py-ma-4 bg-shoji/40">
        <StatusBlock
          quizComplete={quizComplete}
          recommendedCount={recommendedCount}
          interestCount={interestCount}
          savesCount={savesCount}
        />
      </div>
      <div className="p-ma-6">
        <SidebarActions
          currentName={name}
          hasActiveConsent={hasActiveConsent}
          activeLeadCount={interestCount}
        />
      </div>
      <div className="px-ma-6 pb-ma-6">
        <PoliciesBlock acknowledgments={acknowledgments} />
      </div>
    </aside>
  );
}
