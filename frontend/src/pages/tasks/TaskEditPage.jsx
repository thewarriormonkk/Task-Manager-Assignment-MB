import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTask } from '../../context/TaskContext';
import TaskForm from '../../components/task/TaskForm';
import { toast } from 'react-toastify';

const TaskEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchTask } = useTask();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTask = async () => {
      try {
        const taskData = await fetchTask(id);
        setTask(taskData);
      } catch (err) {
        toast.error('Failed to load task');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };

    getTask();
  }, [id, fetchTask, navigate]);

  if (loading) {
    return <div className="container">Loading task...</div>;
  }

  if (!task) {
    return <div className="container">Task not found</div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/tasks/${id}`} style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
          &larr; Back to Task Details
        </Link>
      </div>
      <TaskForm task={task} isEditing={true} />
    </div>
  );
};

export default TaskEditPage;
