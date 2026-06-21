const prisma = require("../config/db");
const projectService = require("./projectService");
const { WORKSPACE_ROLES, VALID_ROLES } = require("../utils/workspaceRoles");
const { DEFAULT_PROJECT_NAME } = require("./projectService");

const workspaceInclude = {
  owner: { select: { id: true, name: true, email: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true, profilePhoto: true, isActive: true, mustResetPassword: true } } },
  },
  _count: { select: { projects: true, members: true } },
};

const createWorkspace = async (userId, data) => {
  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: data.color || "#7C3AED",
        ownerId: userId,
      },
    });

    await tx.workspaceMember.create({
      data: { workspaceId: workspace.id, userId, role: WORKSPACE_ROLES.ADMINISTRATOR },
    });

    await tx.project.create({
      data: {
        name: DEFAULT_PROJECT_NAME,
        description: "Workspace task board",
        workspaceId: workspace.id,
        createdById: userId,
      },
    });

    return tx.workspace.findUnique({
      where: { id: workspace.id },
      include: workspaceInclude,
    });
  });
};

const getWorkspacesForUser = async (userId) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: { include: workspaceInclude },
    },
    orderBy: { joinedAt: "desc" },
  });
  return memberships.map((m) => ({ ...m.workspace, memberRole: m.role }));
};

const getWorkspaceById = async (workspaceId) =>
  prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: workspaceInclude,
  });

const updateWorkspace = async (workspaceId, data) =>
  prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.color && { color: data.color }),
    },
    include: workspaceInclude,
  });

const deleteWorkspace = async (workspaceId) =>
  prisma.workspace.delete({ where: { id: workspaceId } });

const addMember = async (workspaceId, email, role = WORKSPACE_ROLES.COLLABORATOR) => {
  if (!VALID_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return null;

  return prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
    update: { role },
    create: { workspaceId, userId: user.id, role },
    include: { user: { select: { id: true, name: true, email: true, profilePhoto: true } } },
  });
};

const updateMemberRole = async (workspaceId, userId, role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }
  return prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId, userId } },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true, profilePhoto: true } } },
  });
};

const getMembers = async (workspaceId) =>
  prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, profilePhoto: true, isActive: true, mustResetPassword: true } } },
    orderBy: { joinedAt: "asc" },
  });

const removeMember = async (workspaceId, userId) =>
  prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

module.exports = {
  createWorkspace,
  getWorkspacesForUser,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  updateMemberRole,
  getMembers,
  removeMember,
};
