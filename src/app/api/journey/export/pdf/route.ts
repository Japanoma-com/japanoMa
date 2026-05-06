// src/app/api/journey/export/pdf/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildJourneyPdfStream } from '@/lib/journey/export-pdf';
import { consumeRateLimit } from '@/lib/rate-limit';
import type { Readable } from 'stream';

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse('unauthorized', { status: 401 });

  const allowed = await consumeRateLimit(`pdf:${user.id}`, 1, 60);
  if (!allowed) return new NextResponse('rate limited', { status: 429, headers: { 'Retry-After': '60' } });

  const stream = await buildJourneyPdfStream(user.id);
  const filename = `journey-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.pdf`;

  // Convert Node Readable → Web ReadableStream for NextResponse
  const webStream = (stream as unknown as Readable & { [Symbol.asyncIterator](): AsyncIterableIterator<Buffer> });
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of webStream) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
