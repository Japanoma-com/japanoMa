'use server';

import { db } from '@/lib/db';
import { formSubmissions } from '@/lib/db/schema';
import { contactSchema } from '@/lib/validations/contact';
import { logEvent } from '@/lib/events/log';
import { sendEmail } from '@/lib/email/client';
import { renderNotification } from '@/lib/email/templates/new-lead';

export async function submitContactForm(data: unknown) {
  const parsed = contactSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' };
  }

  try {
    const [inserted] = await db
      .insert(formSubmissions)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
        consent: parsed.data.consent as boolean,
        source: parsed.data.source || 'direct',
        sourceContext: parsed.data.sourceContext || null,
      })
      .returning({ id: formSubmissions.id });

    await logEvent('contact_form', {
      source: parsed.data.source || 'direct',
      hasContext: Boolean(parsed.data.sourceContext),
    });

    // Fire-and-forget notification to Go&C — never block the user's submit.
    void (async () => {
      try {
        const rendered = renderNotification({
          type: 'contact',
          submissionId: inserted.id,
          name: parsed.data.name,
          email: parsed.data.email,
          message: parsed.data.message,
          source: parsed.data.source || null,
          sourceContext: parsed.data.sourceContext || null,
        });
        await sendEmail(rendered);
      } catch (err) {
        console.warn('[contact] notification failed:', err);
      }
    })();

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to submit. Please try again.' };
  }
}
