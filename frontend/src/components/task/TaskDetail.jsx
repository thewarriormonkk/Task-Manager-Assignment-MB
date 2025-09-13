import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaUndo, 
  FaArrowLeft, 
  FaClock, 
  FaCalendarAlt,
  FaUser,
  FaTag
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTask } from '../../context/TaskContext';

const TaskDetail = ({ taskId }) => {
  const navigate = useNavigate();
  const { fetchTask, updateTaskStatus, updateTaskPriority, deleteTask } = useTask();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const getTask = async () => {
      try {
        const taskData = await fetchTask(taskId);
        setTask(taskData);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to load task details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      getTask();
    } else {
      setError('No task ID provided');
      setLoading(false);
    }
  }, [taskId, fetchTask]);

  // Handle status toggle
  const handleStatusChange = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTaskStatus(taskId, newStatus);
      setTask({ ...task, status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Handle status change from dropdown
  const handleStatusDropdownChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateTaskStatus(taskId, newStatus);
      setTask({ ...task, status: newStatus });
      toast.success(`Task status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Handle priority change
  const handlePriorityChange = async (e) => {
    const priority = e.target.value;
    try {
      await updateTaskPriority(taskId, priority);
      setTask({ ...task, priority });
      toast.success(`Priority updated to ${priority}`);
    } catch (err) {
      toast.error('Failed to update task priority');
    }
  };

  // Handle task deletion with confirmation
  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="task-detail-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="loading-spinner">Loading task details...</div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container">
        <div className="task-detail-container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-color)' }}>
          <h3>Error Loading Task</h3>
          <p>{error || 'Task not found'}</p>
          <Link to="/tasks" className="add-task-btn" style={{ marginTop: '1rem' }}>
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="container">
      <Link to="/tasks" className="back-link">
        <FaArrowLeft /> Back to Tasks
      </Link>

      <div className="task-detail-container">
        {/* Task Header */}
        <div className="task-detail-header">
          <div className="task-header-content">
            <div className="task-title-section">
              <input 
                type="checkbox" 
                className="task-checkbox" 
                checked={task.status === 'completed'}
                onChange={handleStatusChange}
              />
              <h1 className="task-detail-title">{task.title}</h1>
            </div>
            <div className="task-status-section">
              <span className={`task-detail-status ${getStatusClass(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
            </div>
          </div>
          <div className={`task-detail-priority priority-${task.priority}`}></div>
        </div>

        {/* Task Body */}
        <div className="task-detail-body">
          {/* Description */}
          <div className="task-detail-section">
            <span className="task-detail-label">Description</span>
            <div className="task-detail-description">
              {task.description}
            </div>
          </div>

          {/* Task Meta Information */}
          <div className="task-detail-meta">
            <div className="task-detail-meta-item">
              <FaCalendarAlt />
              <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="task-detail-meta-item">
              <FaClock />
              <span>Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className="task-detail-meta-item">
              <FaTag />
              <span>Priority: 
                <select
                  value={task.priority}
                  onChange={handlePriorityChange}
                  className={`form-control select-inline select-priority priority-${task.priority}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </span>
            </div>
            <div className="task-detail-meta-item">
              <FaCheck />
              <span>Status: 
                <select
                  value={task.status}
                  onChange={handleStatusDropdownChange}
                  className={`form-control select-inline select-status status-${task.status}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </span>
            </div>
            <div className="task-detail-meta-item">
              <FaUser />
              <span>Assigned to: {task.assignedTo?.name || 'Not assigned'}</span>
            </div>
            <div className="task-detail-meta-item">
              <FaUser />
              <span>Assigned by: {task.user?.name || 'Unknown'}</span>
            </div>
          </div>

          {/* Task Actions */}
          <div className="task-detail-actions">
            <Link to={`/tasks/edit/${task._id}`} className="add-task-btn">
              <FaEdit /> Edit Task
            </Link>
            <button
              className="add-task-btn"
              style={{ backgroundColor: 'var(--danger-color)' }}
              onClick={openDeleteModal}
            >
              <FaTrash /> Delete Task
            </button>
          </div>
        </div>

      </div>

      {/* Beautiful Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">
                <FaTrash />
              </div>
              <h3>Delete Task</h3>
            </div>
            
            <div className="modal-content">
              <p>Are you sure you want to delete this task?</p>
              <div className="task-preview">
                <strong>"{task?.title}"</strong>
                <span className="task-meta">
                  Due: {task?.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                </span>
              </div>
              <p className="warning-text">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-delete" 
                onClick={() => {
                  closeDeleteModal();
                  handleDelete();
                }}
              >
                <FaTrash /> Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;