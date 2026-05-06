'use server';

/**
 * Consent cookie server actions.
 *
 * The `analytics_consent` cookie is the single source of truth for whether
 * the user has opted in to analytics (Plausible + our server-side event
 * logging). Values:
 *   "granted"  — opted in
 *   "declined" — opted out
 *   absent     — undecided (banner shown)
 *
 * 1-year max-age; matches the typical consent-renewal cadence.
 */
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const CONSENT_COOKIE = 'analytics_consent';
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setConsent(value: 'granted' | 'declined') {
  const cookieStore = await cookies();
  cookieStore.set(CONSENT_COOKIE, value, {
    httpOnly: false, // The client banner reads this to know if it should render
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ONE_YEAR,
    path: '/',
  });
  // Revalidate so layout.tsx re-renders and conditionally includes/excludes
  // the Plausible script based on the new consent value.
  revalidatePath('/', 'layout');
}
