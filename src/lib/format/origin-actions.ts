'use server';

import { cookies } from 'next/headers';
import {
  AuOrigin,
  DEFAULT_ORIGIN,
  ORIGIN_COOKIE,
  ORIGIN_COOKIE_MAX_AGE_DAYS,
  isAuOrigin,
} from './origin';

/**
 * Read the user's chosen home origin from the cookie. Defaults to
 * Sydney when unset. Render-time helper — call it inside server
 * components that surface a "From {city}" label.
 */
export async function getOrigin(): Promise<AuOrigin> {
  const store = await cookies();
  const value = store.get(ORIGIN_COOKIE)?.value;
  return isAuOrigin(value) ? value : DEFAULT_ORIGIN;
}

/**
 * Persist the user's chosen home origin. Called from the OriginPicker
 * client component via a form action. Cookie is non-HttpOnly so the
 * client picker can mirror state without an extra fetch.
 */
export async function setOrigin(formData: FormData): Promise<void> {
  const candidate = formData.get('origin');
  if (typeof candidate !== 'string' || !isAuOrigin(candidate)) return;
  const store = await cookies();
  store.set({
    name: ORIGIN_COOKIE,
    value: candidate,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    maxAge: ORIGIN_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
  });
}
