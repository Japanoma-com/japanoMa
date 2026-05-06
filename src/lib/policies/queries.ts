// src/lib/policies/queries.ts
// Read helpers for the policy_acknowledgments audit log.
import 'server-only';

import { createServiceClient } from '@/lib/supabase/service';
import type { PolicyDocType } from './versions';

export type AcknowledgmentRecord = {
  docType: PolicyDocType;
  version: string;
  acknowledgedAt: Date;
};

/**
 * Most recent acknowledgment per doc type for a given user. Returns
 * an empty array if the user pre-dates the acknowledgment requirement
 * (signed up before policy_acknowledgments existed) — those users
 * will be prompted to re-acknowledge on next signin.
 */
export async function getLatestAcknowledgments(
  userId: string
): Promise<AcknowledgmentRecord[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('policy_acknowledgments')
    .select('doc_type, version, acknowledged_at')
    .eq('user_id', userId)
    .order('acknowledged_at', { ascending: false });

  if (error || !data) return [];

  // Pick the latest entry per doc_type. Rows already arrived sorted
  // newest-first, so the first occurrence per type wins.
  const latest = new Map<PolicyDocType, AcknowledgmentRecord>();
  for (const row of data) {
    const docType = row.doc_type as PolicyDocType;
    if (latest.has(docType)) continue;
    if (docType !== 'terms' && docType !== 'privacy') continue;
    latest.set(docType, {
      docType,
      version: row.version,
      acknowledgedAt: new Date(row.acknowledged_at),
    });
  }
  return [...latest.values()];
}
