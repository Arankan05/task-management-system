const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllRead,
} = require("../controllers/notificationController");

// All routes here require the user to be logged in (authMiddleware checks the JWT token)
router.get("/",            authMiddleware, getNotifications);
router.patch("/:id/read",  authMiddleware, markAsRead);
router.patch("/read-all",  authMiddleware, markAllRead);

module.exports = router;