'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contactSchema, type ContactFormData, type QuizContextSnapshot } from '@/lib/validations/contact';
import { useQuizStore } from '@/stores/quiz-store';
import { extractQuizContext } from '@/lib/quiz/contact-context';
import { submitContactForm } from './actions';
import { QuizContextPanel } from './quiz-context-panel';

interface ContactFormProps {
  defaultArea?: string | null;
  defaultAreaName?: string | null;
  source?: string;
}

export function ContactForm({ defaultArea, defaultAreaName, source }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [quizSnapshot, setQuizSnapshot] = useState<QuizContextSnapshot | null>(null);

  const quizAnswers = useQuizStore((state) => state.answers);

  // Wait for Zustand persist to hydrate from localStorage before reading state.
  // Without this, the panel flickers on first render because answers is {} initially.
  useEffect(() => {
    const unsub = useQuizStore.persist.onFinishHydration(() => setHydrated(true));
    if (useQuizStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  // Build the snapshot once hydrated, only when source is 'quiz'.
  useEffect(() => {
    if (!hydrated) return;
    if (source !== 'quiz') return;
    setQuizSnapshot(extractQuizContext(quizAnswers));
  }, [hydrated, source, quizAnswers]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    setServerError(null);

    const sourceContext: ContactFormData['sourceContext'] = {};
    if (defaultArea) sourceContext.areaSlugs = [defaultArea];
    if (quizSnapshot) sourceContext.quizContext = quizSnapshot;

    const enrichedData: ContactFormData = {
      ...data,
      source: (source as ContactFormData['source']) ?? 'direct',
      sourceContext: Object.keys(sourceContext).length > 0 ? sourceContext : undefined,
    };

    const result = await submitContactForm(enrichedData);

    if (result.success) {
      setSubmitted(true);
    } else {
      setServerError(result.error ?? 'Something went wrong');
    }
  }

  if (submitted) {
    return (
      <div className="bg-shoji rounded-2xl p-ma-12 text-center shadow-[0_2px_12px_rgba(26,24,22,0.04)]">
        <span aria-hidden className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ai/10 text-ai mb-ma-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h2 className="font-editorial text-2xl text-sumi mb-ma-3 leading-tight">Thank you</h2>
        <p className="text-sumi-light leading-relaxed max-w-sm mx-auto">
          We&apos;ve received your message and will be in touch within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-ma-8">
      {quizSnapshot && (
        <QuizContextPanel
          snapshot={quizSnapshot}
          areaName={defaultAreaName}
          onClear={() => setQuizSnapshot(null)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-ma-6">
        <Field
          id="name"
          label="Name"
          error={errors.name?.message}
        >
          <Input id="name" placeholder="Your full name" autoComplete="name" {...register('name')} />
        </Field>

        <Field
          id="email"
          label="Email"
          error={errors.email?.message}
        >
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
        </Field>
      </div>

      <Field id="message" label="Message" error={errors.message?.message}>
        <textarea
          id="message"
          rows={6}
          placeholder="Tell us what you're thinking about — areas, timing, budget, anything specific."
          className="w-full bg-kinu rounded-lg px-ma-4 py-ma-3 font-ui text-[15px] text-sumi placeholder:text-ash outline-none transition-[box-shadow] duration-base ease-settle shadow-card hover:shadow-[0_2px_8px_rgba(26,24,22,0.06)] focus:shadow-[0_0_0_3px_rgba(61,90,122,0.15),0_2px_8px_rgba(26,24,22,0.06)] resize-y min-h-[160px]"
          {...register('message')}
        />
      </Field>

      <div className="pt-ma-2">
        <label htmlFor="consent" className="flex items-start gap-ma-3 cursor-pointer group">
          <input
            id="consent"
            type="checkbox"
            className="mt-[3px] w-[18px] h-[18px] rounded-[4px] accent-ai cursor-pointer flex-shrink-0"
            {...register('consent')}
          />
          <span className="text-[13px] text-sumi-light leading-relaxed group-hover:text-sumi transition-colors duration-base ease-settle">
            I agree to the{' '}
            <a
              href="/privacy"
              className="text-ai hover:text-ai-deep underline underline-offset-[3px] decoration-ai/30 hover:decoration-ai-deep"
            >
              privacy policy
            </a>
            .
          </span>
        </label>
        {errors.consent && (
          <p className="mt-ma-2 text-[12px] text-beni pl-[30px]">{errors.consent.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-md bg-beni/5 border-l-2 border-beni px-ma-4 py-ma-3">
          <p className="text-[13px] text-beni leading-relaxed">{serverError}</p>
        </div>
      )}

      <div className="flex items-center gap-ma-4 pt-ma-2">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send message →'}
        </Button>
        <p className="text-[11px] text-stone">Reply within 48 hours</p>
      </div>
    </form>
  );
}

/**
 * Editorial form field. Label sits as a small overline above the
 * input; bottom-border-only definition matches the Ma Space spec.
 * Error message slots beneath without bumping layout (reserved row
 * keeps focus rhythm steady when validating).
 */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10px] uppercase tracking-[0.14em] font-medium text-stone mb-[6px]"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-[6px] text-[12px] text-beni leading-snug">{error}</p>
      )}
    </div>
  );
}
