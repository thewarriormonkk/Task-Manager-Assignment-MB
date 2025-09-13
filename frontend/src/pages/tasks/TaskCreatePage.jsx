import { Link } from 'react-router-dom';
import TaskForm from '../../components/task/TaskForm';

const TaskCreatePage = () => {
  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/tasks" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
          &larr; Back to Tasks
        </Link>
      </div>
      <TaskForm />
    </div>
  );
};

export default TaskCreatePage;
