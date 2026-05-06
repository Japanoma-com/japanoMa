'use server';

import { db } from '@/lib/db';
import { consentRecords, consentTextVersions, leads } from '@/lib/db/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getClientIp, hashIp } from '@/lib/lead-capture/hash-ip';
import {
  leadInputSchema,
  recordConsentAndCreateLeadInputSchema,
  type LeadInput,
  type RecordConsentAndCreateLeadInput,
} from '@/lib/validations/lead-capture';
import { sendEmail } from '@/lib/email/client';
import { renderNotification } from '@/lib/email/templates/new-lead';
import { captureSignalSafe } from '@/lib/journey/capture-safe';

async function notifyNewLead(params: {
  leadId: string;
  userEmail: string | null;
  areaSlug: string;
  prefectureSlug: string;
  profileSnapshot: unknown;
}): Promise<void> {
  try {
    const rendered = renderNotification({
      type: 'lead',
      leadId: params.leadId,
      userEmail: params.userEmail,
      areaSlug: params.areaSlug,
      prefectureSlug: params.prefectureSlug,
      profileSnapshot: params.profileSnapshot,
    });
    await sendEmail(rendered);
  } catch (err) {
    // Never fail the lead creation because of a notification error.
    console.warn('[lead-actions] notifyNewLead failed:', err);
  }
}

export type LeadActionError =
  | 'not_authenticated'
  | 'invalid_input'
  | 'no_active_consent'
  | 'consent_version_not_found'
  | 'already_interested'
  | 'lead_not_found'
  | 'lead_not_owned'
  | 'database_error';

type Result<T> = ({ success: true } & T) | { error: LeadActionError };

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === '23505'
  );
}

export async function recordConsentAndCreateLead(
  input: RecordConsentAndCreateLeadInput
): Promise<Result<{ leadId: string; consentRecordId: string }>> {
  // 1. Auth (runs BEFORE validation so unauthenticated callers get that error first)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not_authenticated' };

  // 2. Validate
  const parsed = recordConsentAndCreateLeadInputSchema.safeParse(input);
  if (!parsed.success) return { error: 'invalid_input' };

  // 3. Look up the requested consent text version (history is never deleted —
  //    even if v2 is now active, v1 still exists and is a legally valid version
  //    the user agreed to.)
  const versionRows = await db
    .select()
    .from(consentTextVersions)
    .where(eq(consentTextVersions.version, parsed.data.consentTextVersion))
    .limit(1);
  const versionRow = versionRows[0];
  if (!versionRow) return { error: 'consent_version_not_found' };

  // 4. Capture request metadata
  const clientIp = await getClientIp();
  const h = await headers();
  const userAgent = h.get('user-agent') ?? null;
  const ipHashed = hashIp(clientIp); // throws if salt is missing (fail-closed)

  // 5. Transaction: consent record + lead row
  try {
    const result = await db.transaction(async (tx) => {
      const [consentRecord] = await tx
        .insert(consentRecords)
        .values({
          userId: user.id,
          consentTextVersion: versionRow.version,
          consentTextBody: versionRow.body,
          consentTextHash: versionRow.bodyHash,
          scope: versionRow.scope,
          ipHash: ipHashed,
          userAgent,
        })
        .returning({ id: consentRecords.id });

      const [lead] = await tx
        .insert(leads)
        .values({
          userId: user.id,
          consentRecordId: consentRecord.id,
          areaSlug: parsed.data.areaSlug,
          prefectureSlug: parsed.data.prefectureSlug,
          profileSnapshot: parsed.data.profileSnapshot,
          status: 'new',
        })
        .returning({ id: leads.id });

      return { consentRecordId: consentRecord.id, leadId: lead.id };
    });

    // Fire-and-forget email to Go&C.
    void notifyNewLead({
      leadId: result.leadId,
      userEmail: user.email ?? null,
      areaSlug: parsed.data.areaSlug,
      prefectureSlug: parsed.data.prefectureSlug,
      profileSnapshot: parsed.data.profileSnapshot,
    });

    // D2L journey: Express Interest is the strongest intent signal — phase 6_offer.
    await captureSignalSafe(user.id, 'lead_submitted', {
      areaSlug: parsed.data.areaSlug,
      leadId: result.leadId,
    });

    revalidatePath('/account');
    return { success: true, ...result };
  } catch (err) {
    if (isUniqueViolation(err)) return { error: 'already_interested' };
    return { error: 'database_error' };
  }
}

export async function createLeadWithExistingConsent(
  input: LeadInput
): Promise<Result<{ leadId: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not_authenticated' };

  const parsed = leadInputSchema.safeParse(input);
  if (!parsed.success) return { error: 'invalid_input' };

  // Find the user's active consent (most recent one that hasn't been withdrawn)
  const consentRows = await db
    .select({ id: consentRecords.id })
    .from(consentRecords)
    .where(and(eq(consentRecords.userId, user.id), isNull(consentRecords.withdrawnAt)))
    .orderBy(desc(consentRecords.capturedAt))
    .limit(1);

  const consent = consentRows[0];
  if (!consent) return { error: 'no_active_consent' };

  try {
    const [lead] = await db
      .insert(leads)
      .values({
        userId: user.id,
        consentRecordId: consent.id,
        areaSlug: parsed.data.areaSlug,
        prefectureSlug: parsed.data.prefectureSlug,
        profileSnapshot: parsed.data.profileSnapshot,
        status: 'new',
      })
      .returning({ id: leads.id });

    void notifyNewLead({
      leadId: lead.id,
      userEmail: user.email ?? null,
      areaSlug: parsed.data.areaSlug,
      prefectureSlug: parsed.data.prefectureSlug,
      profileSnapshot: parsed.data.profileSnapshot,
    });

    await captureSignalSafe(user.id, 'lead_submitted', {
      areaSlug: parsed.data.areaSlug,
      leadId: lead.id,
    });

    revalidatePath('/account');
    return { success: true, leadId: lead.id };
  } catch (err) {
    if (isUniqueViolation(err)) return { error: 'already_interested' };
    return { error: 'database_error' };
  }
}

export async function withdrawAllConsent(): Promise<Result<{ withdrawnLeadCount: number }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not_authenticated' };

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Mark all active leads as withdrawn (executed FIRST so the test's
      //    call-count ordering matches)
      const leadResult = await tx
        .update(leads)
        .set({ withdrawnAt: new Date(), status: 'withdrawn', statusUpdatedAt: new Date() })
        .where(and(eq(leads.userId, user.id), isNull(leads.withdrawnAt)));

      // 2. Mark the active consent record as withdrawn
      await tx
        .update(consentRecords)
        .set({ withdrawnAt: new Date() })
        .where(and(eq(consentRecords.userId, user.id), isNull(consentRecords.withdrawnAt)));

      const rowCount = (leadResult as unknown as { rowCount?: number }).rowCount ?? 0;
      return { withdrawnLeadCount: rowCount };
    });

    revalidatePath('/account');
    return { success: true, ...result };
  } catch {
    return { error: 'database_error' };
  }
}

export async function withdrawLead(leadId: string): Promise<Result<object>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not_authenticated' };

  // Fetch the lead to verify existence and ownership
  const rows = await db
    .select({ id: leads.id, userId: leads.userId, withdrawnAt: leads.withdrawnAt })
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  const lead = rows[0];
  if (!lead) return { error: 'lead_not_found' };
  if (lead.userId !== user.id) return { error: 'lead_not_owned' };

  // Idempotent: if already withdrawn, short-circuit to success
  if (lead.withdrawnAt) {
    revalidatePath('/account');
    return { success: true };
  }

  try {
    await db
      .update(leads)
      .set({ withdrawnAt: new Date(), status: 'withdrawn', statusUpdatedAt: new Date() })
      .where(eq(leads.id, leadId));
    revalidatePath('/account');
    return { success: true };
  } catch {
    return { error: 'database_error' };
  }
}
