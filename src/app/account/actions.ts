'use server';

import { cookies } from 'next/headers';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient as createAdminSupabaseClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { saves, events, quizResponses } from '@/lib/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { updateNameSchema, type UpdateNameData } from '@/lib/validations/auth';

// Client callers (onClick handlers, react-hook-form) swallow the throw
// from next/navigation's redirect(), so actions return { redirectTo } and
// the caller does router.push().
type ActionResult<T = void> = T | { error: string };
type ActionRedirect = { redirectTo: string };

type LocalStorageSave = {
  contentType: 'city' | 'article';
  contentId: string;
  title?: string;
  href?: string;
};

export async function updateName(data: UpdateNameData): Promise<ActionResult> {
  const parsed = updateNameSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid name' };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    data: { name: parsed.data.name },
  });

  if (error) {
    return { error: error.message };
  }
}

/**
 * Soft-deactivate the current account: marks the user as deactivated
 * in `auth.users.raw_user_meta_data` and signs them out, but does NOT
 * destroy any rows. All saved areas, quiz responses, journey state,
 * notes, bookmarks, leads, and policy acknowledgments remain intact.
 *
 * Reactivation is automatic on next sign-in (see signIn() in
 * src/app/(auth)/actions.ts) — the very act of returning is the
 * reactivation, no separate "are you sure you want to come back" prompt.
 */
export async function deactivateAccount(): Promise<ActionResult<ActionRedirect>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to deactivate your account (not authenticated)' };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  const adminClient = createAdminSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const { error } = await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      deactivated_at: new Date().toISOString(),
    },
  });
  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  return { redirectTo: '/?deactivated=true' };
}

export async function migrateAnonymousData(
  localStorageSaves: LocalStorageSave[]
): Promise<ActionResult<{ savesMigrated: number; quizLinked: number; eventsLinked: number }>> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('jt_session')?.value ?? null;

  // Upsert localStorage saves into DB with user_id + denormalized display fields
  let savesMigrated = 0;
  for (const save of localStorageSaves) {
    try {
      await db
        .insert(saves)
        .values({
          userId: user.id,
          contentType: save.contentType,
          contentId: save.contentId,
          title: save.title ?? null,
          href: save.href ?? null,
        })
        .onConflictDoNothing();
      savesMigrated++;
    } catch {
      // Ignore duplicates
    }
  }

  let quizLinked = 0;
  let eventsLinked = 0;

  if (sessionId) {
    // Backfill user_id on events and quiz_responses by session_id
    const quizResult = await db
      .update(quizResponses)
      .set({ userId: user.id })
      .where(
        and(
          eq(sql`session_id::text`, sessionId),
          isNull(quizResponses.userId)
        )
      );
    quizLinked = (quizResult as unknown as { rowCount?: number }).rowCount ?? 0;

    const eventsResult = await db
      .update(events)
      .set({ userId: user.id })
      .where(
        and(
          eq(sql`session_id::text`, sessionId),
          isNull(events.userId)
        )
      );
    eventsLinked = (eventsResult as unknown as { rowCount?: number }).rowCount ?? 0;
  }

  return { savesMigrated, quizLinked, eventsLinked };
}
