'use server';

import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { followUpSurveys, leads } from '@/lib/db/schema';
import { getCurrentAdminUser } from '@/lib/auth/admin';
import { sendEmail } from '@/lib/email/client';
import { createClient } from '@/lib/supabase/server';

/**
 * Admin action — create a follow-up survey invite for a given lead and
 * send the email. Token is 32 random bytes base64url-encoded, unguessable.
 */
export async function sendFollowUpSurvey(leadId: string): Promise<
  | { success: true; token: string; surveyId: string }
  | { error: 'not_admin' | 'lead_not_found' | 'no_user_email' | 'db_error' }
> {
  const { isAdmin } = await getCurrentAdminUser();
  if (!isAdmin) return { error: 'not_admin' };

  const leadRows = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  const lead = leadRows[0];
  if (!lead) return { error: 'lead_not_found' };

  // Resolve the recipient's email from Supabase Auth by userId.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.admin.getUserById(lead.userId);
  if (error || !data?.user?.email) return { error: 'no_user_email' };
  const recipientEmail = data.user.email;
  const recipientName = (data.user.user_metadata?.name as string | undefined) ?? null;

  // Generate a URL-safe nonce.
  const token = randomBytes(32).toString('base64url');

  try {
    const [survey] = await db
      .insert(followUpSurveys)
      .values({
        leadId,
        token,
        recipientEmail,
        recipientName,
        context: {
          areaSlug: lead.areaSlug,
          prefectureSlug: lead.prefectureSlug,
        },
      })
      .returning({ id: followUpSurveys.id });

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://japanoma.com.au';
    const surveyUrl = `${base}/survey/${token}`;

    void sendEmail({
      to: [recipientEmail],
      subject: 'Quick 2-minute check-in — how did it go?',
      text: `Hi${recipientName ? ` ${recipientName}` : ''},

Thanks again for using Japanoma to explore ${lead.prefectureSlug} / ${lead.areaSlug}.

We'd love a quick 2-minute check-in on how your conversation with the
local agent went. Your answers stay private and help us improve the
matchmaking for future buyers.

Open the survey:
${surveyUrl}

If you'd rather skip it, no problem — this link simply expires.

— The Japanoma team
`,
      html: `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, Segoe UI, Helvetica, sans-serif; color: #1A1816; background: #F5F0E8; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: #FAFAF7; border: 1px solid #E5E0D8; border-radius: 6px; padding: 32px;">
    <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #3D5A7A; margin: 0 0 8px;">Japanoma · Follow-up</p>
    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 400; color: #1A1816; margin: 0 0 16px;">Quick 2-minute check-in.</h1>
    <p style="font-size: 15px; line-height: 1.65; color: #3D3833; margin: 0 0 20px;">
      Hi${recipientName ? ` ${escapeHtml(recipientName)}` : ''}, thanks again for using Japanoma to explore ${escapeHtml(lead.prefectureSlug)} / ${escapeHtml(lead.areaSlug)}. We'd love a quick 2-minute check-in on how your conversation with the local agent went. Your answers stay private and help us improve matchmaking for future buyers.
    </p>
    <a href="${surveyUrl}" style="display: inline-block; background: #3D5A7A; color: #FFFFFF; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Open survey</a>
    <p style="font-size: 12px; color: #8A8279; margin: 24px 0 0;">If you'd rather skip it, no problem — this link simply expires.</p>
  </div>
</body></html>`.trim(),
    });

    return { success: true, token, surveyId: survey.id };
  } catch (err) {
    console.error('[surveys] sendFollowUpSurvey failed:', err);
    return { error: 'db_error' };
  }
}

/**
 * Public action — record a respondent's answers against the token.
 * No auth required; the token is the capability.
 */
export async function submitSurveyResponse(
  token: string,
  responses: Record<string, unknown>
): Promise<{ success: true } | { error: 'not_found' | 'already_completed' | 'db_error' }> {
  if (!token || token.length < 10) return { error: 'not_found' };

  const rows = await db
    .select({ id: followUpSurveys.id, completedAt: followUpSurveys.completedAt })
    .from(followUpSurveys)
    .where(eq(followUpSurveys.token, token))
    .limit(1);
  const survey = rows[0];
  if (!survey) return { error: 'not_found' };
  if (survey.completedAt) return { error: 'already_completed' };

  try {
    await db
      .update(followUpSurveys)
      .set({ responses, completedAt: new Date() })
      .where(eq(followUpSurveys.id, survey.id));
    return { success: true };
  } catch (err) {
    console.error('[surveys] submitSurveyResponse failed:', err);
    return { error: 'db_error' };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
