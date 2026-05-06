import { createClient } from '@/lib/supabase/server';

/**
 * Resolves whether the current Supabase session belongs to an admin.
 *
 * Admin role is stored in Supabase `app_metadata.is_admin`. That namespace
 * is server-controlled (users cannot self-edit it from a client SDK),
 * unlike user_metadata which any signed-in user can write. To grant admin
 * access: Supabase Studio → Authentication → Users → edit user → add
 * `"is_admin": true` to App Metadata.
 *
 * Returns null for anonymous users, the user for non-admins (so callers
 * can distinguish), or the user when admin.
 */
export async function getCurrentAdminUser(): Promise<{
  user: { id: string; email: string | null } | null;
  isAdmin: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isAdmin: false };

  const isAdmin = Boolean(
    (user.app_metadata as Record<string, unknown> | undefined)?.is_admin
  );

  return {
    user: { id: user.id, email: user.email ?? null },
    isAdmin,
  };
}
