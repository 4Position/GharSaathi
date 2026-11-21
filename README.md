# GharSaathi — Rental Property Management Platform

GharSaathi is a full-stack rental property management application for landlords and tenants. It supports property discovery and management, rental applications, leases, payment records, and maintenance requests.

## Features

- Tenant and landlord registration and login with bcrypt password hashing and JWT authentication.
- Role-based protected pages and API access.
- Public property browsing, details, and filters by city, rent range, and bedrooms.
- Landlord property creation, editing, and status management.
- Tenant applications and landlord application review.
- Lease creation from approved applications and lease status management.
- Landlord-managed payment records and tenant maintenance requests.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | bcryptjs, JSON Web Tokens |

## Project structure

```text
MVP_GHARSAATHI/
├── backend/
│   ├── prisma/migrations/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── app.js
│       └── server.js
├── frontend/src/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   └── services/
├── .gitignore
├── README.md
└── PROJECT_STATUS.md
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL

## Installation

Run from the project root:

```bash
cd backend
npm ci
cd ../frontend
npm ci
```

If a `package-lock.json` is unavailable, use `npm install` instead.

## Local database setup

Create a local development database (replace `YOUR_POSTGRES_USER` with your PostgreSQL role):

```bash
createdb -U YOUR_POSTGRES_USER gharsaathi_dev
```

Create the backend environment file:

```bash
cd backend
cp .env.example .env
```

Set the values in `backend/.env`:

```env
DATABASE_URL="postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5432/gharsaathi_dev?schema=public"
PORT=5001
CLIENT_URL="http://localhost:5173"
JWT_SECRET="REPLACE_WITH_A_LONG_RANDOM_SECRET"
JWT_EXPIRES_IN="7d"
```

Use your own credentials and a long, random JWT secret. Never commit `.env` files or share their contents.

### Apply the committed database migration

The repository includes the initial Prisma migration. For a fresh database, run:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

This applies existing migration files. It does not create a new development migration. Confirm that the target database is the intended one before applying migrations.

## Frontend environment

Create `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

Set:

```env
VITE_API_URL="http://localhost:5001/api"
```

The URL must include `/api`.

## Run locally

Open two terminals from the project root.

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

The frontend is available at `http://localhost:5173`. The backend uses the port configured by `PORT` (the example above uses `5001`).

## Health check

With the backend and database running:

```bash
curl http://localhost:5001/api/health
```

Successful response:

```json
{
  "status": "ok",
  "api": "healthy",
  "database": "connected"
}
```

If the database is unavailable, the health endpoint returns an unsuccessful HTTP response.

## API reference

All endpoints below are prefixed with `/api`. Protected endpoints require:

```http
Authorization: Bearer <token>
```

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API and database health |

### Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a tenant or landlord |
| POST | `/auth/login` | Public | Log in and receive a JWT |
| GET | `/auth/me` | Authenticated | Get the current user's safe profile |

### Properties

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/properties` | Public | List available properties; supports `city`, `minRent`, `maxRent`, and `bedrooms` filters |
| GET | `/properties/:id` | Public | Get property details |
| GET | `/properties/my` | Landlord | List the current landlord's properties |
| POST | `/properties` | Landlord | Create a property |
| PUT | `/properties/:id` | Landlord / owner | Update an owned property |
| PATCH | `/properties/:id/status` | Landlord / owner | Update property status |

### Applications

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/applications` | Tenant | Submit an application |
| GET | `/applications/my` | Tenant | List the tenant's applications |
| GET | `/applications/received` | Landlord | List applications received by the landlord |
| PATCH | `/applications/:id/status` | Landlord | Update application status |

### Leases

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/leases` | Landlord | Create a lease from an approved application |
| GET | `/leases/my` | Authenticated | List leases relevant to the current user |
| GET | `/leases/:id` | Authenticated | Get lease details |
| PATCH | `/leases/:id/status` | Landlord | Update lease status |

### Payments

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/payments` | Landlord | Create a payment record for an owned lease |
| GET | `/payments/my` | Authenticated | List payments relevant to the current user |
| PATCH | `/payments/:id/status` | Landlord | Update payment status |

### Maintenance

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/maintenance` | Tenant | Create a maintenance request for an active lease |
| GET | `/maintenance/my` | Authenticated | List maintenance requests relevant to the current user |
| PATCH | `/maintenance/:id/status` | Landlord | Update maintenance status |

## Frontend routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Home page |
| `/register` | Public | Registration |
| `/login` | Public | Login |
| `/properties` | Public | Browse properties |
| `/properties/:id` | Public | View property details |
| `/applications` | Tenant | View submitted applications |
| `/landlord/applications` | Landlord | Review received applications |
| `/landlord/leases/new` | Landlord | Create a lease |
| `/leases` | Authenticated | View leases |
| `/payments` | Authenticated | View/manage payments by role |
| `/maintenance` | Authenticated | View/manage maintenance by role |
| `/tenant/dashboard` | Tenant | Tenant dashboard |
| `/landlord/dashboard` | Landlord | Landlord dashboard |
| `/landlord/properties/new` | Landlord | Create a property |
| `/landlord/properties/:id/edit` | Landlord | Edit a property |

## Production deployment

The application has three deployable parts:

1. Managed PostgreSQL database.
2. Express backend as a Node.js web service.
3. Vite frontend as a static site.

Choose hosting providers after checking current pricing, availability, and service limits.

### Backend environment variables

Configure these on the backend hosting service:

```env
NODE_ENV=production
DATABASE_URL="YOUR_PRODUCTION_POSTGRESQL_CONNECTION_STRING"
CLIENT_URL="https://YOUR_FRONTEND_DOMAIN"
JWT_SECRET="YOUR_LONG_RANDOM_SECRET"
JWT_EXPIRES_IN=7d
```

Set `PORT` only if the hosting provider requires it. The application reads `process.env.PORT` when supplied and otherwise uses its configured default.

`CLIENT_URL` must match the deployed frontend origin for the current CORS configuration.

### Production database migration

After configuring the production database connection, run from the backend directory:

```bash
npx prisma migrate deploy
npx prisma generate
```

Use `prisma migrate deploy` in production. Do not use `prisma migrate dev` against the production database.

### Frontend environment and build

Set this build-time variable on the frontend hosting service:

```env
VITE_API_URL="https://YOUR_BACKEND_DOMAIN/api"
```

Build the frontend:

```bash
cd frontend
npm ci
npm run build
```

Deploy the generated `frontend/dist` directory as the static site output.

Never put database credentials, JWT secrets, or other private values in `VITE_*` variables. Vite exposes those values to the browser.

## Security and configuration notes

- Keep real `.env` files private and out of version control.
- Use a strong, unique `JWT_SECRET` in production.
- Use a production database separate from the local development database.
- Configure `CLIENT_URL` to the exact deployed frontend origin.
- Ensure `VITE_API_URL` points to the deployed backend and includes `/api`.

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for implementation progress and remaining finalization work.
