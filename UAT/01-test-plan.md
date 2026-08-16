# FoodNest UAT — Test Plan

## 1. Test Objectives

The objectives of User Acceptance Testing for FoodNest are to confirm that the
delivered application:

1. **Enables each intended user to complete their business workflow** end to end —
   registration and account setup, pantry management, donation sharing and
   claiming, analytics, notifications, and meal planning.
2. **Satisfies the acceptance criteria** defined for Use Cases 1–6.
3. **Handles meaningful exception/negative conditions gracefully** (invalid input,
   duplicate data, unauthorised actions) so a real user is never blocked or misled.
4. **Provides evidence of acceptance** that is traceable from each UAT scenario to
   the supporting automated Playwright tests and captured screenshots.
5. **Confirms the application is ready for deployment / hand-over** to end users
   (households, donors, and claimants).

UAT is business-user acceptance of the completed, already-verified functionality.
It does **not** re-test implementation details that automated testing has already
covered; instead it verifies the user-facing outcome and acceptance criteria.

## 2. Test Scope

### In scope
- Use Case 1 — Register Users and Privacy Settings
- Use Case 2 — Manage Food Inventory
- Use Case 3 — Browse Food Items and Claim Donations
- Use Case 4 — Food Analytics
- Use Case 5 — View Notifications
- Use Case 6 — Plan Weekly Meals

Each UAT scenario covers a realistic, business-goal-oriented workflow, including
positive scenarios, negative/exception scenarios, and end-to-end multi-actor
workflows.

### Out of scope
- Use Cases 7–12 (not part of this delivery phase).
- Unit/integration/API testing (covered by Jest + Supertest on the backend).
- Performance, load, and security penetration testing.
- Any new features or use cases not already implemented.

## 3. Test Environment

| Component | Configuration |
|---|---|
| Frontend | React 19 + Vite + TanStack Start, dev server on `http://localhost:8080` |
| Backend | Node.js + Express API on `http://localhost:3000` (Vite proxies `/api` → `:3000`) |
| Database | MongoDB via Mongoose (`mongodb://localhost:27017/FoodNest`) |
| Browser (UAT) | Chrome / Edge (latest), 1280×720 or larger viewport |
| Automated tooling | Playwright (E2E) — `frontend/tests/`, `frontend/playwright.config.ts` |
| Authentication | Local email/password + 2FA onboarding code displayed on-screen during registration |

### Setup steps
1. Start MongoDB.
2. `cd backend && npm install && npm start` → console: `MongoDB connected successfully!`
   and `Express server is online and listening on port 3000`.
3. `cd frontend && npm install && npm run dev` → open `http://localhost:8080`.
4. Run automated supporting evidence: `cd frontend && npx playwright test`.

## 4. User Roles / Actors

| Actor | Description |
|---|---|
| New visitor (unregistered) | Not yet authenticated; must register and complete 2FA. |
| Registered user (household member) | Authenticated; manages inventory, analytics, notifications, meals, and settings. |
| Donor | A registered user publishing surplus food for donation. |
| Claimant / Seeker | A registered user browsing and claiming donated food. |

## 5. Testing Method

UAT is performed as a **scripted, manual acceptance walkthrough** by a user
representative (or product owner), guided by the scenarios in `03-test-cases.md`:

1. Each scenario is executed against the live application using the specified
   preconditions and test data.
2. The tester records the observed **Actual Result** and sets **Status** to
   *Pass*, *Fail*, or *Blocked*.
3. Automated evidence from the Playwright suite is used to **support** the
   expected behaviour of each scenario.
4. Any failure is logged in `05-defect-log.md` and re-tested after resolution.
5. Results are summarised in `04-execution-log.md`, and acceptance is formally
   recorded in `06-sign-off-report.md`.

### Scenario types
- **Positive** — the user completes the intended task successfully.
- **Negative / exception** — the user attempts an invalid or unauthorised action
  and the system responds appropriately (validation message, rejection, redirect).
- **End-to-end** — a complete multi-step workflow (often multi-actor), e.g. donor
  publishes → claimant claims → confirmation received.

## 6. Entry Criteria (to start UAT)

- [ ] Use Cases 1–6 implemented and functional.
- [ ] Automated Playwright suite for UCs 1–6 executed and passed
      (`frontend/test-results/.last-run.json` shows `"status": "passed"`).
- [ ] Backend and frontend running locally with seeded/clean MongoDB.
- [ ] UAT environment and test accounts/test data available.

## 7. Exit Criteria (to accept UAT)

- [ ] All 26 UAT scenarios executed and recorded in the execution log.
- [ ] No open **High** or **Critical** severity defects.
- [ ] All negative/exception scenarios behaved as expected (or were logged and
      fixed/waived with justification).
- [ ] UAT sign-off report completed and signed.

## 8. Defect Process

1. Any deviation from the expected result is recorded in `05-defect-log.md`
   (defect ID, UAT ID, severity, description, steps, expected vs actual).
2. Severity: **Critical** (blocks use case), **High** (major functionality
   unusable), **Medium** (minor deviation with workaround), **Low** (cosmetic).
3. The team fixes the defect; the scenario is re-run and the defect closed or
   re-opened accordingly.
4. UAT cannot be signed off while Critical/High defects are open.

## 9. Test Data Strategy

- Registration uses unique disposable email addresses (the Playwright helper uses
  `test_<timestamp>_<random>@foodnest.test`) to avoid duplicate-email conflicts.
- Inventory and donation test data uses realistic food items (e.g. Apple, Milk,
  Eggs, Strawberries) with future expiry dates (`getFutureDate(n)` pattern).
- Multi-actor scenarios (UC3) use separate donor and claimant accounts.
- Test data is disposable and does not interfere with real production data.
