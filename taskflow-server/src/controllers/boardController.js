const Board = require("../models/Board");
const Task = require("../models/Task");

// Create Board
const createBoard = async (req, res, next) => {
  try {
    const {
      title,
      description = "",
      color = "#6366f1",
      columns,
    } = req.body;

    const board = await Board.create({
      title,
      description,
      color,
      columns:
        columns && columns.length
          ? columns
          : ["To Do", "In Progress", "In Review", "Done"],
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      board,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Boards
const getBoards = async (req, res, next) => {
  try {
    const archived = req.query.archived === "true";

    const boards = await Board.find({
      owner: req.user._id,
      isArchived: archived,
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      boards.map(async (board) => {
        const taskCount = await Task.countDocuments({
          board: board._id,
          isArchived: false,
        });

        return {
          ...board.toObject(),
          taskCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      boards: result,
    });
  } catch (err) {
    next(err);
  }
};

// Get Single Board
const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const taskCount = await Task.countDocuments({
      board: board._id,
      isArchived: false,
    });

    res.status(200).json({
      success: true,
      board: {
        ...board.toObject(),
        taskCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update Board
const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    if (req.body.title !== undefined)
      board.title = req.body.title;

    if (req.body.description !== undefined)
      board.description = req.body.description;

    if (req.body.color !== undefined)
      board.color = req.body.color;

    if (req.body.columns !== undefined)
      board.columns = req.body.columns;

    await board.save();

    res.status(200).json({
      success: true,
      board,
    });
  } catch (err) {
    next(err);
  }
};

// Archive / Unarchive
const toggleArchiveBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    board.isArchived = !board.isArchived;

    await board.save();

    res.status(200).json({
      success: true,
      message: board.isArchived
        ? "Board archived successfully"
        : "Board unarchived successfully",
      board,
    });
  } catch (err) {
    next(err);
  }
};

// Delete Board
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    await Task.deleteMany({
      board: board._id,
    });

    await board.deleteOne();

    res.status(200).json({
      success: true,
      message: "Board and all its tasks deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  toggleArchiveBoard,
  deleteBoard,
};