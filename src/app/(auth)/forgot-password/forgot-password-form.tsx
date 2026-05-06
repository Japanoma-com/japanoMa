'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordData } from '@/lib/validations/auth';
import { resetPasswordForEmail } from '../actions';
import {
  authLabelClass as labelClass,
  authInputClass as inputClass,
  authErrorClass as errorClass,
  authSubmitClass,
} from '../components/form-styles';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordData) {
    await resetPasswordForEmail(data);
    // Always show success to prevent email enumeration
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-sumi-light leading-body">
        If that email exists, we&apos;ve sent a password reset link. Check your inbox.
      </p>
    );
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

      <button type="submit" disabled={isSubmitting} className={authSubmitClass}>
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}
