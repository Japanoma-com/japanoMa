# User Stories: Buyer Interactions (F2)

**Project:** Japanoma — Buyer Insight Platform for Japan Property Investment
**Date:** 2026-02-27
**Feature Area:** F2 — Buyer Interactions

This feature area covers all interactive tools that enable prospective buyers to engage with content and express preferences. Buyer interactions are the primary source of insight signals on the platform. Save/bookmark functionality, the compare tool, three distinct quizzes (area preference, use case, and design style), the budget selector, and the contact/inquiry form all generate structured data that feeds into the admin dashboard. Each interaction is designed to feel useful to the buyer while simultaneously capturing valuable preference data for Go&C.

---

### US-01: Save Content to Bookmarks (Anonymous)
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** save articles and area pages to a personal bookmarks list without creating an account
**So that** I can keep track of content I find interesting during my casual research sessions

**Acceptance Criteria:**
1. GIVEN Emma is viewing an article detail page WHEN she clicks the "Save" bookmark icon THEN the icon state changes to "Saved" (filled) and the item is stored in localStorage
2. GIVEN Emma saves 3 articles WHEN she navigates to the "Saved Items" page THEN all 3 saved articles appear in a list with title, thumbnail, and the date they were saved
3. GIVEN Emma has saved an article WHEN she returns to that article later in the same browser THEN the bookmark icon shows the "Saved" state
4. GIVEN Emma clicks the "Save" icon on an already-saved item WHEN the action registers THEN the item is removed from her saved list and the icon returns to the unsaved state
5. GIVEN Emma has saved items in localStorage WHEN she clears her browser data THEN the saved items are lost and the "Saved Items" page shows an empty state with a prompt to create an account for persistent saves
6. GIVEN Emma saves an item WHEN the save event fires THEN an event is tracked with the content ID, content type (article or area), and all taxonomy tags associated with that content

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-02: Save Content to Bookmarks (Authenticated)
**As a** David Chen (Australian Property Investor)
**I want to** save articles and area pages to my account so they persist across devices
**So that** I can access my bookmarked research whether I am on my laptop at home or my phone on the go

**Acceptance Criteria:**
1. GIVEN David is logged in and viewing an article WHEN he clicks the "Save" icon THEN the item is saved to his user account in the database and the icon changes to "Saved"
2. GIVEN David saves an article on his laptop WHEN he logs in on his phone THEN the same article appears in his "Saved Items" page
3. GIVEN David had saved 5 items anonymously before creating an account WHEN he registers and logs in THEN all 5 previously saved items from localStorage are migrated to his account
4. GIVEN David views his "Saved Items" page WHEN items are displayed THEN each item shows the content title, thumbnail, taxonomy tags, and a "Remove" action
5. GIVEN David removes a saved item WHEN the removal is confirmed THEN the item is deleted from the database and no longer appears on the "Saved Items" page
6. GIVEN David has 20 saved items WHEN he views the "Saved Items" page THEN items are paginated or scrollable with the most recently saved items first
7. GIVEN David saves an item WHEN the save event fires THEN an event is tracked including the content ID, taxonomy tags, and a flag indicating the user is authenticated

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-03: Compare Tool Add Items
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** add area pages or articles to a comparison tray
**So that** I can evaluate multiple options side by side before deciding which areas to investigate further

**Acceptance Criteria:**
1. GIVEN Yuki is viewing the Hakuba area detail page WHEN she clicks the "Add to Compare" button THEN Hakuba is added to a comparison tray that appears as a sticky bar at the bottom of the screen
2. GIVEN Yuki has added Hakuba to the compare tray WHEN she navigates to the Niseko area detail page and clicks "Add to Compare" THEN Niseko is added alongside Hakuba in the tray, showing both items
3. GIVEN Yuki has 2 items in the compare tray WHEN she adds a third item (e.g., Kyoto) THEN the item is added and the tray shows 3 items
4. GIVEN Yuki already has 3 items in the compare tray WHEN she attempts to add a fourth item THEN a message informs her that the maximum of 3 items has been reached and suggests removing one first
5. GIVEN the compare tray has at least 2 items WHEN Yuki views the tray THEN a "Compare Now" button is visible and enabled
6. GIVEN Yuki adds an item to the compare tray WHEN the add event fires THEN a compare_add event is tracked with the item ID, item type, and current compare tray contents
7. GIVEN Yuki closes her browser and returns within the same session WHEN the page loads THEN the compare tray retains its items from localStorage

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-04: Compare Tool Side-by-Side View
**As a** David Chen (Australian Property Investor)
**I want to** view a side-by-side comparison of 2 to 3 areas
**So that** I can quickly see the differences in property types, price ranges, use cases, and lifestyle attributes

**Acceptance Criteria:**
1. GIVEN David has 3 areas in the compare tray (Niseko, Hakuba, Kyoto) WHEN he clicks "Compare Now" THEN a comparison page loads showing all 3 areas in adjacent columns
2. GIVEN the comparison page is displayed WHEN David views the content THEN each column shows the area name, hero image, prefecture, common property types, typical price range (JPY and AUD), popular use cases, and prevalent design styles
3. GIVEN the comparison page is displayed WHEN David views rows for shared attributes THEN values that differ between areas are visually highlighted for easy scanning
4. GIVEN David is on the comparison page WHEN he clicks the "X" remove button on the Kyoto column THEN Kyoto is removed and the remaining 2 areas adjust to fill the available space
5. GIVEN only 1 item remains after removal WHEN David views the page THEN a message prompts him to add more items or return to browsing, since comparison requires at least 2 items
6. GIVEN David views the comparison page on mobile WHEN the layout renders THEN items are displayed in a swipeable carousel or stacked with a tab selector rather than side-by-side columns

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-05: Area Preference Quiz
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** take a multi-step quiz about my area preferences (climate, proximity, amenities)
**So that** I can discover which Japanese areas match my lifestyle and investment interests

**Acceptance Criteria:**
1. GIVEN Emma clicks "Find Your Ideal Area" from the content hub or navigation WHEN the quiz loads THEN the first step presents a welcome screen explaining the quiz with an estimated completion time (2 to 3 minutes) and a "Start" button
2. GIVEN Emma starts the quiz WHEN step 1 appears THEN she is asked about climate preference with options such as "Cold/Snowy (Hokkaido, Nagano)", "Temperate (Tokyo, Osaka)", "Warm/Mild (Kyushu, Okinawa)"
3. GIVEN Emma completes step 1 WHEN step 2 appears THEN she is asked about proximity preference with options such as "Near a major city", "Rural/countryside", "Near ski resorts", "Near the coast"
4. GIVEN Emma completes all quiz steps (minimum 4 steps) WHEN she submits her final answer THEN a results page displays 2 to 3 recommended areas with explanations of why each area matches her preferences
5. GIVEN the quiz results are displayed WHEN Emma views a recommended area THEN a link to the full area detail page is provided for each recommendation
6. GIVEN Emma completes the quiz WHEN the quiz_complete event fires THEN the event payload includes all question-response pairs and the recommended areas without any personal identifying information
7. GIVEN Emma is partway through the quiz WHEN she navigates away and returns THEN the quiz resumes from where she left off (state stored in localStorage or session)

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-06: Use Case Quiz
**As a** David Chen (Australian Property Investor)
**I want to** take a quiz about my intended use for a Japan property
**So that** I can receive tailored content recommendations based on whether I want rental income, a holiday home, or a renovation project

**Acceptance Criteria:**
1. GIVEN David clicks "Discover Your Use Case" WHEN the quiz loads THEN a welcome step explains the quiz purpose and shows a "Start" button
2. GIVEN David starts the quiz WHEN step 1 appears THEN he is asked "What is your primary goal?" with options such as "Holiday home for personal use", "Rental income (short-term or long-term)", "Renovation project (Akiya)", "Lifestyle/retirement relocation", "Pure investment (capital growth)"
3. GIVEN David selects "Rental income" WHEN step 2 appears THEN he is asked follow-up questions relevant to his selection, such as "How much time will you spend in Japan per year?" with options like "Less than 2 weeks", "2 to 8 weeks", "More than 2 months"
4. GIVEN David completes all quiz steps WHEN the results page loads THEN a recommended use case profile is displayed with a description and 3 to 5 related articles or area pages
5. GIVEN the quiz results show a use case profile WHEN David views the recommendations THEN each recommended content item links to its full detail page
6. GIVEN David completes the quiz WHEN the quiz_complete event fires THEN all responses are tracked with question IDs and selected option IDs, plus the resulting use case profile
7. GIVEN David has already completed the use case quiz WHEN he revisits the quiz page THEN he is offered the choice to retake the quiz or view his previous results

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-07: Design Style Quiz with Image Pair Comparison
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** take a visual quiz comparing image pairs to determine my preferred design style
**So that** I can identify whether I lean toward Japandi, Wabi-sabi, Dark Japandi, or another aesthetic

**Acceptance Criteria:**
1. GIVEN Yuki clicks "Find Your Style" WHEN the quiz loads THEN a welcome screen explains the format: "Choose the image that appeals to you more in each pair"
2. GIVEN Yuki starts the quiz WHEN the first pair is presented THEN two high-quality interior/architecture images are shown side by side (or stacked on mobile), each representing a different design style
3. GIVEN the quiz presents image pairs WHEN Yuki progresses through the quiz THEN at least 5 pairs are shown, covering all major design styles (Japandi, Dark Japandi, Wabi-sabi, Seasonal Living, Contemporary Japanese)
4. GIVEN Yuki selects an image in each pair WHEN she completes all 5+ pairs THEN a results page shows her primary style match with a description and example properties
5. GIVEN the style result is "Wabi-sabi" WHEN Yuki views the result THEN the page displays a hero image in the Wabi-sabi style, a paragraph about the aesthetic, and links to content tagged with that design style
6. GIVEN Yuki completes the quiz WHEN the quiz_complete event fires THEN the event includes each pair presented, the choice made, and the resulting style profile
7. GIVEN Yuki is on a slow network connection WHEN the quiz loads THEN images are optimized (WebP, lazy-loaded for upcoming pairs) so the quiz remains responsive

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-08: Budget Selector
**As a** David Chen (Australian Property Investor)
**I want to** select a budget range and see prices in both JPY and AUD
**So that** I can filter content to properties within my investment capacity

**Acceptance Criteria:**
1. GIVEN David interacts with the budget selector on the content hub or a dedicated tool page WHEN the selector loads THEN predefined budget ranges are displayed: Under ¥5M (~A$50K), ¥5M to ¥15M (~A$50K to A$150K), ¥15M to ¥30M (~A$150K to A$300K), ¥30M to ¥50M (~A$300K to A$500K), ¥50M+ (~A$500K+)
2. GIVEN David selects the "¥15M to ¥30M" range WHEN the selection is applied THEN the content hub filters to show only articles and areas tagged within that price range
3. GIVEN David views any price range WHEN the display renders THEN both JPY and approximate AUD values are shown with a disclaimer about exchange rate variability
4. GIVEN David changes his budget selection WHEN the filter updates THEN the content hub re-filters immediately without a full page reload
5. GIVEN David selects a budget range WHEN the budget_select event fires THEN the event payload includes the selected range code, the JPY min/max, and the current page context

**Priority:** Should Have
**Feature:** F2
**Phase:** Core Development

---

### US-09: Contact/Inquiry Form
**As a** David Chen (Australian Property Investor)
**I want to** submit a contact inquiry expressing my interest in a specific area or property type
**So that** Go&C can follow up with me about investment opportunities that match my interests

**Acceptance Criteria:**
1. GIVEN David clicks "Get in Touch" or "Enquire" on an area page WHEN the contact form loads THEN it displays fields for full name, email address, phone (optional), message, and a multi-select for "Areas of Interest" pre-populated with the current area
2. GIVEN David fills in the form WHEN he views the bottom of the form THEN a consent checkbox is visible with disclosure text: "I consent to Go&C contacting me regarding Japan property investment opportunities. See our Privacy Policy."
3. GIVEN David completes all required fields and checks the consent box WHEN he clicks "Send Inquiry" THEN the form submits, a success confirmation is displayed, and the inquiry is stored in the database
4. GIVEN David submits the form without filling in the email field WHEN validation runs THEN an inline error message appears under the email field: "Email address is required"
5. GIVEN David submits the form without checking the consent box WHEN validation runs THEN the form does not submit and a message appears: "Please provide your consent to proceed"
6. GIVEN David successfully submits the form WHEN the form_submit event fires THEN the event includes the content context (area or article ID and taxonomy tags) but does NOT include any PII (no name, email, or phone in the event)
7. GIVEN David submits the form WHEN the submission is processed THEN a notification email is sent to the Go&C admin inbox with the inquiry details

**Priority:** Must Have
**Feature:** F2
**Phase:** Core Development

---

### US-10: Saved Items Page (Anonymous and Authenticated Views)
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** view all my saved/bookmarked items in one place
**So that** I can review and revisit content I found interesting across multiple browsing sessions

**Acceptance Criteria:**
1. GIVEN Emma is not logged in and has 4 saved items in localStorage WHEN she navigates to the "Saved Items" page THEN all 4 items are displayed with title, thumbnail, content type badge, and a "Remove" button
2. GIVEN Emma is not logged in WHEN the "Saved Items" page loads THEN a banner at the top encourages account creation: "Create a free account to sync your saves across devices"
3. GIVEN Emma removes a saved item WHEN the removal is confirmed THEN the item is deleted from localStorage and disappears from the list with a smooth animation
4. GIVEN Emma has no saved items WHEN the "Saved Items" page loads THEN an empty state illustration is shown with a prompt: "Start saving articles and areas you are interested in" and a link to the content hub
5. GIVEN David is logged in and has 10 saved items in his account WHEN he navigates to the "Saved Items" page THEN all items load from the database, sorted by most recently saved, with full taxonomy tags visible on each card
6. GIVEN David is logged in WHEN he views the "Saved Items" page THEN no localStorage banner is shown and instead he sees a count of his saved items (e.g., "10 saved items")

**Priority:** Should Have
**Feature:** F2
**Phase:** Core Development

---

### US-11: Quiz Results Sharing
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** share my quiz results via a link or social media
**So that** I can discuss my recommended area or design style with family and friends who might invest with me

**Acceptance Criteria:**
1. GIVEN Yuki completes the area preference quiz WHEN the results page loads THEN "Share Results" buttons are visible for copying a link, sharing to Facebook, and sharing to LINE
2. GIVEN Yuki clicks "Copy Link" WHEN the action completes THEN a unique shareable URL is copied to her clipboard and a toast notification confirms "Link copied"
3. GIVEN a friend opens Yuki's shared result link WHEN the page loads THEN the same results are displayed (recommended areas and explanations) without requiring the friend to take the quiz
4. GIVEN the shared results page loads WHEN the friend views it THEN a call to action says "Take the quiz yourself to get personalized recommendations"
5. GIVEN Yuki shares the link WHEN the share URL is constructed THEN the URL contains an encoded result identifier but no personal information about Yuki

**Priority:** Could Have
**Feature:** F2
**Phase:** QA + Launch

---

### US-12: Compare Tool Persistence for Authenticated Users
**As a** David Chen (Australian Property Investor)
**I want to** have my compare tray persist across sessions when I am logged in
**So that** I do not lose my comparison selection when I close my browser and return the next day

**Acceptance Criteria:**
1. GIVEN David is logged in and adds 3 items to the compare tray WHEN the items are added THEN the compare tray state is saved to his user account in the database
2. GIVEN David closes his browser WHEN he returns and logs in the next day THEN the compare tray is restored with the same 3 items
3. GIVEN David is logged in on his laptop with 2 items in the compare tray WHEN he logs in on his phone THEN the same 2 items appear in the compare tray
4. GIVEN David had items in the compare tray while anonymous WHEN he logs in THEN the anonymous compare tray items merge with any account-saved compare items, up to the maximum of 3
5. GIVEN David removes all items from the compare tray while logged in WHEN the tray is empty THEN the database record is updated to reflect an empty compare tray

**Priority:** Could Have
**Feature:** F2
**Phase:** Core Development

---

### US-13: Area Preference Quiz Accessibility
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** complete the area preference quiz using keyboard navigation and screen reader
**So that** I can participate in the interactive features regardless of how I access the web

**Acceptance Criteria:**
1. GIVEN Emma navigates the quiz using only the keyboard WHEN she presses Tab THEN focus moves logically through the quiz options and navigation buttons (Back, Next)
2. GIVEN Emma uses a screen reader WHEN the quiz step loads THEN the question text and all options are announced with clear labels (e.g., "Option 1 of 4: Cold/Snowy regions including Hokkaido and Nagano")
3. GIVEN Emma selects an option using the keyboard (Space or Enter) WHEN the selection registers THEN a visual and audible confirmation is provided (aria-selected state change)
4. GIVEN Emma reaches the quiz results WHEN the screen reader reads the page THEN the recommended areas are announced in order with their names and match explanations
5. GIVEN the quiz progress indicator is displayed WHEN a screen reader encounters it THEN the current step and total steps are announced (e.g., "Step 2 of 5")

**Priority:** Should Have
**Feature:** F2
**Phase:** QA + Launch

---

### US-14: Contact Form Auto-population from Context
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** have the contact form auto-populate with context about the area or article I am viewing
**So that** I do not need to manually describe what I am interested in when reaching out to Go&C

**Acceptance Criteria:**
1. GIVEN Yuki clicks "Enquire" from the Hakuba area detail page WHEN the contact form loads THEN the "Areas of Interest" field is pre-populated with "Hakuba"
2. GIVEN Yuki clicks "Enquire" from an article about Akiya renovation in Nara WHEN the form loads THEN the context section shows "Related to: Renovating an Akiya in Nara" and the "Areas of Interest" includes "Nara"
3. GIVEN Yuki has completed the area preference quiz with a result of Niseko WHEN she opens the contact form from the quiz results page THEN "Niseko" is pre-populated in the "Areas of Interest" field
4. GIVEN the form is auto-populated WHEN Yuki views the fields THEN she can modify or remove any pre-populated values before submitting
5. GIVEN the form is auto-populated WHEN Yuki submits the form THEN the submission data includes the context source (area page, article, or quiz result) for Go&C's reference

**Priority:** Should Have
**Feature:** F2
**Phase:** Core Development
