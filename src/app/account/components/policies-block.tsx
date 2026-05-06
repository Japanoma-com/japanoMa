// src/app/account/components/policies-block.tsx
// Sidebar block that surfaces which version of the Terms & Privacy
// the user accepted, and when. Gives the user a way to verify what
// they agreed to and links back to the live document.
import Link from 'next/link';
import type { AcknowledgmentRecord } from '@/lib/policies/queries';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/policies/versions';

type Row = {
  label: string;
  href: string;
  current: string;
  acceptedVersion?: string;
  acceptedAt?: Date;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function PoliciesBlock({
  acknowledgments,
}: {
  acknowledgments: AcknowledgmentRecord[];
}) {
  const byDoc = new Map(acknowledgments.map((a) => [a.docType, a]));
  const rows: Row[] = [
    {
      label: 'Terms & Conditions',
      href: '/terms',
      current: TERMS_VERSION,
      acceptedVersion: byDoc.get('terms')?.version,
      acceptedAt: byDoc.get('terms')?.acknowledgedAt,
    },
    {
      label: 'Privacy Policy',
      href: '/privacy',
      current: PRIVACY_VERSION,
      acceptedVersion: byDoc.get('privacy')?.version,
      acceptedAt: byDoc.get('privacy')?.acknowledgedAt,
    },
  ];

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone mb-ma-3">
        Legal
      </p>
      <ul className="flex flex-col gap-ma-2">
        {rows.map((row) => {
          const stale =
            row.acceptedVersion !== undefined &&
            row.acceptedVersion !== row.current;
          return (
            <li key={row.href} className="flex items-baseline justify-between gap-ma-3 text-[12px] leading-snug">
              <Link
                href={row.href}
                className="text-sumi-light hover:text-ai underline-offset-[3px] hover:underline transition-colors duration-base ease-settle"
              >
                {row.label}
              </Link>
              {row.acceptedVersion ? (
                <span
                  className={`tabular-nums text-[10px] flex-shrink-0 ${
                    stale ? 'text-kohaku' : 'text-stone'
                  }`}
                  title={
                    row.acceptedAt
                      ? `Accepted v${row.acceptedVersion} on ${formatDate(row.acceptedAt)}`
                      : undefined
                  }
                >
                  v{row.acceptedVersion}
                  {row.acceptedAt && (
                    <span className="ml-[6px] text-stone/70">
                      · {formatDate(row.acceptedAt)}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[10px] text-stone/60">v{row.current}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
