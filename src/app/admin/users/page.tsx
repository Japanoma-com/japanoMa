import { getAdminUsers } from '@/lib/admin/queries';
import { AdminSection } from '@/components/admin/admin-section';
import { AdminTable } from '@/components/admin/admin-table';
import { StatCard } from '@/components/admin/stat-card';

export const metadata = {
  title: 'Users · Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getAdminUsers({ limit: 500 });

  const confirmed = users.filter((u) => u.emailConfirmedAt !== null).length;
  const signedIn = users.filter((u) => u.lastSignInAt !== null).length;

  const now = Date.now();
  const active7d = users.filter((u) => {
    if (!u.lastSignInAt) return false;
    return now - u.lastSignInAt.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-ma-8">
      <AdminSection
        overline="User Directory"
        title="Signed-up users"
        subtitle={`${users.length} accounts.`}
        rangeControls={false}
        actions={
          <a
            href="/api/admin/export/users"
            className="px-ma-4 py-ma-2 rounded-md text-xs font-semibold tracking-wide uppercase bg-ai text-kinu hover:bg-ai-deep transition-colors duration-base ease-settle"
          >
            Export CSV
          </a>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-ma-4">
        <StatCard label="Total" value={users.length} />
        <StatCard label="Email confirmed" value={confirmed} sub={`${users.length - confirmed} unverified`} />
        <StatCard label="Ever signed in" value={signedIn} />
        <StatCard label="Active (7d)" value={active7d} />
      </div>

      <AdminTable
        rows={users}
        emptyMessage="No users yet."
        rowKey={(u) => u.id}
        columns={[
          {
            key: 'user',
            header: 'User',
            render: (u) => (
              <div className="min-w-0">
                <div className="text-sumi font-medium truncate">
                  {u.name ?? '—'}
                </div>
                <div className="text-stone text-xs truncate">
                  {u.email ? (
                    <a
                      href={`mailto:${u.email}`}
                      className="text-ai hover:text-ai-deep underline underline-offset-2"
                    >
                      {u.email}
                    </a>
                  ) : (
                    <span className="italic">no email</span>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'joined',
            header: 'Joined',
            width: '108px',
            render: (u) => (
              <span className="text-stone font-mono text-xs whitespace-nowrap">
                {u.createdAt.toISOString().slice(0, 10)}
              </span>
            ),
          },
          {
            key: 'last_sign_in',
            header: 'Last sign-in',
            width: '108px',
            render: (u) => (
              <span className="text-sumi-light font-mono text-xs whitespace-nowrap">
                {u.lastSignInAt ? u.lastSignInAt.toISOString().slice(0, 10) : '—'}
              </span>
            ),
          },
          {
            key: 'confirmed',
            header: 'Confirmed',
            width: '90px',
            render: (u) =>
              u.emailConfirmedAt ? (
                <span className="text-matsu text-xs">✓</span>
              ) : (
                <span className="text-stone text-xs">—</span>
              ),
          },
          {
            key: 'saves',
            header: 'Saves',
            align: 'right',
            width: '72px',
            render: (u) => (
              <span className="text-sumi tabular-nums text-xs">{u.savedCount}</span>
            ),
          },
          {
            key: 'quizzes',
            header: 'Quizzes',
            align: 'right',
            width: '72px',
            render: (u) => (
              <span className="text-sumi tabular-nums text-xs">{u.quizCompletions}</span>
            ),
          },
          {
            key: 'leads',
            header: 'Leads',
            align: 'right',
            width: '72px',
            render: (u) =>
              u.leadCount > 0 ? (
                <span className="text-ai font-semibold tabular-nums text-xs">
                  {u.leadCount}
                </span>
              ) : (
                <span className="text-stone tabular-nums text-xs">0</span>
              ),
          },
        ]}
      />
    </div>
  );
}
