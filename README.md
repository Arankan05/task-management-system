# TASKPULSE — Task Management System

Full-stack task management application (React + Express + MySQL/Prisma).

## Project Structure

```txt
task-management-system/
├── prisma/              # Database schema & migrations (shared)
├── prisma.config.ts     # Prisma CLI config (DB URL, schema path)
├── backend/             # Express API, Socket.io
│   ├── src/
│   ├── scripts/
│   └── package.json
├── frontend/            # React + Vite + Redux
│   └── src/
├── e2e-tests/           # Playwright end-to-end tests
└── package.json         # Root scripts (orchestration)
```

## Setup

```bash
# Install all dependencies
npm run install:all

# Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env: DATABASE_URL, JWT_SECRET, CLIENT_URL, email, etc.

# Apply database schema
npm run prisma:push
```

## Development

Run **both** servers in separate terminals:

```bash
# Terminal 1 — API + Socket.io (port 5000)
npm run dev

# Terminal 2 — Vite dev server (port 5173)
npm run dev:frontend
```

Open http://localhost:5173

## Production Build (Frontend)

```bash
cd frontend

# Lint
npm run lint

# Build static assets → frontend/dist
npm run build

# Preview production build locally (default port 4173)
npm run preview
```

### Frontend environment (`frontend/.env`)

For **local preview** with the Vite proxy (recommended while developing):

```env
# Uses vite.config.js proxy to backend — cookies work on same origin
# VITE_API_URL=/api
# VITE_SOCKET_URL=
```

For **production deployment** (frontend hosted separately from API):

```env
VITE_API_URL=https://your-api.example.com/api
VITE_SOCKET_URL=https://your-api.example.com
```

Copy from `frontend/.env.example` and adjust URLs for your host.

## Testing

```bash
# E2E (requires backend + frontend running)
cd e2e-tests
npm install
npx playwright test
```

## API

- Base URL (dev): `http://localhost:5000/api`
- Swagger docs: `http://localhost:5000/api-docs`

## Integration Checklist

With backend and frontend running, verify:

- [ ] Register / login / logout
- [ ] Create workspace, add member
- [ ] Create / edit / delete task
- [ ] Kanban drag-and-drop status change
- [ ] Notifications bell + clear all
- [ ] Profile update, app settings / theme
- [ ] Protected routes redirect when logged out
