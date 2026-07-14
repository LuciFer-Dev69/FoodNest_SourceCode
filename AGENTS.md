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
