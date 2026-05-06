# User Stories: Event Tracking (F3)

**Project:** Japanoma — Buyer Insight Platform for Japan Property Investment
**Date:** 2026-02-27
**Feature Area:** F3 — Event Tracking

This feature area defines the behavioral event tracking system that powers the buyer insight engine. Every meaningful interaction on the platform (page views, content views, saves, compares, quiz completions, budget selections, form submissions) generates a structured event that is stored, aggregated, and surfaced through the admin dashboard. The tracking system must be resilient, privacy-safe (no PII in event payloads), and capable of capturing the full taxonomy context of each interaction. Events are the foundation upon which all dashboard analytics are built.

---

### US-01: Page View Tracking with Path Context
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track every page view with the full URL path and page type
**So that** I can understand which sections of the platform attract the most traffic and identify browsing patterns

**Acceptance Criteria:**
1. GIVEN a visitor lands on any page WHEN the page finishes loading THEN a `page_view` event is recorded with the fields: path, page_type (content_hub, area_detail, article_detail, quiz, saved_items, etc.), timestamp, and anonymous session ID
2. GIVEN a visitor navigates from the content hub to an article detail page WHEN the article page loads THEN a new `page_view` event fires with the article page path, distinct from the previous hub event
3. GIVEN the visitor uses client-side navigation (Next.js route change) WHEN the route changes THEN a `page_view` event fires without requiring a full page reload
4. GIVEN a visitor refreshes the same page WHEN the page reloads THEN a new `page_view` event is recorded with the same path and a new timestamp
5. GIVEN page view events are recorded WHEN Shiun queries the events table THEN each event includes a session ID that does not contain any PII (no IP address, no user agent fingerprint)

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-02: Content View Tracking with Full Taxonomy Payload
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track content views (articles and area pages) with the complete taxonomy metadata in the event payload
**So that** I can analyze which areas, property types, use cases, design styles, and price ranges attract the most interest

**Acceptance Criteria:**
1. GIVEN a visitor opens the article "Renovating an Akiya in Nara" WHEN the page loads THEN a `content_view` event is recorded with fields: content_id, content_type (article), slug, and taxonomy tags (area: Nara, property_type: Akiya, use_case: Renovation Project, design_style: Wabi-sabi, price_range: ¥5M to ¥15M)
2. GIVEN a visitor views the Niseko area detail page WHEN the event fires THEN the `content_view` event includes content_type: area, area_slug: niseko, prefecture: Hokkaido, region: Hokkaido
3. GIVEN an article has multiple taxonomy tags (e.g., two areas: Tokyo and Osaka) WHEN the `content_view` event fires THEN all assigned tags are included as arrays in the event payload
4. GIVEN the taxonomy tags are included in the event WHEN Shiun aggregates events by area THEN each tag is independently countable (an article tagged Tokyo and Osaka increments both area counts)
5. GIVEN a visitor views content WHEN the event payload is constructed THEN no PII fields (email, name, IP address) are included in the event

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-03: Area View Tracking with Geographic Hierarchy
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track area page views with the full geographic hierarchy (region, prefecture, area)
**So that** I can analyze demand at multiple geographic levels, from individual areas up to regions

**Acceptance Criteria:**
1. GIVEN a visitor views the Hakuba area page WHEN the event fires THEN the `area_view` event includes area: Hakuba, prefecture: Nagano, region: Chubu
2. GIVEN a visitor views the Niseko area page WHEN the event fires THEN the event includes area: Niseko, prefecture: Hokkaido, region: Hokkaido
3. GIVEN area view events have been collected for 30 days WHEN Shiun queries events grouped by region THEN he can see total views for Hokkaido (sum of Niseko + other Hokkaido areas), Chubu (sum of Hakuba + other Chubu areas), etc.
4. GIVEN area view events include prefecture data WHEN Shiun queries by prefecture THEN he can compare Nagano vs Hokkaido vs Kyoto prefecture-level interest
5. GIVEN the geographic hierarchy is present in events WHEN the admin dashboard aggregates data THEN drill-down from region to prefecture to area is supported without additional API calls

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-04: Save and Unsave Event Tracking
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track when visitors save or unsave content
**So that** I can measure which content generates the strongest "intent" signals beyond passive page views

**Acceptance Criteria:**
1. GIVEN a visitor saves an article WHEN the save action completes THEN a `content_save` event is recorded with content_id, content_type, and full taxonomy tags of the saved content
2. GIVEN a visitor unsaves (removes) a previously saved article WHEN the unsave action completes THEN a `content_unsave` event is recorded with the same content metadata
3. GIVEN the events are recorded WHEN Shiun analyzes save data THEN the net save count (saves minus unsaves) can be calculated per content item
4. GIVEN the save event fires WHEN the payload is constructed THEN it includes whether the user was anonymous or authenticated (boolean flag) without including any user identity details
5. GIVEN save events are tracked WHEN Shiun views the dashboard THEN the most-saved areas and articles can be ranked by total save count

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-05: Compare Event Tracking
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track when visitors add items to the compare tray and when they view the comparison page
**So that** I can understand which areas are most frequently compared and which combinations appear together

**Acceptance Criteria:**
1. GIVEN a visitor adds Hakuba to the compare tray WHEN the add action completes THEN a `compare_add` event fires with the item_id (Hakuba), item_type (area), and the full current compare tray contents
2. GIVEN a visitor removes Kyoto from the compare tray WHEN the remove action completes THEN a `compare_remove` event fires with the removed item_id and the remaining tray contents
3. GIVEN a visitor clicks "Compare Now" with 3 items WHEN the comparison page loads THEN a `compare_view` event fires with the array of all compared item IDs and their taxonomy data
4. GIVEN compare events are collected over 30 days WHEN Shiun analyzes co-occurrence THEN he can see which area pairs are most frequently compared (e.g., Niseko and Hakuba appear together in 40% of comparisons)
5. GIVEN compare events include taxonomy data WHEN Shiun aggregates by property type THEN he can see which property types are most frequently compared

**Priority:** Should Have
**Feature:** F3
**Phase:** Core Development

---

### US-06: Quiz Start and Completion Tracking
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track quiz starts, individual question responses, and completions with all response data
**So that** I can analyze buyer preferences at scale and identify the most popular quiz responses

**Acceptance Criteria:**
1. GIVEN a visitor starts the area preference quiz WHEN the first question appears THEN a `quiz_start` event fires with quiz_type: area_preference and a unique quiz_session_id
2. GIVEN a visitor answers a quiz question WHEN the answer is submitted THEN a `quiz_response` event fires with quiz_session_id, question_id, question_text, selected_option_id, and selected_option_text
3. GIVEN a visitor completes the area preference quiz WHEN the results page loads THEN a `quiz_complete` event fires with quiz_type, quiz_session_id, all response pairs, and the resulting recommended areas
4. GIVEN a visitor abandons the quiz at step 3 of 5 WHEN no further interactions occur for 30 minutes THEN a `quiz_abandon` event is inferred during aggregation, recording the last completed step
5. GIVEN quiz events are collected WHEN Shiun analyzes area preference quiz data THEN he can see the distribution of climate preferences, proximity preferences, and other quiz dimensions
6. GIVEN the design style quiz is completed WHEN the `quiz_complete` event fires THEN the payload includes each image pair presented, the user's choice for each pair, and the resulting style (e.g., Japandi, Wabi-sabi)

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-07: Budget Selection Tracking
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track budget range selections
**So that** I can understand the investment capacity distribution of platform visitors

**Acceptance Criteria:**
1. GIVEN a visitor selects the budget range "¥15M to ¥30M" WHEN the selection event fires THEN a `budget_select` event is recorded with range_code, jpy_min, jpy_max, and the page context where the selection was made
2. GIVEN a visitor changes their budget selection from "¥15M to ¥30M" to "¥30M to ¥50M" WHEN the change event fires THEN a new `budget_select` event is recorded with the updated range (the previous selection is preserved as a separate historical event)
3. GIVEN budget events are aggregated WHEN Shiun views the price range histogram THEN each range shows the count of unique sessions that selected it
4. GIVEN the budget selection is made on the content hub WHEN the event fires THEN the page_context field shows "content_hub" to distinguish it from budget selections on other pages

**Priority:** Should Have
**Feature:** F3
**Phase:** Core Development

---

### US-08: Form View and Submission Tracking
**As a** Kaz/Shiun (Go&C Admin)
**I want to** track when the contact/inquiry form is viewed and when it is successfully submitted
**So that** I can measure the conversion funnel from form view to submission

**Acceptance Criteria:**
1. GIVEN a visitor opens the contact form (modal or page) WHEN the form becomes visible THEN a `form_view` event fires with form_type: contact_inquiry and the page context (e.g., area page, article page, or standalone)
2. GIVEN a visitor successfully submits the contact form WHEN the submission completes THEN a `form_submit` event fires with form_type: contact_inquiry and the content context (area_id or article_id if applicable)
3. GIVEN the form_submit event fires WHEN the payload is constructed THEN it does NOT include name, email, phone, or any text from the message field (strict no-PII rule)
4. GIVEN form events are collected over 30 days WHEN Shiun calculates the conversion rate THEN he can compute form_submit count divided by form_view count per page context
5. GIVEN a form submission fails (e.g., server error) WHEN the failure occurs THEN a `form_error` event fires with the error type but no PII, so submission failures can be monitored

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-09: Event Batching and Resilience
**As a** Kaz/Shiun (Go&C Admin)
**I want to** have events batched and resilient to network failures
**So that** no buyer signals are lost due to temporary connectivity issues or high-traffic periods

**Acceptance Criteria:**
1. GIVEN multiple events fire within a short window (e.g., page_view + content_view + content_save) WHEN the events are generated THEN they are queued locally and sent as a batch to the server within 2 seconds
2. GIVEN the user's network connection drops WHEN events are generated THEN events are stored in a local queue (localStorage or IndexedDB) and retried when connectivity resumes
3. GIVEN events have been queued offline WHEN the connection is restored THEN all queued events are sent in order with their original timestamps preserved
4. GIVEN the event API endpoint returns a 500 error WHEN the client receives the error THEN the events are retained in the queue and retried with exponential backoff (1s, 2s, 4s, up to 30s max)
5. GIVEN the local queue exceeds 100 events WHEN new events are generated THEN the oldest events are dropped to prevent excessive memory or storage usage, and a `queue_overflow` warning is logged

**Priority:** Should Have
**Feature:** F3
**Phase:** Core Development

---

### US-10: Daily Aggregation Cron Job
**As a** Kaz/Shiun (Go&C Admin)
**I want to** have raw events aggregated into daily summary tables by a scheduled cron job
**So that** the admin dashboard can query pre-computed metrics for fast rendering without scanning millions of raw events

**Acceptance Criteria:**
1. GIVEN the aggregation cron job runs daily at 02:00 UTC WHEN it processes the previous day's raw events THEN it produces aggregated rows in the `daily_metrics` table grouped by date, event_type, and each taxonomy dimension
2. GIVEN 500 content_view events were recorded yesterday for area "Niseko" WHEN the aggregation runs THEN the `daily_metrics` table contains a row with date, event_type: content_view, area: Niseko, count: 500
3. GIVEN the cron job aggregates by area, property type, use case, design style, and price range WHEN the job completes THEN each dimension has its own aggregated counts for the day
4. GIVEN the cron job encounters an error mid-run WHEN the error occurs THEN the job logs the error, skips the problematic batch, and continues processing remaining events, then sends an alert notification
5. GIVEN the cron job has completed WHEN Shiun loads the admin dashboard THEN all charts and metrics reflect data up to the previous day
6. GIVEN historical aggregated data exists WHEN the cron job runs for a new day THEN it inserts new rows without modifying existing aggregated rows (append-only pattern)

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-11: Privacy Safeguards in Event Tracking
**As a** Kaz/Shiun (Go&C Admin)
**I want to** ensure that no personally identifiable information is ever stored in the events table
**So that** the platform complies with APPI and Australian Privacy Act requirements and protects visitor privacy

**Acceptance Criteria:**
1. GIVEN any event is generated WHEN the event payload is constructed on the client THEN a validation function checks that no fields matching PII patterns (email regex, phone patterns, names) are present
2. GIVEN a visitor is authenticated WHEN events are generated THEN the event payload uses only the anonymous session_id, never the user's account ID, email, or name
3. GIVEN the session_id is assigned WHEN it is generated THEN it is a random UUID that cannot be reverse-engineered to identify a specific person
4. GIVEN session_ids are used for tracking WHEN a session expires (after 30 minutes of inactivity or browser close) THEN a new session_id is generated for subsequent events (session rotation)
5. GIVEN a code review is conducted on the event tracking module WHEN the reviewer inspects the payload construction THEN a documented checklist confirms: no IP logging, no user-agent fingerprinting, no PII fields in the schema

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development

---

### US-12: Event Payload Schema Validation
**As a** Kaz/Shiun (Go&C Admin)
**I want to** have all event payloads validated against a defined schema before storage
**So that** malformed or unexpected events do not pollute the analytics data and cause inaccurate dashboard metrics

**Acceptance Criteria:**
1. GIVEN a `content_view` event is sent to the API WHEN the server receives it THEN the payload is validated against the content_view schema requiring: event_type, timestamp, session_id, content_id, content_type, and taxonomy_tags object
2. GIVEN a `quiz_complete` event is sent WHEN validation runs THEN the schema requires: event_type, timestamp, session_id, quiz_type, quiz_session_id, responses array (each with question_id and selected_option_id), and result object
3. GIVEN an event payload is missing a required field WHEN validation fails THEN the event is rejected with a 400 status, an error is logged, and the client receives a structured error message
4. GIVEN an event payload contains an unexpected field (e.g., "email") WHEN validation runs THEN the unexpected field is stripped from the payload before storage and a warning is logged
5. GIVEN the event schema is updated WHEN a new event type is added THEN a corresponding JSON schema file is committed to the repository and the validation middleware is updated

**Priority:** Must Have
**Feature:** F3
**Phase:** Core Development
