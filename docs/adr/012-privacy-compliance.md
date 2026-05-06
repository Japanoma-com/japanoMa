# ADR-012: Privacy & Compliance — APPI + Australian Privacy Act + GDPR

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Japanoma operates across three privacy jurisdictions:

1. **APPI (Act on the Protection of Personal Information)** — Japan's privacy law. Applies because the platform collects data about preferences related to Japanese properties, and Go&C Partners operates in Japan.

2. **Australian Privacy Act 1988** — Applies because the target users are Australian residents. The Australian Privacy Principles (APPs) govern collection, use, and disclosure of personal information.

3. **GDPR (General Data Protection Regulation)** — May apply if EU residents visit the site. While not the target audience, the platform is publicly accessible and should comply proactively.

The platform's core value proposition involves collecting behavioral data (views, saves, quiz responses) and presenting aggregated insights to Go&C Partners. This data collection must be transparent, consented, and privacy-preserving. The consent language from the functional requirements states: "We may share summarized browsing tendencies (non-identifiable) with partner real estate companies to provide better recommendations. No personal browsing history is shared."

## Options Considered

### Option A: Privacy-First Architecture with Cookieless Analytics + Consent Management
**Pros:**
- Cookieless analytics (Plausible) requires no consent banner for basic traffic data
- Essential cookies (session management) are exempt from consent requirements
- Non-essential tracking gated behind explicit consent
- Clear separation between aggregated insights (shared with Go&C) and raw data (never shared)
- Data minimization by design: no PII in event tracking tables
- Retention policies limit data lifecycle

**Cons:**
- More upfront architecture decisions
- Consent management adds UI complexity
- Some tracking is reduced if users decline consent

**Cost:** Minimal incremental cost (consent banner is a UI component).

### Option B: Full Cookie Consent with Third-Party Analytics
**Pros:**
- Standard approach; many reference implementations
- Third-party analytics (Google Analytics) provide rich behavioral data

**Cons:**
- Cookie consent banner required immediately on every visit (friction)
- Google Analytics raises GDPR concerns (data transfer to US)
- Users who reject cookies lose all tracking (reduces signal volume)
- More complex consent management for multiple cookie categories

**Cost:** Google Analytics is free but has privacy compliance costs.

### Option C: No Analytics Consent (Essential Only)
**Pros:**
- Simplest implementation
- No consent banner needed
- No compliance risk

**Cons:**
- Cannot track any non-essential user behavior
- Defeats the platform's core purpose (buyer intent analytics)
- No data for the admin dashboard

**Cost:** $0 but makes the product non-viable.

## Decision

**Privacy-first architecture with cookieless analytics (Plausible), consent-gated custom event tracking, and explicit data handling policies.**

## Justification

The architecture balances data collection (the product's value) with privacy compliance (legal requirement and trust builder) through a layered approach:

### Layer 1: No Consent Required (Essential + Cookieless)

| What | Basis | Details |
|------|-------|---------|
| Session cookie (`jt_session`) | Essential cookie | First-party, httpOnly, secure. Required for site functionality (quiz state, save state). Exempt from consent under GDPR Art. 5(3), APPI, and Australian Privacy Act. |
| Plausible analytics | No cookies used | Cookieless, no personal data collected. Aggregate traffic metrics only. Does not require consent under any jurisdiction. |
| Page view counting | Legitimate interest | Anonymous count of page loads for site operations. No user identification. |

### Layer 2: Consent Required (Non-Essential Tracking)

| What | Basis | Consent Required |
|------|-------|-----------------|
| Custom event tracking (taxonomy-tagged) | Consent | User interactions (saves, quiz responses, comparisons) with taxonomy context. Stored as anonymous session events. Requires consent before activation. |
| Budget selection tracking | Consent | Price range preferences linked to session. |
| Form submission data | Explicit consent | Contact form includes mandatory consent checkbox with disclosure text. |

### Consent Flow

1. **First visit:** Consent banner appears with clear options:
   - "Accept" enables non-essential event tracking
   - "Decline" limits tracking to essential cookies and Plausible only
   - "Learn more" links to privacy policy
2. **Consent is stored** in a first-party cookie (`jt_consent`) with value `accepted` or `declined`
3. **Consent can be changed** via a link in the site footer
4. **No tracking occurs** for non-essential events until consent is given

### Data Handling Policies

| Data Type | Retention | Shared with Go&C | Access |
|-----------|-----------|-------------------|--------|
| Raw events (taxonomy-tagged) | 90 days | Never (raw form) | System only |
| Aggregated daily stats | Indefinite | Yes (aggregate form) | Admin dashboard |
| User profiles (registered) | Until deletion requested | Name, email for inquiries only | Admin |
| Quiz responses | 90 days (raw), indefinite (aggregate) | Aggregate distributions only | Admin dashboard |
| Contact form submissions | 2 years | Yes (user consented) | Admin |
| Plausible traffic data | Managed by Plausible | No | Plausible dashboard |

### Regulatory Compliance Matrix

| Requirement | APPI | Australian Privacy Act | GDPR | Implementation |
|-------------|------|----------------------|------|----------------|
| Purpose limitation | Required | APP 6 | Art. 5(1)(b) | Consent text specifies purpose |
| Data minimization | Required | APP 3 | Art. 5(1)(c) | No PII in events; only taxonomy tags |
| Consent for collection | Required for sensitive | APP 3.3 | Art. 6(1)(a) | Consent banner + form checkbox |
| Cross-border transfer | Consent required | APP 8 | Art. 46 | Supabase region: Sydney. No cross-border transfer of PII. |
| Right of access | Required | APP 12 | Art. 15 | User profile shows saved data |
| Right of deletion | Required | APP 12 | Art. 17 | Account deletion removes all user data |
| Data breach notification | "Promptly" to PPC and affected individuals (no fixed statutory deadline; APPI guidelines recommend prompt notification) | 30 days (eligible breach) | 72 hours | Sentry monitoring + incident response plan |
| Privacy policy | Required | APP 1 | Art. 13 | Published at /privacy |

### Supabase Region Selection

Supabase project is provisioned in the **Sydney (ap-southeast-2)** region. This ensures:
- User data stays in Australia (no cross-border transfer concerns for Australian Privacy Act)
- Low latency for Australian users
- APPI cross-border provisions are addressed by keeping data outside Japan (Go&C accesses aggregated insights only via the admin dashboard; no raw PII crosses borders)

## Consequences

**Positive:**
- Cookieless Plausible provides traffic data without any consent friction
- Consent-gated event tracking respects user choice while still collecting data from consenting users
- Data minimization (no PII in events) reduces breach exposure and compliance burden
- 90-day retention for raw events limits data liability
- Sydney-based Supabase eliminates cross-border data transfer concerns for Australian users

**Negative/Trade-offs:**
- Users who decline consent will not contribute to taxonomy-tagged analytics (reduced signal volume)
- Consent banner adds UI friction on first visit
- Privacy policy and consent text must be reviewed by the client's legal advisor (not Craefto's responsibility per SOW)

**Risks:**
- Privacy regulations may tighten (mitigated: privacy-first design means less exposure to regulatory changes)
- Australia's Privacy Act reform (expected 2026 to 2027) may introduce GDPR-like right to erasure requirements (mitigated: already implemented)
- Go&C may request more granular data sharing in future (mitigated: aggregation-only principle is a product decision, not just a compliance one; protects user trust)

---

*Cross-references: [ADR-003](003-auth-strategy.md) (Session management and consent cookie), [ADR-005](005-analytics-tracking.md) (Event tracking architecture), [Auth Spec](../architecture/auth-spec.md) (Privacy safeguards in tracking), [User Stories: Privacy](../user-stories/privacy-compliance.md) (Privacy compliance stories), [Personas](../personas/personas.md) (Emma's anonymous signals)*
