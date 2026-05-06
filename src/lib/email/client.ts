/**
 * Thin Resend wrapper with graceful degradation.
 *
 * If RESEND_API_KEY is not set, all sends become no-ops with a warn.
 * This keeps local dev and preview deploys running without the real key.
 *
 * Env vars expected in production:
 *   RESEND_API_KEY            — from resend.com dashboard
 *   EMAIL_FROM                — e.g. "Japanoma <noreply@japanoma.com>" (verified domain)
 *   EMAIL_NOTIFICATIONS_TO    — comma-separated Go&C recipient list
 */
import { Resend } from 'resend';

type SendParams = {
  subject: string;
  html: string;
  text: string;
  /** Override EMAIL_NOTIFICATIONS_TO for one-off transactional sends. */
  to?: string[];
};

export type SendResult =
  | { sent: true; id: string }
  | { sent: false; reason: 'not_configured' | 'no_recipients' | 'send_failed' };

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function resolveTo(override?: string[]): string[] {
  if (override && override.length > 0) return override;
  const raw = process.env.EMAIL_NOTIFICATIONS_TO ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function sendEmail(params: SendParams): Promise<SendResult> {
  const client = getClient();
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping send:', params.subject);
    return { sent: false, reason: 'not_configured' };
  }

  const to = resolveTo(params.to);
  if (to.length === 0) {
    console.warn('[email] No recipients resolved — skipping send:', params.subject);
    return { sent: false, reason: 'no_recipients' };
  }

  const from = process.env.EMAIL_FROM ?? 'Japanoma <noreply@japanoma.com>';

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    if (error || !data) {
      console.error('[email] send failed:', error);
      return { sent: false, reason: 'send_failed' };
    }
    return { sent: true, id: data.id };
  } catch (err) {
    console.error('[email] send threw:', err);
    return { sent: false, reason: 'send_failed' };
  }
}
