import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const SESSION_COOKIE = 'jt_session';
const SESSION_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

const AUTH_UI_ROUTES = new Set([
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/account',
  '/auth/confirm',
]);

export async function middleware(request: NextRequest) {
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
