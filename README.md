# TASKPULSE — Task Management System

Full-stack MERN-style application (React + Express + MySQL/Prisma).

## Project Structure

```txt
task-management-system/
├── prisma/           # Database schema & migrations (shared)
├── prisma.config.ts
├── backend/          # Express API, Socket.io
│   ├── src/
│   ├── scripts/
│   └── package.json
├── frontend/         # React + Vite + Redux
│   └── src/
└── package.json      # Root scripts (orchestration)
```

## Setup

```bash
# Install all dependencies
npm run install:all

# Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL, JWT_SECRET, etc.
```

## Run

From project root:

```bash
# Backend only (port 5000)
npm run dev

# Frontend only (port 5173)
npm run dev:frontend
```

Run both in separate terminals for full-stack development.

## Environment

- **Backend:** `backend/.env`
- **Frontend:** `frontend/.env` (optional — Vite proxy is recommended)

## API

- Base URL: `http://localhost:5000/api`
- Swagger docs: `http://localhost:5000/api-docs`

port killer - taskkill /PID 16220 /F