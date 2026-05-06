// src/lib/rate-limit.ts
// Token-bucket rate limiter using a single-row Postgres upsert per key.
import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Consume one token from a bucket.
 * Returns true if allowed, false if rate-limited.
 */
export async function consumeRateLimit(
  bucketKey: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const sb = createServiceClient();
  const now = new Date();
  const windowStartCutoff = new Date(now.getTime() - windowSeconds * 1000);

  const { data: existing } = await sb
    .from('rate_limit')
    .select('tokens, window_start')
    .eq('bucket_key', bucketKey)
    .maybeSingle();

  if (!existing || new Date(existing.window_start) < windowStartCutoff) {
    // Fresh window
    await sb.from('rate_limit').upsert({
      bucket_key: bucketKey,
      tokens: 1,
      window_start: now.toISOString(),
    });
    return true;
  }

  if (existing.tokens >= limit) return false;

  await sb.from('rate_limit')
    .update({ tokens: existing.tokens + 1 })
    .eq('bucket_key', bucketKey);
  return true;
}
