const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getAssignedTasks,
  getTask,
  updateTask,
  updateTaskPriority,
  updateTaskStatus,
  assignTask,
  deleteTask
} = require('../controllers/taskController');

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/assigned', getAssignedTasks);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.put('/:id/priority', updateTaskPriority);
router.put('/:id/status', updateTaskStatus);
router.put('/:id/assign', assignTask);

module.exports = router;
