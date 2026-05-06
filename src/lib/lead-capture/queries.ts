import { db } from '@/lib/db';
import { consentRecords, consentTextVersions, leads } from '@/lib/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type ConsentTextVersion = typeof consentTextVersions.$inferSelect;

/**
 * Returns the user's currently-active (not withdrawn) consent record, or null.
 * A user has at most one active consent at a time — if more than one exists,
 * this returns the most recent. (That should not happen; the withdraw actions
 * mark every active consent as withdrawn before a new one is created.)
 */
export async function getActiveConsent(userId: string): Promise<ConsentRecord | null> {
  const rows = await db
    .select()
    .from(consentRecords)
    .where(and(eq(consentRecords.userId, userId), isNull(consentRecords.withdrawnAt)))
    .orderBy(desc(consentRecords.capturedAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Returns all of the user's active (not withdrawn) leads.
 * Ordered by most recent first so the UI can render them in a stable order.
 */
export async function getActiveLeads(userId: string): Promise<Lead[]> {
  return db
    .select()
    .from(leads)
    .where(and(eq(leads.userId, userId), isNull(leads.withdrawnAt)))
    .orderBy(desc(leads.createdAt));
}

/**
 * Returns the currently-active consent text version — the one whose
 * effective_until is NULL. The initial migration seeds exactly one such row.
 * Throws if no active version is found (fail closed — without this the
 * consent modal cannot render).
 */
export async function getActiveConsentTextVersion(): Promise<ConsentTextVersion> {
  const rows = await db
    .select()
    .from(consentTextVersions)
    .where(isNull(consentTextVersions.effectiveUntil))
    .limit(1);
  if (!rows[0]) {
    throw new Error('No active consent_text_versions row found');
  }
  return rows[0];
}
