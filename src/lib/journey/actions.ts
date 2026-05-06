// src/lib/journey/actions.ts
// User-facing server actions for the journey module.
'use server';

import { z } from 'zod';
import { revalidateTag, revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { consumeRateLimit } from '@/lib/rate-limit';
import { PHASE_ORDER, type Phase } from './types';
import { canonicalizeUrl, urlHash } from './og-canonical';
import { fetchOgMetadata, type OgMetadata } from './og-fetch';

const overrideSchema = z.object({
  phase: z.enum([...PHASE_ORDER] as [Phase, ...Phase[]]),
});

export type OverrideResult =
  | { success: true }
  | { error: 'unauthorized' | 'rate_limited' | 'invalid_input' };

/**
 * Manual phase adjustment from the "Adjust my step" modal.
 * Rate-limited to 5 changes/hour to prevent thrashing.
 *
 * Uses the service-role client for the upsert. The auth check above is
 * what authorises the write — but the RLS policy on user_journey_state
 * only allows UPDATEs (not INSERTs) from authenticated users, and a
 * first-time override (before any signal has fired) needs to INSERT.
 * Service-role bypasses RLS; we explicitly write user_id = user.id so
 * there's no impersonation surface.
 */
export async function setPhaseOverride(input: unknown): Promise<OverrideResult | { error: 'database_error' }> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  const allowed = await consumeRateLimit(`override:${user.id}`, 5, 3600);
  if (!allowed) return { error: 'rate_limited' };

  let parsed: z.infer<typeof overrideSchema>;
  try {
    parsed = overrideSchema.parse(input);
  } catch {
    return { error: 'invalid_input' };
  }

  const service = createServiceClient();
  const { error } = await service.from('user_journey_state').upsert({
    user_id: user.id,
    phase: parsed.phase,
    phase_set_via: 'override',
    phase_overridden_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[setPhaseOverride] upsert failed:', error);
    return { error: 'database_error' };
  }

  revalidateTag(`journey:${user.id}`);
  revalidatePath('/account');
  return { success: true };
}

// =========================================
// Notes
// =========================================

const noteCreateSchema = z.object({
  phase: z.enum([...PHASE_ORDER] as [Phase, ...Phase[]]),
  body: z.string().min(1).max(20000),
  pinned: z.boolean().default(false),
  linkedPropertySlugs: z.array(z.string()).default([]),
});

const noteUpdateSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1).max(20000).optional(),
  pinned: z.boolean().optional(),
  linkedPropertySlugs: z.array(z.string()).optional(),
});

type NoteResult =
  | { success: true; id?: string }
  | { error: 'unauthorized' | 'rate_limited' | 'invalid_input' | 'database_error' };

export async function createNote(input: unknown): Promise<NoteResult> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  const allowed = await consumeRateLimit(`note_create:${user.id}`, 60, 60);
  if (!allowed) return { error: 'rate_limited' };

  let parsed: z.infer<typeof noteCreateSchema>;
  try { parsed = noteCreateSchema.parse(input); }
  catch { return { error: 'invalid_input' }; }

  const { data, error } = await sb.from('journey_notes').insert({
    user_id: user.id,
    phase: parsed.phase,
    body: parsed.body,
    pinned: parsed.pinned,
    linked_property_slugs: parsed.linkedPropertySlugs,
  }).select('id').single();

  if (error || !data) return { error: 'database_error' };
  revalidatePath('/account');
  return { success: true, id: data.id };
}

export async function updateNote(input: unknown): Promise<NoteResult> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  let parsed: z.infer<typeof noteUpdateSchema>;
  try { parsed = noteUpdateSchema.parse(input); }
  catch { return { error: 'invalid_input' }; }

  const update: Record<string, unknown> = {};
  if (parsed.body !== undefined) update.body = parsed.body;
  if (parsed.pinned !== undefined) update.pinned = parsed.pinned;
  if (parsed.linkedPropertySlugs !== undefined) update.linked_property_slugs = parsed.linkedPropertySlugs;

  const { error } = await sb.from('journey_notes')
    .update(update)
    .eq('id', parsed.id)
    .eq('user_id', user.id);

  if (error) return { error: 'database_error' };
  revalidatePath('/account');
  return { success: true };
}

export async function deleteNote(id: string): Promise<NoteResult> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  const { error } = await sb.from('journey_notes')
    .delete().eq('id', id).eq('user_id', user.id);

  if (error) return { error: 'database_error' };
  revalidatePath('/account');
  return { success: true };
}

// =========================================
// Bookmarks (with OG fetch + cache)
// =========================================

const bookmarkCreateSchema = z.object({
  url: z.string().url().startsWith('https://'),
  phase: z.enum([...PHASE_ORDER] as [Phase, ...Phase[]]).optional(),
  userNote: z.string().max(500).optional(),
  linkedPropertySlugs: z.array(z.string()).default([]),
});

type BookmarkResult =
  | { success: true; id?: string }
  | { error: 'unauthorized' | 'rate_limited' | 'invalid_input' | 'database_error' };

async function getOrFetchOg(canonical: string, hash: string): Promise<OgMetadata | null> {
  const sb = createServiceClient();
  const { data: cached } = await sb.from('og_cache')
    .select('og_title, og_description, og_image_url, og_favicon_url, og_site_name, expires_at')
    .eq('url_hash', hash).maybeSingle();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return {
      title: cached.og_title, description: cached.og_description,
      imageUrl: cached.og_image_url, faviconUrl: cached.og_favicon_url,
      siteName: cached.og_site_name,
    };
  }
  return null;
}

async function refreshOgCache(canonical: string, hash: string): Promise<void> {
  const sb = createServiceClient();
  try {
    const og = await fetchOgMetadata(canonical);
    await sb.from('og_cache').upsert({
      url_hash: hash, url_canonical: canonical,
      og_title: og.title, og_description: og.description,
      og_image_url: og.imageUrl, og_favicon_url: og.faviconUrl,
      og_site_name: og.siteName,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      fetch_error: null, error_count: 0,
    });
  } catch (err) {
    await sb.from('og_cache').upsert({
      url_hash: hash, url_canonical: canonical,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 1 * 3600_000).toISOString(),
      fetch_error: String(err), error_count: 1,
    });
  }
}

export async function addBookmark(input: unknown): Promise<BookmarkResult> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  const allowed = await consumeRateLimit(`bookmark_add:${user.id}`, 30, 60);
  if (!allowed) return { error: 'rate_limited' };

  let parsed: z.infer<typeof bookmarkCreateSchema>;
  try { parsed = bookmarkCreateSchema.parse(input); }
  catch { return { error: 'invalid_input' }; }

  const canonical = canonicalizeUrl(parsed.url);
  const hash = urlHash(canonical);

  const og = await getOrFetchOg(canonical, hash);

  const { data, error } = await sb.from('journey_bookmarks').upsert({
    user_id: user.id,
    url: parsed.url,
    url_canonical: canonical,
    url_hash: hash,
    phase: parsed.phase ?? null,
    user_note: parsed.userNote ?? null,
    linked_property_slugs: parsed.linkedPropertySlugs,
    og_title: og?.title ?? null,
    og_description: og?.description ?? null,
    og_image_url: og?.imageUrl ?? null,
    og_favicon_url: og?.faviconUrl ?? null,
    og_site_name: og?.siteName ?? null,
    og_fetched_at: og ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,url_hash' }).select('id').single();

  if (error || !data) return { error: 'database_error' };

  if (!og) {
    void refreshOgCache(canonical, hash).then(async () => {
      const sb2 = createServiceClient();
      const { data: fresh } = await sb2.from('og_cache')
        .select('og_title, og_description, og_image_url, og_favicon_url, og_site_name')
        .eq('url_hash', hash).single();
      if (fresh) {
        await sb2.from('journey_bookmarks').update({
          og_title: fresh.og_title, og_description: fresh.og_description,
          og_image_url: fresh.og_image_url, og_favicon_url: fresh.og_favicon_url,
          og_site_name: fresh.og_site_name,
          og_fetched_at: new Date().toISOString(),
        }).eq('id', data.id);
      }
    }).catch(() => {});
  }

  revalidatePath('/account');
  return { success: true, id: data.id };
}

export async function deleteBookmark(id: string): Promise<BookmarkResult> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: 'unauthorized' };

  const { error } = await sb.from('journey_bookmarks')
    .delete().eq('id', id).eq('user_id', user.id);

  if (error) return { error: 'database_error' };
  revalidatePath('/account');
  return { success: true };
}
