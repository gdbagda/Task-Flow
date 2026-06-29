const Task = require('../models/Task');
const Board = require('../models/Board');
const { estimateTask } = require('../services/geminiService');

// ─── Get AI Estimate for a Task ───────────────────────────────────────────────
const getTaskEstimate = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;

    // Verify board ownership
    const board = await Board.findOne({
      _id: boardId,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Verify task ownership
    const task = await Task.findOne({
      _id: taskId,
      board: boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Call Gemini service
    const estimate = await estimateTask(task.title, task.description);

    res.status(200).json({
      success: true,
      estimate,
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Estimate from Raw Input (before task is saved) ───────────────────────
const getQuickEstimate = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        errors: { title: 'Title must be at least 2 characters' },
      });
    }

    const estimate = await estimateTask(title.trim(), description?.trim() || '');

    res.status(200).json({
      success: true,
      estimate,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Save AI Suggestion to Task ───────────────────────────────────────────────
const saveEstimateToTask = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;
    const { estimatedHours, suggestedDueDate, reason, confidence, breakdown } =
      req.body;

    // Verify board ownership
    const board = await Board.findOne({
      _id: boardId,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const task = await Task.findOne({
      _id: taskId,
      board: boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Validate estimate values
    if (estimatedHours !== undefined) {
      const hours = Number(estimatedHours);
      if (isNaN(hours) || hours < 0 || hours > 1000) {
        return res.status(400).json({
          success: false,
          errors: { estimatedHours: 'Must be a number between 0 and 1000' },
        });
      }
      task.estimatedHours = hours;
    }

    if (suggestedDueDate !== undefined && suggestedDueDate !== null) {
      const date = new Date(suggestedDueDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          errors: { suggestedDueDate: 'Must be a valid date' },
        });
      }
      // Optionally apply to task due date if not already set
      if (!task.dueDate) {
        task.dueDate = date;
      }
    }

    // Store full AI suggestion on task
    task.aiSuggestion = {
      estimatedHours: estimatedHours ? Number(estimatedHours) : null,
      suggestedDueDate: suggestedDueDate ? new Date(suggestedDueDate) : null,
      reason: reason || '',
      generatedAt: new Date(),
    };

    await task.save();

    res.status(200).json({
      success: true,
      message: 'AI estimate saved to task',
      task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTaskEstimate, getQuickEstimate, saveEstimateToTask };