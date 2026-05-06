'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInData } from '@/lib/validations/auth';
import { signIn } from '../actions';
import {
  authLabelClass as labelClass,
  authInputClass as inputClass,
  authErrorClass as errorClass,
  authSubmitClass,
} from '../components/form-styles';

export function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInData) {
    setServerError(null);
    const result = await signIn(data, next);
    if (result && 'error' in result) {
      setServerError(result.error);
      return;
    }
    if (result && 'redirectTo' in result) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-ma-6">
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
          autoComplete="current-password"
          className={inputClass}
          {...register('password')}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-md bg-beni/5 border-l-2 border-beni px-ma-4 py-ma-3">
          <p className="text-[12px] text-beni leading-relaxed">{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={authSubmitClass}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
