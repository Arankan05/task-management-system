const prisma = require("../config/db");
const {
  normalizeRole,
  canManageAllTasks,
  WORKSPACE_ROLES,
} = require("../utils/workspaceRoles");

const getWorkspaceMembership = async (userId, workspaceId) =>
  prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

const getWorkspaceRole = async (userId, workspaceId) => {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership) return null;
  return normalizeRole(membership.role);
};

const isWorkspaceMember = async (userId, workspaceId) => {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  return !!membership;
};

const assertCanManageTasks = async (userId, workspaceId) => {
  const role = await getWorkspaceRole(userId, workspaceId);
  if (!canManageAllTasks(role)) {
    return {
      ok: false,
      role,
      message: "Only administrators and project managers can perform this action",
    };
  }
  return { ok: true, role };
};

const getProjectWithWorkspace = async (projectId) =>
  prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });

const getTaskWithProject = async (taskId) =>
  prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { workspace: true } } },
  });

const resolveTaskAccess = async (userId, taskId) => {
  const task = await getTaskWithProject(taskId);
  if (!task) {
    return { allowed: false, task: null, role: null, canManage: false, message: "Task not found" };
  }

  const role = await getWorkspaceRole(userId, task.project.workspaceId);
  if (!role) {
    return { allowed: false, task, role: null, canManage: false, message: "Access denied" };
  }

  if (canManageAllTasks(role)) {
    return { allowed: true, task, role, canManage: true };
  }

  if (role === WORKSPACE_ROLES.COLLABORATOR) {
    return {
      allowed: true,
      task,
      role,
      canManage: false,
      canInteract: task.assignedToId === userId,
    };
  }

  return { allowed: false, task, role, canManage: false, message: "Access denied" };
};

const canAccessProject = async (userId, projectId) => {
  const project = await getProjectWithWorkspace(projectId);
  if (!project) return { allowed: false, project: null, role: null };
  const role = await getWorkspaceRole(userId, project.workspaceId);
  return { allowed: !!role, project, role };
};

const canAccessTask = async (userId, taskId) => {
  const access = await resolveTaskAccess(userId, taskId);
  return {
    allowed: access.allowed,
    task: access.task,
    role: access.role,
    canManage: access.canManage,
    message: access.message,
  };
};

const getTaskListFiltersForRole = (_role, _userId, filters = {}) => filters;

module.exports = {
  getWorkspaceMembership,
  getWorkspaceRole,
  isWorkspaceMember,
  assertCanManageTasks,
  getProjectWithWorkspace,
  getTaskWithProject,
  resolveTaskAccess,
  canAccessProject,
  canAccessTask,
  getTaskListFiltersForRole,
};
