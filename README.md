# DegreeMap 🎓


A full-stack web app that helps LAU Computer Engineering, Electrical Engineering, and Mechatronics Engineering students plan their entire degree, from freshman year to graduation. The app enforces prerequisite rules, warns about conflicts, and recommends a valid course order, all powered by data structures built from scratch.

---

## Features

| Feature | Data Structure | Algorithm |
|---|---|---|
| Course Prerequisite Graph | Directed Graph (adjacency list) | DFS traversal |
| BFS Semester Plan Generator | Graph + Queue | BFS level-order |
| Cycle Detection | Graph | DFS with visited tracking |
| Course Catalog Search | HashMap | O(1) lookup by course code |
| Completed Course Tracking | HashSet | O(1) membership check |
| Drag-and-Drop Custom Planner | Graph's Data | Client-side validation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Flow, @dnd-kit |
| Backend | Node.js, Express |
| Database | MySQL (via `mysql2`) |
| Auth | JWT + bcrypt |
| DB Client | HeidiSQL |

---

## Project Structure

```
DegreeMap/
├── frontend/               # React app
│   ├── src/
│   │   ├── api/            # Fetch calls to backend
│   │   ├── components/     # Navbar, SemesterColumn, PrereqGraph, etc.
│   │   ├── pages/          # LoginPage, CatalogPage, PlannerPage, GraphPage, etc.
│   │   ├── hooks/          # usePlanner, useCatalog, useAuth
│   │   └── utils/          # validateDrop.js
│   └── package.json
│
└── backend/                # Express API
    ├── server.js
    ├── .env
    ├── schema.sql
    └── src/
        ├── db.js
        ├── datastructures/ # Graph.js, HashMap.js, HashSet.js, BFSPlanner.js
        ├── algorithms/     # dfs.js, cycleDetection.js
        ├── middleware/     # auth.js (JWT verification)
        └── routes/         # auth, courses, planner, customPlanner, prerequisites
```

---

## Prerequisites

Make sure you have these installed before starting:

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://dev.mysql.com/downloads/) (or XAMPP/WAMP)
- [HeidiSQL](https://www.heidisql.com/) (optional, for managing the DB visually)

---

## Database Setup

**1. Open HeidiSQL (or any MySQL client) and create the database:**

```sql
CREATE DATABASE degreemap_db;
```

**2. Run the schema file to create all tables:**

```sql
-- Run backend/schema.sql in HeidiSQL
-- Tables created: users, courses, major_requirements, prerequisites,
--                 completed_courses, user_plans
```

## Backend Setup

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create the .env file
```

Create a file called `.env` in the `backend/` folder with the following:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=degreemap_db
JWT_SECRET=degreemap_super_secret_key_2026
PORT=5000
```

Replace `yourpassword` with your actual MySQL root password.

```bash
# 4. Start the backend server
node server.js
```

You should see:
```
Server running on port 5000
Catalog loaded: XX courses in HashMap
```

---

## Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the React dev server
npm start
```

The app opens at **http://localhost:3000**

---

## Running the Full App

You need **two terminals** running at the same time:

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Then open http://localhost:3000 in your browser.

---
