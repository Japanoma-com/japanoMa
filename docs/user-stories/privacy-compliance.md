# User Stories: Privacy & Compliance (F6)

**Project:** Japanoma — Buyer Insight Platform for Japan Property Investment
**Date:** 2026-02-27
**Feature Area:** F6 — Privacy & Compliance

This feature area ensures the Japanoma platform meets privacy and compliance obligations under both the Australian Privacy Act and Japan's Act on the Protection of Personal Information (APPI). The platform collects behavioral signals (event tracking) and optional personal data (account registration, contact forms), so it must implement transparent consent mechanisms, data retention policies, PII safeguards, and user rights (access, deletion). Every compliance requirement is designed to build trust with buyers while enabling Go&C to collect legitimate, consented insight data.

---

### US-01: Cookie Consent Banner
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** see a clear cookie consent banner when I first visit the site
**So that** I can make an informed choice about whether to allow tracking cookies and analytics

**Acceptance Criteria:**
1. GIVEN Emma visits the Japanoma platform for the first time WHEN the page loads THEN a cookie consent banner appears at the bottom of the screen with the text: "We use cookies and analytics to improve your experience and understand buyer preferences. You can accept or decline non-essential cookies."
2. GIVEN the consent banner is displayed WHEN Emma views the options THEN two clear buttons are visible: "Accept All" and "Decline Non-Essential" along with a "Learn More" link to the full privacy policy
3. GIVEN Emma clicks "Accept All" WHEN the preference is saved THEN all tracking cookies and event analytics are enabled, the banner dismisses, and her consent choice is stored in a cookie with a 12-month expiration
4. GIVEN Emma clicks "Decline Non-Essential" WHEN the preference is saved THEN only essential cookies (session management, consent preference) are set, behavioral event tracking is disabled for her session, and the banner dismisses
5. GIVEN Emma has already made a consent choice WHEN she returns to the site within 12 months THEN the consent banner does not reappear and her previous choice is respected
6. GIVEN Emma clears her browser cookies WHEN she revisits the site THEN the consent banner reappears since her preference has been lost

**Priority:** Must Have
**Feature:** F6
**Phase:** Core Development

---

### US-02: Privacy Policy Page
**As a** David Chen (Australian Property Investor)
**I want to** read a comprehensive privacy policy that explains what data is collected and how it is used
**So that** I can make informed decisions about using the platform and sharing my information

**Acceptance Criteria:**
1. GIVEN David navigates to the Privacy Policy page (via footer link, consent banner link, or direct URL) WHEN the page loads THEN a complete privacy policy is displayed covering: data controller identity (Go&C), types of data collected, purposes of collection, legal basis for processing, data retention periods, third-party sharing, user rights, and contact information
2. GIVEN the privacy policy is displayed WHEN David reads the "Data We Collect" section THEN it clearly distinguishes between: (a) behavioral event data (anonymous, no PII), (b) account data (email, optional display name), and (c) contact form data (name, email, phone, message)
3. GIVEN the privacy policy is displayed WHEN David reads the "How We Use Your Data" section THEN it explains that behavioral data is used for aggregated buyer insight analytics and is never linked to personal identity
4. GIVEN the privacy policy references APPI compliance WHEN David reads the relevant section THEN it explains the purpose limitation principle and confirms that personal data is only used for the stated purposes
5. GIVEN the privacy policy is updated WHEN the update is published THEN the page displays a "Last updated" date at the top and a summary of changes since the previous version

**Priority:** Must Have
**Feature:** F6
**Phase:** Core Development

---

### US-03: Consent Preference Management
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** change my cookie and tracking consent preferences at any time via a footer link
**So that** I maintain control over my privacy choices without needing to clear cookies

**Acceptance Criteria:**
1. GIVEN Yuki is on any page of the platform WHEN she scrolls to the footer THEN a "Cookie Settings" or "Privacy Preferences" link is visible
2. GIVEN Yuki clicks "Cookie Settings" WHEN the preferences panel opens THEN it displays her current consent state (e.g., "Analytics cookies: Accepted") with toggle switches for each cookie category
3. GIVEN Yuki currently has analytics cookies accepted WHEN she toggles analytics to "Declined" and saves THEN behavioral event tracking is immediately disabled for her session and the consent cookie is updated
4. GIVEN Yuki changes her preference from "Declined" to "Accepted" WHEN she saves the change THEN event tracking resumes from that point forward (no retroactive tracking of her previous session activity)
5. GIVEN Yuki updates her consent preference WHEN the update is processed THEN a `consent_update` event is recorded (for audit purposes) with the old and new preference states and a timestamp, but no PII

**Priority:** Must Have
**Feature:** F6
**Phase:** Core Development

---

### US-04: APPI Compliance (Purpose Limitation and Consent)
**As a** Kaz/Shiun (Go&C Admin)
**I want to** ensure the platform complies with Japan's APPI requirements for purpose limitation and consent
**So that** Go&C operates legally in Japan and maintains trust with Japanese and international buyers

**Acceptance Criteria:**
1. GIVEN a user visits the platform WHEN event tracking is active THEN the data collected is limited to the stated purposes: understanding buyer preferences and improving content (no secondary use without additional consent)
2. GIVEN a user submits the contact form WHEN the form is processed THEN the personal data (name, email, message) is used only for responding to the inquiry and is not added to marketing databases without explicit additional consent
3. GIVEN Go&C needs to use contact form data for a new purpose (e.g., newsletter) WHEN the platform is updated THEN a separate, specific consent mechanism is provided and historical contacts are not retroactively enrolled
4. GIVEN APPI requires a designated data protection manager WHEN the privacy policy is reviewed THEN it names the responsible person or department at Go&C and provides contact details for privacy inquiries
5. GIVEN APPI requires notification of data transfer across borders WHEN the privacy policy explains data processing THEN it discloses that data may be processed on servers outside Japan (e.g., Supabase/Vercel infrastructure) and names the jurisdictions

**Priority:** Must Have
**Feature:** F6
**Phase:** Discovery + Design

---

### US-05: Data Retention Enforcement (90-Day Raw Events)
**As a** Kaz/Shiun (Go&C Admin)
**I want to** have raw event data automatically deleted after 90 days
**So that** the platform minimizes data storage risk and complies with data minimization principles under APPI and the Australian Privacy Act

**Acceptance Criteria:**
1. GIVEN the data retention cron job runs daily at 03:00 UTC WHEN it scans the raw events table THEN all raw events older than 90 days are permanently deleted from the database
2. GIVEN raw events are deleted WHEN the deletion completes THEN the pre-aggregated daily_metrics table (which contains no PII) is unaffected and retains historical data indefinitely
3. GIVEN the retention cron job runs WHEN it processes a batch of 100,000+ expired events THEN deletion is performed in batches of 10,000 to avoid database locks and performance degradation
4. GIVEN the retention cron job encounters an error WHEN the error occurs THEN the job logs the error, sends an alert notification to the admin, and retries the failed batch on the next run
5. GIVEN Shiun wants to verify retention compliance WHEN he queries the raw events table THEN no events with timestamps older than 90 days exist (verifiable via a dashboard metric or admin query)

**Priority:** Must Have
**Feature:** F6
**Phase:** Core Development

---

### US-06: User Data Deletion Request Handling
**As a** David Chen (Australian Property Investor)
**I want to** request deletion of all my personal data from the platform
**So that** I can exercise my right to erasure under applicable privacy laws

**Acceptance Criteria:**
1. GIVEN David navigates to Account Settings WHEN he clicks "Delete My Data" or "Delete Account" THEN a confirmation dialog explains what data will be deleted: account information, saved items, quiz results, and contact form submissions
2. GIVEN David confirms the deletion request WHEN the request is processed THEN all personal data is deleted within 30 days as required by APPI and the Australian Privacy Act
3. GIVEN David's account data is deleted WHEN the deletion completes THEN anonymous event tracking data (which contains no PII and cannot be linked to David) is retained in aggregated form
4. GIVEN David submits a deletion request via email (as an alternative to the in-app method) WHEN Go&C receives the request THEN the admin verifies David's identity, processes the deletion, and sends confirmation within 30 days
5. GIVEN a deletion request is processed WHEN the deletion completes THEN a compliance log entry is created recording the request date, completion date, and data categories deleted (without storing the deleted personal data itself)
6. GIVEN David's data has been deleted WHEN he tries to log in THEN the login fails with the standard "Invalid email or password" message, not revealing that the account was deleted

**Priority:** Must Have
**Feature:** F6
**Phase:** Core Development

---

### US-07: No PII in Event Tracking Verification
**As a** Kaz/Shiun (Go&C Admin)
**I want to** verify through automated checks that no PII is ever stored in the event tracking tables
**So that** I can be confident the analytics data is privacy-safe and can be retained without consent concerns

**Acceptance Criteria:**
1. GIVEN the event ingestion API receives an event WHEN the payload is validated THEN a server-side check scans all string fields for patterns matching email addresses (regex), phone numbers, and common name fields and rejects events containing matches
2. GIVEN an event payload accidentally includes a field named "email" or "name" WHEN the validation runs THEN the field is stripped from the payload before storage and a warning is logged for developer review
3. GIVEN the events table schema is defined WHEN a developer reviews the schema THEN no column is typed or named in a way that suggests PII storage (no "email", "name", "phone", "ip_address" columns)
4. GIVEN a weekly automated audit job runs WHEN it scans a sample of 1,000 recent events THEN the audit confirms zero events contain PII patterns and logs the result to the compliance audit trail
5. GIVEN the audit detects a potential PII leak WHEN the detection occurs THEN an immediate alert is sent to the admin and the affected events are quarantined for manual review and remediation

**Priority:** Must Have
**Feature:** F6
**Phase:** QA + Launch

---

### US-08: Consent Checkbox on Contact Form
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** see a clear consent checkbox and disclosure text on the contact form
**So that** I understand how my personal information will be used before submitting an inquiry

**Acceptance Criteria:**
1. GIVEN Yuki opens the contact/inquiry form WHEN the form renders THEN a checkbox with disclosure text is displayed: "I consent to Go&C collecting and using the information I provide in this form to respond to my inquiry about Japan property investment. I have read and agree to the Privacy Policy."
2. GIVEN the consent checkbox is displayed WHEN Yuki views the "Privacy Policy" text THEN it is a clickable link that opens the privacy policy page in a new tab
3. GIVEN Yuki fills in the form but does not check the consent box WHEN she clicks "Submit" THEN the form does not submit and a validation message appears: "Please provide your consent to proceed"
4. GIVEN Yuki checks the consent box and submits the form WHEN the submission is stored THEN the database record includes a consent_given: true flag with the timestamp of consent
5. GIVEN the disclosure text is rendered WHEN Yuki reads it THEN the text is displayed in a readable font size (minimum 14px) and is not hidden behind a "show more" toggle, ensuring it is fully visible without extra clicks

**Priority:** Must Have
**Feature:** F6
**Phase:** Core Development

---

### US-09: Third-Party Data Sharing Transparency
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** know whether my data is shared with any third parties
**So that** I can trust the platform and understand who has access to my information

**Acceptance Criteria:**
1. GIVEN Emma reads the Privacy Policy WHEN she views the "Third-Party Sharing" section THEN it lists all third-party services that receive or process data (e.g., Supabase for database hosting, Vercel for site hosting, Resend for email delivery)
2. GIVEN third-party services are listed WHEN Emma reads each entry THEN the policy explains what data each service receives (e.g., "Supabase receives account data for authentication and storage; Vercel receives page request data for site delivery")
3. GIVEN the platform does not sell personal data WHEN Emma reads the policy THEN a clear statement confirms: "We do not sell, rent, or trade your personal information to third parties for their marketing purposes"
4. GIVEN Emma has questions about data sharing WHEN she looks for contact information THEN the privacy policy provides a direct email address for privacy inquiries (e.g., privacy@goandconsulting.com)

**Priority:** Should Have
**Feature:** F6
**Phase:** Discovery + Design

---

### US-10: Compliance Audit Trail
**As a** Kaz/Shiun (Go&C Admin)
**I want to** maintain an audit trail of all privacy-relevant actions
**So that** Go&C can demonstrate compliance during regulatory reviews or in response to user inquiries

**Acceptance Criteria:**
1. GIVEN a user registers and provides consent WHEN the registration completes THEN an audit log entry records: action (registration_consent), timestamp, consent text version, and a hashed user reference
2. GIVEN a user updates their cookie consent preference WHEN the update is saved THEN an audit log entry records: action (consent_update), old_preference, new_preference, and timestamp
3. GIVEN a user requests account deletion WHEN the request is submitted THEN an audit log entry records: action (deletion_request), timestamp, and status (pending/completed)
4. GIVEN the data retention cron job deletes expired events WHEN the job completes THEN an audit log entry records: action (retention_purge), event_count_deleted, date_range_covered, and completion_timestamp
5. GIVEN Shiun needs to review compliance history WHEN he accesses the audit trail in the admin dashboard THEN entries are displayed chronologically with filtering by action type and date range

**Priority:** Should Have
**Feature:** F6
**Phase:** Core Development
