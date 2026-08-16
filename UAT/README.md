# FoodNest — User Acceptance Testing (UAT) Suite

This folder contains the complete **User Acceptance Testing (UAT)** documentation for
the FoodNest Smart Food Sustainability & Donation Platform.

UAT answers a different question than automated functional testing:

> **Automated testing (Playwright):** "Does this feature technically work?"
>
> **UAT:** "Can the intended end user successfully accomplish their required
> business task, and does the system satisfy the acceptance criteria?"

The automated Playwright tests for **Use Cases 1–6** are already complete. They
serve as the **supporting automated evidence** for each UAT scenario in this
suite. This UAT suite defines the end-user, business-goal-oriented scenarios that
a real user (or the product owner on behalf of the user) executes to formally
**accept** the delivered functionality.

---

## What's in this folder

| File | Purpose |
|---|---|
| `README.md` | This index. |
| `01-test-plan.md` | Test objectives, scope, environment, roles, method, entry/exit criteria, and defect process. |
| `02-traceability-matrix.md` | Mapping of feature → Use Case → UAT scenario → supporting Playwright test → evidence. |
| `03-test-cases.md` | The 26 detailed UAT test cases (UAT-01 … UAT-26) grouped by Use Case. |
| `04-execution-log.md` | Execution log template for recording the actual outcome of each UAT scenario. |
| `05-defect-log.md` | Defect log template for any issues found during UAT execution. |
| `06-sign-off-report.md` | Acceptance sign-off report template. |
| `07-assignment-summary.md` | Concise narrative section (objectives, method, Playwright automation, UAT approach, acceptance criteria, results, Playwright↔UAT relationship) ready to be copied into the assignment documentation. |

---

## Scope of this UAT suite

This suite covers **Use Cases 1–6**, which are already implemented and verified
automatically with Playwright:

| Use Case | Title |
|---|---|
| UC1 | Register Users and Privacy Settings |
| UC2 | Manage Food Inventory |
| UC3 | Browse Food Items and Claim Donations |
| UC4 | Food Analytics |
| UC5 | View Notifications |
| UC6 | Plan Weekly Meals |

Use Cases 7–12 referenced in the project backlog are **outside** this suite's scope.

---

## How the UAT suite is organised

1. **Automated evidence already exists** — 43 Playwright tests across 6 spec
   files under `frontend/tests/`, plus screenshots in
   `frontend/test-results/screenshots/`, the Playwright HTML report in
   `frontend/playwright-report/`, and `frontend/test-results/.last-run.json`
   (status: `passed`, no failed tests).
2. **Each UAT scenario (UAT-01…UAT-26)** describes a realistic end-user workflow
   with a business goal, preconditions, test data, steps, expected result, and the
   acceptance criteria it validates.
3. **Actual Result and Status are intentionally left blank** in `03-test-cases.md`
   and `04-execution-log.md` so the UAT is executed and recorded live.
4. The **Traceability Matrix** connects every UAT scenario back to its Use Case and
   the specific Playwright test(s) that provide supporting automated evidence.

---

## How to run the automated supporting evidence

```bash
# Backend (MongoDB + Express API on :3000)
cd backend
npm start

# Frontend (Vite dev server on :8080, proxies /api -> :3000)
cd frontend
npm run dev

# Playwright E2E tests (all 6 use-case spec files)
cd frontend
npx playwright test
```

Open the HTML report for evidence:

```bash
cd frontend
npx playwright show-report
```

---

## User roles in the application

FoodNest uses a single registered-user model (household / community member). In
business terms the same account can act as:

- **Donor** — a user who publishes surplus food for donation.
- **Claimant / Seeker** — a user who browses and claims donated food.
- **Household member** — a user managing personal pantry inventory, meal plans,
  analytics, notifications, and account settings.

These roles appear in the UAT scenarios as the **User/Actor** that is performing
the business goal.
