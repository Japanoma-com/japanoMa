import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Feature gate lives in src/middleware.ts.
  //
  // Vertically center the auth card within the viewport height minus the
  // global Header (h-16 = 64px = 4rem). The footer sits naturally below this
  // container. On tall viewports where the footer fits inside 100vh, this
  // gives a nicely centered card with the footer visible; on short viewports
  // the container takes up almost the full viewport and the footer scrolls
  // just below the fold.
  return (
    <div className="min-h-[calc(100svh-4rem)] flex items-center justify-center bg-washi px-ma-4 py-ma-12">
      {children}
    </div>
  );
}
