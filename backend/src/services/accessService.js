const prisma = require("../config/db");
const {
  normalizeRole,
  canManageAllTasks,
  canManageWorkspace,
  WORKSPACE_ROLES,
} = require("../utils/workspaceRoles");
const {
  normalizeProjectRole,
  canManageProjectTasks,
  PROJECT_ROLES,
} = require("../utils/projectRoles");

const isSystemAdmin = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMINISTRATOR";
};

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

const getProjectMembership = async (userId, projectId) =>
  prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

const getProjectRole = async (userId, projectId, workspaceId) => {
  if (await isSystemAdmin(userId)) return PROJECT_ROLES.PROJECT_MANAGER;

  const workspaceRole = await getWorkspaceRole(userId, workspaceId);
  if (!workspaceRole) return null;
  if (canManageWorkspace(workspaceRole)) return PROJECT_ROLES.PROJECT_MANAGER;

  const membership = await getProjectMembership(userId, projectId);
  if (!membership) {
    if (workspaceRole === WORKSPACE_ROLES.PROJECT_MANAGER) {
      return PROJECT_ROLES.PROJECT_MANAGER;
    }
    if (workspaceRole === WORKSPACE_ROLES.COLLABORATOR) {
      return PROJECT_ROLES.COLLABORATOR;
    }
    return null;
  }

  return normalizeProjectRole(membership.role);
};

const assertCanManageProject = async (userId, projectId) => {
  const project = await getProjectWithWorkspace(projectId);
  if (!project) {
    return { ok: false, project: null, role: null, message: "Project not found" };
  }

  const role = await getProjectRole(userId, projectId, project.workspaceId);
  if (!role || !canManageProjectTasks(role)) {
    return {
      ok: false,
      project,
      role,
      message: "Only project managers can perform this action",
    };
  }

  return { ok: true, project, role };
};

const assertCanManageTasks = async (userId, workspaceId) => {
  if (await isSystemAdmin(userId)) return { ok: true, role: WORKSPACE_ROLES.ADMINISTRATOR };

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

  const projectRole = await getProjectRole(userId, task.projectId, task.project.workspaceId);
  if (!projectRole) {
    return { allowed: false, task, role: null, canManage: false, message: "Access denied" };
  }

  if (canManageProjectTasks(projectRole)) {
    return { allowed: true, task, role: projectRole, canManage: true };
  }

  if (projectRole === PROJECT_ROLES.COLLABORATOR) {
    return {
      allowed: true,
      task,
      role: projectRole,
      canManage: false,
      canInteract: task.assignedToId === userId,
    };
  }

  return { allowed: false, task, role: projectRole, canManage: false, message: "Access denied" };
};

const canAccessProject = async (userId, projectId) => {
  const project = await getProjectWithWorkspace(projectId);
  if (!project) return { allowed: false, project: null, role: null };

  const role = await getProjectRole(userId, projectId, project.workspaceId);
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

const getTaskListFiltersForRole = (role, userId, filters = {}) => {
  if (role === PROJECT_ROLES.COLLABORATOR) {
    return { ...filters, assignedToId: userId };
  }
  return filters;
};

const getAccessibleProjectIds = async (userId, workspaceId) => {
  if (await isSystemAdmin(userId)) {
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });
    return projects.map((p) => p.id);
  }

  const workspaceRole = await getWorkspaceRole(userId, workspaceId);
  if (!workspaceRole) return [];

  if (
    canManageWorkspace(workspaceRole) ||
    workspaceRole === WORKSPACE_ROLES.PROJECT_MANAGER ||
    workspaceRole === WORKSPACE_ROLES.COLLABORATOR
  ) {
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });
    return projects.map((p) => p.id);
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId, project: { workspaceId } },
    select: { projectId: true },
  });
  return memberships.map((m) => m.projectId);
};

module.exports = {
  isSystemAdmin,
  getWorkspaceMembership,
  getWorkspaceRole,
  isWorkspaceMember,
  getProjectMembership,
  getProjectRole,
  assertCanManageProject,
  assertCanManageTasks,
  getProjectWithWorkspace,
  getTaskWithProject,
  resolveTaskAccess,
  canAccessProject,
  canAccessTask,
  getTaskListFiltersForRole,
  getAccessibleProjectIds,
};
