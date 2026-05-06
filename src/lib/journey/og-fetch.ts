// src/lib/journey/og-fetch.ts
// SSRF-defended OG metadata fetcher.
import 'server-only';
import { lookup } from 'dns/promises';
import * as cheerio from 'cheerio';

export type OgMetadata = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  siteName: string | null;
};

const TIMEOUT_MS = 5000;
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;

export function isPrivateIp(ip: string): boolean {
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (/^127\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;
  if (/^0\./.test(ip)) return true;
  if (ip === '::1') return true;
  const lc = ip.toLowerCase();
  if (lc.startsWith('fc') || lc.startsWith('fd')) return true;
  if (lc.startsWith('fe80')) return true;
  return false;
}

async function safeResolve(hostname: string): Promise<void> {
  const records = await lookup(hostname, { all: true });
  for (const r of records) {
    if (isPrivateIp(r.address)) {
      throw new Error(`SSRF: ${hostname} resolves to private IP ${r.address}`);
    }
  }
}

async function safeFetch(url: string, redirectsLeft = MAX_REDIRECTS): Promise<Response> {
  const u = new URL(url);
  if (u.protocol !== 'https:') throw new Error('SSRF: non-https URL');
  await safeResolve(u.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'JapanoMa-OG-Fetcher/1.0' },
    });

    if (res.status >= 300 && res.status < 400 && redirectsLeft > 0) {
      const location = res.headers.get('location');
      if (!location) throw new Error('redirect without location');
      const next = new URL(location, url).toString();
      return safeFetch(next, redirectsLeft - 1);
    }

    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function readLimitedText(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let received = 0;
  let html = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BYTES) {
      void reader.cancel();
      break;
    }
    html += decoder.decode(value, { stream: true });
  }
  return html;
}

export async function fetchOgMetadata(url: string): Promise<OgMetadata> {
  const res = await safeFetch(url);
  if (!res.ok) throw new Error(`OG fetch failed: ${res.status}`);
  const html = await readLimitedText(res);
  const $ = cheerio.load(html);

  const meta = (selector: string): string | null =>
    $(selector).attr('content') ?? null;

  return {
    title:       meta('meta[property="og:title"]') ?? $('title').text() ?? null,
    description: meta('meta[property="og:description"]') ?? meta('meta[name="description"]'),
    imageUrl:    meta('meta[property="og:image"]'),
    faviconUrl:  $('link[rel*="icon"]').attr('href') ?? null,
    siteName:    meta('meta[property="og:site_name"]'),
  };
}
