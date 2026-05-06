'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { saves } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logEvent } from '@/lib/events/log';
import { captureSignalSafe } from '@/lib/journey/capture-safe';

export type SaveContentType = 'city' | 'article';

type ToggleSaveInput = {
  contentType: SaveContentType;
  contentId: string;
  title: string;
  href: string;
};

type ToggleSaveResult =
  | { success: true; saved: boolean }
  | { error: 'not_authenticated' | 'invalid_input' | 'database_error' };

export async function toggleSave(input: ToggleSaveInput): Promise<ToggleSaveResult> {
  // Validate input
  if (
    !input.contentId ||
    !input.title ||
    !input.href ||
    (input.contentType !== 'city' && input.contentType !== 'article')
  ) {
    return { error: 'invalid_input' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'not_authenticated' };
  }

  try {
    // Check if the save already exists
    const existing = await db
      .select({ id: saves.id })
      .from(saves)
      .where(
        and(
          eq(saves.userId, user.id),
          eq(saves.contentType, input.contentType),
          eq(saves.contentId, input.contentId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Already saved — remove it
      await db
        .delete(saves)
        .where(
          and(
            eq(saves.userId, user.id),
            eq(saves.contentType, input.contentType),
            eq(saves.contentId, input.contentId)
          )
        );

      await logEvent(
        'bookmark_remove',
        { contentType: input.contentType, contentId: input.contentId },
        user.id
      );

      // Revalidate /account so the SavedItemsSection reflects the change
      revalidatePath('/account');
      return { success: true, saved: false };
    }

    // Not saved yet — insert it
    await db.insert(saves).values({
      userId: user.id,
      contentType: input.contentType,
      contentId: input.contentId,
      title: input.title,
      href: input.href,
    });

    await logEvent(
      'bookmark_add',
      { contentType: input.contentType, contentId: input.contentId, title: input.title },
      user.id
    );

    // D2L journey: city saves advance to phase 3_area; article saves don't advance phase
    // (Property listings will hook in here as a separate content_type when listings ship.)
    if (input.contentType === 'city') {
      await captureSignalSafe(user.id, 'area_saved', { areaSlug: input.contentId });
    }

    revalidatePath('/account');
    return { success: true, saved: true };
  } catch (error) {
    console.error('toggleSave failed:', error);
    return { error: 'database_error' };
  }
}

/**
 * Returns the set of (contentType, contentId) pairs the current user has saved.
 * Used by content pages to set the initial saved state of SaveButtons without
 * needing a client-side fetch. Returns an empty set for anonymous users.
 */
export async function getCurrentUserSavedKeys(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  try {
    const rows = await db
      .select({ contentType: saves.contentType, contentId: saves.contentId })
      .from(saves)
      .where(eq(saves.userId, user.id));

    return new Set(rows.map((r) => `${r.contentType}:${r.contentId}`));
  } catch {
    return new Set();
  }
}
