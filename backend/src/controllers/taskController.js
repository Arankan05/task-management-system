const taskService = require("../services/taskService");
const {
  canAccessProject,
  canAccessTask,
  resolveTaskAccess,
  assertCanManageTasks,
  getWorkspaceRole,
  getTaskListFiltersForRole,
} = require("../services/accessService");
const { successResponse, errorResponse } = require("../utils/response");
const {
  notifyTaskAssigned,
  notifyTaskStatusChanged,
  notifyTaskComment,
} = require("../services/notificationService");

const emitProjectUsers = (io, projectId, event, payload) => {
  io.to(`project:${projectId}`).emit(event, payload);
};

const actorName = (req) => req.user?.name || req.user?.email || "Someone";

const denyTaskAccess = (res, access) => {
  if (!access.task) return errorResponse(res, access.message || "Task not found", 404);
  return errorResponse(res, access.message || "Access denied", 403);
};

const listTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowed, project, role } = await canAccessProject(req.user.id, projectId);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const { status, priority, assignedToId, search, sort, labelId } = req.query;
    const filters = getTaskListFiltersForRole(role, req.user.id, {
      status,
      priority,
      assignedToId,
      search,
      sort,
      labelId,
    });
    const tasks = await taskService.getTasksByProject(projectId, filters);
    return successResponse(res, "Tasks fetched", tasks);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch tasks", 500);
  }
};

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowed, project } = await canAccessProject(req.user.id, projectId);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const permission = await assertCanManageTasks(req.user.id, project.workspaceId);
    if (!permission.ok) return errorResponse(res, permission.message, 403);

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
    await notifyTaskAssigned(io, task, req.user.id, actorName(req));

    return successResponse(res, "Task created", task, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to create task", 500);
  }
};

const getTask = async (req, res) => {
  try {
    const access = await resolveTaskAccess(req.user.id, req.params.id);
    if (!access.allowed) return denyTaskAccess(res, access);

    const fullTask = await taskService.getTaskById(req.params.id);
    return successResponse(res, "Task fetched", fullTask);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch task", 500);
  }
};

const updateTask = async (req, res) => {
  try {
    const access = await resolveTaskAccess(req.user.id, req.params.id);
    if (!access.allowed) return denyTaskAccess(res, access);
    if (!access.canManage) {
      return errorResponse(res, "Collaborators cannot modify task details", 403);
    }

    const updated = await taskService.updateTask(req.params.id, req.body);
    const io = req.app.get("io");
    emitProjectUsers(io, access.task.projectId, "task:updated", { task: updated });

    if (req.body.assignedToId && req.body.assignedToId !== access.task.assignedToId) {
      await notifyTaskAssigned(io, updated, req.user.id, actorName(req));
    }

    if (req.body.status && req.body.status !== access.task.status) {
      await notifyTaskStatusChanged(io, updated, req.user.id, actorName(req), req.body.status);
    }

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

    const access = await resolveTaskAccess(req.user.id, req.params.id);
    if (!access.allowed) return denyTaskAccess(res, access);
    if (!access.canManage && !access.canInteract) {
      return errorResponse(res, "Collaborators can only update status on tasks assigned to them", 403);
    }

    const progress =
      status === "DONE"
        ? 100
        : status === "IN_PROGRESS"
          ? Math.max(access.task.progress, 25)
          : access.task.progress;
    const updated = await taskService.updateTask(req.params.id, { status, progress });

    const io = req.app.get("io");
    emitProjectUsers(io, access.task.projectId, "task:updated", { task: updated });
    await notifyTaskStatusChanged(io, updated, req.user.id, actorName(req), status);

    return successResponse(res, "Status updated", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update status", 500);
  }
};

const deleteTask = async (req, res) => {
  try {
    const access = await resolveTaskAccess(req.user.id, req.params.id);
    if (!access.allowed) return denyTaskAccess(res, access);
    if (!access.canManage) {
      return errorResponse(res, "Collaborators cannot delete tasks", 403);
    }

    await taskService.deleteTask(req.params.id);
    const io = req.app.get("io");
    emitProjectUsers(io, access.task.projectId, "task:deleted", { taskId: req.params.id });

    return successResponse(res, "Task deleted");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete task", 500);
  }
};

const listLabels = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowed, project } = await canAccessProject(req.user.id, projectId);
    if (!project) return errorResponse(res, "Project not found", 404);
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
    const { allowed, project } = await canAccessProject(req.user.id, projectId);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const permission = await assertCanManageTasks(req.user.id, project.workspaceId);
    if (!permission.ok) return errorResponse(res, permission.message, 403);
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
    const access = await resolveTaskAccess(req.user.id, req.params.taskId);
    if (!access.allowed) return denyTaskAccess(res, access);
    if (!access.canManage) {
      return errorResponse(res, "Collaborators cannot modify task labels", 403);
    }

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
    const access = await resolveTaskAccess(req.user.id, req.params.taskId);
    if (!access.allowed) return denyTaskAccess(res, access);
    if (!access.canManage) {
      return errorResponse(res, "Collaborators cannot modify task labels", 403);
    }

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
    const access = await resolveTaskAccess(req.user.id, req.params.taskId);
    if (!access.allowed) return denyTaskAccess(res, access);
    if (!access.canManage && !access.canInteract) {
      return errorResponse(res, "Collaborators can only comment on tasks assigned to them", 403);
    }
    if (!req.body.content?.trim()) return errorResponse(res, "Comment is required", 400);

    const comment = await taskService.addComment(req.params.taskId, req.user.id, req.body.content);
    const io = req.app.get("io");
    io.to(`task:${req.params.taskId}`).emit("comment:added", comment);

    if (access.task?.assignedToId || access.task?.createdById) {
      await notifyTaskComment(io, access.task, req.user.id, actorName(req));
    }

    return successResponse(res, "Comment added", comment, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to add comment", 500);
  }
};

const addAttachment = async (req, res) => {
  try {
    const access = await resolveTaskAccess(req.user.id, req.params.taskId);
    if (!access.allowed) return denyTaskAccess(res, access);
    if (!access.canManage && !access.canInteract) {
      return errorResponse(res, "Collaborators can only add attachments to tasks assigned to them", 403);
    }
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

