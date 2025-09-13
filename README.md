# Task Manager - MERN Stack Task Management System

A modern, responsive task management application built with the MERN stack. Task Manager helps users organize their work with an intuitive interface, real-time updates, and comprehensive task tracking capabilities.

## 🚀 Features

### Core Functionality

- **User Authentication** - Secure registration, login, logout with JWT tokens
- **Task Management** - Create, edit, delete, and organize tasks with rich details
- **Smart Filtering** - Filter tasks by status (Pending, Overdue, Completed) and priority (High, Medium, Low)
- **Task Assignment** - Assign tasks to team members and track assigned work
- **Dashboard Overview** - Clickable summary cards showing pending, completed, and assigned tasks
- **Due Date Tracking** - Calendar integration with overdue task detection
- **Responsive Design** - Beautiful, mobile-first UI that works on all devices

### User Experience

- **Real-time Updates** - Instant feedback with toast notifications
- **Persistent State** - Tab selections and pagination state saved across sessions
- **Touch-Friendly** - Optimized for mobile devices with proper touch targets
- **Clean Interface** - Modern card-based design with subtle animations
- **Client-side Pagination** - Fast, smooth pagination with 5 tasks per page
- **Loading Animations** - Beautiful loading screens with smooth transitions
- **Password Visibility Toggle** - Eye icon to show/hide passwords
- **Custom Confirmation Modal** - Beautiful delete confirmation dialog

## 🏗️ Architecture

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic (users, tasks)
│   ├── middleware/      # Authentication & error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── server.js        # Application entry point
```

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Login/Register forms
│   │   ├── layout/      # Header, Layout components
│   │   ├── shared/      # LoadingScreen, PrivateRoute
│   │   └── task/        # TaskForm, TaskList, TaskDetail
│   ├── context/         # AuthContext, TaskContext
│   ├── pages/           # Route components
│   │   ├── auth/        # LoginPage, RegisterPage
│   │   ├── dashboard/   # DashboardPage
│   │   └── tasks/       # TasksPage, TaskDetailPage, etc.
│   ├── services/        # API communication
│   └── utils/           # Helper functions
├── public/              # Static assets, favicon, manifest
└── index.html           # HTML template with meta tags
```

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend

- **React 19** - UI library with hooks
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management (AuthContext, TaskContext)
- **Axios** - HTTP client with interceptors
- **React Icons** - Icon library (FontAwesome)
- **React Toastify** - Notifications
- **date-fns** - Date manipulation and formatting
- **React DatePicker** - Date input component
- **Formik + Yup** - Form handling and validation

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or Atlas cloud)
- **npm** or **yarn** package manager

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Magnet Brains Task"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/task_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start the Application

**Backend Server:**

```bash
cd backend
npm run dev
```

**Frontend Development Server:**

```bash
cd frontend
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔌 API Endpoints

### Authentication

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | `/api/users/register` | Register new user |
| POST   | `/api/users/login`    | User login        |
| GET    | `/api/users/logout`   | User logout       |
| GET    | `/api/users/me`       | Get current user  |
| GET    | `/api/users`          | Get all users     |

### Tasks

| Method | Endpoint                  | Description                           |
| ------ | ------------------------- | ------------------------------------- |
| GET    | `/api/tasks`              | Get tasks (with pagination & filters) |
| POST   | `/api/tasks`              | Create new task                       |
| GET    | `/api/tasks/:id`          | Get single task                       |
| PUT    | `/api/tasks/:id`          | Update task                           |
| DELETE | `/api/tasks/:id`          | Delete task                           |
| PUT    | `/api/tasks/:id/status`   | Update task status                    |
| PUT    | `/api/tasks/:id/priority` | Update task priority                  |
| PUT    | `/api/tasks/:id/assign`   | Assign task to user                   |
| GET    | `/api/tasks/assigned`     | Get assigned tasks                    |

## 🎨 Key Features Explained

### Smart Task Filtering

The application features intelligent task categorization:

- **Pending**: Tasks due today or in the future
- **Overdue**: Tasks past their due date
- **Completed**: Finished tasks
- **Priority Filter**: Filter by High, Medium, Low priority across all tabs

Each category maintains independent pagination and state persistence.

### Dashboard Overview

Interactive dashboard with clickable summary cards:

- **Pending Tasks**: Shows count and recent pending tasks
- **Completed Tasks**: Shows count and recent completed tasks
- **Assigned to You**: Shows tasks assigned to current user
- **Quick Actions**: Direct links to create tasks and view all tasks

### Task Assignment System

- **User Selection**: Dropdown to assign tasks to any registered user
- **Assignment Tracking**: Shows "Assigned by" and "Assigned to" information
- **Reassignment**: Edit tasks to reassign to different users
- **Assigned Tasks Page**: Dedicated page for tasks assigned to you

### Responsive Design

Built with a mobile-first approach:

- **Touch-friendly** interface with 44px minimum touch targets
- **Adaptive layouts** that work on phones, tablets, and desktops
- **Optimized typography** that scales across screen sizes
- **Safe area support** for devices with notches
- **Custom scrollbars** with beautiful styling

### State Management

- **Context API** for global state (authentication, tasks)
- **Session storage** for persistent user preferences (tabs, pagination)
- **Optimistic updates** for better user experience
- **Error handling** with user-friendly messages

## 🔒 Security Features

- **JWT-based authentication** with secure token storage
- **Password hashing** using bcryptjs
- **Protected routes** with middleware validation
- **Input validation** and sanitization
- **CORS configuration** for secure cross-origin requests

## 📱 Mobile Optimization

- **Progressive Web App** ready with manifest.json
- **Touch gestures** support
- **Performance optimized** with lazy loading
- **Accessibility** compliant with WCAG guidelines
- **Custom favicon** with green theme matching dashboard
- **Loading animations** with smooth transitions
- **Password visibility toggle** for better UX

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or local MongoDB instance
2. Configure environment variables in production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment

1. Build the production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting service
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 🎯 Project Structure

```
Task-Manager-Task-MB/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth & error handling
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   └── server.js       # Entry point
│   └── package.json
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # State management
│   │   ├── pages/          # Route components
│   │   ├── services/       # API calls
│   │   └── utils/          # Helpers
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

---
