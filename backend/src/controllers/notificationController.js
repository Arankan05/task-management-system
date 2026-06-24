const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getBadgeCount = async (userId, openedAt) => {
  const where = { userId };
  if (openedAt) {
    where.createdAt = { gt: openedAt };
  }
  return prisma.notification.count({ where });
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsOpenedAt: true },
    });

    const [notifications, badgeCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      getBadgeCount(userId, user?.notificationsOpenedAt),
    ]);

    return successResponse(res, "Notifications fetched", { notifications, badgeCount });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch notifications", 500);
  }
};

const acknowledgeOpen = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    await prisma.user.update({
      where: { id: userId },
      data: { notificationsOpenedAt: now },
    });

    return successResponse(res, "Notifications acknowledged", { badgeCount: 0 });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to acknowledge notifications", 500);
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      return errorResponse(res, "Notification not found", 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(res, "Notification marked as read", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to mark notification as read", 500);
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.deleteMany({ where: { userId } });

    return successResponse(res, "All notifications cleared");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to clear notifications", 500);
  }
};

module.exports = {
  getNotifications,
  acknowledgeOpen,
  markNotificationRead,
  clearAllNotifications,
};
