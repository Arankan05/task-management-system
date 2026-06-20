const prisma = require("../config/db");

const projectInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  _count: { select: { tasks: true, labels: true } },
};

const DEFAULT_PROJECT_NAME = "__workspace_default__";

const getOrCreateDefaultProject = async (workspaceId, userId) => {
  let project = await prisma.project.findFirst({
    where: { workspaceId, name: DEFAULT_PROJECT_NAME },
  });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: DEFAULT_PROJECT_NAME,
        description: "Workspace task board",
        workspaceId,
        createdById: userId,
      },
    });
  }
  return project;
};

const createProject = async (data) =>
  prisma.project.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      color: data.color || "#A855F7",
      workspaceId: data.workspaceId,
      createdById: data.createdById,
    },
    include: projectInclude,
  });

const getProjectsByWorkspace = async (workspaceId, { search, sort = "recent" } = {}) => {
  const orderBy =
    sort === "name"
      ? { name: "asc" }
      : sort === "tasks"
        ? { tasks: { _count: "desc" } }
        : { updatedAt: "desc" };

  return prisma.project.findMany({
    where: {
      workspaceId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    },
    include: {
      ...projectInclude,
      tasks: {
        select: { id: true, status: true, progress: true },
      },
    },
    orderBy,
  });
};

const getProjectById = async (projectId) =>
  prisma.project.findUnique({
    where: { id: projectId },
    include: {
      ...projectInclude,
      workspace: { select: { id: true, name: true, color: true } },
      labels: true,
    },
  });

const updateProject = async (projectId, data) =>
  prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.color && { color: data.color }),
      ...(data.status && { status: data.status }),
    },
    include: projectInclude,
  });

const deleteProject = async (projectId) =>
  prisma.project.delete({ where: { id: projectId } });

const getProjectStats = async (projectId) => {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      progress: true,
      dueDate: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const now = new Date();
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
    ).length,
    byPriority: {
      LOW: tasks.filter((t) => t.priority === "LOW").length,
      MEDIUM: tasks.filter((t) => t.priority === "MEDIUM").length,
      HIGH: tasks.filter((t) => t.priority === "HIGH").length,
    },
    avgProgress: tasks.length
      ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length)
      : 0,
    completionRate: tasks.length
      ? Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100)
      : 0,
    recentTasks: tasks.slice(0, 5),
  };

  return stats;
};

module.exports = {
  DEFAULT_PROJECT_NAME,
  getOrCreateDefaultProject,
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
};
