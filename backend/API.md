# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication Endpoints

### Signup
- **POST** `/auth/signup`
- **Body:** `{ name, email, password }`
- **Response:** `{ message, token, user }`

### Login
- **POST** `/auth/login`
- **Body:** `{ email, password }`
- **Response:** `{ message, token, user }`

### Get Current User
- **GET** `/auth/me`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** User object

## Project Endpoints

### Create Project
- **POST** `/projects`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ name, description }`
- **Response:** `{ message, project }`

### Get All Projects
- **GET** `/projects`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array of projects

### Get Single Project
- **GET** `/projects/:projectId`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Project object

### Update Project
- **PUT** `/projects/:projectId`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ name, description }`
- **Response:** `{ message, project }`

### Add Member to Project
- **POST** `/projects/:projectId/members`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ userId }`
- **Response:** `{ message, project }`

### Remove Member from Project
- **DELETE** `/projects/:projectId/members/:userId`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** `{ message, project }`

### Delete Project
- **DELETE** `/projects/:projectId`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** `{ message }`

## Task Endpoints

### Create Task
- **POST** `/tasks`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ title, description, projectId, assignee, dueDate, priority }`
- **Response:** `{ message, task }`

### Get All Tasks for Project
- **GET** `/tasks/project/:projectId`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array of tasks

### Get Single Task
- **GET** `/tasks/:taskId`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Task object

### Update Task
- **PUT** `/tasks/:taskId`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ title, description, status, priority, assignee, dueDate }`
- **Response:** `{ message, task }`

### Delete Task
- **DELETE** `/tasks/:taskId`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** `{ message }`

### Get Dashboard Stats
- **GET** `/tasks/dashboard/stats`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Dashboard statistics

## User Endpoints

### Get All Users
- **GET** `/users`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array of users

### Get User by ID
- **GET** `/users/:userId`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** User object
