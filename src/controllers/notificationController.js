const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// GET /api/notifications — get all notifications for logged in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, "Notifications fetched", notifications);
  } catch (error) {
    return errorResponse(res, "Failed to fetch notifications", 500);
  }
};

// PATCH /api/notifications/:id/read — mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    if (!notification.count) {
      return errorResponse(res, "Notification not found", 404);
    }
    const updated = await prisma.notification.findUnique({ where: { id: req.params.id } });
    return successResponse(res, "Marked as read", updated);
  } catch (error) {
    return errorResponse(res, "Failed to update", 500);
  }
};

// PATCH /api/notifications/read-all — mark all notifications as read
const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return successResponse(res, "All notifications marked as read");
  } catch (error) {
    return errorResponse(res, "Failed to update", 500);
  }
};

module.exports = { getNotifications, markAsRead, markAllRead };