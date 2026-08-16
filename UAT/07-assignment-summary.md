# FoodNest — UAT & Testing Narrative (for Assignment Documentation)

This section is written to be copied directly into the BIT216 Software
Engineering Principles Assignment 2 documentation. It covers the required
headings: Test Objectives, Testing Method, Automated Testing with Playwright,
UAT Approach, UAT Acceptance Criteria, UAT Results, and the Relationship between
Playwright testing and UAT.

---

## 1. Test Objectives

The testing effort for FoodNest had two complementary objectives:

1. **Functional correctness** — verify that each implemented feature of Use Cases
   1–6 technically works as designed.
2. **User acceptance** — verify that a real end user can successfully complete
   their required business workflows and that the delivered system satisfies the
   agreed user stories and acceptance criteria.

In short: *functional testing* answers "does it work?", while *UAT* answers "can
the intended user accomplish their task with it, and does the business accept
it?".

## 2. Testing Method

A layered testing strategy was used:

- **API/Unit level** — Node.js **Jest + Supertest** tests exercise the backend
  endpoints (e.g. authentication in `backend/tests/auth.test.js`).
- **End-to-end automated (functional/use-case) testing** — **Playwright** drives
  a real browser against the running application to verify every step of Use
  Cases 1–6.
- **User Acceptance Testing (UAT)** — a scripted, user-oriented walkthrough of
  the business workflows defined for Use Cases 1–6, executed against the live
  application and recorded in the UAT suite (`UAT/` folder).

The UAT suite is deliberately **business-goal oriented**. Instead of merely
checking "click Login → login succeeds", each UAT scenario represents a realistic
user task, e.g. *"a registered donor publishes surplus food and a neighbour
claims it"*, and validates that the system satisfies the acceptance criteria.

## 3. Automated Testing with Playwright

**Playwright** is the automated end-to-end browser testing tool used for this
project. It runs against the Vite development server on `http://localhost:8080`
(which proxies `/api` to the Express backend on `:3000`).

The automated suite consists of **43 tests in 6 spec files** under
`frontend/tests/`, one spec file per use case:

| Use Case | Spec file | Tests | Coverage |
|---|---|---|---|
| UC1 Register & Privacy Settings | `use-case-1-register-settings.spec.ts` | 10 | Registration + 2FA, login/logout, auth redirects, password change, privacy & notification preference persistence, validation |
| UC2 Manage Food Inventory | `use-case-2-inventory.spec.ts` | 11 | Add/edit/delete, validation, zero quantity, category/location/status filters, search, sort, grid/list views, mark-as-used |
| UC3 Browse & Claim Donations | `use-case-3-browse-claim-donations.spec.ts` | 11 | Publish, browse, view details, claim, own/already-claimed rejection, validation, filters, search, location detail, edit/delete, community feed, claim notification |
| UC4 Food Analytics | `use-case-4-analytics.spec.ts` | 3 | Stat cards, charts, period filters, food-saved/waste/CO₂/score/sustainability insights |
| UC5 View Notifications | `use-case-5-notifications.spec.ts` | 4 | Donation-created & expiry notifications, mark-all-read, clear-read, status/type filters, search, click-through |
| UC6 Plan Weekly Meals | `use-case-6-meal-planner.spec.ts` | 4 | Generate plan, clear all, save plan, inventory-based smart suggestions |

Each test captures **step-by-step screenshots** under
`frontend/test-results/screenshots/`, producing **103 scenario screenshots** (plus
retry captures) that serve as visual evidence of the automated runs.

Run command:

```bash
cd frontend
npx playwright test        # all 6 use-case suites
npx playwright show-report # view the HTML evidence report
```

## 4. UAT Approach

UAT was planned as a **scripted acceptance walkthrough** executed by a user
representative against the live application, guided by the scenarios in the UAT
suite (`UAT/03-test-cases.md`). The suite:

- Covers **26 scenarios** mapped to Use Cases 1–6 (`UAT-01` … `UAT-26`).
- Includes **positive scenarios** (task completed successfully), **negative /
  exception scenarios** that represent meaningful user requirements (duplicate
  email, missing required fields, claiming one's own or an already-claimed
  donation, unauthenticated access), and **end-to-end multi-actor workflows**
  (donor publishes → claimant claims → confirmation).
- Records, for every scenario: **UAT ID, related use case, actor, business/user
  goal, preconditions, test data, steps, expected result, actual result, status,
  and the acceptance criteria being validated**.
- Uses the **existing Playwright tests as supporting evidence** for each UAT
  scenario, traced in `UAT/02-traceability-matrix.md`.

Artifacts in the `UAT/` folder:

| File | Purpose |
|---|---|
| `01-test-plan.md` | Test objectives, scope, environment, roles, method, entry/exit criteria, defect process |
| `02-traceability-matrix.md` | Feature → Use Case → UAT scenario → Playwright test → evidence |
| `03-test-cases.md` | The 26 UAT test cases (UAT-01 … UAT-26) |
| `04-execution-log.md` | Execution record (status per scenario) |
| `05-defect-log.md` | Defect tracking |
| `06-sign-off-report.md` | Formal acceptance sign-off |

## 5. UAT Acceptance Criteria

The application will be accepted when **all** of the following are met:

1. **UC1 — Register & Privacy Settings:** a new user can register with 2FA and
   reach their dashboard; a registered user can log in; duplicate/invalid
   registration is rejected with clear messages; privacy & notification
   preferences persist; the user can change their password; unauthenticated
   access to protected pages is redirected to login.
2. **UC2 — Manage Food Inventory:** a user can add, edit, and delete pantry
   items; missing required fields are rejected; items can be searched, filtered
   (category/location/status), sorted, and marked as used; expiring-soon items
   are surfaced.
3. **UC3 — Browse & Claim Donations:** a donor can publish a donation with
   pickup/location details; a seeker can browse, view details, and claim it; a
   donation cannot be claimed by its owner or claimed twice; listings can be
   edited/deleted; donations can be shared to the community feed; the claimant
   receives confirmation.
4. **UC4 — Food Analytics:** the dashboard shows stat cards, charts, period
   filters, food-saved/waste/CO₂ metrics, a performance score, and
   sustainability insights.
5. **UC5 — View Notifications:** users receive donation-created and expiry
   notifications and can mark all read, clear read, filter, search, and
   click-through to the related page.
6. **UC6 — Plan Weekly Meals:** a user can generate, save, and clear a weekly
   meal plan, and receive smart recipe suggestions based on their inventory.

Exit conditions for sign-off: all 26 scenarios executed, no open Critical/High
defects, and the sign-off report completed.

## 6. UAT Results

**Automated evidence (functional level):** the Playwright suite for Use Cases 1–6
has been executed successfully. `frontend/test-results/.last-run.json` reports
`{"status": "passed", "failedTests": []}` — **43/43 automated tests passed** with
no failures, supported by 103 step screenshots and the HTML report in
`frontend/playwright-report/`.

**UAT execution:** the 26 UAT scenarios (UAT-01 … UAT-26) are defined in
`UAT/03-test-cases.md` with their **Actual Result and Status left blank**,
awaiting live execution by the user representative. Results will be recorded in
`UAT/04-execution-log.md`, defects (if any) in `UAT/05-defect-log.md`, and the
formal acceptance decision in `UAT/06-sign-off-report.md`.

## 7. Relationship between Playwright testing and UAT

Playwright testing and UAT are complementary layers of the same verification
effort:

- **Playwright (automated functional/use-case testing)** verifies that each step
  of Use Cases 1–6 works technically — the inputs, the system responses, the
  validation, and the navigation — and produces repeatable, screenshot-backed
  evidence.
- **UAT verifies that a real end user can achieve their business goal using
  those same features and that the system meets the acceptance criteria.** A
  Playwright test proves "the *Claim Donation* button works"; the corresponding
  UAT scenario proves "a neighbour successfully finds, reviews, and claims the
  donated food, and the system behaves as the business requires".
- Because every UAT scenario is **traceable** to its supporting Playwright
  test(s) (see `UAT/02-traceability-matrix.md`), the automated results strengthen
  UAT: where the business workflow has already been shown to work automatically,
  the UAT execution focuses on **user-level acceptance**, expected behaviour, and
  exception handling.

This layered approach means the two forms of testing reinforce each other and
together demonstrate that the application both *works correctly* and *meets the
user stories and acceptance criteria* defined for the project.
