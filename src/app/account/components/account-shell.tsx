// src/app/account/components/account-shell.tsx
// Two-column layout: flexible main column + 320px concierge sidebar.
// Generous Ma-zone padding; sidebar sticky on desktop only. On mobile,
// sidebar appears AFTER the main column so the journey hero is the
// first thing visible above the fold.
import type { ReactNode } from 'react';

type Props = {
  sidebar: ReactNode;
  main: ReactNode;
};

export function AccountShell({ sidebar, main }: Props) {
  return (
    <div className="mx-auto max-w-[1180px] px-ma-6 sm:px-ma-12 pt-ma-12 sm:pt-ma-16 pb-ma-24 sm:pb-ma-32">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-ma-12 lg:gap-ma-16">
        <main className="min-w-0 order-1">{main}</main>
        <div className="order-2">{sidebar}</div>
      </div>
    </div>
  );
}
