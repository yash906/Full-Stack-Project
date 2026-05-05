# Project Management Web App

Full-stack application for project and task management with role-based access control.

## Features

- User authentication with JWT tokens
- Project and team management
- Task creation, assignment, and tracking
- Dashboard with statistics
- Role-based access (Admin/Member)

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication

**Frontend:**
- HTML5, CSS3
- Vanilla JavaScript
- Fetch API

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm

### Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file in `backend` folder:
   ```
   MONGODB_URI=mongodb://localhost:27017/project-management
   JWT_SECRET=your_secret_key
   PORT=5000
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open `frontend/index.html` in your browser

## API Documentation

See [backend/API.md](backend/API.md) for API endpoints.

## Database Models

- **User**: id, email, password, name, role
- **Project**: id, name, description, admin, members
- **Task**: id, title, project, assignee, status, dueDate
