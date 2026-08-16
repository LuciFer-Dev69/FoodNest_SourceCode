# FoodNest UAT — Requirements Traceability Matrix

This matrix maps each **Use Case** to its **UAT scenario(s)** and the **supporting
Playwright automated test(s)** that provide functional evidence. The evidence
screenshots live under `frontend/test-results/screenshots/<spec-name>/` and the
HTML report at `frontend/playwright-report/index.html`.

Legend — Evidence type:
- **A** = Automated Playwright test (spec file + test name)
- **S** = Captured screenshot(s) in `frontend/test-results/screenshots/`
- **R** = Playwright HTML report (`frontend/playwright-report/index.html`) and
  `.last-run.json` (`status: passed`, `failedTests: []`)

---

## UC1 — Register Users and Privacy Settings

| UAT ID | Scenario (short) | Type | Supporting Playwright test (spec: test name) | Evidence |
|---|---|---|---|---|
| UAT-01 | New member registers, completes 2FA, reaches dashboard | E2E / Positive | `use-case-1-register-settings.spec.ts`: *user registers and configures privacy/security preferences*; *rejects invalid 2FA code during registration* | A, S, R |
| UAT-02 | Registered user logs in and accesses dashboard | Positive | `use-case-1-register-settings.spec.ts`: *user logs in with valid credentials* | A, S, R |
| UAT-03 | Registration with an already-registered email is rejected | Negative | `use-case-1-register-settings.spec.ts`: *rejects duplicate email* | A, S, R |
| UAT-04 | Invalid email format and empty required fields are rejected | Negative | `use-case-1-register-settings.spec.ts`: *rejects invalid email format on register*; *rejects empty required fields on register* | A, S, R |
| UAT-05 | Privacy & notification preferences persist after re-login | Positive | `use-case-1-register-settings.spec.ts`: *user configures all privacy and notification preferences from dashboard*; *user registers and configures privacy/security preferences* | A, S, R |
| UAT-06 | User changes password and logs in with the new password | Positive | `use-case-1-register-settings.spec.ts`: *user changes password from settings* | A, S, R |
| UAT-07 | Unauthenticated users are redirected to login | Negative / Security | `use-case-1-register-settings.spec.ts`: *redirects unauthenticated users to login*; *redirects /register to /login?mode=register* | A, S, R |

## UC2 — Manage Food Inventory

| UAT ID | Scenario (short) | Type | Supporting Playwright test (spec: test name) | Evidence |
|---|---|---|---|---|
| UAT-08 | User adds, edits, and deletes inventory items | E2E / Positive | `use-case-2-inventory.spec.ts`: *user adds, edits, and deletes inventory items*; *delete item via trash button directly removes it* | A, S, R |
| UAT-09 | User finds items using search, filters, and sort | Positive | `use-case-2-inventory.spec.ts`: *searches inventory items*; *filters items by category*; *filters items by storage location*; *filters items by status*; *sorts inventory items*; *toggles between grid and list views* | A, S, R |
| UAT-10 | Saving an item with missing required fields is rejected | Negative | `use-case-2-inventory.spec.ts`: *rejects add with missing required fields* | A, S, R |
| UAT-11 | User tracks used / expiring-soon items | Positive | `use-case-2-inventory.spec.ts`: *marks item as used by deleting it*; *filters items by status*; *handles zero quantity gracefully* | A, S, R |

## UC3 — Browse Food Items and Claim Donations

| UAT ID | Scenario (short) | Type | Supporting Playwright test (spec: test name) | Evidence |
|---|---|---|---|---|
| UAT-12 | Donor publishes a donation; a second user claims it end to end | E2E / Positive | `use-case-3-browse-claim-donations.spec.ts`: *user browses available food listings and claims a donation*; *claimant receives confirmation notification* | A, S, R |
| UAT-13 | A donor cannot claim their own donation | Negative | `use-case-3-browse-claim-donations.spec.ts`: *cannot claim own donation* | A, S, R |
| UAT-14 | An already-claimed donation cannot be claimed again | Negative | `use-case-3-browse-claim-donations.spec.ts`: *rejects claim on already-claimed donation* | A, S, R |
| UAT-15 | Publishing a donation with missing fields is rejected | Negative | `use-case-3-browse-claim-donations.spec.ts`: *rejects create donation with missing fields* | A, S, R |
| UAT-16 | User filters/searches donations and views pickup/location details | Positive | `use-case-3-browse-claim-donations.spec.ts`: *filters donations by category*; *searches donations by keyword*; *browses donations by location in detail view* | A, S, R |
| UAT-17 | Donor edits and deletes a donation listing | Positive | `use-case-3-browse-claim-donations.spec.ts`: *donor edits a donation listing*; *donor deletes a donation listing* | A, S, R |
| UAT-18 | Donor shares a donation to the community feed | Positive | `use-case-3-browse-claim-donations.spec.ts`: *published donation appears in community feed when shared* | A, S, R |

## UC4 — Food Analytics

| UAT ID | Scenario (short) | Type | Supporting Playwright test (spec: test name) | Evidence |
|---|---|---|---|---|
| UAT-19 | User views analytics dashboard with stats, charts, and period filters | Positive | `use-case-4-analytics.spec.ts`: *user views analytics dashboard with stats and charts* | A, S, R |
| UAT-20 | User sees food-saved, waste, performance score, and sustainability insights | Positive | `use-case-4-analytics.spec.ts`: *shows food saved, waste, and performance progress indicators*; *shows sustainability stats and progress indicators* | A, S, R |

## UC5 — View Notifications

| UAT ID | Scenario (short) | Type | Supporting Playwright test (spec: test name) | Evidence |
|---|---|---|---|---|
| UAT-21 | User receives donation-created and expiry notifications | Positive | `use-case-5-notifications.spec.ts`: *user receives and manages notifications*; *receives expiry notification for items expiring soon* | A, S, R |
| UAT-22 | User manages notifications (mark all read, clear read, filter, search) | Positive | `use-case-5-notifications.spec.ts`: *user receives and manages notifications*; *notifications filter and sort works* | A, S, R |
| UAT-23 | User navigates to the relevant page by clicking a notification | Positive | `use-case-5-notifications.spec.ts`: *filters notifications by type and navigates on click* | A, S, R |

## UC6 — Plan Weekly Meals

| UAT ID | Scenario (short) | Type | Supporting Playwright test (spec: test name) | Evidence |
|---|---|---|---|---|
| UAT-24 | User generates a weekly meal plan | Positive | `use-case-6-meal-planner.spec.ts`: *user generates and views a weekly meal plan* | A, S, R |
| UAT-25 | Meal planner suggests recipes based on pantry ingredients | Positive | `use-case-6-meal-planner.spec.ts`: *smart suggestions are based on inventory ingredients* | A, S, R |
| UAT-26 | User clears and saves a meal plan | Positive | `use-case-6-meal-planner.spec.ts`: *user clears meal plan and starts fresh*; *user can save a meal plan* | A, S, R |

---

## Evidence inventory (as found in the repository)

| Evidence artifact | Location | Detail |
|---|---|---|
| Playwright `.last-run.json` | `frontend/test-results/.last-run.json` | `{"status": "passed", "failedTests": []}` |
| Screenshots per use case | `frontend/test-results/screenshots/<spec-name>/` | UC1: 30, UC2: 17, UC3: 19, UC4: 11, UC5: 15, UC6: 11 (total 103 step screenshots; full set 207 PNG files incl. retry captures) |
| Playwright HTML report | `frontend/playwright-report/index.html` | Full report of the 6 spec files / 43 tests |
| Playwright traces | `frontend/test-results/` | Trace files per failed/retried test |
| Backend API tests (supporting) | `backend/tests/auth.test.js` | Jest + Supertest for auth endpoints |
