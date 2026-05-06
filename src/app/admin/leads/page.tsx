import { getLeadsWithCustomers, type LeadWithCustomer } from '@/lib/admin/queries';
import { parseRangeOrDefault, toIsoDate } from '@/lib/admin/range';
import { AdminSection } from '@/components/admin/admin-section';
import { AdminTable } from '@/components/admin/admin-table';
import { SurveyButton } from './survey-button';

export const metadata = {
  title: 'Leads · Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function AdminLeadsPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = parseRangeOrDefault(params, 90);

  const leads = await getLeadsWithCustomers({ ...range, limit: 200 });

  const exportHref = `/api/admin/export/leads?from=${toIsoDate(range.from)}&to=${toIsoDate(range.to)}`;

  return (
    <div className="space-y-ma-8">
      <AdminSection
        overline="Lead Capture"
        title="Leads"
        subtitle={`${leads.length} expressions of interest with consent record.`}
        range={range}
        actions={
          <a
            href={exportHref}
            className="px-ma-4 py-ma-2 rounded-md text-xs font-semibold tracking-wide uppercase bg-ai text-kinu hover:bg-ai-deep transition-colors duration-base ease-settle"
          >
            Export CSV
          </a>
        }
      />

      <AdminTable
        rows={leads}
        emptyMessage="No leads in this range."
        rowKey={(lead) => lead.id}
        columns={[
          {
            key: 'date',
            header: 'Date',
            width: '108px',
            render: (lead) => (
              <span className="text-stone font-mono text-xs whitespace-nowrap">
                {toIsoDate(new Date(lead.createdAt))}
              </span>
            ),
          },
          {
            key: 'customer',
            header: 'Customer',
            render: (lead) => (
              <div className="min-w-0">
                <div className="text-sumi font-medium truncate">
                  {lead.customerName ?? '—'}
                </div>
                <div className="text-stone text-xs truncate">
                  {lead.customerEmail ? (
                    <a
                      href={`mailto:${lead.customerEmail}`}
                      className="text-ai hover:text-ai-deep underline underline-offset-2"
                    >
                      {lead.customerEmail}
                    </a>
                  ) : (
                    <span className="italic">(no email on record)</span>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'area',
            header: 'Area',
            render: (lead) => (
              <span className="text-sumi text-xs">
                {lead.prefectureSlug} / {lead.areaSlug}
              </span>
            ),
          },
          {
            key: 'profile',
            header: 'Profile',
            render: (lead) => <ProfileSummary snapshot={lead.profileSnapshot} />,
          },
          {
            key: 'status',
            header: 'Status',
            render: (lead) => <StatusChip status={lead.status} />,
          },
          {
            key: 'katitas',
            header: 'Katitas ref',
            render: (lead) => (
              <span className="text-sumi-light">{lead.katitasReference ?? '—'}</span>
            ),
          },
          {
            key: 'notes',
            header: 'Notes',
            render: (lead) => (
              <span className="text-sumi-light max-w-xs inline-block truncate">
                {lead.notes ?? '—'}
              </span>
            ),
          },
          {
            key: 'action',
            header: 'Action',
            align: 'right',
            render: (lead) =>
              lead.status === 'withdrawn' ? (
                <span className="text-xs text-stone">—</span>
              ) : (
                <SurveyButton leadId={lead.id} />
              ),
          },
        ]}
      />
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const tone =
    status === 'new'
      ? 'bg-ai/10 text-ai'
      : status === 'withdrawn'
      ? 'bg-stone/10 text-stone line-through'
      : 'bg-matsu/10 text-matsu';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-sm text-xs font-mono ${tone}`}
    >
      {status}
    </span>
  );
}

/**
 * Compact display of the profile_snapshot JSON: budget + property types
 * + use case + condition, whichever are present. Falls back to raw JSON
 * if the shape is unexpected.
 */
function ProfileSummary({ snapshot }: { snapshot: LeadWithCustomer['profileSnapshot'] }) {
  if (!snapshot || typeof snapshot !== 'object') {
    return <span className="text-stone text-xs">—</span>;
  }

  const obj = snapshot as Record<string, unknown>;
  const rows: Array<[string, string]> = [];

  const asString = (v: unknown) =>
    typeof v === 'string'
      ? v
      : Array.isArray(v)
      ? v.join(', ')
      : typeof v === 'number' || typeof v === 'boolean'
      ? String(v)
      : null;

  for (const key of ['budget', 'types', 'useCase', 'useCases', 'condition', 'season', 'purpose'] as const) {
    const v = asString(obj[key]);
    if (v) rows.push([key, v]);
  }

  if (rows.length === 0) {
    return (
      <details className="text-xs text-stone">
        <summary className="cursor-pointer">JSON</summary>
        <pre className="mt-2 max-w-xs overflow-x-auto text-[10px]">
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      </details>
    );
  }

  return (
    <div className="text-xs text-sumi-light space-y-0.5 min-w-0">
      {rows.map(([k, v]) => (
        <div key={k} className="truncate">
          <span className="text-stone">{k}:</span> {v}
        </div>
      ))}
    </div>
  );
}
