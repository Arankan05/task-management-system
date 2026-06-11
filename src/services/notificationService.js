const prisma = require("../config/db");
const EVENTS = require("../socket/events");

const sendNotification = async (io, { userId, type, message }) => {
  // Save to database so offline users get it when they come back
  const notification = await prisma.notification.create({
    data: { userId, type, message },
  });

  // If user is online, send it to them instantly via socket
  io.to(`user:${userId}`).emit(EVENTS.NEW_NOTIFICATION, notification);

  return notification;
};

module.exports = { sendNotification };