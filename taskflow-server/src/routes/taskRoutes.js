const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  moveTask,
  archiveTask,
  deleteTask,
  reorderTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All task routes are protected
router.use(protect);

// Base routes — /api/boards/:boardId/tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

// Reorder (bulk update) — /api/boards/:boardId/tasks/reorder
router.patch('/reorder', reorderTasks);

// Single task routes — /api/boards/:boardId/tasks/:taskId
router.route('/:taskId')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:taskId/move', moveTask);
router.patch('/:taskId/archive', archiveTask);

module.exports = router;