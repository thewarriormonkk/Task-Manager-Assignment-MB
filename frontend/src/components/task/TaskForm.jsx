import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const TaskForm = ({ task, isEditing = false }) => {
  const navigate = useNavigate();
  const { createTask, updateTask, assignTask, error } = useTask();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users for assignment
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await authAPI.getAllUsers();
        // Filter out current user from assignment options
        const filteredUsers = response.data.data.filter(u => u._id !== user?._id);
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    loadUsers();
  }, [user]);

  // If editing, populate form with task data
  useEffect(() => {
    if (isEditing && task) {
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate),
        priority: task.priority,
        assignedTo: task.assignedTo?._id || '',
      });
    }
  }, [isEditing, task]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dueDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditing) {
        // Update task with all data including assignment
        await updateTask(task._id, formData);
        
        toast.success('Task updated successfully');
        navigate(`/tasks`);
      } else {
        // Prepare task data with default assignment to current user if no one is assigned
        const taskData = {
          ...formData,
          assignedTo: formData.assignedTo || user._id
        };
        
        // Create task
        const newTask = await createTask(taskData);
        
        toast.success('Task created successfully');
        // Ensure we're on the pending tab when navigating to tasks
        sessionStorage.setItem('activeTaskTab', 'pending');
        navigate(`/tasks`);
      }
    } catch (err) {
      toast.error(error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">
        {/* <h1 className="app-title">Task Manager</h1> */}
      </header>

      <div className="container">
        <div className="task-form">
          <h2>{isEditing ? 'Edit Task' : 'Add Task'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Task Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
                rows="4"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                Due Date
              </label>
              <DatePicker
                id="dueDate"
                selected={formData.dueDate}
                onChange={handleDateChange}
                className="form-control"
                dateFormat="MMM dd, yyyy"
                minDate={new Date()}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className={`form-control select-priority priority-${formData.priority}`}
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="assignedTo" className="form-label">
                Assign To
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                className="form-control select-assignment"
                value={formData.assignedTo}
                onChange={handleChange}
                disabled={loadingUsers}
              >
                <option value="">Select a user (optional)</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {loadingUsers && (
                <small className="form-text">Loading users...</small>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="add-task-btn"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading
                  ? isEditing
                    ? 'Updating...'
                    : 'Adding...'
                  : isEditing
                  ? 'Update Task'
                  : 'Add Task'}
              </button>
              <button
                type="button"
                className="add-task-btn"
                style={{ 
                  flex: 1, 
                  backgroundColor: '#e0e0e0', 
                  color: '#333'
                }}
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TaskForm;