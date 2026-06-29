const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getTaskEstimate,
  getQuickEstimate,
  saveEstimateToTask,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes are protected
router.use(protect);

// Quick estimate from raw input (no task ID needed)
// POST /api/ai/estimate
router.post('/estimate', getQuickEstimate);

// Estimate for an existing task
// GET /api/boards/:boardId/tasks/:taskId/estimate
router.get('/boards/:boardId/tasks/:taskId/estimate', getTaskEstimate);

// Save AI suggestion to an existing task
// POST /api/boards/:boardId/tasks/:taskId/estimate/save
router.post('/boards/:boardId/tasks/:taskId/estimate/save', saveEstimateToTask);

module.exports = router;