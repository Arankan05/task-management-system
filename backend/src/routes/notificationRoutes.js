const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  acknowledgeOpen,
  markNotificationRead,
  clearAllNotifications,
} = require("../controllers/notificationController");

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: List notifications
 *     description: Retrieves the notification history for the authenticated user, ordered by creation date (newest first).
 *     tags: [Notifications]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", authMiddleware, getNotifications);

/**
 * @swagger
 * /api/notifications/open:
 *   patch:
 *     summary: Acknowledge notifications opened
 *     description: Marks all un-opened notifications as opened for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as opened successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/open", authMiddleware, acknowledgeOpen);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark single notification as read
 *     description: Updates the isRead status to true for a specific notification.
 *     tags: [Notifications]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification UUID
 *     responses:
 *       200:
 *         description: Marked as read successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/read", authMiddleware, markNotificationRead);

/**
 * @swagger
 * /api/notifications:
 *   delete:
 *     summary: Clear all notifications
 *     description: Deletes all notifications for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Notifications cleared successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete("/", authMiddleware, clearAllNotifications);

module.exports = router;
