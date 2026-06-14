# Task_Flow

A production-ready MERN application for managing team projects and assigned work. It includes JWT authentication, role-based access control, MongoDB relationships with Mongoose, REST APIs, and a responsive React UI.

## Folder Structure

```text
team-task-manager/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
      app.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
      styles.css
    .env.example
    package.json
    vite.config.js
  .env.example
  package.json
  railway.json
```

## Features

- Signup and login with bcrypt password hashing
- JWT auth with protected API routes
- Admin and Member roles
- Admin project CRUD and team member management
- Admin task CRUD inside projects
- Member access limited to assigned projects and tasks
- Members can update their own task status
- Dashboard with completed, pending, and overdue counts
- Task filters by status and assigned user
- Express validation and centralized error handling
- Railway-compatible production build where Express serves the React app

## Local Setup

### 1. Prerequisites

- Node.js 20+
- npm 10+
- MongoDB local instance or MongoDB Atlas connection string

### 2. Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 3. Configure environment variables

Copy `backend/.env.example` to `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team_task_manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

For local frontend development, `frontend/.env` is optional. The Vite dev server proxies `/api` to `http://localhost:5000`. If you deploy the API separately, set:

```env
VITE_API_URL=https://your-api-host.example.com/api
```

### 4. Run the app in development

Open two terminals:

```bash
npm run dev --prefix backend
```

```bash
npm run dev --prefix frontend
```

Frontend: `http://localhost:5173`  
Backend health check: `http://localhost:5000/api/health`

### 5. Production build locally

```bash
npm run build
NODE_ENV=production npm start
```

On Windows PowerShell:

```powershell
$env:NODE_ENV="production"; npm start
```

## Railway Deployment

1. Push this repository to GitHub.
2. Create a new Railway project from the GitHub repository.
3. Add a MongoDB service in Railway or use MongoDB Atlas.
4. Add these Railway environment variables:

```env
NODE_ENV=production
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
```

5. Railway will use `railway.json`:
   - Build command: `npm run build`
   - Start command: `npm start`

The production server serves API routes from `/api/*` and the React app for all other paths.

## Roles

- `Admin`: can create, update, and delete projects; manage team members; create, update, and delete tasks.
- `Member`: can view assigned projects and tasks; can update status for tasks assigned to them.

For convenience, signup lets a user choose `Admin` or `Member`. In a stricter production environment, replace this with an invite-only admin provisioning flow.

## API Endpoints

Base URL: `/api`

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/signup` | Public | Create user and return JWT |
| POST | `/auth/login` | Public | Login and return JWT |
| GET | `/auth/me` | Authenticated | Return current user |

Signup body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "Admin"
}
```

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | Admin | List users |
| PATCH | `/users/:id/role` | Admin | Update user role |
| DELETE | `/users/:id` | Admin | Delete user and unassign related work |

### Projects

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/projects` | Authenticated | Admin sees all; members see assigned |
| POST | `/projects` | Admin | Create project |
| GET | `/projects/:id` | Project member or Admin | Get project |
| PATCH | `/projects/:id` | Admin | Update project |
| DELETE | `/projects/:id` | Admin | Delete project and tasks |

Project body:

```json
{
  "name": "Website Launch",
  "description": "Launch the new marketing site",
  "teamMembers": ["USER_OBJECT_ID"]
}
```

### Tasks

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/tasks` | Authenticated | List tasks with filters |
| GET | `/tasks/my-dashboard` | Authenticated | Current user's tasks and counts |
| PATCH | `/tasks/:id` | Admin or assigned Member | Update task; members can only update status |
| DELETE | `/tasks/:id` | Admin | Delete task |
| GET | `/projects/:projectId/tasks` | Project member or Admin | List project tasks |
| POST | `/projects/:projectId/tasks` | Admin | Create project task |

Task body:

```json
{
  "title": "Create landing page",
  "description": "Build responsive React UI",
  "assignedTo": "USER_OBJECT_ID",
  "status": "Todo",
  "dueDate": "2026-05-15"
}
```

Task filters:

```text
GET /api/tasks?status=Todo&assignedTo=USER_OBJECT_ID&project=PROJECT_OBJECT_ID
GET /api/projects/PROJECT_OBJECT_ID/tasks?status=In%20Progress
```

## Validation and Error Format

Validation errors return HTTP `422`:

```json
{
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

Authentication and authorization use HTTP `401` and `403`. Missing resources return `404`.
