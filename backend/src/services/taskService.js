const prisma = require("../config/db");

const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true, profilePhoto: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  labels: { include: { label: true } },
  _count: { select: { comments: true, attachments: true } },
};

const buildTaskWhere = (projectId, filters = {}) => {
  const where = { projectId };

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }
  if (filters.labelId) {
    where.labels = { some: { labelId: filters.labelId } };
  }

  return where;
};

const getSortOrder = (sort) => {
  switch (sort) {
    case "title":
      return { title: "asc" };
    case "priority":
      return { priority: "desc" };
    case "dueDate":
      return { dueDate: "asc" };
    case "progress":
      return { progress: "desc" };
    default:
      return { updatedAt: "desc" };
  }
};

const ensureWorkspaceMember = async (workspaceId, userId) => {
  if (!workspaceId || !userId) return;
  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!existing) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId,
          role: user.role === "ADMINISTRATOR" ? "COLLABORATOR" : user.role,
        },
      });
    }
  }
};

const createTask = async (data) => {
  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: { workspaceId: true },
  });
  if (data.assignedToId && project) {
    await ensureWorkspaceMember(project.workspaceId, data.assignedToId);
  }

  return prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      status: data.status || "TODO",
      priority: data.priority || "MEDIUM",
      progress: data.progress ?? 0,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId,
      assignedToId: data.assignedToId || null,
      createdById: data.createdById,
    },
    include: taskInclude,
  });
};

const getTasksByProject = async (projectId, filters = {}) =>
  prisma.task.findMany({
    where: buildTaskWhere(projectId, filters),
    include: taskInclude,
    orderBy: getSortOrder(filters.sort),
  });

const getTaskById = async (taskId) =>
  prisma.task.findUnique({
    where: { id: taskId },
    include: {
      ...taskInclude,
      project: { select: { id: true, name: true, workspaceId: true } },
      comments: {
        include: { user: { select: { id: true, name: true, profilePhoto: true } } },
        orderBy: { createdAt: "asc" },
      },
      attachments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

const updateTask = async (taskId, data) => {
  const updateData = {};
  if (data.title) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.status) updateData.status = data.status;
  if (data.priority) updateData.priority = data.priority;
  if (data.progress !== undefined) updateData.progress = Math.min(100, Math.max(0, data.progress));
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId || null;

  if (data.assignedToId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { workspaceId: true } } },
    });
    if (task?.project) {
      await ensureWorkspaceMember(task.project.workspaceId, data.assignedToId);
    }
  }

  return prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: taskInclude,
  });
};

const deleteTask = async (taskId) =>
  prisma.task.delete({ where: { id: taskId } });

const addLabelToTask = async (taskId, labelId) =>
  prisma.taskLabel.create({
    data: { taskId, labelId },
  });

const removeLabelFromTask = async (taskId, labelId) =>
  prisma.taskLabel.delete({
    where: { taskId_labelId: { taskId, labelId } },
  });

const createLabel = async (projectId, data) =>
  prisma.label.create({
    data: {
      name: data.name.trim(),
      color: data.color || "#7C3AED",
      projectId,
    },
  });

const getLabelsByProject = async (projectId) =>
  prisma.label.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });

const addComment = async (taskId, userId, content) =>
  prisma.comment.create({
    data: { taskId, userId, content: content.trim() },
    include: { user: { select: { id: true, name: true, profilePhoto: true } } },
  });

const addAttachment = async (taskId, userId, data) =>
  prisma.attachment.create({
    data: {
      taskId,
      userId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType || null,
    },
    include: { user: { select: { id: true, name: true } } },
  });

module.exports = {
  taskInclude,
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  addLabelToTask,
  removeLabelFromTask,
  createLabel,
  getLabelsByProject,
  addComment,
  addAttachment,
};
