const prisma = require("../config/db");
const EVENTS = require("../socket/events");
const { sendNotification } = require("../services/notificationService");
const { successResponse, errorResponse } = require("../utils/response");

// POST /api/tasks/:taskId/comments — add a comment to a task
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;
    const io = req.app.get("io");

    const comment = await prisma.comment.create({
      data: { content, taskId, userId: req.user.id },
      include: { user: { select: { id: true, name: true } } },
    });

    // Emit to everyone viewing this task in real time
    io.to(`task:${taskId}`).emit(EVENTS.NEW_COMMENT, comment);

    // Notify the assigned user if someone else commented
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task?.assignedUserId && task.assignedUserId !== req.user.id) {
      await sendNotification(io, {
        userId: task.assignedUserId,
        type: "NEW_COMMENT",
        message: `New comment on task: ${task.title}`,
      });
    }

    return successResponse(res, "Comment added", comment, 201);
  } catch (error) {
    return errorResponse(res, "Failed to add comment", 500);
  }
};

// GET /api/tasks/:taskId/comments — get all comments for a task
const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.taskId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
    return successResponse(res, "Comments fetched", comments);
  } catch (error) {
    return errorResponse(res, "Failed to fetch comments", 500);
  }
};

// DELETE /api/tasks/:taskId/comments/:commentId — delete a comment
const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const io = req.app.get("io");

    await prisma.comment.delete({ where: { id: commentId } });

    // Notify everyone in the task room that a comment was deleted
    io.to(`task:${taskId}`).emit(EVENTS.COMMENT_DELETED, { commentId });

    return successResponse(res, "Comment deleted");
  } catch (error) {
    return errorResponse(res, "Failed to delete comment", 500);
  }
};

module.exports = { addComment, getComments, deleteComment };