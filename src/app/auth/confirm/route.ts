import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase PKCE email-link callback handler.
 *
 * Supabase sends a confirmation/reset email containing a link back to this
 * URL with a `?code=...` query param. The code must be exchanged for a
 * session before the user is actually signed in. This exchange has to set
 * cookies, which is only allowed in route handlers, middleware, or server
 * actions — not in server component pages. That's why /verify-email and
 * /reset-password can't do the exchange themselves.
 *
 * Flow:
 * 1. Email signUp action → emailRedirectTo=/auth/confirm?next=/account
 * 2. User clicks email link → arrives here
 * 3. exchangeCodeForSession sets auth cookies
 * 4. Redirect to ?next (account for signup, reset-password for reset)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';

  if (!code) {
    return NextResponse.redirect(`${origin}/verify-email?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/verify-email?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
