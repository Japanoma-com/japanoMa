'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpData } from '@/lib/validations/auth';
import { signUp } from '../actions';
import {
  authLabelClass as labelClass,
  authInputClass as inputClass,
  authErrorClass as errorClass,
  authSubmitClass,
} from '../components/form-styles';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/policies/versions';

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { acknowledgePolicies: false as unknown as true },
  });

  async function onSubmit(data: SignUpData) {
    setServerError(null);
    const result = await signUp(data);
    if (result && 'error' in result) {
      setServerError(result.error);
      return;
    }
    if (result && 'redirectTo' in result) {
      router.push(result.redirectTo);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-ma-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          autoComplete="name"
          className={inputClass}
          {...register('name')}
        />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClass}
          {...register('email')}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register('password')}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        <p className="mt-ma-2 text-[11px] text-stone">At least 8 characters.</p>
      </div>

      {/*
        Required acknowledgment. The user is told exactly which
        version of each document they're agreeing to so the audit
        trail in policy_acknowledgments matches what was rendered.
        Both links open in new tabs so the form state isn't lost.
      */}
      <div>
        <label
          htmlFor="acknowledgePolicies"
          className="flex items-start gap-ma-3 cursor-pointer group"
        >
          <input
            id="acknowledgePolicies"
            type="checkbox"
            className="mt-[3px] w-[18px] h-[18px] rounded-[4px] accent-ai cursor-pointer flex-shrink-0"
            {...register('acknowledgePolicies')}
          />
          <span className="text-[13px] text-sumi-light leading-relaxed group-hover:text-sumi transition-colors duration-base ease-settle">
            I have read and acknowledge the{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener"
              className="text-ai hover:text-ai-deep underline underline-offset-[3px] decoration-ai/30 hover:decoration-ai-deep"
            >
              Terms &amp; Conditions <span aria-hidden>↗</span>
            </Link>
            {' '}(v{TERMS_VERSION}) and{' '}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener"
              className="text-ai hover:text-ai-deep underline underline-offset-[3px] decoration-ai/30 hover:decoration-ai-deep"
            >
              Privacy Policy <span aria-hidden>↗</span>
            </Link>
            {' '}(v{PRIVACY_VERSION}).
          </span>
        </label>
        {errors.acknowledgePolicies && (
          <p className="mt-[6px] pl-[30px] text-[12px] text-beni leading-snug">
            {errors.acknowledgePolicies.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="rounded-md bg-beni/5 border-l-2 border-beni px-ma-4 py-ma-3">
          <p className="text-[12px] text-beni leading-relaxed">{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={authSubmitClass}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
