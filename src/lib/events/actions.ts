'use server';

/**
 * Server actions for client-triggered event logging.
 *
 * Client components (stores, buttons) that need to log analytics events
 * call these thin wrappers instead of reaching into the server-only
 * logEvent directly. All calls are fire-and-forget; the client does not
 * await them and never surfaces errors.
 */

import { logEvent, type EventPayload } from './log';

export async function trackCompareAdd(payload: EventPayload) {
  await logEvent('compare_add', payload);
}

export async function trackCompareRemove(payload: EventPayload) {
  await logEvent('compare_remove', payload);
}
