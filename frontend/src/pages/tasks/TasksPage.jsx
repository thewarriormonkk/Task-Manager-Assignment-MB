import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../../context/TaskContext';
import TaskList from '../../components/task/TaskList';
import { FaPlus, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const TasksPage = () => {
  const { 
    tasks, 
    loading, 
    error,
    fetchTasks
  } = useTask();
  
  // Get active tab from sessionStorage or default to 'pending'
  const getStoredActiveTab = () => {
    try {
      const storedTab = sessionStorage.getItem('activeTaskTab');
      return storedTab || 'pending';
    } catch (error) {
      console.error('Error retrieving active tab from sessionStorage:', error);
      return 'pending';
    }
  };
  
  // Get stored page for current tab
  const getStoredPage = (tab) => {
    try {
      const storedPage = sessionStorage.getItem(`activePage_${tab}`);
      return storedPage ? parseInt(storedPage, 10) : 1;
    } catch (error) {
      console.error('Error retrieving active page from sessionStorage:', error);
      return 1;
    }
  };

  const [activeTab, setActiveTab] = useState(getStoredActiveTab);
  const [currentPage, setCurrentPage] = useState(getStoredPage(getStoredActiveTab()));
  const [priorityFilter, setPriorityFilter] = useState('all');
  const tasksPerPage = 5;
  const hasFetchedTasks = useRef(false);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newPage = getStoredPage(tab);
    setCurrentPage(newPage);
    sessionStorage.setItem('activeTaskTab', tab);
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
    setCurrentPage(1); // Reset to page 1 when filter changes
    sessionStorage.setItem(`activePage_${activeTab}`, '1');
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    sessionStorage.setItem(`activePage_${activeTab}`, page.toString());
  };

  // Filter tasks based on active tab using useMemo for performance
  const filteredTasks = useMemo(() => {
    console.log('DEBUG: TasksPage - Total tasks available:', tasks.length);
    console.log('DEBUG: TasksPage - Active tab:', activeTab);
    console.log('DEBUG: TasksPage - Tasks data:', tasks);
    
    if (tasks.length === 0) return [];
    
    const now = new Date();
    // Normalize today's date to start of day for proper comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filtered = [];
    switch(activeTab) {
      case 'completed':
        filtered = tasks.filter(task => task.status === 'completed');
        break;
      case 'overdue':
        filtered = tasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          // Normalize due date to start of day
          const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          // Overdue: due date is before today AND task is not completed
          return dueDateNormalized < today && task.status !== 'completed';
        });
        break;
      case 'pending':
      default:
        filtered = tasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          // Normalize due date to start of day
          const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          // Pending: task is not completed AND (due date is today or in the future)
          return task.status !== 'completed' && dueDateNormalized >= today;
        });
        break;
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    console.log('DEBUG: TasksPage - Filtered tasks for', activeTab, ':', filtered.length);
    console.log('DEBUG: TasksPage - Filtered tasks data:', filtered);
    return filtered;
  }, [tasks, activeTab, priorityFilter]);

  // Calculate pagination for filtered tasks
  const totalFilteredTasks = filteredTasks.length;
  const totalPages = Math.ceil(totalFilteredTasks / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Reset to page 1 when filtered tasks change and current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      sessionStorage.setItem(`activePage_${activeTab}`, '1');
    }
  }, [filteredTasks, currentPage, totalPages, activeTab]);

  // Ensure tasks are fetched when component mounts
  useEffect(() => {
    if (!hasFetchedTasks.current && !loading) {
      hasFetchedTasks.current = true;
      fetchTasks();
    }
  }, [fetchTasks, loading]);


  return (
    <div className="container">
      {/* Navigation Tabs */}
      <div className="app-nav">
        <button 
          className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          Pending
        </button>
        <button 
          className={`nav-tab ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => handleTabChange('overdue')}
        >
          Overdue
        </button>
        <button 
          className={`nav-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => handleTabChange('completed')}
        >
          Completed
        </button>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <div className="section-header">
          <div className="priority-filter-container">
            <select 
              className="priority-filter-dropdown"
              value={priorityFilter}
              onChange={(e) => handlePriorityFilterChange(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <Link to="/tasks/create" className="add-task-btn">
            <FaPlus size={14} /> Add Task
          </Link>
        </div>

        {loading ? (
          <div className="task-item" style={{ justifyContent: 'center' }}>
            <p>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="task-item" style={{ justifyContent: 'center', color: 'var(--priority-high)' }}>
            <p>Error loading tasks. Please try again later.</p>
          </div>
        ) : (
          <>
            <TaskList tasks={currentTasks} />

            {/* Pagination - Only show if there are more than 5 tasks in the current tab */}
            {totalFilteredTasks > tasksPerPage && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaArrowLeft />
                </button>
                
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
            
            {/* Pagination Info - Only show if there are tasks */}
            {totalFilteredTasks > 0 && (
              <div className="pagination-info">
                {totalPages > 1 ? (
                  <>Showing page {currentPage} of {totalPages} ({totalFilteredTasks} {activeTab} tasks total)</>
                ) : (
                  <>{totalFilteredTasks} {activeTab} task{totalFilteredTasks !== 1 ? 's' : ''}</>
                )}
              </div>
            )}

            {/* No Tasks Message */}
            {totalFilteredTasks === 0 && (
              <div className="task-item" style={{ justifyContent: 'center' }}>
                <p>
                  {activeTab === 'completed' ? 'No completed tasks.' : 
                   activeTab === 'overdue' ? 'No overdue tasks.' : 'No pending tasks.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TasksPage;