'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNameSchema, type UpdateNameData } from '@/lib/validations/auth';
import { updateName } from '../actions';
import { Spinner } from '@/components/japandi/spinner';

type Props = {
  currentName: string;
  onClose: () => void;
};

export function SidebarNameEdit({ currentName, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateNameData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name: currentName },
  });

  async function onSubmit(data: UpdateNameData) {
    setServerError(null);
    const result = await updateName(data);
    if (result && 'error' in result) {
      setServerError(result.error);
      return;
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-ma-3 p-ma-4 bg-washi rounded-lg">
      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-stone">
        Name
      </label>
      <input
        {...register('name')}
        className="w-full bg-transparent border-0 border-b border-border text-sm text-sumi focus:border-b-2 focus:border-ai focus:outline-none py-1 transition-colors duration-base ease-settle"
        autoFocus
      />
      {errors.name && <p className="text-[11px] text-beni">{errors.name.message}</p>}
      {serverError && <p className="text-[11px] text-beni">{serverError}</p>}
      <div className="flex gap-ma-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-ma-3 h-8 bg-ai text-kinu text-[11px] font-semibold tracking-wide rounded-lg hover:bg-ai-deep disabled:opacity-60 inline-flex items-center justify-center gap-ma-1"
        >
          {isSubmitting && <Spinner size="sm" />}
          <span>{isSubmitting ? 'Saving…' : 'Save'}</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-ma-3 h-8 text-[11px] text-stone hover:text-sumi"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
