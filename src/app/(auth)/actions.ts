'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { logPolicyAcknowledgment } from '@/lib/policies/log-acknowledgment';
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignInData,
  type SignUpData,
  type ForgotPasswordData,
  type ResetPasswordData,
} from '@/lib/validations/auth';

// Client-facing actions return a plain result object instead of calling
// `redirect()`. Redirects thrown from a server action are swallowed by
// react-hook-form's handleSubmit wrapper and by imperative onClick
// handlers that try/catch the call, so the client never navigates.
// Returning `{ redirectTo }` lets the caller do router.push() cleanly.
type ActionError = { error: string };
type ActionRedirect = { redirectTo: string };
type ActionResult = ActionError | ActionRedirect | void;

function sanitizeNext(next: string | null): string {
  if (!next) return '/';
  if (!next.startsWith('/')) return '/';
  // Reject protocol-relative (//), backslash-escaped (/\), and absolute URLs
  if (next.length > 1 && (next[1] === '/' || next[1] === '\\')) return '/';
  return next;
}

async function getBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function signIn(data: SignInData, next?: string | null): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid form data' };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Auto-reactivate. If the user previously chose "Deactivate account",
  // their user_metadata.deactivated_at flag is set. The fact that they
  // just authenticated successfully is the reactivation signal — clear
  // the flag silently so the next /account render is fully restored.
  // Errors here are swallowed: if the metadata write fails, the user is
  // still signed in (auth.users row was untouched at deactivation time)
  // and we'd rather not block sign-in over a flag clear we can retry.
  const user = signInData.user;
  if (user?.user_metadata?.deactivated_at) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      try {
        const { createClient: createAdminSupabaseClient } = await import('@supabase/supabase-js');
        const admin = createAdminSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        );
        const { deactivated_at: _drop, ...rest } = user.user_metadata;
        void _drop;
        await admin.auth.admin.updateUserById(user.id, { user_metadata: rest });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[signIn] failed to clear deactivated_at flag:', e);
      }
    }
  }

  return { redirectTo: sanitizeNext(next ?? null) };
}

export async function signUp(data: SignUpData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid form data' };
  }

  const supabase = await createClient();
  const baseUrl = await getBaseUrl();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      // PKCE callback handler — see src/app/auth/confirm/route.ts
      emailRedirectTo: `${baseUrl}/auth/confirm?next=/account`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Log the Terms & Privacy acknowledgment. The user has ticked the
  // required checkbox (zod-enforced above), so we record what version
  // they accepted, when, from which IP. Append-only audit log; never
  // mutated. Errors here don't block signup — the account exists,
  // the audit row is best-effort, and we'd rather have a missing row
  // than a failed signup attempt that leaves a half-created account.
  if (signUpData.user) {
    await logPolicyAcknowledgment({
      userId: signUpData.user.id,
      docTypes: ['terms', 'privacy'],
      context: 'signup',
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('[signUp] policy acknowledgment log failed:', e);
    });
  }

  return { redirectTo: '/verify-email' };
}

export async function resetPasswordForEmail(data: ForgotPasswordData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid email' };
  }

  const supabase = await createClient();
  const baseUrl = await getBaseUrl();
  // Note: Supabase intentionally does not reveal whether the email exists.
  // We always show "if that email exists, we sent a link" on the UI side.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    // PKCE callback handler exchanges the code then bounces to /reset-password
    redirectTo: `${baseUrl}/auth/confirm?next=/reset-password`,
  });
}

export async function updatePassword(data: ResetPasswordData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { redirectTo: '/login?message=password-updated' };
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { redirectTo: '/' };
}
