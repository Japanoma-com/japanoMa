import crypto from 'node:crypto';
import { headers } from 'next/headers';

export function hashIp(ip: string | null): string | null {
  const salt = process.env.CONSENT_IP_HASH_SALT;
  if (!salt) {
    throw new Error('CONSENT_IP_HASH_SALT is not configured');
  }
  if (!ip) return null;
  return crypto.createHash('sha256').update(`${salt}::${ip}`).digest('hex');
}

export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const xff = h.get('x-forwarded-for');
  if (xff) {
    // XFF may be a comma-separated list: "client, proxy1, proxy2"
    return xff.split(',')[0].trim();
  }
  return h.get('x-real-ip');
}
