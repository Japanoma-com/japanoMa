// src/app/api/journey/signal/route.ts
// Client-fired signal endpoint. Used by viewport-entry trackers and any
// other in-browser interactions that should advance phase.
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { captureSignalSafe } from '@/lib/journey/capture-safe';
import { SIGNAL_TYPES, type SignalType } from '@/lib/journey/types';

const inputSchema = z.object({
  signalType: z.enum([...SIGNAL_TYPES] as [SignalType, ...SignalType[]]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  let parsed: z.infer<typeof inputSchema>;
  try {
    const json = await request.json();
    parsed = inputSchema.parse(json);
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await captureSignalSafe(user?.id, parsed.signalType, parsed.metadata ?? {});

  return NextResponse.json({ ok: true });
}
