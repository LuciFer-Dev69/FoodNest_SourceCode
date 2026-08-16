# FoodNest UAT — Sign-off Report

## 1. Acceptance summary

| Field | Value |
|---|---|
| Application | FoodNest — Smart Food Sustainability & Donation Platform |
| Release / Build under test | *(version / commit)* |
| UAT scope | Use Cases 1–6 (UAT-01 … UAT-26) |
| Test environment | Frontend `http://localhost:8080`, Backend `http://localhost:3000`, MongoDB |
| Automated suite used as evidence | Playwright — 6 spec files, 43 tests (`frontend/tests/use-case-{1..6}-*.spec.ts`) |
| Automated suite result | Passed — `frontend/test-results/.last-run.json`: `{"status": "passed", "failedTests": []}` |
| UAT execution period | *(DD/MM/YYYY – DD/MM/YYYY)* |
| UAT executed by | *(tester / user representative name)* |

## 2. UAT results

| Metric | Value |
|---|---|
| Total scenarios executed | / 26 |
| Passed |  |
| Failed |  |
| Blocked |  |
| Defects raised |  |
| Open Critical / High defects |  |

## 3. Acceptance criteria check

| Use Case | Acceptance criteria | Status (Met / Not met) |
|---|---|---|
| UC1 — Register Users and Privacy Settings | Registration with 2FA, login, password change, persisted privacy/notification preferences, auth redirects |  |
| UC2 — Manage Food Inventory | Add/edit/delete items, validation, search/filter/sort, status tracking |  |
| UC3 — Browse and Claim Donations | Publish, browse, view details, claim (once, not own), edit/delete listings, community sharing |  |
| UC4 — Food Analytics | Stats, charts, period filters, food-saved/waste/score/sustainability insights |  |
| UC5 — View Notifications | Donation & expiry notifications, mark-all-read/clear, filters, search, click-through |  |
| UC6 — Plan Weekly Meals | Generate, save, clear plan; inventory-based smart suggestions |  |

## 4. Decision

Based on the executed UAT and the supporting automated Playwright evidence, the
application for Use Cases 1–6 is:

- [ ] **ACCEPTED** — all acceptance criteria met; no open Critical/High defects.
- [ ] **ACCEPTED WITH CONDITIONS** — minor issues logged with agreed resolution.
- [ ] **NOT ACCEPTED** — critical/high defects remain; re-test required.

## 5. Signatures

| Role | Name | Signature | Date |
|---|---|---|---|
| User representative / Product owner |  |  |  |
| UAT coordinator / Tester |  |  |  |
| Development lead |  |  |  |
