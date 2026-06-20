const taskService = require("../services/taskService");
const { canAccessProject, canAccessTask } = require("../services/accessService");
const { successResponse, errorResponse } = require("../utils/response");

const emitProjectUsers = (io, projectId, event, payload) => {
  io.to(`project:${projectId}`).emit(event, payload);
};

const listTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowed } = await canAccessProject(req.user.id, projectId);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const { status, priority, assignedToId, search, sort, labelId } = req.query;
    const tasks = await taskService.getTasksByProject(projectId, {
      status,
      priority,
      assignedToId,
      search,
      sort,
      labelId,
    });
    return successResponse(res, "Tasks fetched", tasks);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch tasks", 500);
  }
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowed } = await canAccessProject(req.user.id, projectId);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const { title, description, status, priority, progress, dueDate, assignedToId } = req.body;
    if (!title?.trim()) return errorResponse(res, "Title is required", 400);

    const task = await taskService.createTask({
      title,
      description,
      status,
      priority,
      progress,
      dueDate,
      assignedToId,
      projectId,
      createdById: req.user.id,
    });

    const io = req.app.get("io");
    emitProjectUsers(io, projectId, "task:created", { task });

    return successResponse(res, "Task created", task, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to create task", 500);
  }
};

const getTask = async (req, res) => {
  try {
    const { allowed, task } = await canAccessTask(req.user.id, req.params.id);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const fullTask = await taskService.getTaskById(req.params.id);
    return successResponse(res, "Task fetched", fullTask);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch task", 500);
  }
};

const updateTask = async (req, res) => {
  try {
    const { allowed, task } = await canAccessTask(req.user.id, req.params.id);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const updated = await taskService.updateTask(req.params.id, req.body);
    const io = req.app.get("io");
    emitProjectUsers(io, task.projectId, "task:updated", { task: updated });

    return successResponse(res, "Task updated", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update task", 500);
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["TODO", "IN_PROGRESS", "DONE"];
    if (!valid.includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const { allowed, task } = await canAccessTask(req.user.id, req.params.id);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const progress = status === "DONE" ? 100 : status === "IN_PROGRESS" ? Math.max(task.progress, 25) : task.progress;
    const updated = await taskService.updateTask(req.params.id, { status, progress });

    const io = req.app.get("io");
    emitProjectUsers(io, task.projectId, "task:updated", { task: updated });

    return successResponse(res, "Status updated", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update status", 500);
  }
};

const deleteTask = async (req, res) => {
  try {
    const { allowed, task } = await canAccessTask(req.user.id, req.params.id);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    await taskService.deleteTask(req.params.id);
    const io = req.app.get("io");
    emitProjectUsers(io, task.projectId, "task:deleted", { taskId: req.params.id });

    return successResponse(res, "Task deleted");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete task", 500);
  }
};

const listLabels = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowed } = await canAccessProject(req.user.id, projectId);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const labels = await taskService.getLabelsByProject(projectId);
    return successResponse(res, "Labels fetched", labels);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch labels", 500);
  }
};

const createLabel = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowed } = await canAccessProject(req.user.id, projectId);
    if (!allowed) return errorResponse(res, "Access denied", 403);
    if (!req.body.name?.trim()) return errorResponse(res, "Label name is required", 400);

    const label = await taskService.createLabel(projectId, req.body);
    return successResponse(res, "Label created", label, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to create label", 500);
  }
};

const addTaskLabel = async (req, res) => {
  try {
    const { allowed, task } = await canAccessTask(req.user.id, req.params.taskId);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    await taskService.addLabelToTask(req.params.taskId, req.params.labelId);
    const updated = await taskService.getTaskById(req.params.taskId);
    return successResponse(res, "Label added", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add label", 500);
  }
};

const removeTaskLabel = async (req, res) => {
  try {
    const { allowed, task } = await canAccessTask(req.user.id, req.params.taskId);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    await taskService.removeLabelFromTask(req.params.taskId, req.params.labelId);
    const updated = await taskService.getTaskById(req.params.taskId);
    return successResponse(res, "Label removed", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to remove label", 500);
  }
};

const addComment = async (req, res) => {
  try {
    const { allowed, task } = await canAccessTask(req.user.id, req.params.taskId);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);
    if (!req.body.content?.trim()) return errorResponse(res, "Comment is required", 400);

    const comment = await taskService.addComment(req.params.taskId, req.user.id, req.body.content);
    const io = req.app.get("io");
    io.to(`task:${req.params.taskId}`).emit("comment:added", comment);

    return successResponse(res, "Comment added", comment, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add comment", 500);
  }
};

const addAttachment = async (req, res) => {
  try {
    const { allowed, task } = await canAccessTask(req.user.id, req.params.taskId);
    if (!task) return errorResponse(res, "Task not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);
    if (!req.body.fileName || !req.body.fileUrl) {
      return errorResponse(res, "File name and URL are required", 400);
    }

    const attachment = await taskService.addAttachment(req.params.taskId, req.user.id, req.body);
    return successResponse(res, "Attachment added", attachment, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add attachment", 500);
  }
};

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  listLabels,
  createLabel,
  addTaskLabel,
  removeTaskLabel,
  addComment,
  addAttachment,
};
