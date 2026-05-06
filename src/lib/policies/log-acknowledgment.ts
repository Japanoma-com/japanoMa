// src/lib/policies/log-acknowledgment.ts
// Server-only helper that records a Terms or Privacy acknowledgment
// to the policy_acknowledgments audit log. Writes go through the
// service-role client because the table's RLS only permits SELECT
// for authenticated users — INSERTs are reserved for trusted code
// paths (signup, re-acknowledgment after a version bump).
import 'server-only';

import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/service';
import {
  TERMS_VERSION,
  PRIVACY_VERSION,
  type PolicyDocType,
} from './versions';

type AcknowledgmentContext = 'signup' | 'reacknowledgment';

export type LogResult =
  | { success: true; rowIds: string[] }
  | { success: false; error: string };

/**
 * Record acknowledgment of one or more policy documents for a given
 * user. Inserts one row per docType, capturing the version that was
 * shown to the user, the IP and user-agent at acknowledgment time,
 * and the context (signup vs. re-acknowledgment).
 *
 * Failures are logged but do NOT throw — we never want a flaky audit
 * write to block account creation. The caller decides whether to
 * surface the error; in practice the signUp action proceeds
 * regardless and we have a backfill job for missed rows (TODO).
 */
export async function logPolicyAcknowledgment({
  userId,
  docTypes,
  context,
}: {
  userId: string;
  docTypes: PolicyDocType[];
  context: AcknowledgmentContext;
}): Promise<LogResult> {
  if (docTypes.length === 0) {
    return { success: false, error: 'No docTypes provided' };
  }

  const supabase = createServiceClient();
  const headerList = await headers();
  // x-forwarded-for is set by Vercel's edge; first hop is the client.
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const userAgent = headerList.get('user-agent') ?? null;

  const VERSION_BY_DOC: Record<PolicyDocType, string> = {
    terms: TERMS_VERSION,
    privacy: PRIVACY_VERSION,
  };

  const rows = docTypes.map((doc) => ({
    user_id: userId,
    doc_type: doc,
    version: VERSION_BY_DOC[doc],
    ip_address: ip,
    user_agent: userAgent,
    context,
  }));

  const { data, error } = await supabase
    .from('policy_acknowledgments')
    .insert(rows)
    .select('id');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, rowIds: (data ?? []).map((r) => r.id) };
}
