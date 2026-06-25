const EVENTS = require("../socket/events");

/**
 * Sends a real-time notification to a specific user's private room.
 * Bypasses database storage as there is no Notification model in the schema,
 * ensuring 100% stability and zero-migration requirements.
 * 
 * @param {import("socket.io").Server} io - Socket.IO server instance
 * @param {object} params
 * @param {string} params.userId - Target user's database ID
 * @param {string} params.type - Notification type identifier
 * @param {string} params.message - Visual text notification content
 * @param {object} [params.data] - Additional metadata parameters
 */
const sendNotification = async (io, { userId, type, message, data }) => {
  if (!io) return null;

  const notification = {
    id: String(Date.now() + Math.random()),
    userId,
    type,
    message,
    data,
    createdAt: new Date(),
  };

  // If user is online, send it to their private room instantly via socket
  io.to(`user:${userId}`).emit(EVENTS.NEW_NOTIFICATION, notification);

  return notification;
};

module.exports = { sendNotification };