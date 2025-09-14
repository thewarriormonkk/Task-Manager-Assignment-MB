import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized (only for authentication issues, not authorization)
    if (error.response && error.response.status === 401) {
      // Only logout if it's a token/authentication issue, not authorization
      if (error.response.data?.message?.includes('token') ||
        error.response.data?.message?.includes('authentication') ||
        error.response.data?.message?.includes('login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.get('/users/logout'),
  getCurrentUser: () => api.get('/users/me'),
  getAllUsers: () => api.get('/users'),
};

// Task API
export const taskAPI = {
  // Get tasks with pagination and filters
  getTasks: (page = 1, limit = 5, status = '', priority = '') => {
    let url = `/tasks?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;
    return api.get(url);
  },

  // Get assigned tasks
  getAssignedTasks: (page = 1, limit = 5) =>
    api.get(`/tasks/assigned?page=${page}&limit=${limit}`),

  // Get single task
  getTask: (id) => api.get(`/tasks/${id}`),

  // Create task
  createTask: (taskData) => api.post('/tasks', taskData),

  // Update task
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),

  // Update task priority
  updateTaskPriority: (id, priority) =>
    api.put(`/tasks/${id}/priority`, { priority }),

  // Update task status
  updateTaskStatus: (id, status) =>
    api.put(`/tasks/${id}/status`, { status }),

  // Assign task to user
  assignTask: (id, userId) =>
    api.put(`/tasks/${id}/assign`, { userId }),

  // Delete task
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

