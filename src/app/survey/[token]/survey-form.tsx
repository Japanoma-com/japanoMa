'use client';

import { useState, useTransition } from 'react';
import { submitSurveyResponse } from '@/lib/surveys/actions';

/**
 * Public follow-up survey form. Token-authenticated via the URL; the
 * server action re-validates and records the response. Four questions,
 * kept short because charter says "2-minute check-in".
 */

const OUTCOMES = [
  { value: 'purchased', label: 'We purchased a property' },
  { value: 'still_looking', label: 'Still looking — conversation helped' },
  { value: 'not_right_fit', label: 'Not the right fit for us' },
  { value: 'no_response', label: 'Agent did not respond' },
] as const;

export function SurveyForm({ token }: { token: string }) {
  const [outcome, setOutcome] = useState<string>('');
  const [helpfulness, setHelpfulness] = useState<number>(0);
  const [recommend, setRecommend] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!outcome) {
      setError('Please pick an outcome so we know how to read the rest.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitSurveyResponse(token, {
        outcome,
        helpfulness,
        recommend,
        comments: comments.trim() || null,
      });
      if ('success' in result && result.success) {
        setSubmitted(true);
      } else if ('error' in result) {
        setError(
          result.error === 'already_completed'
            ? 'This survey has already been submitted.'
            : 'Something went wrong — please try again in a moment.'
        );
      }
    });
  };

  if (submitted) {
    return (
      <div className="bg-shoji border border-border rounded-lg p-ma-8">
        <h2 className="text-xl font-editorial text-sumi mb-ma-3">Thank you.</h2>
        <p className="text-sumi-light leading-relaxed">
          Your answers are in. We read every one — they shape how we match the
          next round of buyers with local agents.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-ma-12 max-w-2xl">
      {/* Q1 — outcome */}
      <fieldset className="space-y-ma-3">
        <legend className="text-sm font-semibold text-sumi mb-ma-3">
          1. What happened after the introduction?
        </legend>
        {OUTCOMES.map((o) => (
          <label
            key={o.value}
            className="flex items-start gap-ma-3 p-ma-3 rounded-md border border-border hover:bg-shoji cursor-pointer"
          >
            <input
              type="radio"
              name="outcome"
              value={o.value}
              checked={outcome === o.value}
              onChange={(e) => setOutcome(e.target.value)}
              className="mt-1"
            />
            <span className="text-sm text-sumi-light">{o.label}</span>
          </label>
        ))}
      </fieldset>

      {/* Q2 — helpfulness */}
      <fieldset>
        <legend className="text-sm font-semibold text-sumi mb-ma-3">
          2. How helpful was the agent? (1 = not at all, 5 = extremely)
        </legend>
        <div className="flex gap-ma-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setHelpfulness(n)}
              aria-pressed={helpfulness === n}
              className={`w-10 h-10 rounded-md border text-sm font-semibold transition-colors duration-base ease-settle ${
                helpfulness === n
                  ? 'bg-ai border-ai text-kinu'
                  : 'border-border text-sumi-light hover:bg-shoji'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Q3 — NPS-style */}
      <fieldset>
        <legend className="text-sm font-semibold text-sumi mb-ma-3">
          3. How likely are you to recommend Japanoma to a friend? (0–10)
        </legend>
        <div className="flex gap-ma-1 flex-wrap">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRecommend(n)}
              aria-pressed={recommend === n}
              className={`w-10 h-10 rounded-md border text-sm font-semibold transition-colors duration-base ease-settle ${
                recommend === n
                  ? 'bg-ai border-ai text-kinu'
                  : 'border-border text-sumi-light hover:bg-shoji'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Q4 — open comments */}
      <div>
        <label
          htmlFor="comments"
          className="text-sm font-semibold text-sumi mb-ma-3 block"
        >
          4. Anything else you&apos;d like us to know? (optional)
        </label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full border-b border-border bg-transparent py-ma-2 text-sumi focus:outline-none focus:border-ai resize-none"
          placeholder="Anything the agent did brilliantly, or that tripped you up..."
        />
      </div>

      {error && (
        <p className="text-sm text-beni" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-ma-6 py-ma-3 rounded-md text-sm font-semibold tracking-wide uppercase bg-ai text-kinu hover:bg-ai-deep transition-colors duration-base ease-settle disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit check-in'}
      </button>
    </form>
  );
}
