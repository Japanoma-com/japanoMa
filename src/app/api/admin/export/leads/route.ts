import { NextResponse } from 'next/server';
import { getCurrentAdminUser } from '@/lib/auth/admin';
import { getLeadsWithCustomers, parseRange } from '@/lib/admin/queries';
import { csvResponse, toCsv } from '@/lib/admin/csv';

export const dynamic = 'force-dynamic';

/**
 * CSV export of leads, including customer name + email from auth.users
 * and the full profile snapshot. Admin-only (404 for non-admins).
 */
export async function GET(request: Request) {
  const { isAdmin } = await getCurrentAdminUser();
  if (!isAdmin) return new NextResponse(null, { status: 404 });

  const url = new URL(request.url);
  const range = parseRange({
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
  });

  const rows = await getLeadsWithCustomers({ ...range, limit: 10000 });

  const flattened = rows.map((r) => ({
    id: r.id,
    created_at: r.createdAt.toISOString(),
    status: r.status,
    customer_name: r.customerName ?? '',
    customer_email: r.customerEmail ?? '',
    user_id: r.userId,
    prefecture_slug: r.prefectureSlug,
    area_slug: r.areaSlug,
    katitas_reference: r.katitasReference ?? '',
    notes: r.notes ?? '',
    withdrawn_at: r.withdrawnAt ? r.withdrawnAt.toISOString() : '',
    profile_snapshot: r.profileSnapshot,
  }));

  const columns = [
    'id',
    'created_at',
    'status',
    'customer_name',
    'customer_email',
    'user_id',
    'prefecture_slug',
    'area_slug',
    'katitas_reference',
    'notes',
    'withdrawn_at',
    'profile_snapshot',
  ];

  const csv = toCsv(flattened, columns);
  const filename = `japanoma-leads-${range.from.toISOString().slice(0, 10)}-to-${range.to.toISOString().slice(0, 10)}.csv`;
  return csvResponse(csv, filename);
}
