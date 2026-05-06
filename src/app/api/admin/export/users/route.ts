import { NextResponse } from 'next/server';
import { getCurrentAdminUser } from '@/lib/auth/admin';
import { getAdminUsers } from '@/lib/admin/queries';
import { csvResponse, toCsv } from '@/lib/admin/csv';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { isAdmin } = await getCurrentAdminUser();
  if (!isAdmin) return new NextResponse(null, { status: 404 });

  const rows = await getAdminUsers({ limit: 10000 });

  const flattened = rows.map((r) => ({
    id: r.id,
    email: r.email ?? '',
    name: r.name ?? '',
    created_at: r.createdAt.toISOString(),
    last_sign_in_at: r.lastSignInAt ? r.lastSignInAt.toISOString() : '',
    email_confirmed_at: r.emailConfirmedAt ? r.emailConfirmedAt.toISOString() : '',
    saved_count: r.savedCount,
    quiz_completions: r.quizCompletions,
    lead_count: r.leadCount,
  }));

  const columns = [
    'id',
    'email',
    'name',
    'created_at',
    'last_sign_in_at',
    'email_confirmed_at',
    'saved_count',
    'quiz_completions',
    'lead_count',
  ];

  const csv = toCsv(flattened, columns);
  const filename = `japanoma-users-${new Date().toISOString().slice(0, 10)}.csv`;
  return csvResponse(csv, filename);
}
