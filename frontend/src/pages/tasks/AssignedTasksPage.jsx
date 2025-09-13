import { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import TaskList from '../../components/task/TaskList';

const AssignedTasksPage = () => {
  const { assignedTasks, loading, error, pagination, fetchAssignedTasks } = useTask();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAssignedTasks(currentPage);
  }, [fetchAssignedTasks, currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="container">
      <h1>Tasks Assigned to Me</h1>
      {loading ? (
        <div className="card">Loading assigned tasks...</div>
      ) : error ? (
        <div className="card">Error loading tasks. Please try again later.</div>
      ) : (
        <>
          <TaskList tasks={assignedTasks} showActions={false} />
          
          {/* Pagination */}
          {assignedTasks.length > 0 && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn"
              >
                Previous
              </button>
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="btn"
              >
                Next
              </button>
            </div>
          )}
          
          {assignedTasks.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No tasks have been assigned to you yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssignedTasksPage;
