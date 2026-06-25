const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

router.get("/:taskId/comments",               authMiddleware, getComments);
router.post("/:taskId/comments",              authMiddleware, addComment);
router.delete("/:taskId/comments/:commentId", authMiddleware, deleteComment);

module.exports = router;