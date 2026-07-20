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
- **History & Claims:** Track the items you've claimed or donated to build community trust.
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
- **Backend:** Node.js + Express + JWT Authentication + Google OAuth.
- **Database:** MySQL (relational persistence) with a built-in mock database fallback for test environments.
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
│   ├── vite.config.ts            ← Proxies backend API to http://localhost:5000
│   └── .env                      ← Frontend environment config
├── backend/                      ← Node.js + Express API
│   ├── config/                   ← Database pool & mockup configurations
│   ├── middleware/               ← Auth & request logging middleware
│   ├── routes/                   ← API controllers mapped to router paths
│   ├── tests/                    ← API & Selenium E2E tests
│   ├── schema.sql                ← MySQL database schema
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
- **MySQL Server** (running locally or in the cloud)

---

### 1. Database Configuration 

1. Log into your MySQL console:
   ```bash
   mysql -u root -p
   ```
2. Import the database schema:
   ```sql
   CREATE DATABASE IF NOT EXISTS foodnest;
   USE foodnest;
   SOURCE backend/schema.sql;
   ```
   *This automatically creates the `foodnest` database and sets up the required tables (`users`, `inventory`, `donations`, `meal_plans`, and `notifications`).*

---

### 2. Backend Setup 📡

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
   # Server Port
   PORT=5000

   # JWT Token Secret
   JWT_SECRET=f00d_n3st_jwt_s3cr3t_2026_str0ng_k3y!

   # MySQL Database Details
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD
   DB_NAME=foodnest
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The console should print:* `📡 Express server is online and listening on port 5000`

---

### 3. Frontend Setup 

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
4. Open your browser and navigate to **`http://localhost:8080`** (or the URL printed in your terminal).

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

---

## 🛡️ License

This project is licensed under the ISC License. Developed with 💚 to promote zero-waste communities.
