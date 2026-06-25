const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  acknowledgeOpen,
  markNotificationRead,
  clearAllNotifications,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.patch("/open", authMiddleware, acknowledgeOpen);
router.patch("/:id/read", authMiddleware, markNotificationRead);
router.delete("/", authMiddleware, clearAllNotifications);

module.exports = router;
