// src/lib/journey/capture-safe.ts
import 'server-only';
import { captureSignal } from './signals';
import type { SignalType } from './types';

/**
 * Fire-and-forget wrapper around captureSignal.
 * Never throws; logs to console on failure.
 * Use this from action sites where the existing flow must not break
 * if signal capture has a transient issue.
 */
export async function captureSignalSafe(
  userId: string | null | undefined,
  signalType: SignalType,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!userId) return;
  try {
    await captureSignal(userId, { signalType, metadata });
  } catch (err) {
    console.warn(`[journey] captureSignal(${signalType}) failed:`, err);
  }
}
