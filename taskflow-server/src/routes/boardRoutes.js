const express = require("express");
const router = express.Router();

const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  toggleArchiveBoard,
  deleteBoard,
} = require("../controllers/boardController");

const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Create board
// Get all boards
router
  .route("/")
  .post(createBoard)
  .get(getBoards);

// Get one board
// Update board
// Delete board
router
  .route("/:id")
  .get(getBoardById)
  .put(updateBoard)
  .delete(deleteBoard);

// Archive / Unarchive
router.patch("/:id/archive", toggleArchiveBoard);

module.exports = router;