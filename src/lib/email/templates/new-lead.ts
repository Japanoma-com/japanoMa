/**
 * Notification template sent to Go&C when a new lead is created.
 *
 * Two shapes are supported:
 *   - "lead"     — a row in the `leads` table (area expression of interest
 *                   with consent record + profile snapshot).
 *   - "contact"  — a row in the `form_submissions` table (free-form
 *                   inquiry via /contact).
 *
 * Both render as plain, scannable HTML with a link into /admin.
 */

export type LeadNotification = {
  type: 'lead';
  leadId: string;
  userEmail: string | null;
  areaSlug: string;
  prefectureSlug: string;
  profileSnapshot: unknown;
};

export type ContactNotification = {
  type: 'contact';
  submissionId: string;
  name: string;
  email: string;
  message: string;
  source: string | null;
  sourceContext: unknown;
};

export type NotificationInput = LeadNotification | ContactNotification;

function adminUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://japanoma.com.au';
  return `${base}${path}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatJson(v: unknown): string {
  if (v === null || v === undefined) return '—';
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function renderNotification(n: NotificationInput): {
  subject: string;
  html: string;
  text: string;
} {
  if (n.type === 'lead') {
    const subject = `New lead · ${n.prefectureSlug}/${n.areaSlug}`;
    const href = adminUrl('/admin/leads');
    const text =
      `New lead on Japanoma.\n\n` +
      `Area:        ${n.prefectureSlug} / ${n.areaSlug}\n` +
      `User email:  ${n.userEmail ?? '(not provided)'}\n` +
      `Lead ID:     ${n.leadId}\n\n` +
      `Profile snapshot:\n${formatJson(n.profileSnapshot)}\n\n` +
      `Review in admin: ${href}\n`;

    const html = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, Segoe UI, Helvetica, sans-serif; color: #1A1816; background: #F5F0E8; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #FAFAF7; border: 1px solid #E5E0D8; border-radius: 6px; padding: 32px;">
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #3D5A7A; margin: 0 0 8px;">Japanoma · New Lead</p>
    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 400; color: #1A1816; margin: 0 0 16px;">Someone's interested in ${escapeHtml(n.prefectureSlug)} / ${escapeHtml(n.areaSlug)}.</h1>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; color: #8A8279; font-size: 12px; width: 120px;">User email</td><td style="padding: 6px 0; font-size: 14px;">${escapeHtml(n.userEmail ?? '(not provided)')}</td></tr>
      <tr><td style="padding: 6px 0; color: #8A8279; font-size: 12px;">Lead ID</td><td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${escapeHtml(n.leadId)}</td></tr>
    </table>
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8A8279; margin: 24px 0 8px;">Profile snapshot</p>
    <pre style="background: #F5F0E8; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto; margin: 0 0 24px;">${escapeHtml(formatJson(n.profileSnapshot))}</pre>
    <a href="${href}" style="display: inline-block; background: #3D5A7A; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Review in admin</a>
  </div>
</body></html>`.trim();

    return { subject, html, text };
  }

  // contact
  const subject = `New contact form · ${n.name}`;
  const href = adminUrl('/admin');
  const text =
    `New contact submission on Japanoma.\n\n` +
    `From:    ${n.name} <${n.email}>\n` +
    `Source:  ${n.source ?? 'direct'}\n` +
    `ID:      ${n.submissionId}\n\n` +
    `Message:\n${n.message}\n\n` +
    (n.sourceContext
      ? `Context:\n${formatJson(n.sourceContext)}\n\n`
      : '') +
    `Review in admin: ${href}\n`;

  const html = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, Segoe UI, Helvetica, sans-serif; color: #1A1816; background: #F5F0E8; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #FAFAF7; border: 1px solid #E5E0D8; border-radius: 6px; padding: 32px;">
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #3D5A7A; margin: 0 0 8px;">Japanoma · Contact Form</p>
    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 400; color: #1A1816; margin: 0 0 16px;">${escapeHtml(n.name)} got in touch.</h1>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 6px 0; color: #8A8279; font-size: 12px; width: 120px;">Email</td><td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${escapeHtml(n.email)}" style="color: #3D5A7A;">${escapeHtml(n.email)}</a></td></tr>
      <tr><td style="padding: 6px 0; color: #8A8279; font-size: 12px;">Source</td><td style="padding: 6px 0; font-size: 14px;">${escapeHtml(n.source ?? 'direct')}</td></tr>
      <tr><td style="padding: 6px 0; color: #8A8279; font-size: 12px;">Submission ID</td><td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${escapeHtml(n.submissionId)}</td></tr>
    </table>
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8A8279; margin: 24px 0 8px;">Message</p>
    <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0 0 24px;">${escapeHtml(n.message)}</p>
    ${n.sourceContext ? `<p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #8A8279; margin: 24px 0 8px;">Context</p><pre style="background: #F5F0E8; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto; margin: 0 0 24px;">${escapeHtml(formatJson(n.sourceContext))}</pre>` : ''}
    <a href="${href}" style="display: inline-block; background: #3D5A7A; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Review in admin</a>
  </div>
</body></html>`.trim();

  return { subject, html, text };
}
