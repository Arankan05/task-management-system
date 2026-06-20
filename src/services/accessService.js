const prisma = require("../config/db");

const getWorkspaceMembership = async (userId, workspaceId) =>
  prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

const isWorkspaceMember = async (userId, workspaceId) => {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  return !!membership;
};

const getProjectWithWorkspace = async (projectId) =>
  prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });

const canAccessProject = async (userId, projectId) => {
  const project = await getProjectWithWorkspace(projectId);
  if (!project) return { allowed: false, project: null };
  const member = await isWorkspaceMember(userId, project.workspaceId);
  return { allowed: member, project };
};

const canAccessTask = async (userId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { workspace: true } } },
  });
  if (!task) return { allowed: false, task: null };
  const member = await isWorkspaceMember(userId, task.project.workspaceId);
  return { allowed: member, task };
};

module.exports = {
  getWorkspaceMembership,
  isWorkspaceMember,
  getProjectWithWorkspace,
  canAccessProject,
  canAccessTask,
};
