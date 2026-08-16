# FoodNest – Smart Food Sustainability & Donation Platform

FoodNest (originally known as the *Food Karma Collective*) is a modern, full-stack application built to reduce food waste, simplify household grocery tracking, and enable community-driven food sharing. By connecting neighbors and local food pantries, FoodNest fosters a collaborative ecosystem for zero-waste living.

---

##  Key Features

###  Smart Inventory Management
- **Pantry Logging:** Effortlessly track your household groceries, categories, and storage locations.
- **Expiration Alerts:** Dynamic warnings notify you when food items are approaching their expiration dates.
- **Visual Emojis:** Auto-assigned emojis for each food item make scanning your inventory intuitive.

###  Food Karma Collective (Donations)
- **Local Sharing:** Easily post excess edible food items for neighbors or local shelters.
- **Interactive Proximity Mapping:** Simulated proximity calculation displays how close donations are (in km).
- **History & Claims:** Track the items you've claimed or donated in the sidebar history widget.
- **Fanned-out Meat Donations:** Special automated distribution rule for high-value perishable items.

###  Weekly Meal Planner
- **Intelligent Planning:** Construct your weekly eating schedule around ingredients in your pantry that are expiring soon.
- **Slot Management:** Calendar integration for Breakfast, Lunch, and Dinner.

###  Waste & Savings Analytics
- **Personal Insights:** Track your monthly money saved and the weight (in kg) of food saved from landfills.
- **Sustainability Badges:** Reward systems for hitting zero-waste milestones.

---

##  Technology Stack

- **Frontend:** React (v19) + Vite + TanStack Start (file-based routing) + Tailwind CSS + Lucide Icons + Framer Motion.
- **Backend:** Node.js + Express + Mongoose + JWT Authentication + Google OAuth.
- **Database:** MongoDB (NoSQL persistence via Mongoose schemas).
- **Testing:** Playwright (E2E browser testing) & Supertest + Jest (API unit testing).

---

##  Project Structure

```text
foodnest/
├── frontend/                     ← React Frontend (TanStack Start)
│   ├── src/
│   │   ├── components/           ← Reusable UI elements (AppShell, charts, etc.)
│   │   ├── controllers/          ← State hooks, filters, and interaction logic
│   │   ├── models/               ← Core data structures and API layer logic
│   │   ├── routes/               ← File-based routing pages
│   │   └── views/                ← Presentational UI views
│   ├── package.json
│   ├── vite.config.ts            ← Proxies backend API to http://localhost:8080
│   └── .env                      ← Frontend environment config
├── backend/                      ← Node.js + Express API
│   ├── config/                   ← MongoDB connection configuration (db.js)
│   ├── middleware/               ← Auth & request logging middleware
│   ├── models/                   ← Mongoose Schemas (User, Inventory, Donation, MealPlan, Notification)
│   ├── routes/                   ← API controllers mapped to router paths
│   ├── tests/                    ← API & Selenium E2E tests
│   ├── server.js                 ← Application entry point
│   └── .env                      ← Backend configuration secrets
├── .gitignore
└── README.md
```

---

##  Setup & Installation Guide

Follow these steps to set up and run the application locally on your machine.

###  Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (running locally on port `27017` or a MongoDB Atlas URI)

---

### 1. Backend Setup 📡

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` configuration file inside the `backend/` directory:
   ```ini
   # Server Configuration
   PORT=8080
   JWT_SECRET=f00d_n3st_jwt_s3cr3t_2026_str0ng_k3y!

   # Database Configuration (MongoDB)
   MONGODB_URI=mongodb://localhost:27017/FoodNest

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The console should print:* `MongoDB connected successfully!` and `Express server is online and listening on port 8080`

---

### 2. Frontend Setup 💻

1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:5173`** (or the URL printed in your terminal).

---

##  Testing the Project

The application comes with unit, integration, and E2E test suites.

### Backend Tests
To run Jest tests on the backend API endpoints:
```bash
cd backend
npm test
```

### Frontend E2E Tests
To execute Playwright browser tests on the frontend:
```bash
cd frontend
npx playwright test
```

### UAT Test Coverage Matrix (Playwright)

Each UAT use case is mapped to a dedicated spec file under `frontend/tests/`. Tests
run against the Vite dev server (`:8080`, proxying `/api` → backend `:3000`).

| Use Case | Spec File | Covered Scenarios |
|---|---|---|
| 1 – Register & Privacy Settings | `use-case-1-register-settings.spec.ts` | 2FA onboarding, invalid/empty/duplicate email, auth redirects, login, invalid 2FA, password change, privacy & notification preference toggles with persistence |
| 2 – Manage Food Inventory | `use-case-2-inventory.spec.ts` | Add/edit/delete, validation, zero quantity, category/location/status filters, search, sort, grid/list views, mark-as-used |
| 3 – Browse & Claim Donations | `use-case-3-browse-claim-donations.spec.ts` | Browse, claim, own/already-claimed rejection, validation, filters, search, location detail, edit/delete listing, share-to-community feed, claim notifications |
| 4 – Food Analytics | `use-case-4-analytics.spec.ts` | Stat cards, charts, period filters, food saved / waste / performance score progress indicators, sustainability insights |
| 5 – View Notifications | `use-case-5-notifications.spec.ts` | donation-created & expiry notifications, mark-all-read, clear-read, status/type filters, search, click-through navigation |
| 6 – Plan Weekly Meals | `use-case-6-meal-planner.spec.ts` | Generate random plan, clear all, save plan, inventory-based smart suggestions |

> **Note:** Use Case 2 describes *converting inventory items directly to donation
> listings* from the inventory screen. This feature is **not currently implemented**
> in the UI (donations are created from the separate Donation marketplace page), so no
> automated test covers it. Add the feature, then extend `use-case-2-inventory.spec.ts`.

---

## 📋 UAT Testing

The complete **User Acceptance Testing** documentation and artifacts live in
[`docs/uat/`](docs/uat/README.md):

- **Test Plan** — scope, environment, roles, entry/exit criteria, defect process.
- **Requirements Traceability Matrix** — feature → use case → spec → test case IDs.
- **Test Cases** — step-by-step UAT test cases for all 12 use cases
  (UC-01…UC-06 automated via Playwright, UC-07…UC-12 manual).
- **Execution Log, Defect Log & Sign-off Report** — recording and sign-off templates.

---

## 🛡️ License

This project is licensed under the ISC License. Developed with 💚 to promote zero-waste communities.
