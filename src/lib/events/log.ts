/**
 * Server-side event logging helper for the analytics pipeline.
 *
 * Inserts into the `events` table (see src/lib/db/schema.ts). Consent-gated
 * and non-blocking: a failure here must never break the calling request.
 *
 * Session handling matches the rest of the app: the `jt_session` cookie is
 * the anonymous session id (90-day, httpOnly — see middleware.ts).
 * `userId` is filled when the caller is authenticated; otherwise null.
 * On sign-in, migrateAnonymousData (src/app/account/actions.ts) backfills
 * userId on historical events keyed by session.
 *
 * Consent is read from the `analytics_consent` cookie set by the consent
 * banner. Value "granted" enables tracking; anything else (absent, "declined",
 * "pending") is treated as NOT granted and the insert is skipped.
 */
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';

export type EventName =
  | 'page_view'
  | 'article_read'
  | 'quiz_start'
  | 'quiz_complete'
  | 'bookmark_add'
  | 'bookmark_remove'
  | 'compare_add'
  | 'compare_remove'
  | 'filter_apply'
  | 'contact_form';

const SESSION_COOKIE = 'jt_session';
const CONSENT_COOKIE = 'analytics_consent';

export type EventPayload = Record<string, unknown> | undefined;

/**
 * Log a single analytics event. Never throws — all failures are swallowed
 * with a console.warn so the calling request completes normally.
 *
 * Consent is required. If the user hasn't accepted analytics tracking
 * (or has declined), this is a no-op.
 *
 * Pass `userId` explicitly if you've already resolved the Supabase user
 * in the calling code (saves a round-trip). Otherwise the helper looks
 * it up itself.
 */
export async function logEvent(
  eventName: EventName,
  payload?: EventPayload,
  userId?: string | null
): Promise<void> {
  try {
    const cookieStore = await cookies();

    // Consent gate — strict: only 'granted' enables tracking
    const consent = cookieStore.get(CONSENT_COOKIE)?.value;
    if (consent !== 'granted') return;

    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return; // No session means middleware hasn't set one yet

    let resolvedUserId: string | null = userId ?? null;
    if (resolvedUserId === undefined || resolvedUserId === null) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        resolvedUserId = user?.id ?? null;
      } catch {
        resolvedUserId = null;
      }
    }

    await db.insert(events).values({
      sessionId,
      userId: resolvedUserId,
      eventType: eventName,
      payload: payload ?? null,
    });
  } catch (err) {
    // Non-blocking — we never fail a user-facing request because of an
    // analytics insert. Log to stderr for local debugging only.
    console.warn(`[events] logEvent("${eventName}") failed:`, err);
  }
}
