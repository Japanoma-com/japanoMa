import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const SESSION_COOKIE = 'jt_session';
const SESSION_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds
const PREVIEW_COOKIE = 'jt_preview_unlock';
const PREVIEW_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const AUTH_UI_ROUTES = new Set([
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/account',
  '/auth/confirm',
]);

// Routes that stay accessible while the rest of the site is gated by
// LAUNCH_MODE='coming_soon'. Auth surfaces are open so the team can
// still sign in and review; the coming-soon page itself must obviously
// be reachable; admin and api stay live for internal use.
const LAUNCH_MODE_ALLOWLIST = new Set([
  '/coming-soon',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/account',
  '/auth/confirm',
]);

function isLaunchModeAllowed(pathname: string): boolean {
  if (LAUNCH_MODE_ALLOWLIST.has(pathname)) return true;
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/account/') ||
    pathname.startsWith('/auth/')
  );
}

export async function middleware(request: NextRequest) {
  // Launch-mode gate. When LAUNCH_MODE === 'coming_soon', every public
  // route redirects to /coming-soon — except the auth surfaces, /admin,
  // /api, and the coming-soon page itself. Bypass for preview reviewers
  // is via ?preview=<PREVIEW_KEY>: matches the env, sets a 30-day
  // unlock cookie, and redirects to a clean URL. Anyone with that
  // cookie can browse the full site until LAUNCH_MODE=live ships.
  //
  // No NEXT_PUBLIC_ prefix on either env so flipping them on Vercel
  // takes effect on the next request without a rebuild.
  if (process.env.LAUNCH_MODE === 'coming_soon') {
    const url = request.nextUrl;
    const previewKey = process.env.PREVIEW_KEY;
    const previewQuery = url.searchParams.get('preview');

    // Match query → set cookie + redirect to clean URL.
    if (previewKey && previewQuery && previewQuery === previewKey) {
      const cleanUrl = url.clone();
      cleanUrl.searchParams.delete('preview');
      const redirect = NextResponse.redirect(cleanUrl);
      redirect.cookies.set(PREVIEW_COOKIE, '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: PREVIEW_COOKIE_MAX_AGE,
        path: '/',
      });
      return redirect;
    }

    // Cookie present → preview reviewer; let through.
    const hasPreviewUnlock = request.cookies.get(PREVIEW_COOKIE)?.value === '1';

    if (!hasPreviewUnlock && !isLaunchModeAllowed(url.pathname)) {
      const redirectUrl = url.clone();
      redirectUrl.pathname = '/coming-soon';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth UI feature gate: when the flag is not 'true', return a real 404
  // at the edge before any rendering. This is the single source of truth;
  // layouts/pages do NOT repeat this check. Next.js 15's notFound() from
  // a layout does not properly gate routes in production builds, so the
  // gate must live here. AUTH_UI_ENABLED intentionally does NOT use the
  // NEXT_PUBLIC_ prefix so it is read at runtime, not inlined at build
  // time — flipping the Vercel env var takes effect on the next request
  // without a rebuild.
  if (process.env.AUTH_UI_ENABLED !== 'true') {
    if (AUTH_UI_ROUTES.has(request.nextUrl.pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // First refresh the Supabase auth session.
  // updateSession() returns a NextResponse with any Supabase auth cookies
  // already set. We layer the analytics cookie on top.
  const response = await updateSession(request);

  // Then ensure the analytics session cookie is set.
  // Used by quiz/actions.ts to group anonymous events without a database table.
  if (!request.cookies.get(SESSION_COOKIE)) {
    response.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|api/revalidate).*)',
  ],
};
