import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

// Store pagination state in sessionStorage to persist between page reloads
const getStoredPagination = () => {
  try {
    const storedPagination = sessionStorage.getItem('taskPagination');
    if (storedPagination) {
      return JSON.parse(storedPagination);
    }
  } catch (error) {
    console.error('Error retrieving pagination from sessionStorage:', error);
  }
  return {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };
};

// Store filters in sessionStorage to persist between page reloads
const getStoredFilters = () => {
  try {
    const storedFilters = sessionStorage.getItem('taskFilters');
    if (storedFilters) {
      return JSON.parse(storedFilters);
    }
  } catch (error) {
    console.error('Error retrieving filters from sessionStorage:', error);
  }
  return {
    status: '',
    priority: ''
  };
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(getStoredPagination());
  const [filters, setFilters] = useState(getStoredFilters());

  // Update sessionStorage when pagination changes
  useEffect(() => {
    if (pagination) {
      sessionStorage.setItem('taskPagination', JSON.stringify(pagination));
    }
  }, [pagination]);

  // Update sessionStorage when filters change
  useEffect(() => {
    if (filters) {
      sessionStorage.setItem('taskFilters', JSON.stringify(filters));
    }
  }, [filters]);

  // Fetch tasks with pagination and filters
  const fetchTasks = useCallback(async (page = 1, status = '', priority = '') => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      // For TasksPage, we need all tasks for client-side filtering
      // Always fetch from page 1 with large limit to get all tasks
      console.log('DEBUG: Frontend - Fetching tasks...');
      const response = await taskAPI.getTasks(1, 1000, '', '');
      console.log('DEBUG: Frontend - API response:', response.data);
      console.log('DEBUG: Frontend - Tasks received:', response.data.data);
      console.log('DEBUG: Frontend - Tasks count:', response.data.data?.length);
      setTasks(response.data.data);
      
      // Extract pagination info from response
      const total = response.data.pagination?.total || response.data.count || 0;
      const totalPages = response.data.pagination?.totalPages || Math.ceil(total / 5);
      
      setPagination(prev => ({
        ...prev,
        page: 1,
        total,
        totalPages
      }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch assigned tasks
  const fetchAssignedTasks = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await taskAPI.getAssignedTasks(page, pagination.limit);
      setAssignedTasks(response.data.data);
      
      // Extract pagination info for assigned tasks
      if (response.data.pagination) {
        const total = response.data.pagination.total || response.data.count || 0;
        const totalPages = response.data.pagination.totalPages || 
          Math.ceil(total / pagination.limit);
        
        // Only update pagination for assigned tasks view if needed
        if (window.location.pathname.includes('/tasks/assigned')) {
          setPagination({
            ...pagination,
            page: response.data.pagination.page || page,
            total,
            totalPages
          });
        }
      }
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagination.limit]);

  // Fetch single task
  const fetchTask = useCallback(async (taskId) => {
    if (!taskId) {
      return null;
    }
    
    setLoading(true);
    try {
      console.log('DEBUG: Frontend - Fetching task with ID:', taskId);
      const response = await taskAPI.getTask(taskId);
      console.log('DEBUG: Frontend - Task response:', response.data);
      console.log('DEBUG: Frontend - Task data:', response.data.data);
      setCurrentTask(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('DEBUG: Frontend - Error fetching task:', error);
      console.error('DEBUG: Frontend - Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to fetch task');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new task
  const createTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.createTask(taskData);
      // Refresh tasks after creating a new one
      fetchTasks(pagination.page, filters.status, filters.priority);
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task');
      console.error('Error creating task:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.updateTask(taskId, taskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? response.data.data : task
        )
      );
      if (currentTask && currentTask._id === taskId) {
        setCurrentTask(response.data.data);
      }
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task');
      console.error('Error updating task:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update task priority
  const updateTaskPriority = async (taskId, priority) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.updateTaskPriority(taskId, priority);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? response.data.data : task
        )
      );
      if (currentTask && currentTask._id === taskId) {
        setCurrentTask(response.data.data);
      }
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task priority');
      console.error('Error updating task priority:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.updateTaskStatus(taskId, status);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? response.data.data : task
        )
      );
      if (currentTask && currentTask._id === taskId) {
        setCurrentTask(response.data.data);
      }
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task status');
      console.error('Error updating task status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Assign task to user
  const assignTask = async (taskId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.assignTask(taskId, userId);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? response.data.data : task
        )
      );
      if (currentTask && currentTask._id === taskId) {
        setCurrentTask(response.data.data);
      }
      return response.data.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign task');
      console.error('Error assigning task:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      await taskAPI.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      if (currentTask && currentTask._id === taskId) {
        setCurrentTask(null);
      }
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete task');
      console.error('Error deleting task:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchTasks(1, newFilters.status, newFilters.priority);
  };

  // Change page
  const changePage = (page) => {
    fetchTasks(page, filters.status, filters.priority);
  };

  // Load tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Use the stored pagination page and filters
      fetchTasks(pagination.page, filters.status, filters.priority);
      fetchAssignedTasks();
    } else {
      setTasks([]);
      setAssignedTasks([]);
      setCurrentTask(null);
    }
  }, [isAuthenticated, fetchTasks, fetchAssignedTasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        assignedTasks,
        currentTask,
        loading,
        error,
        pagination,
        filters,
        fetchTasks,
        fetchAssignedTasks,
        fetchTask,
        createTask,
        updateTask,
        updateTaskPriority,
        updateTaskStatus,
        assignTask,
        deleteTask,
        applyFilters,
        changePage,
        setCurrentTask
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;