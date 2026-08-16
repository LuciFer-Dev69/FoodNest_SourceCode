# FoodNest UAT — Test Cases (UAT-01 … UAT-26)

Each scenario describes a **realistic end-user workflow** for Use Cases 1–6 and
the acceptance criteria it validates. The **Actual Result** and **Status** fields
are intentionally blank so the UAT can be executed and recorded live (see also
`04-execution-log.md`).

**Status values:** Pass / Fail / Blocked · **Type:** Positive / Negative / E2E

---

## Use Case 1 — Register Users and Privacy Settings

### UAT-01 — New community member registers, completes 2FA, and reaches their dashboard

| Field | Value |
|---|---|
| **UAT ID** | UAT-01 |
| **Related Use Case** | UC1 — Register Users and Privacy Settings |
| **Type** | E2E / Positive |
| **User / Actor** | New visitor (unregistered community member) |
| **Business / User Goal** | As a new user I want to create my FoodNest account securely so that I can start using the platform (track pantry, share/claim food, plan meals). |
| **Preconditions** | Application is running; user is logged out; registration page available at `/login?mode=register`. |
| **Test Data** | Name: `UAT Member`; Email: unique `uat1_<timestamp>@foodnest.test`; Password: `SecurePass1!`; 2FA code displayed on screen. |
| **Steps** | 1. Open the landing page. 2. Go to the registration form. 3. Enter name, email, and password. 4. Submit "Create Account". 5. Enter the on-screen 2FA code. 6. Confirm/verify. 7. Observe landing page after registration. |
| **Expected Result** | Account is created; after valid 2FA the user is taken to the personal dashboard (`/app/dashboard`) with a greeting, proving authenticated access. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | New users can self-register and must complete 2FA; registration grants immediate, authenticated access to the dashboard. |
| **Supporting Playwright evidence** | `use-case-1-register-settings.spec.ts` — *user registers and configures privacy/security preferences* (screenshots `01-landing-page`, `02-register-form`, `03-dashboard-after-register`); *rejects invalid 2FA code during registration* (screenshot `02-invalid-2fa-error`, confirming 2FA codes are validated). |

---

### UAT-02 — Registered user logs in and accesses the functionality required for their role

| Field | Value |
|---|---|
| **UAT ID** | UAT-02 |
| **Related Use Case** | UC1 |
| **Type** | Positive |
| **User / Actor** | Registered user (household member) |
| **Business / User Goal** | As a returning user I want to log in and reach my dashboard so that I can continue managing my household food activities. |
| **Preconditions** | A user account already exists; user is logged out. |
| **Test Data** | Email: `<existing unique email>`; Password: `SecurePass1!`. |
| **Steps** | 1. Go to the login page. 2. Enter valid credentials. 3. Submit "Sign In". 4. Confirm the dashboard opens. 5. Verify the sidebar exposes the main functional areas (Dashboard, Inventory, Donations, Analytics, Planner, Notifications, Settings). |
| **Expected Result** | Login succeeds; the user lands on `/app/dashboard` and can access all role-relevant areas of the platform. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Registered users can authenticate and access the functionality required for their role. |
| **Supporting Playwright evidence** | `use-case-1-register-settings.spec.ts` — *user logs in with valid credentials* (screenshots `01-logged-out`, `02-logged-in`, `03-dashboard-visible`). |

---

### UAT-03 — Registration with an already-registered email is rejected

| Field | Value |
|---|---|
| **UAT ID** | UAT-03 |
| **Related Use Case** | UC1 |
| **Type** | Negative |
| **User / Actor** | New visitor attempting to reuse an existing email |
| **Business / User Goal** | As a user I expect the system to prevent duplicate accounts so that my email identity stays unique. |
| **Preconditions** | An account with the chosen email already exists; user is logged out. |
| **Test Data** | Name: `UAT User B`; Email: the previously registered email; Password: `SecurePass1!`. |
| **Steps** | 1. Open registration form. 2. Enter the already-used email. 3. Submit "Create Account". 4. Observe the response. |
| **Expected Result** | The system rejects the submission with a clear "already exists" message and does not create a second account. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Duplicate email addresses are rejected with a clear, user-friendly message. |
| **Supporting Playwright evidence** | `use-case-1-register-settings.spec.ts` — *rejects duplicate email* (screenshot `duplicate-email-error`). |

---

### UAT-04 — Invalid email format and empty required fields are rejected

| Field | Value |
|---|---|
| **UAT ID** | UAT-04 |
| **Related Use Case** | UC1 |
| **Type** | Negative |
| **User / Actor** | New visitor entering invalid registration data |
| **Business / User Goal** | As a user I want immediate feedback when my registration details are invalid so that I can correct them instead of wondering if registration failed. |
| **Preconditions** | User is logged out; registration form open. |
| **Test Data** | Case A: email `notanemail`; Case B: all fields empty. |
| **Steps** | Case A: 1. Enter a name and password. 2. Enter malformed email. 3. Submit. 4. Observe validation. — Case B: 1. Submit empty form. 2. Observe validation errors. |
| **Expected Result** | Invalid email shows a "valid email" error; empty submission shows required-field errors; no account is created. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Registration validates email format and required fields with clear inline errors. |
| **Supporting Playwright evidence** | `use-case-1-register-settings.spec.ts` — *rejects invalid email format on register* (screenshot `invalid-email-error`); *rejects empty required fields on register* (screenshot `empty-fields-errors`). |

---

### UAT-05 — Privacy and notification preferences persist after re-login

| Field | Value |
|---|---|
| **UAT ID** | UAT-05 |
| **Related Use Case** | UC1 |
| **Type** | Positive |
| **User / Actor** | Registered user configuring account preferences |
| **Business / User Goal** | As a user I want my privacy and notification choices to be remembered so that I do not have to reconfigure them on every visit. |
| **Preconditions** | User is registered and logged in. |
| **Test Data** | Preference labels: Public profile, Show donations publicly, Allow community messages, Show online status, Inventory reminders, Donation updates, Community activity, Meal reminders, Weekly reports, Email notifications, Push notifications. |
| **Steps** | 1. Open Settings. 2. Toggle several privacy and notification preferences; confirm each saves. 3. Leave Settings and return (or log out and log back in). 4. Verify each toggled preference is still in the chosen state. |
| **Expected Result** | Every preference change is saved ("settings saved") and persists across navigation / re-login. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Privacy and notification preferences are persisted per user and restored correctly. |
| **Supporting Playwright evidence** | `use-case-1-register-settings.spec.ts` — *user configures all privacy and notification preferences from dashboard* (screenshots `03-all-settings-toggled`, `05-settings-persisted`); *user registers and configures privacy/security preferences* (screenshot `11-settings-persisted`). |

---

### UAT-06 — User changes password and logs in with the new password

| Field | Value |
|---|---|
| **UAT ID** | UAT-06 |
| **Related Use Case** | UC1 |
| **Type** | Positive |
| **User / Actor** | Registered user managing account security |
| **Business / User Goal** | As a user I want to change my password so that I can protect my account. |
| **Preconditions** | User is registered and logged in with current password `SecurePass1!`. |
| **Test Data** | Current password: `SecurePass1!`; New password: `NewSecure1!`; Confirm: `NewSecure1!`. |
| **Steps** | 1. Open Settings. 2. Open the password-change dialog. 3. Enter current and new password (twice). 4. Submit. 5. Log out. 6. Log in using the new password. |
| **Expected Result** | Password update succeeds; the user can log in with the new password, proving the change took effect. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Users can update their password and the new credentials work. |
| **Supporting Playwright evidence** | `use-case-1-register-settings.spec.ts` — *user changes password from settings* (screenshot `04-logged-in-with-new-password`). |

---

### UAT-07 — Unauthenticated access to protected areas is redirected to login

| Field | Value |
|---|---|
| **UAT ID** | UAT-07 |
| **Related Use Case** | UC1 |
| **Type** | Negative / Security |
| **User / Actor** | Unauthenticated visitor |
| **Business / User Goal** | As a visitor I should not be able to access account areas without signing in, so that user data remains private. |
| **Preconditions** | User is logged out (no valid token). |
| **Test Data** | Protected URL: `/app/dashboard`; register shortcut `/register`. |
| **Steps** | 1. Clear session. 2. Try to open `/app/dashboard`. 3. Observe redirect. 4. Open `/register`. 5. Observe redirect to the registration form. |
| **Expected Result** | Both attempts are redirected to the login page (dashboard → `/login`; `/register` → `/login?mode=register`); protected content is never shown. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Protected routes enforce authentication and redirect unauthenticated users. |
| **Supporting Playwright evidence** | `use-case-1-register-settings.spec.ts` — *redirects unauthenticated users to login* (screenshot `redirected-to-login`); *redirects /register to /login?mode=register* (screenshot `register-redirect`). |

---

## Use Case 2 — Manage Food Inventory

### UAT-08 — User adds, edits, and deletes pantry items

| Field | Value |
|---|---|
| **UAT ID** | UAT-08 |
| **Related Use Case** | UC2 — Manage Food Inventory |
| **Type** | E2E / Positive |
| **User / Actor** | Registered user (household member) |
| **Business / User Goal** | As a household member I want to log my groceries (add, correct, remove) so that my pantry list stays accurate. |
| **Preconditions** | User is registered and logged in; inventory is empty or contains no conflicting item. |
| **Test Data** | Add: `Test Apple`, qty `3`, unit `pcs`, category `Produce`, location `Fridge`, expiry `+7 days`. Edit: rename to `Test Apple (Updated)`, qty `5`. Delete: remove the item. |
| **Steps** | 1. Open Inventory. 2. "Add Item". 3. Fill the form and save. 4. Confirm the item appears. 5. Edit the item (name + quantity) and save. 6. Confirm the updated item appears. 7. Delete the item. 8. Confirm it disappears. |
| **Expected Result** | The item is added, updated, and removed successfully with the UI reflecting each change. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Users can create, update, and delete inventory items; changes persist and display correctly. |
| **Supporting Playwright evidence** | `use-case-2-inventory.spec.ts` — *user adds, edits, and deletes inventory items* (screenshots `03-item-added`, `04-item-edited`, `05-item-deleted`); *delete item via trash button directly removes it* (screenshot `delete-confirmed`). |

---

### UAT-09 — User finds items quickly using search, filters, and sort

| Field | Value |
|---|---|
| **UAT ID** | UAT-09 |
| **Related Use Case** | UC2 |
| **Type** | Positive |
| **User / Actor** | Registered user with a populated pantry |
| **Business / User Goal** | As a household member I want to quickly find a specific item (by search, category, location, status, or alphabetical sort) so that managing a large pantry is fast. |
| **Preconditions** | User is logged in; several inventory items exist across categories and locations (e.g. `Apple`, `Milk`, `Zebra Cake`, `Apple Juice`). |
| **Test Data** | Search term `Apple`; category `Dairy`; location `Fridge`; status `Expiring soon`; sort by name. |
| **Steps** | 1. Open Inventory. 2. Search for `Apple`; verify matching items shown and non-matching hidden. 3. Filter by category/location; verify only matching items remain. 4. Filter by status; verify expiring items shown. 5. Sort by name; verify alphabetical order. |
| **Expected Result** | Search, filters, and sort all narrow/order the list correctly with no unrelated items shown. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Inventory supports search, category/location/status filters, and name sorting. |
| **Supporting Playwright evidence** | `use-case-2-inventory.spec.ts` — *searches inventory items* (screenshot `search-apple-results`); *filters items by category* (`filtered-dairy-only`); *filters items by storage location* (`filtered-fridge-only`); *filters items by status* (`filtered-expiring-soon`); *sorts inventory items* (`sorted-a-z`); *toggles between grid and list views* (`list-view`, `grid-view`). |

---

### UAT-10 — Saving an item with missing required fields is rejected

| Field | Value |
|---|---|
| **UAT ID** | UAT-10 |
| **Related Use Case** | UC2 |
| **Type** | Negative |
| **User / Actor** | Registered user adding an incomplete item |
| **Business / User Goal** | As a user I want clear feedback when required item details are missing so that I do not lose data or create broken entries. |
| **Preconditions** | User is logged in; inventory page open. |
| **Test Data** | Submit with empty food name, quantity, and expiration date. |
| **Steps** | 1. Open Inventory. 2. Open "Add Item". 3. Submit without filling required fields. 4. Observe the message. |
| **Expected Result** | The save is rejected with a message such as "food name, quantity, and expiration date are required"; no item is created. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Required inventory fields are validated and missing data is clearly reported. |
| **Supporting Playwright evidence** | `use-case-2-inventory.spec.ts` — *rejects add with missing required fields* (screenshot `missing-fields-toast`). |

---

### UAT-11 — User tracks used and expiring-soon items

| Field | Value |
|---|---|
| **UAT ID** | UAT-11 |
| **Related Use Case** | UC2 |
| **Type** | Positive |
| **User / Actor** | Registered user (household member) |
| **Business / User Goal** | As a user I want to mark items as used/removed and see which items are expiring soon so that I avoid waste. |
| **Preconditions** | User is logged in; an item exists that expires within 1 day (`Expiring Banana`) and another that is fresh. |
| **Test Data** | Item `Used Item` qty `3`; item `Expiring Banana` expiring in 1 day. |
| **Steps** | 1. Open Inventory. 2. Mark the `Used Item` as used (via delete/trash). 3. Confirm it is removed and a "removed" confirmation appears. 4. Apply the "Expiring soon" status filter. 5. Confirm the expiring item is shown and fresh items are not. |
| **Expected Result** | The used item is removed with confirmation; expiring items are surfaced by the status filter. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Users can mark items used and identify items that are expiring soon. |
| **Supporting Playwright evidence** | `use-case-2-inventory.spec.ts` — *marks item as used by deleting it* (screenshot `item-marked-used`); *filters items by status* (`filtered-expiring-soon`); *handles zero quantity gracefully* (supplementary, `zero-qty-added` / `zero-qty-rejected`). |

---

## Use Case 3 — Browse Food Items and Claim Donations

### UAT-12 — Donor publishes a donation and a second user claims it end to end

| Field | Value |
|---|---|
| **UAT ID** | UAT-12 |
| **Related Use Case** | UC3 — Browse Food Items and Claim Donations |
| **Type** | E2E / Positive (multi-actor) |
| **User / Actor** | Donor (publishes) → Claimant / Seeker (claims) |
| **Business / User Goal** | As a donor I want to list surplus food with pickup details so that a neighbour can claim it; as a seeker I want to find and claim it so that food is not wasted. |
| **Preconditions** | Two separate accounts exist (donor and claimant); both are logged in at different points; no conflicting listings. |
| **Test Data** | Donation: `Donation Test <timestamp>`, qty `5` kg, category `Produce`, expiry `+7 days`, pickup date `+7 days`, pickup time `5-7pm`, address `Baneshwor, Kathmandu`. |
| **Steps** | 1. Donor opens Donations and publishes the listing. 2. Donor confirms the listing is live. 3. Donor logs out; claimant logs in. 4. Claimant browses Donations and finds the listing. 5. Claimant opens "View Details" and verifies expiry, pickup date and time, and location. 6. Claimant clicks "Claim Donation" and sees the confirmation. |
| **Expected Result** | The donation is published, visible to another user, contains full pickup/location details, and can be claimed with a "donation claimed" confirmation. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Full donation workflow: publish → browse → view details → claim; donation visible to other users with correct details. |
| **Supporting Playwright evidence** | `use-case-3-browse-claim-donations.spec.ts` — *user browses available food listings and claims a donation* (screenshots `03-donation-published`, `05-claimant-browse-donations`, `06-donation-detail-modal`, `07-donation-claimed`, `08-claim-confirmation`); *claimant receives confirmation notification* (screenshot `claim-notification-shown`). |

---

### UAT-13 — A donor cannot claim their own donation

| Field | Value |
|---|---|
| **UAT ID** | UAT-13 |
| **Related Use Case** | UC3 |
| **Type** | Negative |
| **User / Actor** | Donor viewing their own listing |
| **Business / User Goal** | As a donor I should not be able to claim my own donation, so that claims are genuine. |
| **Preconditions** | Donor is logged in; donor has published a listing. |
| **Test Data** | Donation: `Own Donation <timestamp>`, qty `3` kg, `Produce`, expiry `+7 days`. |
| **Steps** | 1. Open Donations. 2. Locate the donor's own listing. 3. Attempt to view details / claim it. |
| **Expected Result** | The system does not offer "Claim Donation" on the user's own listing (no claim button for own donations). |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Users cannot claim their own donation listings. |
| **Supporting Playwright evidence** | `use-case-3-browse-claim-donations.spec.ts` — *cannot claim own donation* (screenshot `own-donation-no-claim`). |

---

### UAT-14 — An already-claimed donation cannot be claimed again

| Field | Value |
|---|---|
| **UAT ID** | UAT-14 |
| **Related Use Case** | UC3 |
| **Type** | Negative |
| **User / Actor** | Third user (another seeker) |
| **Business / User Goal** | As a seeker I should not be able to claim food that someone else already claimed, so that claims remain fair. |
| **Preconditions** | Donor published a donation; claimant already claimed it; a third account exists. |
| **Test Data** | Donation: `Already Claimed <timestamp>`, qty `2` kg, `Produce`, expiry `+7 days`. |
| **Steps** | 1. Donor publishes the listing. 2. Claimant claims it. 3. Log out; log in as third user. 4. Browse Donations and look for the listing. 5. Attempt to claim it. |
| **Expected Result** | The claimed donation is no longer available to other users (hidden / cannot be claimed). |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | A donation can be claimed only once; already-claimed donations are unavailable to others. |
| **Supporting Playwright evidence** | `use-case-3-browse-claim-donations.spec.ts` — *rejects claim on already-claimed donation* (screenshot `already-claimed-not-visible`). |

---

### UAT-15 — Publishing a donation with missing fields is rejected

| Field | Value |
|---|---|
| **UAT ID** | UAT-15 |
| **Related Use Case** | UC3 |
| **Type** | Negative |
| **User / Actor** | Donor entering incomplete donation details |
| **Business / User Goal** | As a donor I want the system to require the key donation details so that claims are actionable and complete. |
| **Preconditions** | Donor is logged in; donation page open. |
| **Test Data** | Submit with no food name and no quantity. |
| **Steps** | 1. Open Donations. 2. Open "List a Donation". 3. Submit without food name and quantity. 4. Observe the message. |
| **Expected Result** | Publishing is rejected with a "food name and quantity are required" message; no listing is created. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Donation creation validates required fields. |
| **Supporting Playwright evidence** | `use-case-3-browse-claim-donations.spec.ts` — *rejects create donation with missing fields* (screenshot `create-donation-missing-fields`). |

---

### UAT-16 — User filters/searches donations and views pickup & location details

| Field | Value |
|---|---|
| **UAT ID** | UAT-16 |
| **Related Use Case** | UC3 |
| **Type** | Positive |
| **User / Actor** | Claimant / Seeker browsing available food |
| **Business / User Goal** | As a seeker I want to narrow the donation list by category/keyword and confirm the pickup location before deciding to claim. |
| **Preconditions** | Several donations exist across categories (e.g. `Produce Donation`, `Dairy Donation`, `Fresh Strawberries`, `Cheddar Cheese`). |
| **Test Data** | Filter category `Dairy`; search keyword `Strawberries`. |
| **Steps** | 1. Open Donations. 2. Filter by category `Dairy`; verify only dairy items shown. 3. Search `Strawberries`; verify matching donation shown and others hidden. 4. Open "View Details" of a listing; verify pickup information and location are displayed. |
| **Expected Result** | Category filter and keyword search return the correct donations; the detail view shows pickup/date/time/location details. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Donations are searchable and filterable by category; location/pickup details are visible before claiming. |
| **Supporting Playwright evidence** | `use-case-3-browse-claim-donations.spec.ts` — *filters donations by category* (`filtered-dairy-donations`); *searches donations by keyword* (`search-strawberries`); *browses donations by location in detail view* (`donation-location-detail`). |

---

### UAT-17 — Donor edits and deletes a donation listing

| Field | Value |
|---|---|
| **UAT ID** | UAT-17 |
| **Related Use Case** | UC3 |
| **Type** | Positive |
| **User / Actor** | Donor managing their listings |
| **Business / User Goal** | As a donor I want to correct or withdraw a listing when details change or food is no longer available. |
| **Preconditions** | Donor is logged in; donor has published a listing. |
| **Test Data** | Listing `Editable Donation <timestamp>` → rename to `Editable Donation <timestamp> (Updated)`; then a `Deletable Donation <timestamp>` to remove. |
| **Steps** | 1. Open Donations. 2. Edit the listing name and save. 3. Confirm the updated name is shown. 4. Delete the second listing. 5. Confirm it disappears. |
| **Expected Result** | The donor can edit (update persists) and delete their own listings; the UI reflects both changes. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Donors can edit and delete their own donation listings. |
| **Supporting Playwright evidence** | `use-case-3-browse-claim-donations.spec.ts` — *donor edits a donation listing* (`donation-edited`); *donor deletes a donation listing* (`donation-deleted`). |

---

### UAT-18 — Donor shares a donation to the community feed

| Field | Value |
|---|---|
| **UAT ID** | UAT-18 |
| **Related Use Case** | UC3 |
| **Type** | Positive |
| **User / Actor** | Donor (community member) |
| **Business / User Goal** | As a donor I want to share a donation to the community feed so that more neighbours see it. |
| **Preconditions** | Donor is logged in; community feed exists. |
| **Test Data** | Donation `Community Donation <timestamp>`, qty `4` kg, `Produce`, expiry `+7 days`, pickup `4-6pm`, with "Share to community" checked. |
| **Steps** | 1. Open Donations. 2. List a donation and tick "Share to community". 3. Publish. 4. Open Community. 5. Verify the donation appears as a food-donation post. |
| **Expected Result** | The shared donation appears in the community feed with a food-donation label. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Donations can be shared to the community feed and are visible there. |
| **Supporting Playwright evidence** | `use-case-3-browse-claim-donations.spec.ts` — *published donation appears in community feed when shared* (`donation-shared-to-community`, `donation-post-in-community`). |

---

## Use Case 4 — Food Analytics

### UAT-19 — User views the analytics dashboard with stats, charts, and period filters

| Field | Value |
|---|---|
| **UAT ID** | UAT-19 |
| **Related Use Case** | UC4 — Food Analytics |
| **Type** | Positive |
| **User / Actor** | Registered user (household member) |
| **Business / User Goal** | As a user I want to see a dashboard of my food activity (inventory, donations, meals, community) so that I understand how I use FoodNest. |
| **Preconditions** | User is logged in; has at least one inventory item added. |
| **Test Data** | One inventory item (`Analytics Apple`, qty `5`, `Produce`, expiry `+7 days`). |
| **Steps** | 1. Add an inventory item (so analytics has data). 2. Open Analytics. 3. Verify stat cards (Inventory Items, Active Donations, Meals Planned, Community Posts). 4. Verify chart sections (Weekly Activity, Inventory Categories, Monthly Donations, Food Status). 5. Switch period filters (`7d`, `30d`, `90d`) and confirm the page updates. |
| **Expected Result** | Analytics loads with correct stat cards, charts, and responsive period filters. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Analytics dashboard displays key stats, charts, and working period filters. |
| **Supporting Playwright evidence** | `use-case-4-analytics.spec.ts` — *user views analytics dashboard with stats and charts* (screenshots `03-analytics-page`, `04-stat-cards`, `05-charts-visible`, `06-period-filters`). |

---

### UAT-20 — User sees food-saved, waste, performance score, and sustainability insights

| Field | Value |
|---|---|
| **UAT ID** | UAT-20 |
| **Related Use Case** | UC4 |
| **Type** | Positive |
| **User / Actor** | Registered user interested in zero-waste insights |
| **Business / User Goal** | As a user I want to see how much food I saved/wasted and my sustainability performance so that I can improve my zero-waste habits. |
| **Preconditions** | User is logged in; has inventory and at least one donation. |
| **Test Data** | Inventory item `Progress Banana` (qty `2`); donation `Progress Donation` (qty `5`, `Produce`). |
| **Steps** | 1. Add inventory and publish a donation. 2. Open Analytics. 3. Verify the Waste % indicator, Donation Success, CO₂ Saved, and Items Saved metrics. 4. Verify the FoodNest Score progress ring and breakdown. 5. Verify a smart insight/recommendation is present. |
| **Expected Result** | Analytics shows food-saved/waste/CO₂/score indicators and at least one insight. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Analytics reports food saved, waste, performance score, and sustainability insights. |
| **Supporting Playwright evidence** | `use-case-4-analytics.spec.ts` — *shows food saved, waste, and performance progress indicators* (`01-analytics-loaded`, `02-sustainability-metrics`, `03-performance-score`, `04-insights`); *shows sustainability stats and progress indicators* (`sustainability-section`). |

---

## Use Case 5 — View Notifications

### UAT-21 — User receives donation-created and expiry notifications

| Field | Value |
|---|---|
| **UAT ID** | UAT-21 |
| **Related Use Case** | UC5 — View Notifications |
| **Type** | Positive |
| **User / Actor** | Registered user |
| **Business / User Goal** | As a user I want to be notified about platform activity (a donation I published, or pantry items expiring soon) so that I can act on time. |
| **Preconditions** | User is logged in. |
| **Test Data** | Donation `Notif Test <timestamp>` (qty `3`); inventory item `Expiring Item <timestamp>` expiring in 1 day. |
| **Steps** | 1. Open Notifications (confirm initially empty). 2. Publish a donation. 3. Re-open Notifications and verify a donation-created notification appears. 4. Add an item expiring tomorrow. 5. Open Notifications again (allow check-expiry to run) and verify an expiry notification appears. |
| **Expected Result** | Notifications are generated for donation creation and for items expiring soon, and are visible in the Notifications page. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | The system generates donation-created and inventory-expiry notifications. |
| **Supporting Playwright evidence** | `use-case-5-notifications.spec.ts` — *user receives and manages notifications* (`02-notifications-empty`, `03-donation-created`, `04-notifications-populated`); *receives expiry notification for items expiring soon* (`03-notifications-after-expiry`, `04-expiry-notification-visible`). |

---

### UAT-22 — User manages notifications (mark all read, clear read, filter, search)

| Field | Value |
|---|---|
| **UAT ID** | UAT-22 |
| **Related Use Case** | UC5 |
| **Type** | Positive |
| **User / Actor** | Registered user with several notifications |
| **Business / User Goal** | As a user I want to keep my notifications organised (mark read, clear read, filter by status, search) so that I can focus on what matters. |
| **Preconditions** | User is logged in and has unread notifications. |
| **Test Data** | At least one unread notification; status filters "Unread"/"Read"; search placeholder `search notification`. |
| **Steps** | 1. Open Notifications. 2. Click "Mark all read" and confirm notifications are marked. 3. Click "Clear read" and confirm read notifications are removed. 4. Use the "Unread"/"Read" filters. 5. Use the search box. |
| **Expected Result** | Notifications can be marked read, cleared, filtered by status/type, and searched. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Notification management (mark-all-read, clear-read, filters, search) works. |
| **Supporting Playwright evidence** | `use-case-5-notifications.spec.ts` — *user receives and manages notifications* (`05-marked-all-read`, `06-cleared-read`); *notifications filter and sort works* (`filtered-unread`, `filters-visible`). |

---

### UAT-23 — User navigates to the relevant page by clicking a notification

| Field | Value |
|---|---|
| **UAT ID** | UAT-23 |
| **Related Use Case** | UC5 |
| **Type** | Positive |
| **User / Actor** | Registered user acting on a notification |
| **Business / User Goal** | As a user I want to click a notification and be taken to the relevant screen so that I can act immediately. |
| **Preconditions** | User is logged in; a donation-created notification exists. |
| **Test Data** | Donation `Click Donation <timestamp>` (qty `3`, expiry `+7 days`). |
| **Steps** | 1. Publish a donation (generates a notification). 2. Open Notifications. 3. Filter by type `Donation`. 4. Verify a donation notification is shown. 5. Click the notification and confirm navigation to the Donations page. |
| **Expected Result** | Clicking the notification navigates the user to the Donations page. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Notifications support click-through navigation to the related feature. |
| **Supporting Playwright evidence** | `use-case-5-notifications.spec.ts` — *filters notifications by type and navigates on click* (`02-filtered-donation-type`, `03-navigated-to-donations`). |

---

## Use Case 6 — Plan Weekly Meals

### UAT-24 — User generates a weekly meal plan

| Field | Value |
|---|---|
| **UAT ID** | UAT-24 |
| **Related Use Case** | UC6 — Plan Weekly Meals |
| **Type** | Positive |
| **User / Actor** | Registered user (household member) |
| **Business / User Goal** | As a user I want to generate a weekly meal plan so that I can organise breakfast, lunch, and dinner for the week. |
| **Preconditions** | User is logged in. |
| **Test Data** | None required (random plan generation). |
| **Steps** | 1. Open Planner. 2. Click "Generate Random Plan". 3. Verify meals appear in the grid (3+ meals). 4. Verify the planner summary/stats area. |
| **Expected Result** | A weekly plan is generated and displayed in the meal grid with summary stats. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Users can generate a weekly meal plan. |
| **Supporting Playwright evidence** | `use-case-6-meal-planner.spec.ts` — *user generates and views a weekly meal plan* (`03-plan-generated`, `04-meals-in-grid`, `05-planner-with-meals`). |

---

### UAT-25 — Meal planner suggests recipes based on pantry ingredients

| Field | Value |
|---|---|
| **UAT ID** | UAT-25 |
| **Related Use Case** | UC6 |
| **Type** | Positive |
| **User / Actor** | Registered user with pantry items |
| **Business / User Goal** | As a user I want recipe suggestions that use what I already have (e.g. eggs) so that I plan meals around my inventory and reduce waste. |
| **Preconditions** | User is logged in; inventory contains `Eggs` (qty `6`, expiry `+3 days`). |
| **Test Data** | Inventory item `Eggs` qty `6` pcs, category `Produce`. |
| **Steps** | 1. Add `Eggs` to Inventory. 2. Open Planner and generate a plan (to reveal suggestions panel). 3. Verify the "Smart suggestions" panel appears. 4. Verify egg-based recipes (e.g. Boiled Eggs / Omelette / Egg Fried Rice) are suggested. |
| **Expected Result** | Smart suggestions appear and include recipes based on the eggs available in inventory. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Meal planner suggests recipes based on available inventory ingredients. |
| **Supporting Playwright evidence** | `use-case-6-meal-planner.spec.ts` — *smart suggestions are based on inventory ingredients* (`03-planner-with-suggestions`, `04-egg-suggestions-visible`). |

---

### UAT-26 — User clears and saves a meal plan

| Field | Value |
|---|---|
| **UAT ID** | UAT-26 |
| **Related Use Case** | UC6 |
| **Type** | Positive |
| **User / Actor** | Registered user managing their week |
| **Business / User Goal** | As a user I want to save the plan I like and clear it to start fresh, so that I control my weekly schedule. |
| **Preconditions** | User is logged in. |
| **Test Data** | None required. |
| **Steps** | 1. Open Planner. 2. Generate a plan. 3. Click "Save" and confirm the plan saves. 4. Click "Clear All" and confirm the plan clears (accepting any confirmation dialog). |
| **Expected Result** | The plan can be saved and cleared; both actions complete successfully with feedback. |
| **Actual Result** | *(blank)* |
| **Status** | *(blank)* |
| **Acceptance Criteria validated** | Users can save a meal plan and clear the plan to start fresh. |
| **Supporting Playwright evidence** | `use-case-6-meal-planner.spec.ts` — *user can save a meal plan* (`plan-saved`, `save-attempted`); *user clears meal plan and starts fresh* (`after-clear`). |
