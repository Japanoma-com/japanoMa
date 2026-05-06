// src/lib/journey/export-pdf.tsx
import 'server-only';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { getJourneyState } from './queries';
import { PHASE_ORDER, type Phase } from './types';
import { phaseToUserLabel } from './phase-mapping';

const styles = StyleSheet.create({
  page:    { padding: 48, fontFamily: 'Helvetica', fontSize: 11, color: '#3D3833' },
  h1:      { fontSize: 24, marginBottom: 16, color: '#1A1816', fontFamily: 'Times-Roman' },
  h2:      { fontSize: 16, marginTop: 24, marginBottom: 8, color: '#1A1816', fontFamily: 'Times-Roman' },
  meta:    { fontSize: 10, color: '#8A8279', marginBottom: 16 },
  note:    { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E0D8' },
  pinned:  { color: '#A67B3D', fontSize: 10, marginBottom: 4 },
  body:    { lineHeight: 1.5, marginBottom: 4 },
});

type NoteRow = { id: string; phase: string; body: string; pinned: boolean };
type BookmarkRow = { id: string; phase: string | null; url: string; og_title: string | null; user_note: string | null };

export async function buildJourneyPdfStream(userId: string): Promise<NodeJS.ReadableStream> {
  const sb = await createClient();
  const state = await getJourneyState(userId);
  const [notesRes, bookmarksRes] = await Promise.all([
    sb.from('journey_notes').select('id, phase, body, pinned').eq('user_id', userId).order('phase'),
    sb.from('journey_bookmarks').select('id, phase, url, og_title, user_note').eq('user_id', userId).order('created_at'),
  ]);
  const notes = (notesRes.data as NoteRow[] | null) ?? [];
  const bookmarks = (bookmarksRes.data as BookmarkRow[] | null) ?? [];

  const Doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Your Journey</Text>
        <Text style={styles.meta}>
          Step {state.stepNumber} of 6 · {state.userLabel}
          {' · '}Exported {new Date().toISOString().slice(0, 10)}
        </Text>
        {PHASE_ORDER.map((phase) => {
          const ns = notes.filter((n) => n.phase === phase);
          const bs = bookmarks.filter((b) => b.phase === phase);
          if (ns.length === 0 && bs.length === 0) return null;
          return (
            <View key={phase}>
              <Text style={styles.h2}>{phase} · {phaseToUserLabel(phase as Phase)}</Text>
              {ns.map((n) => (
                <View key={n.id} style={styles.note}>
                  {n.pinned && <Text style={styles.pinned}>Pinned</Text>}
                  <Text style={styles.body}>{n.body}</Text>
                </View>
              ))}
              {bs.map((b) => (
                <View key={b.id} style={styles.note}>
                  <Text style={styles.body}>
                    {b.og_title ?? b.url}
                    {b.user_note ? `\n${b.user_note}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );

  return renderToStream(Doc);
}
