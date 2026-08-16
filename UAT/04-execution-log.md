# FoodNest UAT — Execution Log

Record the live execution of each UAT scenario. Copy rows from `03-test-cases.md`
(UAT-01 … UAT-26) and fill in the result. This log is the primary record used to
complete the Sign-off Report (`06-sign-off-report.md`).

**Status values:** Pass / Fail / Blocked

## Execution metadata

| Field | Value |
|---|---|
| Application | FoodNest — Smart Food Sustainability & Donation Platform |
| Release / Build under test | *(e.g. main branch, commit hash)* |
| Environment | Frontend `http://localhost:8080`, Backend `http://localhost:3000`, MongoDB `localhost:27017/FoodNest` |
| Browser | *(e.g. Chrome 1xx)* |
| Tester(s) | *(name(s))* |
| Test dates | *(DD/MM/YYYY – DD/MM/YYYY)* |
| Automated suite reference | `frontend/tests/use-case-{1..6}-*.spec.ts` (43 tests, all passed — `frontend/test-results/.last-run.json`) |

## Log table

| Run # | Date | UAT ID | Related UC | Scenario | Tester | Result | Notes / Evidence reference |
|---|---|---|---|---|---|---|---|
| 1 |  | UAT-01 | UC1 | New member registers, completes 2FA, reaches dashboard |  |  |  |
| 2 |  | UAT-02 | UC1 | Registered user logs in and accesses dashboard |  |  |  |
| 3 |  | UAT-03 | UC1 | Duplicate email rejected |  |  |  |
| 4 |  | UAT-04 | UC1 | Invalid email / empty fields rejected |  |  |  |
| 5 |  | UAT-05 | UC1 | Preferences persist after re-login |  |  |  |
| 6 |  | UAT-06 | UC1 | Password change |  |  |  |
| 7 |  | UAT-07 | UC1 | Unauthenticated access redirected |  |  |  |
| 8 |  | UAT-08 | UC2 | Add / edit / delete inventory items |  |  |  |
| 9 |  | UAT-09 | UC2 | Search, filter, sort inventory |  |  |  |
| 10 |  | UAT-10 | UC2 | Missing required fields rejected |  |  |  |
| 11 |  | UAT-11 | UC2 | Track used / expiring-soon items |  |  |  |
| 12 |  | UAT-12 | UC3 | Donor publishes → claimant claims (E2E) |  |  |  |
| 13 |  | UAT-13 | UC3 | Cannot claim own donation |  |  |  |
| 14 |  | UAT-14 | UC3 | Already-claimed donation unavailable |  |  |  |
| 15 |  | UAT-15 | UC3 | Publish with missing fields rejected |  |  |  |
| 16 |  | UAT-16 | UC3 | Filter / search + location details |  |  |  |
| 17 |  | UAT-17 | UC3 | Edit / delete donation listing |  |  |  |
| 18 |  | UAT-18 | UC3 | Share donation to community feed |  |  |  |
| 19 |  | UAT-19 | UC4 | Analytics stats, charts, period filters |  |  |  |
| 20 |  | UAT-20 | UC4 | Food saved / waste / score / insights |  |  |  |
| 21 |  | UAT-21 | UC5 | Donation-created & expiry notifications |  |  |  |
| 22 |  | UAT-22 | UC5 | Manage notifications (mark read / clear / filter) |  |  |  |
| 23 |  | UAT-23 | UC5 | Notification click-through navigation |  |  |  |
| 24 |  | UAT-24 | UC6 | Generate weekly meal plan |  |  |  |
| 25 |  | UAT-25 | UC6 | Smart suggestions from pantry |  |  |  |
| 26 |  | UAT-26 | UC6 | Clear and save meal plan |  |  |  |

## Summary (to complete after execution)

| Metric | Value |
|---|---|
| Total scenarios | 26 |
| Passed |  |
| Failed |  |
| Blocked |  |
| Defects raised |  |
| Open Critical/High defects |  |
| Acceptance decision |  |
