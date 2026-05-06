// src/app/api/og-image-proxy/route.ts
// Proxies bookmark hero images same-origin so we don't whitelist arbitrary CDNs in CSP.
// Same SSRF defense as og-fetch.
import { NextResponse } from 'next/server';
import { lookup } from 'dns/promises';
import { isPrivateIp } from '@/lib/journey/og-fetch';

const TIMEOUT_MS = 5000;
const MAX_BYTES = 5_000_000;
const ALLOWED_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url) return new NextResponse('missing url', { status: 400 });

  let parsed: URL;
  try { parsed = new URL(url); }
  catch { return new NextResponse('invalid url', { status: 400 }); }
  if (parsed.protocol !== 'https:') return new NextResponse('non-https', { status: 400 });

  const records = await lookup(parsed.hostname, { all: true });
  if (records.some((r) => isPrivateIp(r.address))) {
    return new NextResponse('private host', { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return new NextResponse('upstream error', { status: 502 });

    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return new NextResponse('unsupported content type', { status: 415 });
    }

    const contentLength = Number(res.headers.get('content-length') ?? '0');
    if (contentLength > MAX_BYTES) {
      return new NextResponse('too large', { status: 413 });
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return new NextResponse('too large', { status: 413 });
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, immutable',  // 30 days
      },
    });
  } catch {
    clearTimeout(timer);
    return new NextResponse('fetch error', { status: 502 });
  }
}
