# User Stories: User Accounts (F4)

**Project:** Japanoma — Buyer Insight Platform for Japan Property Investment
**Date:** 2026-02-27
**Feature Area:** F4 — User Accounts

This feature area covers user registration, authentication, session management, and profile functionality. Accounts are optional on the platform; visitors can browse content and use most interactive tools anonymously. However, creating an account unlocks persistent saves across devices, quiz result history, and a richer profile experience. The account system must also handle the critical "session migration" flow where anonymous activity (saves, compare tray, quiz results) is seamlessly transferred to a newly created account. All account operations must comply with privacy requirements and provide clear consent mechanisms.

---

### US-01: Registration with Email and Password
**As a** David Chen (Australian Property Investor)
**I want to** register for an account using my email address and a password
**So that** I can access my saved content and quiz results across multiple devices and sessions

**Acceptance Criteria:**
1. GIVEN David clicks "Create Account" or "Sign Up" WHEN the registration form loads THEN it displays fields for email address, password, confirm password, and a consent checkbox
2. GIVEN David fills in all fields correctly WHEN he enters a password THEN the password must meet minimum requirements: at least 8 characters, containing at least one uppercase letter, one lowercase letter, and one number
3. GIVEN David enters a valid email and matching passwords WHEN he checks the consent box ("I agree to the Terms of Service and Privacy Policy") and clicks "Register" THEN the account is created and David is logged in automatically
4. GIVEN David enters an email already associated with an existing account WHEN he clicks "Register" THEN an error message appears: "An account with this email already exists. Please log in or reset your password."
5. GIVEN David registers successfully WHEN the account is created THEN a verification email is sent to his address with a confirmation link
6. GIVEN David does not check the consent checkbox WHEN he clicks "Register" THEN the form does not submit and a validation message appears: "You must agree to the Terms of Service and Privacy Policy to create an account"
7. GIVEN David registers successfully WHEN the registration event fires THEN a `user_register` event is tracked with a flag for consent_given: true, but no PII in the event payload

**Priority:** Must Have
**Feature:** F4
**Phase:** Core Development

---

### US-02: Login with Email and Password
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** log in to my existing account using my email and password
**So that** I can access my saved content, quiz history, and comparison items

**Acceptance Criteria:**
1. GIVEN Yuki clicks "Log In" WHEN the login form loads THEN it displays fields for email and password, plus a "Remember me" checkbox and a "Forgot password?" link
2. GIVEN Yuki enters her correct email and password WHEN she clicks "Log In" THEN she is authenticated and redirected to the page she was on before clicking login
3. GIVEN Yuki enters an incorrect password WHEN she clicks "Log In" THEN an error message appears: "Invalid email or password. Please try again." without specifying which field was wrong
4. GIVEN Yuki fails to log in 5 times consecutively WHEN she attempts a sixth login THEN rate limiting is applied with a message: "Too many login attempts. Please try again in 15 minutes."
5. GIVEN Yuki logs in successfully WHEN the login event fires THEN a `user_login` event is tracked with session_id and login_method: email, but no PII
6. GIVEN Yuki has items in her anonymous localStorage (saves, compare tray) WHEN she logs in THEN the session migration process begins automatically (see US-04)
7. GIVEN Yuki is already logged in WHEN she navigates to the login page THEN she is redirected to her profile page with a message: "You are already logged in"

**Priority:** Must Have
**Feature:** F4
**Phase:** Core Development

---

### US-03: Password Reset Flow
**As a** David Chen (Australian Property Investor)
**I want to** reset my password if I forget it
**So that** I can regain access to my account without losing my saved data

**Acceptance Criteria:**
1. GIVEN David clicks "Forgot password?" on the login page WHEN the reset form loads THEN a single field for email address is displayed with a "Send Reset Link" button
2. GIVEN David enters his registered email WHEN he clicks "Send Reset Link" THEN a password reset email is sent to that address with a unique, time-limited reset link (valid for 1 hour)
3. GIVEN David enters an email that does not exist in the system WHEN he clicks "Send Reset Link" THEN the same success message is shown ("If an account exists with this email, a reset link has been sent") to prevent email enumeration
4. GIVEN David clicks the reset link in the email WHEN the reset page loads THEN he sees fields for "New Password" and "Confirm New Password"
5. GIVEN David enters a new valid password WHEN he clicks "Reset Password" THEN his password is updated, all existing sessions are invalidated, and he is redirected to the login page with a success message
6. GIVEN the reset link has expired (older than 1 hour) WHEN David clicks it THEN an error page appears: "This reset link has expired. Please request a new one." with a link to the forgot password form
7. GIVEN David resets his password WHEN the reset completes THEN a `password_reset` event is tracked with a timestamp and method: email_link, but no PII

**Priority:** Must Have
**Feature:** F4
**Phase:** Core Development

---

### US-04: Session Migration (Anonymous to Authenticated)
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** have all my anonymous activity (saved items, compare tray, quiz results) transferred to my new account when I register
**So that** I do not lose the research I have already done on the platform

**Acceptance Criteria:**
1. GIVEN Emma has saved 4 articles anonymously in localStorage WHEN she registers for a new account THEN all 4 saved articles are migrated to her account in the database
2. GIVEN Emma has 2 items in her anonymous compare tray WHEN she registers THEN the compare tray items are saved to her account and the compare tray displays the same items post-login
3. GIVEN Emma has completed the design style quiz anonymously with a result of "Japandi" WHEN she registers THEN the quiz result is associated with her account and visible on her profile page
4. GIVEN Emma registers and session migration runs WHEN the migration completes THEN localStorage data for saves, compare tray, and quiz results is cleared to avoid duplication
5. GIVEN Emma had saved the same article both anonymously and (in a previous session) on an existing account WHEN migration runs THEN duplicates are detected and only one instance is kept in the account saves
6. GIVEN session migration fails due to a server error WHEN the error occurs THEN localStorage data is preserved (not cleared), an error is logged, and Emma is shown a non-blocking warning: "Some of your saved data could not be transferred. Please try refreshing the page."
7. GIVEN session migration completes successfully WHEN Emma views her "Saved Items" page THEN she sees all migrated items alongside any previously saved account items, sorted by most recently saved

**Priority:** Must Have
**Feature:** F4
**Phase:** Core Development

---

### US-05: User Profile with Saved Items and Quiz Results
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** view my profile page showing my saved items and quiz results
**So that** I have a personalized dashboard of my Japan property research

**Acceptance Criteria:**
1. GIVEN Yuki is logged in WHEN she navigates to "My Profile" THEN the page displays her email address (partially masked, e.g., y***@email.com), account creation date, and sections for Saved Items and Quiz Results
2. GIVEN Yuki has 8 saved items WHEN the Saved Items section loads THEN items are displayed as cards with title, thumbnail, content type, and taxonomy tags, sorted by most recently saved
3. GIVEN Yuki has completed the area preference quiz and the design style quiz WHEN the Quiz Results section loads THEN each quiz result is shown with the quiz name, completion date, and result summary (e.g., "Your Style: Wabi-sabi", "Recommended Area: Niseko")
4. GIVEN Yuki clicks on a quiz result WHEN the result detail loads THEN the full quiz result page is displayed with all recommendations and explanations
5. GIVEN Yuki has not completed any quizzes WHEN the Quiz Results section loads THEN an empty state message appears: "You have not completed any quizzes yet" with links to available quizzes
6. GIVEN Yuki views her profile on mobile WHEN the page renders THEN all sections are stacked vertically with appropriate touch targets and readable text

**Priority:** Should Have
**Feature:** F4
**Phase:** Core Development

---

### US-06: Profile Editing
**As a** David Chen (Australian Property Investor)
**I want to** edit my profile details such as display name and notification preferences
**So that** I can personalize my account and control how Go&C communicates with me

**Acceptance Criteria:**
1. GIVEN David navigates to "Edit Profile" WHEN the form loads THEN it displays editable fields for display name (optional), email address (read-only, shown for reference), and notification preferences
2. GIVEN David enters a display name "Dave" WHEN he clicks "Save Changes" THEN the display name is updated and reflected across the platform (e.g., in the header greeting "Welcome, Dave")
3. GIVEN David changes his notification preference from "All updates" to "Important only" WHEN he saves THEN the preference is stored and future communications respect the setting
4. GIVEN David attempts to save an empty display name WHEN validation runs THEN the field accepts an empty value (display name is optional) and the platform defaults to showing the first part of his email
5. GIVEN David edits his profile WHEN the changes are saved THEN a success toast notification confirms "Profile updated successfully"

**Priority:** Could Have
**Feature:** F4
**Phase:** Core Development

---

### US-07: Account Deletion
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** delete my account and all associated data
**So that** I can exercise my right to data removal if I no longer wish to use the platform

**Acceptance Criteria:**
1. GIVEN Emma navigates to "Account Settings" WHEN the page loads THEN a "Delete Account" option is visible in a clearly marked danger zone section
2. GIVEN Emma clicks "Delete Account" WHEN the confirmation dialog appears THEN it warns: "This will permanently delete your account, saved items, quiz results, and all associated data. This action cannot be undone."
3. GIVEN Emma confirms deletion by typing "DELETE" in the confirmation field WHEN she clicks "Confirm Delete" THEN her account and all associated data (saves, quiz results, compare tray, profile) are removed from the database
4. GIVEN Emma's account is deleted WHEN the deletion completes THEN she is logged out and redirected to the homepage with a confirmation message: "Your account has been deleted"
5. GIVEN Emma's account is deleted WHEN the deletion is processed THEN any raw events associated with her session IDs remain in the events table but are fully anonymized (no link to the deleted account)
6. GIVEN Emma tries to log in with her deleted email WHEN she enters credentials THEN the login fails with "Invalid email or password" (the system does not reveal that the account was deleted)
7. GIVEN Emma requests account deletion WHEN the request is logged THEN a `user_delete` event is recorded with a timestamp and a flag indicating user-initiated deletion, for compliance audit purposes

**Priority:** Must Have
**Feature:** F4
**Phase:** Core Development

---

### US-08: Remember Me and Persistent Login
**As a** David Chen (Australian Property Investor)
**I want to** stay logged in across browser sessions when I check "Remember me"
**So that** I do not need to re-enter my credentials every time I visit the platform

**Acceptance Criteria:**
1. GIVEN David checks the "Remember me" checkbox during login WHEN he logs in successfully THEN a persistent session token is set with an expiration of 30 days
2. GIVEN David did not check "Remember me" WHEN he logs in THEN a session-only cookie is set that expires when the browser is closed
3. GIVEN David checked "Remember me" 15 days ago WHEN he returns to the platform THEN he is still logged in without needing to re-authenticate
4. GIVEN David's persistent token has expired (older than 30 days) WHEN he visits the platform THEN he is prompted to log in again
5. GIVEN David is logged in with "Remember me" WHEN he explicitly clicks "Log Out" THEN the persistent token is invalidated and he must log in again to access his account
6. GIVEN David changes his password WHEN the password update completes THEN all "Remember me" tokens for his account are invalidated (forcing re-login on all devices)

**Priority:** Should Have
**Feature:** F4
**Phase:** Core Development

---

### US-09: Email Verification
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** verify my email address after registration
**So that** Go&C can confirm my identity and I can receive important account communications

**Acceptance Criteria:**
1. GIVEN Yuki has just registered WHEN the registration completes THEN a verification email is sent to her address with a unique confirmation link valid for 24 hours
2. GIVEN Yuki clicks the verification link WHEN the link is processed THEN her account is marked as "verified" and she is redirected to the platform with a success message: "Email verified successfully"
3. GIVEN Yuki has not verified her email WHEN she logs in THEN a banner at the top of the page reminds her: "Please verify your email address" with a "Resend verification email" link
4. GIVEN Yuki clicks "Resend verification email" WHEN the request is processed THEN a new verification email is sent and a cooldown of 2 minutes is enforced before she can request another
5. GIVEN the verification link has expired WHEN Yuki clicks it THEN a page displays: "This verification link has expired" with a button to resend the verification email
6. GIVEN Yuki has not verified her email WHEN she uses the platform THEN she can still save items, take quizzes, and browse content without restriction (verification is not a blocker for core features)

**Priority:** Should Have
**Feature:** F4
**Phase:** Core Development

---

### US-10: OAuth Social Login
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** sign up or log in using my Google account
**So that** I can create an account quickly without managing another password

**Acceptance Criteria:**
1. GIVEN Emma clicks "Continue with Google" on the registration or login page WHEN the OAuth flow initiates THEN she is redirected to Google's authentication page
2. GIVEN Emma authorizes the Japanoma application on Google WHEN the OAuth callback returns THEN a new account is created (or existing account is logged in) and Emma is redirected to the platform
3. GIVEN Emma registers via Google WHEN her account is created THEN her email is automatically verified (since Google has already verified it) and no separate verification email is sent
4. GIVEN Emma has an existing email/password account WHEN she tries to log in with Google using the same email THEN the accounts are linked and she can use either method to log in going forward
5. GIVEN Emma logs in with Google WHEN session migration runs THEN anonymous localStorage data (saves, compare, quiz results) is migrated to her account just as with email/password registration
6. GIVEN Emma uses Google login WHEN the login event fires THEN the event includes login_method: google but no PII from the Google profile

**Priority:** Could Have
**Feature:** F4
**Phase:** Core Development
