import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdminUser } from '@/lib/auth/admin';

/**
 * Admin layout with role gate + sidebar navigation.
 *
 * Non-admins get a 404 (not a redirect — we don't want to leak the
 * existence of the /admin subtree). Admin status comes from Supabase
 * `app_metadata.is_admin`.
 */

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/insights', label: 'Insights' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getCurrentAdminUser();

  if (!user || !isAdmin) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-washi">
      <div className="border-b border-border bg-shoji">
        <div className="ma-page px-ma-6 py-ma-4 flex items-center justify-between gap-ma-6">
          <div className="flex items-center gap-ma-6">
            <Link
              href="/admin"
              className="label-overline text-ai hover:text-ai-deep transition-colors duration-base ease-settle"
            >
              Japanoma · Admin
            </Link>
            <nav className="hidden md:flex items-center gap-ma-4 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-sumi-light hover:text-sumi transition-colors duration-base ease-settle whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-xs text-stone truncate max-w-[240px]">
            {user.email}
          </div>
        </div>
        {/* Mobile nav — horizontally scrollable */}
        <nav className="md:hidden ma-page px-ma-6 pb-ma-3 flex items-center gap-ma-4 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-sumi-light hover:text-sumi transition-colors duration-base ease-settle whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ma-page px-ma-6 py-ma-12">{children}</div>
    </div>
  );
}
