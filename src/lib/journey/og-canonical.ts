// src/lib/journey/og-canonical.ts
import { createHash } from 'crypto';

const STRIP_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'mc_cid', 'mc_eid', '_ga', 'ref', 'ref_src',
]);

export function canonicalizeUrl(input: string): string {
  const u = new URL(input);
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === 'https:' && u.port === '443') ||
      (u.protocol === 'http:'  && u.port === '80')) {
    u.port = '';
  }
  const params = new URLSearchParams(u.search);
  for (const k of [...params.keys()]) {
    if (STRIP_PARAMS.has(k.toLowerCase())) params.delete(k);
  }
  u.search = params.toString() ? '?' + params.toString() : '';
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.slice(0, -1);
  }
  u.hash = '';
  return u.toString();
}

export function urlHash(canonical: string): string {
  return createHash('sha256').update(canonical).digest('hex');
}
