import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { FaPlus, FaCalendarAlt, FaTasks, FaClipboardCheck, FaUser, FaClock, FaCheckCircle } from 'react-icons/fa';

const DashboardPage = () => {
  const { user } = useAuth();
  const { tasks, assignedTasks, loading, fetchTasks, fetchAssignedTasks } = useTask();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [assignedPendingTasks, setAssignedPendingTasks] = useState([]);
  

  useEffect(() => {
    // Fetch tasks and assigned tasks when component mounts
    fetchTasks();
    fetchAssignedTasks();
  }, [fetchTasks, fetchAssignedTasks]);

  useEffect(() => {
    // Filter tasks by status - get all tasks for scrollers
    setPendingTasks(tasks.filter(task => task.status !== 'completed'));
    setCompletedTasks(tasks.filter(task => task.status === 'completed'));
    setAssignedPendingTasks(assignedTasks.filter(task => task.status !== 'completed'));
  }, [tasks, assignedTasks]);


  return (
    <div className="container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/tasks/create" className="dashboard-create-btn">
          <FaPlus />
          <span>Create Task</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <Link 
          to="/tasks" 
          className="stat-card stat-card-clickable"
          onClick={() => {
            sessionStorage.setItem('activeTaskTab', 'pending');
          }}
        >
          <div className="stat-icon stat-pending">
            <FaTasks />
          </div>
          <div className="stat-content">
            <div className="stat-number">{tasks.filter(task => task.status !== 'completed').length}</div>
            <div className="stat-label">Pending Tasks</div>
          </div>
        </Link>
        
        <Link 
          to="/tasks" 
          className="stat-card stat-card-clickable"
          onClick={() => {
            sessionStorage.setItem('activeTaskTab', 'completed');
          }}
        >
          <div className="stat-icon stat-completed">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-number">{tasks.filter(task => task.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </Link>
        
        <Link 
          to="/tasks/assigned" 
          className="stat-card stat-card-clickable"
        >
          <div className="stat-icon stat-assigned">
            <FaUser />
          </div>
          <div className="stat-content">
            <div className="stat-number">{assignedTasks.filter(task => task.status !== 'completed').length}</div>
            <div className="stat-label">Assigned to You</div>
          </div>
        </Link>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        {/* Pending Tasks */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-title">
              <FaTasks className="card-icon card-icon-pending" />
              <h3>Pending Tasks</h3>
            </div>
            <div className="card-count">{pendingTasks.length}</div>
          </div>
          
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : pendingTasks.length > 0 ? (
              <div className="pending-tasks-container">
                <div className="task-list-scrollable">
                  {pendingTasks.map(task => (
                    <Link key={task._id} to={`/tasks/${task._id}`} className="dashboard-task-item">
                      <div className="task-priority-indicator priority-{task.priority}"></div>
                      <div className="task-content">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-meta">
                          <FaCalendarAlt className="meta-icon" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="task-status-badge status-pending">Pending</div>
                    </Link>
                  ))}
                </div>
                
              </div>
            ) : (
              <div className="empty-state">
                <FaTasks className="empty-icon" />
                <p>No pending tasks</p>
              </div>
            )}
            
            {pendingTasks.length > 3 && (
              <div className="card-footer">
                <Link 
                  to="/tasks" 
                  className="view-all-link"
                  onClick={() => sessionStorage.setItem('activeTaskTab', 'pending')}
                >
                  View all {pendingTasks.length} pending tasks
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-title">
              <FaCheckCircle className="card-icon card-icon-completed" />
              <h3>Recently Completed</h3>
            </div>
            <div className="card-count">{completedTasks.length}</div>
          </div>
          
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : completedTasks.length > 0 ? (
              <div className="completed-tasks-container">
                <div className="task-list-scrollable">
                  {completedTasks.map(task => (
                    <Link key={task._id} to={`/tasks/${task._id}`} className="dashboard-task-item">
                      <div className="task-priority-indicator priority-{task.priority}"></div>
                      <div className="task-content">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-meta">
                          <FaCalendarAlt className="meta-icon" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="task-status-badge status-completed">Completed</div>
                    </Link>
                  ))}
                </div>
                
              </div>
            ) : (
              <div className="empty-state">
                <FaCheckCircle className="empty-icon" />
                <p>No completed tasks</p>
              </div>
            )}
            
            {completedTasks.length > 3 && (
              <div className="card-footer">
                <Link 
                  to="/tasks" 
                  className="view-all-link"
                  onClick={() => sessionStorage.setItem('activeTaskTab', 'completed')}
                >
                  View all {completedTasks.length} completed tasks
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="card-title">
              <FaUser className="card-icon card-icon-assigned" />
              <h3>Assigned to You</h3>
            </div>
            <div className="card-count">{assignedPendingTasks.length}</div>
          </div>
          
          <div className="dashboard-card-content">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : assignedPendingTasks.length > 0 ? (
              <div className="assigned-tasks-container">
                <div className="task-list-scrollable">
                  {assignedPendingTasks.map(task => (
                    <Link key={task._id} to={`/tasks/${task._id}`} className="dashboard-task-item">
                      <div className="task-priority-indicator priority-{task.priority}"></div>
                      <div className="task-content">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-meta">
                          <FaCalendarAlt className="meta-icon" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="task-status-badge status-assigned">Assigned</div>
                    </Link>
                  ))}
                </div>
                
              </div>
            ) : (
              <div className="empty-state">
                <FaUser className="empty-icon" />
                <p>No tasks assigned to you</p>
              </div>
            )}
            
            {assignedPendingTasks.length > 3 && (
              <div className="card-footer">
                <Link to="/tasks/assigned" className="view-all-link">
                  View all {assignedPendingTasks.length} assigned tasks
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;