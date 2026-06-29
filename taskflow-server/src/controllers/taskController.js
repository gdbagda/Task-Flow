const Task = require('../models/Task');
const Board = require('../models/Board');
const { validateTask } = require('../validators/taskValidator');

// ─── Helper: verify board belongs to user ────────────────────────────────────
const getBoardForUser = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  return board;
};

// ─── Create Task ──────────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
    } = req.body;

    // Verify board ownership
    const board = await getBoardForUser(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Validate input
    const { errors, isValid } = validateTask({
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
    });
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    // Validate status is a valid column on this board
    const taskStatus = status || board.columns[0];
    if (!board.columns.includes(taskStatus)) {
      return res.status(400).json({
        success: false,
        errors: {
          status: `Status must be one of the board columns: ${board.columns.join(', ')}`,
        },
      });
    }

    // Determine order (place at end of column)
    const lastTask = await Task.findOne({
      board: boardId,
      status: taskStatus,
      isArchived: false,
    }).sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: taskStatus,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : null,
      tags: tags ? tags.map((t) => t.trim()) : [],
      board: boardId,
      owner: req.user._id,
      order,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Tasks for a Board ────────────────────────────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const {
      status,
      priority,
      archived,
      search,
      sortBy,
      sortOrder,
      tag,
    } = req.query;

    // Verify board ownership
    const board = await getBoardForUser(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Build filter
    const filter = {
      board: boardId,
      isArchived: archived === 'true' ? true : false,
    };

    if (status) {
      // Support comma-separated statuses: ?status=To Do,In Progress
      const statuses = status.split(',').map((s) => s.trim());
      filter.status = { $in: statuses };
    }

    if (priority) {
      const priorities = priority.split(',').map((p) => p.trim());
      filter.priority = { $in: priorities };
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const allowedSortFields = ['order', 'createdAt', 'dueDate', 'priority', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'order';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter).sort({
      [sortField]: sortDirection,
      createdAt: 1,
    });

    // Group tasks by column status for convenience
    const grouped = {};
    board.columns.forEach((col) => {
      grouped[col] = [];
    });

    tasks.forEach((task) => {
      if (grouped[task.status] !== undefined) {
        grouped[task.status].push(task);
      }
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
      grouped,
      columns: board.columns,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Task ──────────────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;

    const board = await getBoardForUser(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

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

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Task ──────────────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
      order,
    } = req.body;

    const board = await getBoardForUser(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const { errors, isValid } = validateTask(
      { title, description, status, priority, dueDate, estimatedHours, tags },
      true
    );
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const task = await Task.findOne({
      _id: taskId,
      board: boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Validate new status against board columns
    if (status !== undefined && !board.columns.includes(status)) {
      return res.status(400).json({
        success: false,
        errors: {
          status: `Status must be one of: ${board.columns.join(', ')}`,
        },
      });
    }

    // Apply updates
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate === '' ? null : dueDate;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (tags !== undefined) task.tags = tags.map((t) => t.trim());
    if (order !== undefined) task.order = order;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Move Task (change status/column) ────────────────────────────────────────
const moveTask = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;
    const { status, order } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        errors: { status: 'New status (column) is required' },
      });
    }

    const board = await getBoardForUser(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    if (!board.columns.includes(status)) {
      return res.status(400).json({
        success: false,
        errors: {
          status: `Status must be one of: ${board.columns.join(', ')}`,
        },
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      board: boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    if (order !== undefined) task.order = order;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task moved successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Archive / Unarchive Task ─────────────────────────────────────────────────
const archiveTask = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;

    const board = await getBoardForUser(boardId, req.user._id);
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

    task.isArchived = !task.isArchived;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task ${task.isArchived ? 'archived' : 'unarchived'} successfully`,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Task ──────────────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const { boardId, taskId } = req.params;

    const board = await getBoardForUser(boardId, req.user._id);
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

    await Task.deleteOne({ _id: task._id });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Bulk Update Task Orders ──────────────────────────────────────────────────
const reorderTasks = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { tasks } = req.body;

    // tasks = [{ _id: '...', order: 0, status: '...' }, ...]
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tasks array is required',
      });
    }

    const board = await getBoardForUser(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    // Bulk write for performance
    const bulkOps = tasks.map(({ _id, order, status }) => ({
      updateOne: {
        filter: { _id, board: boardId, owner: req.user._id },
        update: {
          $set: {
            ...(order !== undefined && { order }),
            ...(status !== undefined && { status }),
          },
        },
      },
    }));

    await Task.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  moveTask,
  archiveTask,
  deleteTask,
  reorderTasks,
};