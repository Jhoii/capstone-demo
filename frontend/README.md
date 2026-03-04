# Capstone Demo — Frontend

React (Vite) UI for the Capstone Demo Student Registry.

## Prerequisites

- Node.js + npm
- Backend API running (see `backend/`)

## Setup

Install dependencies:

```bash
npm install
```

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

Note: the backend mounts routes under `/api`, so the frontend will call:

- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`

## Run (dev)

```bash
npm run dev
```

## Build

```bash
npm run build
```

## UI features

- Light-only modern UI (no theme selector)
- Create student
- Edit student
- Students table with refresh + loading/empty states

## API payloads (students)

Create/update expects:

```json
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "course": "BSIT",
  "yearLevel": 1
}
```
