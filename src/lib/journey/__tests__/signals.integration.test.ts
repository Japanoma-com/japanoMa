/**
 * Integration test for D2L journey captureSignal.
 *
 * Requires: Japanoma Supabase project credentials in .env.local +
 * INTEGRATION=1 environment variable.
 *
 * Each scenario creates a fresh test auth user via the service-role admin
 * API, runs the signal capture, and deletes the user at the end (CASCADE
 * cleans up user_journey_state and journey_signals rows).
 */

import { captureSignal } from '../signals';
import { createServiceClient } from '@/lib/supabase/service';
import { randomUUID } from 'crypto';

const RUN = process.env.INTEGRATION === '1';
const describeIfIntegration = RUN ? describe : describe.skip;

describeIfIntegration('captureSignal — integration', () => {
  let testUserId: string;

  beforeAll(async () => {
    const sb = createServiceClient();
    const email = `it-journey-${randomUUID()}@test.local`;
    const { data, error } = await sb.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error('createUser returned no user');
    testUserId = data.user.id;
  });

  afterAll(async () => {
    if (!testUserId) return;
    const sb = createServiceClient();
    await sb.auth.admin.deleteUser(testUserId);
  });

  it('creates user_journey_state lazily and advances phase on quiz_started', async () => {
    await captureSignal(testUserId, { signalType: 'quiz_started' });

    const sb = createServiceClient();
    const { data } = await sb
      .from('user_journey_state')
      .select('phase, phase_set_via')
      .eq('user_id', testUserId)
      .single();

    expect(data?.phase).toBe('1_decision');
    expect(data?.phase_set_via).toBe('inference');
  });

  it('logs the signal and advances forward on quiz_completed', async () => {
    await captureSignal(testUserId, { signalType: 'quiz_completed' });

    const sb = createServiceClient();
    const { data: state } = await sb
      .from('user_journey_state')
      .select('phase')
      .eq('user_id', testUserId)
      .single();
    expect(state?.phase).toBe('3_area');

    const { data: signals } = await sb
      .from('journey_signals')
      .select('signal_type, phase_before, phase_after')
      .eq('user_id', testUserId)
      .order('captured_at', { ascending: false })
      .limit(1);
    expect(signals?.[0]?.signal_type).toBe('quiz_completed');
    expect(signals?.[0]?.phase_before).toBe('1_decision');
    expect(signals?.[0]?.phase_after).toBe('3_area');
  });

  it('does NOT regress phase on a lower-rank signal', async () => {
    await captureSignal(testUserId, { signalType: 'quiz_started' });

    const sb = createServiceClient();
    const { data } = await sb
      .from('user_journey_state')
      .select('phase')
      .eq('user_id', testUserId)
      .single();

    expect(data?.phase).toBe('3_area'); // unchanged
  });

  it('still logs the signal even when phase does not change', async () => {
    const sb = createServiceClient();
    const before = await sb
      .from('journey_signals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', testUserId);
    const beforeCount = before.count ?? 0;

    await captureSignal(testUserId, { signalType: 'quiz_started' });

    const after = await sb
      .from('journey_signals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', testUserId);
    expect((after.count ?? 0)).toBe(beforeCount + 1);
  });
});
