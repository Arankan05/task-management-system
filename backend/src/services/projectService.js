const prisma = require("../config/db");
const { seedProjectMembersFromWorkspace } = require("./projectMemberService");

const projectInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  _count: { select: { tasks: true, labels: true, members: true } },
};

const DEFAULT_PROJECT_NAME = "__workspace_default__";
const LEGACY_DEFAULT_DISPLAY = "General";

const isLegacyDefaultName = (name) => name === DEFAULT_PROJECT_NAME;

const createProject = async (data) => {
  const project = await prisma.project.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      color: data.color || "#A855F7",
      workspaceId: data.workspaceId,
      createdById: data.createdById,
    },
    include: projectInclude,
  });

  await seedProjectMembersFromWorkspace(project.id, data.workspaceId, data.createdById);
  return project;
};

const getProjectsByWorkspace = async (workspaceId, { search, sort = "recent", accessibleIds } = {}) => {
  const orderBy =
    sort === "name"
      ? { name: "asc" }
      : sort === "tasks"
        ? { tasks: { _count: "desc" } }
        : { updatedAt: "desc" };

  const projects = await prisma.project.findMany({
    where: {
      workspaceId,
      ...(accessibleIds && { id: { in: accessibleIds } }),
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

  return projects.filter((p) => !isLegacyDefaultName(p.name) || p._count.tasks > 0);
};

const getProjectById = async (projectId) =>
  prisma.project.findUnique({
    where: { id: projectId },
    include: {
      ...projectInclude,
      workspace: { select: { id: true, name: true, color: true } },
      labels: true,
      members: {
        include: { user: { select: { id: true, name: true, email: true, profilePhoto: true } } },
      },
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

const deleteProject = async (projectId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    const err = new Error("Project not found");
    err.status = 404;
    throw err;
  }
  if (project.name === DEFAULT_PROJECT_NAME || project.name === LEGACY_DEFAULT_DISPLAY) {
    const err = new Error("Cannot delete the default migrated project");
    err.status = 400;
    throw err;
  }
  return prisma.project.delete({ where: { id: projectId } });
};

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
      assignedToId: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const now = new Date();
  const stats = {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === "BACKLOG").length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    review: tasks.filter((t) => t.status === "REVIEW").length,
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
    assignedCount: tasks.filter((t) => t.assignedToId).length,
  };

  return stats;
};

module.exports = {
  DEFAULT_PROJECT_NAME,
  LEGACY_DEFAULT_DISPLAY,
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
};
