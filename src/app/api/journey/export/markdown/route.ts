// src/app/api/journey/export/markdown/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildJourneyMarkdown } from '@/lib/journey/export-markdown';

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse('unauthorized', { status: 401 });

  const md = await buildJourneyMarkdown(user.id);
  const filename = `journey-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.md`;
  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
