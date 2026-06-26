const prisma = require("../config/db");
const { seedProjectMembersFromWorkspace, syncWorkspaceMemberToProjects } = require("./projectMemberService");
const joinRequestService = require("./joinRequestService");
const { notifyAdminUpdate } = require("./notificationService");
const { WORKSPACE_ROLES, VALID_ROLES, ROLE_LABELS } = require("../utils/workspaceRoles");
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

    const defaultProject = await tx.project.create({
      data: {
        name: DEFAULT_PROJECT_NAME,
        description: "Workspace task board",
        workspaceId: workspace.id,
        createdById: userId,
      },
    });

    await seedProjectMembersFromWorkspace(defaultProject.id, workspace.id, userId);

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

const memberUserSelect = {
  id: true,
  name: true,
  email: true,
  profilePhoto: true,
  isActive: true,
  mustResetPassword: true,
};

const addMember = async (workspaceId, { email, role = WORKSPACE_ROLES.COLLABORATOR, name, invitedById }, io = null) => {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error("Invalid role");
    err.status = 400;
    throw err;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user) {
    if (!user.isActive) {
      const err = new Error("This account is deactivated. Reactivate the user before adding them.");
      err.status = 400;
      throw err;
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });
    if (existing) {
      const err = new Error("This user is already a member of this workspace");
      err.status = 409;
      throw err;
    }

    const pendingRequest = await prisma.workspaceJoinRequest.findFirst({
      where: {
        workspaceId,
        userId: user.id,
        status: { in: ["PENDING", "EXPIRED"] },
      },
    });
    if (pendingRequest) {
      const err = new Error("This user already has a pending workspace invitation");
      err.status = 409;
      throw err;
    }

    const member = await prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role },
      include: { user: { select: memberUserSelect } },
    });

    await syncWorkspaceMemberToProjects(workspaceId, user.id, role);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });
    const roleLabel = ROLE_LABELS[role] || role.replace(/_/g, " ");
    await notifyAdminUpdate(
      io,
      user.id,
      `You were added to workspace "${workspace?.name}" as ${roleLabel}`,
      { workspaceId, role }
    );

    return { member, created: false };
  }

  if (!name || !String(name).trim()) {
    const err = new Error("Full name is required when adding a new user");
    err.status = 400;
    throw err;
  }

  if (!invitedById) {
    const err = new Error("Inviter is required");
    err.status = 400;
    throw err;
  }

  const joinRequest = await joinRequestService.createPendingWorkspaceUser(
    workspaceId,
    {
      name: String(name).trim(),
      email: normalizedEmail,
      role,
      invitedById,
    },
    io
  );

  return { joinRequest, created: true, pending: true };
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
