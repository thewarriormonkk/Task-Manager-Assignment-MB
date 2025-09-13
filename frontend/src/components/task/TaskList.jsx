import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTask } from '../../context/TaskContext';
import { format, isAfter, isBefore, isToday } from 'date-fns';

const TaskList = ({ tasks, showActions = true }) => {
  const { updateTaskStatus, deleteTask } = useTask();
  const navigate = useNavigate();
  
  // Handle task status toggle
  const handleStatusToggle = async (task, e) => {
    e.stopPropagation(); // Prevent navigation when clicking checkbox
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateTaskStatus(task._id, newStatus);
      toast.success(`Task marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };
  
  // Navigate to task details
  const goToTaskDetails = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  // Format date with simple styling (no colors)
  const formatDueDate = (dueDate) => {
    const dueDateObj = new Date(dueDate);
    
    return (
      <span className="due-date">
        {format(dueDateObj, 'MMM dd, yyyy')}
      </span>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="task-item" style={{ justifyContent: 'center' }}>
        <p>No tasks found.</p>
      </div>
    );
  }

  return (
    <>
      {tasks.map((task) => (
        <div 
          key={task._id} 
          className="task-item-clean"
          onClick={() => goToTaskDetails(task._id)}
        >
          {/* Checkbox */}
          <input 
            type="checkbox" 
            className="task-checkbox-clean" 
            checked={task.status === 'completed'}
            onChange={(e) => handleStatusToggle(task, e)}
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Task Title */}
          <div className="task-title-clean">
            {task.title}
          </div>
          
          {/* Due Date with Clock Icon */}
          <div className="task-date-clean">
            <FaClock className="date-icon-clean" />
            <span className="date-text-clean">
              {format(new Date(task.dueDate), 'EEE MMM dd yyyy')}
            </span>
          </div>
          
          {/* Edit Icon */}
          <Link 
            to={`/tasks/edit/${task._id}`} 
            className="task-edit-clean"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          
          {/* Priority Pill - Color coding on the right edge */}
          <div 
            className={`priority-pill-clean priority-${task.priority}`}
            style={{ 
              backgroundColor: task.priority === 'high' ? '#ff6b6b' : 
                              task.priority === 'medium' ? '#ffd93d' : '#6bcf7f',
              width: '4px',
              height: '100%',
              borderRadius: '0 8px 8px 0',
              flexShrink: 0,
              marginLeft: 'auto',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0
            }}
            title={`Priority: ${task.priority}`}
          ></div>
        </div>
      ))}
    </>
  );
};

export default TaskList;