import { useParams } from 'react-router-dom';
import TaskDetail from '../../components/task/TaskDetail';

const TaskDetailPage = () => {
  const { id } = useParams();
  return <TaskDetail taskId={id} />;
};

export default TaskDetailPage;