// Single source of truth for policy versioning. Both the rendered
// pages and the signup acknowledgment-logging server action read from
// these constants so the version a user accepts is exactly what was
// shown to them on the page when they ticked the box.
//
// Bump the version + lastUpdated whenever the legal team makes a
// substantive change. Bumping the version invalidates the user's
// previous acknowledgment — they'll be prompted to re-accept on next
// signin (handled in the auth middleware path).

export const TERMS_VERSION = '1.0';
export const TERMS_LAST_UPDATED = '2026-05-06';

export const PRIVACY_VERSION = '1.0';
export const PRIVACY_LAST_UPDATED = '2026-05-06';

export type PolicyDocType = 'terms' | 'privacy';

export const POLICY_VERSIONS: Record<PolicyDocType, string> = {
  terms: TERMS_VERSION,
  privacy: PRIVACY_VERSION,
};
