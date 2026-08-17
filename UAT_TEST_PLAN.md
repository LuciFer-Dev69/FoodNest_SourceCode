# FoodNest – User Acceptance Testing (UAT) Plan

**Version:** 1.0
**Status:** Draft
**Author:** QA / Product Team
**Last Updated:** 2026-08-17

---

## 1. Overview

### 1.1 Purpose
This document defines the approach, scope, and test cases for User Acceptance Testing (UAT) of
the **FoodNest** smart food sustainability & donation platform. UAT verifies that the application
meets the business requirements from a real end-user perspective and that it is ready for
production go-live.

### 1.2 Objectives
- Validate that every user-facing feature works end-to-end as a real user would use it.
- Confirm the business requirements (use cases UC1–UC9) are satisfied.
- Identify defects, gaps, and usability issues before go-live.
- Obtain formal sign-off from business stakeholders.

### 1.3 Application Summary
FoodNest (originally *Food Karma Collective*) is a full-stack application that:
- Tracks household food inventory with expiration alerts.
- Enables community food donation and claiming (Food Karma Collective).
- Provides weekly meal planning built around expiring inventory.
- Reports waste & savings analytics with sustainability badges.

**Stack:** React 19 + Vite + TanStack Start (frontend) · Node/Express + Mongoose + JWT (backend) · MongoDB.

---

## 2. Scope

### 2.1 In Scope
| Area | Route(s) |
|---|---|
| Registration, Login, 2FA, Forgot Password | `/`, `/login`, `/register`, `/forgot-password` |
| Dashboard | `/app/dashboard` |
| Food Inventory | `/app/inventory` |
| Donations (marketplace) | `/app/donations` |
| Food Connect (coordination) | `/app/food-connect`, `/app/food-connect/:id` |
| Community (feed, saved, nearby, map) | `/app/community`, `/app/community/saved`, `/app/community/nearby`, `/app/community/donation-map` |
| Analytics | `/app/analytics` |
| Weekly Meal Planner | `/app/planner` |
| Notifications | `/app/notifications` |
| Settings (privacy, notifications, password) | `/app/settings` |
| Profile | `/app/profile` |
| Help | `/app/help` |

### 2.2 Out of Scope
- Backend-only APIs and database internals (covered by Jest/Supertest suites).
- Google OAuth provider configuration/credentials.
- Performance/load testing, penetration testing.
- Third-party integrations beyond the app's own API.

---

## 3. Environment & Prerequisites

### 3.1 Test Environment Checklist
- [ ] Node.js v18+ (repo pins v22.15.0 via Volta)
- [ ] MongoDB running locally on `27017` (or Atlas URI)
- [ ] Backend `.env` created in `backend/` with `PORT=8080`, `JWT_SECRET`, `MONGODB_URI`
- [ ] Frontend `.env` created in `frontend/` (proxies `/api` → `http://localhost:8080`)

### 3.2 Setup Steps
```bash
# Backend
cd backend
npm install
npm start          # expect: "MongoDB connected successfully!" and "listening on port 8080"

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev        # open http://localhost:5173
```

### 3.3 Test Data & Reset
- Each UAT test uses a **fresh unique email** (e.g. `uat_<timestamp>@foodnest.test`) so
  duplicate-email behavior can be verified and old data does not interfere.
- Recommended shared data setup:
  - **Donor user** – creates donation listings.
  - **Claimant user** – browses and claims donations.
  - **Planner user** – has inventory items for smart suggestions.
- To reset data: drop the MongoDB `FoodNest` database and restart the backend.

### 3.4 Evidence
- Screenshot each completed step (browser screenshots, full-page).
- Automated suites provide supplementary evidence (see §5.2).

---

## 4. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| **UAT Tester / Business User** | Executes test cases, records Pass/Fail, reports defects with evidence. |
| **Business / Product Owner** | Confirms business acceptance criteria, approves scope changes, signs off. |
| **Developer** | Fixes accepted defects, triages bug reports, supports environment setup. |
| **Test Lead / Coordinator** | Tracks execution, manages the defect log, prepares sign-off pack. |

---

## 5. Test Strategy

### 5.1 Manual UAT Execution
- Testers execute the manual test case sheets in **Section 9** in the order of use cases.
- Record result for every test case: **Pass / Fail / Blocked** with remarks.
- Capture a screenshot for every Fail and, where practical, for key Pass steps.
- Re-verify fixed defects (retest) and check for regressions on adjacent features.

### 5.2 Automated Supporting Suites
Automated tests provide fast regression evidence. Run them before manual UAT begins and after
each defect fix.

**Backend API tests:**
```bash
cd backend
npm test          # Jest + Supertest (auth, e2e)
```

**Frontend E2E UAT suites (Playwright):**
```bash
cd frontend
npx playwright test          # runs all 6 use-case specs
npx playwright test --ui     # visual/step-by-step UI runner
npx playwright test --debug  # step-through debugging
```
Reports are written to `frontend/playwright-report/`.

### 5.3 Data & Defect Flow
1. Execute a test case.
2. Record result in the execution log (§7).
3. If Failed/Blocked → raise a defect (§10) and attach screenshots.
4. Developer fixes → retest the case → update log.
5. All high-priority defects resolved → business sign-off (§11).

---

## 6. Entry / Exit / Suspension Criteria

### 6.1 Entry Criteria
- [ ] Backend and frontend run successfully in the UAT environment.
- [ ] Automated suites pass (backend `npm test`; frontend `npx playwright test`).
- [ ] Test data/users prepared.
- [ ] Environment URLs and credentials documented.
- [ ] UAT team roles confirmed.

### 6.2 Exit Criteria (Go-Live Gate)
- [ ] 100% of in-scope test cases executed.
- [ ] 100% of **Critical** and **High** defects closed and verified.
- [ ] No **Critical/High** defects open.
- [ ] Business owner signs the UAT Certificate (§11).

### 6.3 Suspension / Resumption Criteria
- **Suspend** when a Critical defect blocks an entire flow (e.g., cannot register/login) or the
  environment is down for > 4 hours.
- **Resume** when the blocker is fixed and the blocked area is stable, then retest from the point
  of suspension.

---

## 7. Test Schedule & Execution Log (Template)

| Test ID | Use Case | Date | Tester | Result (P/F/B) | Defect ID | Remarks |
|---|---|---|---|---|---|---|
| UC1-01 | Register & Settings | | | | | |
| UC2-01 | Inventory | | | | | |
| UC3-01 | Donations | | | | | |
| UC4-01 | Analytics | | | | | |
| UC5-01 | Notifications | | | | | |
| UC6-01 | Meal Planner | | | | | |
| UC7-01 | Food Connect | | | | | |
| UC8-01 | Community | | | | | |
| UC9-01 | Profile & Help | | | | | |

---

## 8. Traceability Matrix

| Use Case | Business Requirement | Page(s) | Automated Spec |
|---|---|---|---|
| UC1 – Register & Privacy Settings | Users can register, secure login, manage privacy/notification preferences | `/login`, `/register`, `/app/settings`, `/app/dashboard` | `use-case-1-register-settings.spec.ts` |
| UC2 – Manage Food Inventory | Users can track groceries, expiry, categories, locations | `/app/inventory` | `use-case-2-inventory.spec.ts` |
| UC3 – Browse & Claim Donations | Users can list, browse, and claim excess food | `/app/donations`, `/app/community` | `use-case-3-browse-claim-donations.spec.ts` |
| UC4 – Food Analytics | Users see savings, waste, score, insights | `/app/analytics` | `use-case-4-analytics.spec.ts` |
| UC5 – View Notifications | Users receive and manage alerts | `/app/notifications` | `use-case-5-notifications.spec.ts` |
| UC6 – Plan Weekly Meals | Users build a weekly meal plan | `/app/planner` | `use-case-6-meal-planner.spec.ts` |
| UC7 – Food Connect | Coordinate food rescue/delivery | `/app/food-connect`, `/app/food-connect/:id` | — (manual) |
| UC8 – Community | Feed, saved posts, nearby, donation map | `/app/community`, `.../saved`, `.../nearby`, `.../donation-map` | — (manual) |
| UC9 – Profile & Help | Users manage profile and access help | `/app/profile`, `/app/help` | — (manual) |

---

## 9. Manual Test Case Sheets

> **How to execute:** For each test, read the Preconditions, perform the Steps, and compare the
> actual outcome with the Expected Result. Record **Pass / Fail / Blocked** and remarks.

---

### UC1 — Register Users & Privacy Settings
*(Automated: `frontend/tests/use-case-1-register-settings.spec.ts`)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC1-01 | Fresh browser | Open `http://localhost:5173/` | Landing page loads with brand & value props |
| UC1-02 | — | Go to `/login?mode=register`; fill Name/Email/Password (strong pw); click **Create Account** | 2FA code screen appears (`2fa-code` element) |
| UC1-03 | 2FA screen shown | Enter the displayed code; click **Verify & Complete** | Redirected to `/app/dashboard` |
| UC1-04 | — | Register with invalid email (`notanemail`) | Validation error: "valid email" |
| UC1-05 | — | Click **Create Account** with empty fields | Validation errors shown for required fields |
| UC1-06 | One registered user | Register again with the **same email** | Error: "already exists" |
| UC1-07 | Logged out | Visit `/app/dashboard` unauthenticated | Redirected to `/login` |
| UC1-08 | — | Visit `/register` | Redirected to `/login?mode=register` |
| UC1-09 | Registered user | Log out; log in with valid credentials | Land on `/app/dashboard` with greeting heading |
| UC1-10 | Registration 2FA shown | Enter wrong code `999999` | Error: "Invalid 2FA" |
| UC1-11 | Logged in | Settings → toggle **Show donations publicly** | "Settings saved" toast; toggle state changes |
| UC1-12 | Logged in | Settings → toggle **Public profile** | "Settings saved" toast |
| UC1-13 | Logged in | Settings → toggle **Inventory reminders** | "Settings saved" toast |
| UC1-14 | Toggles changed | Navigate Dashboard → Settings again | Toggles persist (state retained) |
| UC1-15 | Logged in | Settings → toggle all: Public profile, Show donations publicly, Allow community messages, Show online status, Inventory reminders, Donation updates, Community activity, Meal reminders, Weekly reports, Email notifications, Push notifications | Each shows "Settings saved"; all persist after reload |
| UC1-16 | Logged in | Settings → **Update** → enter current password + new password twice → **Update** | Password updated; login works with new password |

---

### UC2 — Manage Food Inventory
*(Automated: `frontend/tests/use-case-2-inventory.spec.ts`)*

> **Known gap:** The UI does **not** currently support converting inventory items directly into
> donation listings from the inventory screen (donations are created on the Donations page).
> Do not test this as a Pass requirement — record as N/A until the feature ships.

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC2-01 | Logged in | Inventory → **Add Item** → fill name, quantity, unit, category, location, expiry → **Save Item** | Item appears in list/grid |
| UC2-02 | Item exists | Edit item (rename, change quantity) → **Save Changes** | Updated values displayed |
| UC2-03 | Item exists | Delete item via trash icon | Item removed from inventory |
| UC2-04 | — | **Add Item** → **Save Item** with empty required fields | Error toast: "food name, quantity, and expiration date are required" |
| UC2-05 | — | Add item with quantity `0` | Handled gracefully (either added or rejected with clear error) |
| UC2-06 | Produce + Dairy items | Click **Dairy** filter pill | Only Dairy items shown; Produce hidden |
| UC2-07 | Fridge + Pantry items | Click **Fridge** location pill | Only Fridge items shown |
| UC2-08 | Items exist | Search "Apple" | Only matching items shown |
| UC2-09 | Items exist | Sort by name (A–Z) | Items ordered alphabetically |
| UC2-10 | Expiring + fresh items | Click **Expiring Soon** pill | Only expiring items shown |
| UC2-11 | Expiring items | Click **Expired** pill | No expired items shown for fresh data |
| UC2-12 | Item exists | Toggle **List** view, then **Grid** view | View switches; item still visible |
| UC2-13 | Item exists | Mark item as used (delete/removed action) | "Removed" toast; item no longer visible |

---

### UC3 — Browse Food Items & Claim Donations
*(Automated: `frontend/tests/use-case-3-browse-claim-donations.spec.ts`)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC3-01 | Donor logged in | Donations → **List a Donation** → fill name, quantity, unit, category, description, expiry, pickup date/time, address → **Publish Donation** | Donation appears on the Donations page |
| UC3-02 | Donation published by another user | As a second user, open Donations page | Donation card visible; **View Details** button present |
| UC3-03 | Detail modal open | Verify pickup date, pickup time, expiry shown | All details displayed |
| UC3-04 | Claimant on detail modal | Click **Claim Donation** | "Donation claimed" confirmation shown |
| UC3-05 | Donor viewing own donation | Open own listing | No **Claim** button on own donation |
| UC3-06 | Donation already claimed | A third user opens the listing | Claimed donation is no longer visible/claimable |
| UC3-07 | — | **List a Donation** → **Publish Donation** empty | Error: "food name and quantity are required" |
| UC3-08 | Produce + Dairy donations | Click **Dairy** filter pill | Only Dairy donations shown |
| UC3-09 | Donations exist | Search "Strawberries" | Only matching donations shown |
| UC3-10 | Donation exists | Open **View Details** | Pickup/location detail visible |
| UC3-11 | Donor own listing | Edit listing (rename) → **Save Changes** | Updated name displayed |
| UC3-12 | Donor own listing | Delete listing via trash icon | Listing removed |
| UC3-13 | Donor publishes with **Share to community** checked | Publish → open Community page | Donation appears as a community post ("food donation") |
| UC3-14 | Donation claimed | Claimant opens Notifications | Claim confirmation notification visible |

---

### UC4 — Food Analytics
*(Automated: `frontend/tests/use-case-4-analytics.spec.ts`)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC4-01 | Logged in, has inventory data | Analytics page | Page heading "Analytics" visible |
| UC4-02 | Data present | Verify stat cards | "Inventory Items", "Active Donations", "Meals Planned", "Community Posts" present |
| UC4-03 | Data present | Verify charts | "Weekly Activity", "Inventory Categories", "Monthly Donations", "Food Status" sections rendered |
| UC4-04 | Data present | Click period filters `7d`, `30d`, `90d` | Charts/statistics update per period |
| UC4-05 | Data present | Verify sustainability metrics | "Waste %", "Donation Success", "CO₂ Saved", "Items Saved" indicators visible |
| UC4-06 | Data present | Verify performance score | "FoodNest Score" circular progress rendered |
| UC4-07 | Data present | Scroll to insights | "Recommendation"/"insight" content present |

---

### UC5 — View Notifications
*(Automated: `frontend/tests/use-case-5-notifications.spec.ts`)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC5-01 | New user | Open Notifications | Empty-state screen loads |
| UC5-02 | Create a donation | Open Notifications again | "donation_created" notification appears |
| UC5-03 | Notifications present | Click **Mark All Read** | All notifications marked read |
| UC5-04 | Read notifications | Click **Clear Read** | Read notifications cleared |
| UC5-05 | Notifications present | Verify status filter buttons | **Unread** and **Read** filters visible; filtering works |
| UC5-06 | Notifications present | Search box present | "Search notification" input visible |
| UC5-07 | Add item expiring tomorrow | Open Notifications, reload | Expiry notification for the item ("expires/expired") |
| UC5-08 | Donation created | Click **Donation** type filter | Donation-type notifications shown |
| UC5-09 | Donation notification | Click the notification card | Navigates to `/app/donations` |

---

### UC6 — Plan Weekly Meals
*(Automated: `frontend/tests/use-case-6-meal-planner.spec.ts`)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC6-01 | Logged in | Planner page loads | Empty planner with **Generate Random Plan** button |
| UC6-02 | — | Click **Generate Random Plan** | Meal grid populated (≥3 meals) |
| UC6-03 | Plan generated | Verify summary | "Meals planned" stat shown |
| UC6-04 | Plan generated | Click **Clear All** (accept confirm dialog) | Plan cleared / fresh state |
| UC6-05 | "Eggs" in inventory | Planner → **Generate Random Plan** | "Smart suggestions" panel shows recipes using Eggs (Boiled Eggs / Omelette / Egg Fried Rice) |
| UC6-06 | Plan generated | Click **Save** | Plan saved successfully |

---

### UC7 — Food Connect (Coordination) *(Manual only)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC7-01 | Logged in | Navigate **Food Connect** (`/app/food-connect`) | Page loads with active & history sections |
| UC7-02 | — | Browse the list page | Active coordinations and history listed |
| UC7-03 | A coordination exists | Open a coordination detail (`/app/food-connect/:id`) | Detail view loads with full info |
| UC7-04 | — | Initiate/request a coordination flow | Flow completes with confirmation |

---

### UC8 — Community *(Manual only)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC8-01 | A donation shared to community | Open **Community** (`/app/community`) | Donation post visible in feed |
| UC8-02 | Posts exist | Open **Saved** (`/app/community/saved`) | Saved posts shown |
| UC8-03 | Donations exist | Open **Nearby** (`/app/community/nearby`) | Nearby donations with proximity (km) displayed |
| UC8-04 | Donations exist | Open **Donation Map** (`/app/community/donation-map`) | Map renders donation markers |

---

### UC9 — Profile & Help *(Manual only)*

| Test ID | Preconditions | Steps | Expected Result |
|---|---|---|---|
| UC9-01 | Logged in | Open **Profile** (`/app/profile`) | Profile details displayed |
| UC9-02 | Profile page | Edit profile fields and save | Changes persist |
| UC9-03 | Logged in | Open **Help** (`/app/help`) | Help content/guidance loads |

---

## 10. Defect Management

### 10.1 Severity & Priority

| Level | Severity (impact) | Priority (fix order) |
|---|---|---|
| **Critical** | Blocks the whole application / core flow (e.g., cannot login, data loss) | Fix immediately |
| **High** | Major feature broken; workaround painful or none | Fix before go-live |
| **Medium** | Feature partially works; workaround exists | Fix in current release if time allows |
| **Low** | Cosmetic / minor; no impact on function | Fix in a later release |

### 10.2 Defect Report Template
```
Defect ID:   DEF-001
Test ID:     UC3-04
Title:       [Short summary]
Steps:       1. ...  2. ...  3. ...
Expected:    ...
Actual:      ...
Environment: OS / Browser / URL
Severity:    Critical / High / Medium / Low
Priority:    1 / 2 / 3 / 4
Attachments: screenshot(s), trace
Status:      New → In Progress → Fixed → Verified → Closed
```

### 10.3 Workflow
1. Tester logs defect (New).
2. Developer triages & fixes (In Progress → Fixed).
3. Tester retests (Verified) and closes (Closed).
4. Fixed defects must also be regression-checked against adjacent use cases.

---

## 11. Sign-off (UAT Certificate)

| Item | Detail |
|---|---|
| **Application:** | FoodNest – Smart Food Sustainability & Donation Platform |
| **UAT Environment:** | http://localhost:5173 (frontend) · http://localhost:8080 (backend) |
| **Total Test Cases Executed:** | ____ |
| **Passed:** | ____ |
| **Failed:** | ____ |
| **Blocked:** | ____ |
| **Open Critical/High Defects:** | ____ |
| **Decision:** | ☐ **GO** (all criteria met) ☐ **NO-GO** (remaining Critical/High defects) |

| Role | Name | Signature | Date |
|---|---|---|---|
| Business / Product Owner | | | |
| Test Lead | | | |
| Development Lead | | | |

---
*End of UAT Test Plan — proceed to execute Section 9 test cases and complete Section 11 on sign-off.*
