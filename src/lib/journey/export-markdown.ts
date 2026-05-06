// src/lib/journey/export-markdown.ts
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { phaseToUserLabel } from './phase-mapping';
import { PHASE_ORDER, type Phase } from './types';
import { getJourneyState } from './queries';

type NoteRow = {
  phase: string;
  body: string;
  pinned: boolean;
  created_at: string;
};

type BookmarkRow = {
  url: string;
  og_title: string | null;
  user_note: string | null;
  phase: string | null;
};

type SaveRow = {
  content_type: string;
  title: string | null;
  content_id: string;
};

export async function buildJourneyMarkdown(userId: string): Promise<string> {
  const sb = await createClient();
  const state = await getJourneyState(userId);

  const [notesRes, bookmarksRes, savesRes] = await Promise.all([
    sb.from('journey_notes').select('phase, body, pinned, created_at').eq('user_id', userId).order('phase'),
    sb.from('journey_bookmarks').select('url, og_title, user_note, phase').eq('user_id', userId).order('created_at'),
    sb.from('saves').select('content_type, title, content_id').eq('user_id', userId).order('created_at'),
  ]);

  const notes = (notesRes.data as NoteRow[] | null) ?? [];
  const bookmarks = (bookmarksRes.data as BookmarkRow[] | null) ?? [];
  const saves = (savesRes.data as SaveRow[] | null) ?? [];

  let md = `# Your Journey\n\n`;
  md += `**Step ${state.stepNumber} of 6 · ${state.userLabel}**\n\n`;
  md += `Exported ${new Date().toISOString().slice(0, 10)}\n\n---\n\n`;

  for (const phase of PHASE_ORDER) {
    const phaseNotes = notes.filter((n) => n.phase === phase);
    const phaseBookmarks = bookmarks.filter((b) => b.phase === phase);
    if (phaseNotes.length === 0 && phaseBookmarks.length === 0) continue;

    md += `## ${phase} · ${phaseToUserLabel(phase as Phase)}\n\n`;

    if (phaseNotes.length) {
      md += `### Notes\n\n`;
      for (const n of phaseNotes) {
        if (n.pinned) md += `**📌 Pinned**\n\n`;
        md += `${n.body}\n\n`;
        md += `_${new Date(n.created_at).toISOString().slice(0, 10)}_\n\n---\n\n`;
      }
    }

    if (phaseBookmarks.length) {
      md += `### External Reading\n\n`;
      for (const b of phaseBookmarks) {
        md += `- [${b.og_title ?? b.url}](${b.url})${b.user_note ? ` — ${b.user_note}` : ''}\n`;
      }
      md += `\n`;
    }
  }

  if (saves.length > 0) {
    md += `## Saved Items\n\n`;
    for (const s of saves) {
      md += `- ${s.content_type}: ${s.title ?? s.content_id}\n`;
    }
  }

  return md;
}
