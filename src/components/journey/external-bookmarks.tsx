// src/components/journey/external-bookmarks.tsx
import { createClient } from '@/lib/supabase/server';
import { BookmarkCard, type Bookmark } from './bookmark-card';
import { BookmarkAddForm } from './bookmark-add-form';

type Row = {
  id: string;
  url: string;
  phase: string | null;
  user_note: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  og_site_name: string | null;
  og_fetched_at: string | null;
  created_at: string;
};

export async function ExternalBookmarks({ userId }: { userId: string }) {
  const sb = await createClient();
  const { data } = await sb.from('journey_bookmarks')
    .select('id, url, phase, user_note, og_title, og_description, og_image_url, og_site_name, og_fetched_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const bookmarks: Bookmark[] = ((data as Row[] | null) ?? []).map((row) => ({
    id: row.id,
    url: row.url,
    phase: row.phase as Bookmark['phase'],
    userNote: row.user_note,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImageUrl: row.og_image_url,
    ogSiteName: row.og_site_name,
    ogFetchedAt: row.og_fetched_at,
    createdAt: row.created_at,
  }));

  return (
    <section className="mb-ma-16">
      <p className="label-overline text-stone mb-ma-2">External Reading</p>
      <h2 className="font-editorial text-2xl text-sumi leading-tight mb-ma-2">
        Your reading list
      </h2>
      <p className="text-sm text-sumi-light leading-relaxed mb-ma-6 max-w-md">
        Research outside JapanoMa is welcome. Bookmark it here so you can come back when you&apos;re ready.
      </p>

      <BookmarkAddForm />

      {bookmarks.length === 0 ? (
        <div className="mt-ma-6 rounded-lg bg-shoji/40 p-ma-8 text-center">
          <p className="text-sm text-stone">No bookmarks yet. Paste a URL above to start.</p>
        </div>
      ) : (
        <div className="mt-ma-6 grid gap-ma-3">
          {bookmarks.map((b) => <BookmarkCard key={b.id} bookmark={b} />)}
        </div>
      )}
    </section>
  );
}
