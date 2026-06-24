const prisma = require("../config/db");
const EVENTS = require("../socket/events");
const { successResponse, errorResponse } = require("../utils/response");

// POST /api/tasks/:taskId/attachments — upload a file to a task
const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const io = req.app.get("io");

    // Save file info to database (file itself is stored in Cloudinary)
    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        userId:   req.user.id,
        fileName: req.file.originalname,
        fileUrl:  req.file.path,      // Cloudinary URL
        fileType: req.file.mimetype,
      },
    });

    // Notify everyone in the task room that a file was uploaded
    io.to(`task:${taskId}`).emit(EVENTS.NEW_ATTACHMENT, attachment);

    return successResponse(res, "File uploaded", attachment, 201);
  } catch (error) {
    return errorResponse(res, "Failed to upload file", 500);
  }
};

// GET /api/tasks/:taskId/attachments — get all attachments for a task
const getAttachments = async (req, res) => {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { taskId: req.params.taskId },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, "Attachments fetched", attachments);
  } catch (error) {
    return errorResponse(res, "Failed to fetch attachments", 500);
  }
};

module.exports = { uploadAttachment, getAttachments };