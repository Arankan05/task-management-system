const prisma = require("../config/db");
const EVENTS = require("../socket/events");
const { NOTIFICATION_TYPES } = require("../utils/notificationTypes");

const toPayload = (data) => (data ? JSON.stringify(data) : null);

const sendNotification = async (io, { userId, type, message, payload = null }) => {
  if (!userId || !message) return null;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      ...(payload ? { payload } : {}),
    },
  });

  if (io) {
    io.to(`user:${userId}`).emit(EVENTS.NEW_NOTIFICATION, notification);
  }

  return notification;
};

const notifyUsers = async (io, userIds, { type, message, payload, excludeUserId }) => {
  const unique = [...new Set(userIds.filter(Boolean))];
  const results = [];
  for (const userId of unique) {
    if (excludeUserId && userId === excludeUserId) continue;
    const n = await sendNotification(io, { userId, type, message, payload });
    if (n) results.push(n);
  }
  return results;
};

const taskPayload = (task, extra = {}) =>
  toPayload({
    taskId: task.id,
    projectId: task.projectId,
    workspaceId: extra.workspaceId,
    ...extra,
  });

const getTaskStakeholderIds = (task) => {
  const ids = new Set();
  if (task.assignedToId) ids.add(task.assignedToId);
  if (task.createdById) ids.add(task.createdById);
  return [...ids];
};

const notifyTaskAssigned = async (io, task, actorId, actorName) => {
  if (!task?.assignedToId || task.assignedToId === actorId) return;
  return sendNotification(io, {
    userId: task.assignedToId,
    type: NOTIFICATION_TYPES.TASK_ASSIGNED,
    message: `${actorName || "Someone"} assigned you to task: "${task.title}"`,
    payload: taskPayload(task),
  });
};

const notifyTaskStatusChanged = async (io, task, actorId, actorName, newStatus) => {
  const label = String(newStatus || task.status).replace(/_/g, " ");
  return notifyUsers(io, getTaskStakeholderIds(task), {
    type: NOTIFICATION_TYPES.TASK_STATUS_CHANGED,
    message: `${actorName || "Someone"} changed status of "${task.title}" to ${label}`,
    payload: taskPayload(task, { status: newStatus || task.status }),
    excludeUserId: actorId,
  });
};

const notifyTaskComment = async (io, task, actorId, actorName) => {
  return notifyUsers(io, getTaskStakeholderIds(task), {
    type: NOTIFICATION_TYPES.TASK_COMMENT,
    message: `${actorName || "Someone"} commented on task: "${task.title}"`,
    payload: taskPayload(task),
    excludeUserId: actorId,
  });
};

const notifyAdminUpdate = async (io, userId, message, payloadData = {}) => {
  return sendNotification(io, {
    userId,
    type: NOTIFICATION_TYPES.ADMIN_UPDATE,
    message,
    payload: toPayload(payloadData),
  });
};

const formatDueDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const checkApproachingDeadlines = async (io) => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: { gte: now, lte: in24h },
      status: { not: "DONE" },
      assignedToId: { not: null },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      projectId: true,
      assignedToId: true,
    },
  });

  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const task of tasks) {
    const alreadySent = await prisma.notification.findFirst({
      where: {
        userId: task.assignedToId,
        type: NOTIFICATION_TYPES.TASK_DEADLINE,
        payload: { contains: task.id },
        createdAt: { gte: since },
      },
    });
    if (alreadySent) continue;

    await sendNotification(io, {
      userId: task.assignedToId,
      type: NOTIFICATION_TYPES.TASK_DEADLINE,
      message: `Deadline approaching: "${task.title}" is due ${formatDueDate(task.dueDate)}`,
      payload: taskPayload(task, { dueDate: task.dueDate }),
    });
  }
};

const startDeadlineChecker = (io, intervalMs = 60 * 60 * 1000) => {
  const run = () => {
    checkApproachingDeadlines(io).catch((err) =>
      console.error("Deadline notification check failed:", err.message)
    );
  };
  run();
  return setInterval(run, intervalMs);
};

module.exports = {
  NOTIFICATION_TYPES,
  sendNotification,
  notifyUsers,
  notifyTaskAssigned,
  notifyTaskStatusChanged,
  notifyTaskComment,
  notifyAdminUpdate,
  checkApproachingDeadlines,
  startDeadlineChecker,
};
