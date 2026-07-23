# FoodNest Development

This project is organized using the Model-View-Controller (MVC) architectural pattern:
- **Models** (`frontend/src/models/`): Houses core data structures, schemas, and API layer logic.
- **Controllers** (`frontend/src/controllers/`): Hosts state hooks, interaction logic, filters, and state flow handlers.
- **Views** (`frontend/src/views/`): Hosts presentational UI views.
- **Routes** (`frontend/src/routes/`): Acts as entrypoints for pages using TanStack Router.

## Project Structure

```
food-karma-collective/
├── frontend/          ← React + Vite + TanStack Start
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── views/
│   │   └── routes/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
├── backend/           ← Node.js + Express API
│   ├── routes/
│   ├── config/
│   ├── middleware/
│   ├── tests/
│   ├── server.js
│   └── .env
├── .gitignore
└── AGENTS.md
```

## Running the project

```bash
# Frontend (from project root)
cd frontend && npm install && npm run dev

# Backend (from project root)
cd backend && npm install && npm start
```

## Running Playwright E2E Tests

Tests are in `frontend/tests/` and cover 3 use cases:
1. **Register Users and Privacy Settings** (`use-case-1-register-settings.spec.ts`)
2. **Manage Food Inventory** (`use-case-2-inventory.spec.ts`)
3. **Browse Food Items and Claim Donations** (`use-case-3-browse-claim-donations.spec.ts`)

**Prerequisites**: Backend (`localhost:3000`) and frontend (`localhost:8080`) must be running.

```bash
# Run all tests (from project root)
cd frontend && npm test

# Run a specific use case
cd frontend && npx playwright test use-case-1-register-settings.spec.ts

# Run with UI mode
cd frontend && npm run test:ui

# Show HTML report after run
cd frontend && npx playwright show-report
```

### Screenshots
- **On success**: Manual screenshots saved to `test-results/screenshots/{test-name}/{step-name}.png`
- **On failure**: Playwright auto-captures screenshots with `screenshot: 'only-on-failure'` config
- **Trace**: Available on first retry (`trace: 'on-first-retry'`)
