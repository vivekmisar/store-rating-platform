# StoreRate — Starting Guide

## 1. What this project is

This project implements the supplied Roxiler FullStack Intern Coding Challenge as a store-rating platform.

The assessment specifies:

- Backend: ExpressJs / Loopback / NestJs
- Database: PostgreSQL / MySQL
- Frontend: ReactJs
- One login system for all users
- Three roles: System Administrator, Normal User, Store Owner
- Store ratings from 1 to 5
- Role-specific functionality after login
- Validation, filtering, sorting, and database best practices

This implementation uses **Express.js + PostgreSQL + React**.

The accompanying JD says MERN, but the actual coding assessment explicitly permits PostgreSQL/MySQL and Express, so this implementation follows the assessment specification.

---

## 2. Project architecture

```text
roxiler-store-rating/
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   └── env.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── admin.controller.js
│       │   ├── owner.controller.js
│       │   ├── rating.controller.js
│       │   └── store.controller.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── role.js
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── admin.routes.js
│       │   ├── owner.routes.js
│       │   ├── rating.routes.js
│       │   └── store.routes.js
│       ├── utils/
│       │   ├── asyncHandler.js
│       │   ├── errors.js
│       │   └── validation.js
│       └── validators/
│           ├── admin.validators.js
│           ├── auth.validators.js
│           └── rating.validators.js
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       │   ├── ErrorMessage.jsx
│       │   ├── Layout.jsx
│       │   ├── Loading.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── AdminDashboardPage.jsx
│       │   ├── AdminStoresPage.jsx
│       │   ├── AdminUserDetailPage.jsx
│       │   ├── AdminUsersPage.jsx
│       │   ├── ChangePasswordPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── NotFoundPage.jsx
│       │   ├── OwnerDashboardPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── StoresPage.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── validation.js
│
├── .gitignore
├── README.md
└── starting.md
```

---

## 3. Core database design

### `users`

```text
id
name
email
password_hash
address
role
is_active
created_at
updated_at
```

Allowed roles:

```text
ADMIN
USER
STORE_OWNER
```

### `stores`

```text
id
name
email
address
owner_id
created_at
updated_at
```

`owner_id` points to `users.id` and is nullable because an administrator can create a store before assigning an owner.

`owner_id` is unique, matching the assessment's singular store-owner dashboard model: one store owner can have one assigned store in this implementation.

### `ratings`

```text
id
user_id
store_id
rating
created_at
updated_at
```

A unique constraint on `(user_id, store_id)` guarantees that one normal user can have one rating per store. Updating a rating changes that existing record instead of creating a second record.

---

## 4. Authentication model

There is exactly one login route:

```text
POST /api/auth/login
```

The credentials are checked against the `users` table.

The server returns a signed JWT containing the user ID and role.

Every protected request sends:

```http
Authorization: Bearer <token>
```

The backend authentication middleware:

```text
Authorization header
        ↓
JWT verification
        ↓
Find active user in PostgreSQL
        ↓
req.user = authenticated user
```

Then the role middleware controls access:

```text
requireRole('ADMIN')
requireRole('USER')
requireRole('STORE_OWNER')
```

Passwords are never stored directly. They are hashed with bcryptjs.

### Logout

This project uses stateless JWT authentication. The logout endpoint exists and returns success, while the frontend removes the stored token. True server-side JWT revocation would require a token/session revocation store and is intentionally not added because it is outside the assessment scope.

---

## 5. Complete backend route map

### Health

```http
GET /api/health
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
PUT  /api/auth/password
POST /api/auth/logout
```

`register` always creates a `USER` role. Admins can create other roles through the admin API.

### Normal-user store listing

```http
GET /api/stores
GET /api/stores/:id
```

`GET /api/stores` supports:

```text
name
address
sortBy
order
page
limit
```

Example:

```text
/api/stores?name=market&address=pune&sortBy=rating&order=desc&page=1&limit=12
```

The list returns:

```text
store name
store email
store address
overall rating
current user's rating
current user's rating id
rating count
```

The rating ID is returned because the update endpoint needs the actual rating record to enforce ownership correctly.

### Ratings

```http
POST /api/ratings
PUT  /api/ratings/:id
```

Only authenticated `USER` accounts can call these routes.

A user can only modify their own rating.

Rating must be an integer from 1 to 5.

### Admin

```http
GET  /api/admin/dashboard
GET  /api/admin/users
GET  /api/admin/users/:id
POST /api/admin/users
GET  /api/admin/stores
POST /api/admin/stores
```

Admin user filters:

```text
name
email
address
role
sortBy
order
page
limit
```

Admin store filters:

```text
name
email
address
sortBy
order
page
limit
```

### Store owner

```http
GET /api/owner/dashboard
```

The authenticated owner's ID comes from the JWT. The backend finds the assigned store and returns:

- Store information
- Average rating
- Rating count
- Users who submitted ratings
- Rating values
- Created/updated timestamps

---

## 6. Frontend route map

```text
/
/login
/register

/stores
/change-password

/admin/dashboard
/admin/users
/admin/users/:id
/admin/stores

/owner/dashboard
```

The frontend redirects users based on role:

```text
ADMIN       → /admin/dashboard
USER        → /stores
STORE_OWNER → /owner/dashboard
```

The frontend also protects routes so a logged-in user cannot simply navigate to another role's UI.

The backend still performs the real authorization checks, because client-side protection alone is never sufficient.

---

## 7. Validation implemented

The assessment requires:

### Name

```text
20–60 characters
```

### Address

```text
1–400 characters
```

### Password

```text
8–16 characters
At least one uppercase letter
At least one special character
```

### Email

A standard email format is required.

These rules are checked on both the React forms and the Express API.

The database also contains length/check constraints for the core fields.

---

## 8. Important backend implementation choices

### Raw SQL instead of an ORM

This project deliberately uses `pg` directly.

That means you can see the actual SQL used for:

- joins
- aggregates
- filtering
- sorting
- pagination
- inserts
- updates

This is especially useful because you are learning PostgreSQL instead of hiding it behind Prisma/Sequelize/etc.

### Parameterized SQL

Values are passed using PostgreSQL parameters such as `$1`, `$2`, etc. User-controlled values are not concatenated directly into SQL.

Sorting is additionally restricted through server-side whitelists so a user cannot inject an arbitrary SQL expression through `sortBy`.

### Aggregated ratings

The average rating is calculated from the `ratings` table using SQL `AVG()` rather than storing a second manually maintained rating value on the store.

### Ownership enforcement

When a user updates a rating, the SQL update includes both:

```text
rating id
+
authenticated user id
```

So a normal user cannot modify another user's rating merely by changing an ID in the URL.

---

## 9. Install and run from zero

### Prerequisites

Use a current Node.js version compatible with Vite 8. The machine used while preparing this project has Node 22.16.0.

You also need a PostgreSQL database. Neon PostgreSQL is a suitable hosted option.

### Step 1 — Create the database

Create a Neon PostgreSQL database and copy its connection URL.

It will look approximately like:

```text
postgresql://username:password@host/database?sslmode=require
```

### Step 2 — Backend environment

Go into:

```text
backend/
```

Create:

```text
.env
```

from:

```text
.env.example
```

At minimum set:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=YOUR_NEON_POSTGRES_URL
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=1d
```

### Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 4 — Apply database schema

```bash
npm run db:migrate
```

This runs `database/schema.sql`.

### Step 5 — Seed demo data

```bash
npm run seed
```

The seed script creates demo accounts, a store owner/store, normal users, and ratings.

### Demo credentials

```text
ADMIN
email: admin@example.com
password: Admin@123

STORE OWNER
email: owner@example.com
password: Owner@123

NORMAL USER
email: user@example.com
password: User@123
```

These are development/demo credentials only. Change them before any real deployment.

### Step 6 — Start backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### Step 7 — Frontend environment

Open another terminal:

```bash
cd frontend
```

Create `.env` from `.env.example` if you want an explicit API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

The Vite development proxy also forwards `/api` requests to the backend, so the default setup works without changing the frontend code.

### Step 8 — Install and start frontend

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 10. Feature checklist

### System Administrator

- Dashboard total user count
- Dashboard total store count
- Dashboard total rating count
- Create users
- Create admins
- Create store owners
- Create stores
- Assign a store owner while creating a store
- View users
- Filter users by name/email/address/role
- Sort users
- View individual user details
- See store information/rating for store owners
- View stores
- Filter stores
- Sort stores
- See store average rating
- Logout

### Normal User

- Register
- Login
- Browse registered stores
- Search by store name
- Search by address
- Sort store listing
- View overall rating
- View current user's submitted rating
- Submit rating from 1–5
- Modify own rating
- Change password
- Logout

### Store Owner

- Login through the same login route
- Change password
- See own assigned store
- See average rating
- See rating count
- See users who submitted ratings
- Sort the owner rating table
- Logout

---

## 11. Suggested reading order

Read the project in this sequence to understand the implementation quickly:

```text
1. database/schema.sql
2. backend/src/config/db.js
3. backend/src/config/env.js
4. backend/src/utils/validation.js
5. backend/src/middleware/auth.js
6. backend/src/middleware/role.js
7. backend/src/routes/*.routes.js
8. backend/src/controllers/auth.controller.js
9. backend/src/controllers/rating.controller.js
10. backend/src/controllers/store.controller.js
11. backend/src/controllers/admin.controller.js
12. backend/src/controllers/owner.controller.js
13. backend/src/app.js
14. frontend/src/services/api.js
15. frontend/src/context/AuthContext.jsx
16. frontend/src/components/ProtectedRoute.jsx
17. frontend/src/App.jsx
18. frontend/src/pages/*
```

A useful mental flow is:

```text
React page
  ↓
api.js
  ↓
HTTP request
  ↓
Express route
  ↓
auth middleware
  ↓
role middleware
  ↓
controller
  ↓
pg query
  ↓
PostgreSQL
  ↓
JSON response
  ↓
React state/UI
```

---

## 12. Package versions used for this implementation

Backend:

```text
express        5.2.1
pg             8.23.0
bcryptjs       3.0.3
jsonwebtoken   9.0.3
helmet         8.3.0
cors           2.8.6
morgan         1.11.0
dotenv         17.4.2
```

Frontend:

```text
react              19.2.8
react-dom          19.2.8
react-router-dom   7.18.2
vite               8.2.2
@vitejs/plugin-react 6.1.0
```

The versions were checked against current npm package listings while preparing this project.

---

## 13. Before submission

At minimum, manually test:

1. Normal registration.
2. Normal login.
3. Admin login.
4. Store owner login.
5. Normal user cannot access admin endpoints.
6. Normal user cannot access owner endpoints.
7. Admin can create a STORE_OWNER.
8. Admin can create and assign a store.
9. Normal user sees the store.
10. Normal user submits a rating.
11. Normal user modifies the same rating rather than creating a duplicate.
12. Store owner sees the updated rating and average.
13. Admin dashboard counts update.
14. Admin filters and sorting work.
15. Store search by name/address works.
16. Password change rejects a wrong current password.
17. Invalid password formats are rejected.
18. Duplicate email registration is rejected.
19. Duplicate rating for the same user/store is rejected.
20. Logout removes access to protected frontend routes.

---

## 14. Deliberate scope boundaries

The project does not add unrelated features such as:

- email verification
- forgot-password emails
- payments
- reviews/comments
- favorites
- image uploads
- multiple stores per owner
- refresh-token rotation
- server-side JWT revocation
- third-party OAuth

Those are not required by the supplied assessment and would increase complexity without improving the core assessment coverage.
