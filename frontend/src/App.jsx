import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './index.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

// Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/shared/PrivateRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Task Pages
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import TaskCreatePage from './pages/tasks/TaskCreatePage';
import TaskEditPage from './pages/tasks/TaskEditPage';
import AssignedTasksPage from './pages/tasks/AssignedTasksPage';

// Landing Page
const LandingPage = () => {
  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Task Manager</h1>
      </header>
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Welcome to Task Manager. Please login or register to manage your tasks.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a href="/login" className="add-task-btn">
              Login
            </a>
            <a href="/register" className="add-task-btn" style={{ backgroundColor: '#64748b' }}>
              Register
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaskProvider>
          <ToastContainer 
            position="top-right" 
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Task Routes */}
                <Route path="tasks">
                  <Route index element={<TasksPage />} />
                  <Route path="create" element={<TaskCreatePage />} />
                  <Route path=":id" element={<TaskDetailPage />} />
                  <Route path="edit/:id" element={<TaskEditPage />} />
                  <Route path="assigned" element={<AssignedTasksPage />} />
                </Route>
              </Route>

              {/* Catch all - redirect to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </TaskProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;