'use client';

import { useState, useTransition } from 'react';
import { sendFollowUpSurvey } from '@/lib/surveys/actions';

/**
 * Admin row-action — send a follow-up survey invite to the user behind
 * this lead. Three display states:
 *   idle    — "Send survey" button
 *   sending — disabled, "Sending…"
 *   sent    — "Sent ✓" with 3s dismiss
 *   error   — small inline message
 */
export function SurveyButton({ leadId }: { leadId: string }) {
  const [state, setState] = useState<
    { kind: 'idle' } | { kind: 'sent' } | { kind: 'error'; msg: string }
  >({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await sendFollowUpSurvey(leadId);
      if ('success' in result && result.success) {
        setState({ kind: 'sent' });
      } else if ('error' in result) {
        const msg =
          result.error === 'no_user_email'
            ? 'No email on file'
            : result.error === 'not_admin'
            ? 'Not authorised'
            : result.error === 'lead_not_found'
            ? 'Lead missing'
            : 'Failed';
        setState({ kind: 'error', msg });
      }
    });
  };

  if (state.kind === 'sent') {
    return <span className="text-xs text-matsu font-semibold">Sent ✓</span>;
  }
  if (state.kind === 'error') {
    return <span className="text-xs text-beni">{state.msg}</span>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-semibold text-ai hover:text-ai-deep underline underline-offset-2 disabled:opacity-50"
    >
      {isPending ? 'Sending…' : 'Send survey'}
    </button>
  );
}
