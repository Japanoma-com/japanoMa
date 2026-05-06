'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordData } from '@/lib/validations/auth';
import { updatePassword } from '../actions';
import {
  authLabelClass as labelClass,
  authInputClass as inputClass,
  authErrorClass as errorClass,
  authSubmitClass,
} from '../components/form-styles';

export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordData) {
    setServerError(null);
    const result = await updatePassword(data);
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
        <label htmlFor="password" className={labelClass}>
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register('password')}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className={errorClass}>{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-md bg-beni/5 border-l-2 border-beni px-ma-4 py-ma-3">
          <p className="text-[12px] text-beni leading-relaxed">{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={authSubmitClass}>
        {isSubmitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
