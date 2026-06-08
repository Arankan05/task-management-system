# Task Management System Backend

Backend API for the Task Management System project.

## Tech Stack

- Node.js
- Express.js
- MySQL
- Prisma ORM
- JWT Authentication
- Swagger API Docs

---

## Installation

```bash
npm install
```

---

## Run Server

```bash
npm run dev
```

---

## Environment Variables

Create `.env` file:

```env
PORT=5000
JWT_SECRET=your_secret_key
DATABASE_URL="mysql://root:@localhost:3306/task_management"
```

---

## API Base URL

```txt
http://localhost:5000/api/v1
```

---

## Features

- JWT Authentication
- Role Based Access Control
- Task CRUD APIs
- Validation Middleware
- Prisma ORM Integration

---

## Folder Structure

```txt
src/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── utils/
└── app.js
```
