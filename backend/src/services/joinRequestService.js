const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { generateTempPassword } = require("../utils/passwordPolicy");
const { buildTempPasswordCreateData } = require("../utils/userAccountHelper");
const { sendWelcomeUserEmail } = require("./emailService");
const { revokeAllUserRefreshTokens } = require("./authTokenService");
const { VALID_ROLES, ROLE_LABELS } = require("../utils/workspaceRoles");
const { notifyAdminUpdate } = require("./notificationService");
const EVENTS = require("../socket/events");

const JOIN_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
};

const TEMP_PASSWORD_MS = 24 * 60 * 60 * 1000;

const requestInclude = {
  user: { select: { id: true, name: true, email: true, isActive: true, mustResetPassword: true } },
  workspace: { select: { id: true, name: true, color: true } },
  invitedBy: { select: { id: true, name: true, email: true } },
};

const getExpiryDate = () => new Date(Date.now() + TEMP_PASSWORD_MS);

const expireStaleRequests = async () => {
  const now = new Date();
  await prisma.workspaceJoinRequest.updateMany({
    where: { status: JOIN_STATUS.PENDING, expiresAt: { lt: now } },
    data: { status: JOIN_STATUS.EXPIRED },
  });
};

const createJoinNotification = async (tx, { userId, workspace, role, requestId }) => {
  const roleLabel = ROLE_LABELS[role] || role;
  return tx.notification.create({
    data: {
      userId,
      type: "WORKSPACE_JOIN_REQUEST",
      message: `You have been invited to join "${workspace.name}" as ${roleLabel}. Accept or reject this invitation.`,
      payload: JSON.stringify({
        requestId,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        role,
      }),
    },
  });
};

const emitNotification = (io, notification) => {
  if (io && notification) {
    io.to(`user:${notification.userId}`).emit(EVENTS.NEW_NOTIFICATION, notification);
  }
};

const createPendingWorkspaceUser = async (workspaceId, { name, email, role, invitedById }, io = null) => {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error("Invalid role");
    err.status = 400;
    throw err;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    const err = new Error("A user with this email already exists");
    err.status = 409;
    throw err;
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) {
    const err = new Error("Workspace not found");
    err.status = 404;
    throw err;
  }

  const expiresAt = getExpiryDate();
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const { request, notification } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        role,
        isActive: true,
        ...buildTempPasswordCreateData(hashedPassword, expiresAt),
      },
    });

    const joinRequest = await tx.workspaceJoinRequest.create({
      data: {
        workspaceId,
        userId: user.id,
        role,
        invitedById,
        status: JOIN_STATUS.PENDING,
        expiresAt,
      },
      include: requestInclude,
    });

    const notif = await createJoinNotification(tx, {
      userId: user.id,
      workspace,
      role,
      requestId: joinRequest.id,
    });

    return { request: joinRequest, notification: notif };
  });

  emitNotification(io, notification);

  await sendWelcomeUserEmail({
    to: normalizedEmail,
    name: String(name).trim(),
    emailAddress: normalizedEmail,
    tempPassword,
    expiresInHours: 24,
  });

  return request;
};

const listWorkspaceJoinRequests = async (workspaceId, { status } = {}) => {
  await expireStaleRequests();

  const where = { workspaceId };
  if (status) {
    where.status = status;
  } else {
    where.status = { in: [JOIN_STATUS.PENDING, JOIN_STATUS.EXPIRED] };
  }

  return prisma.workspaceJoinRequest.findMany({
    where,
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
};

const getJoinRequestForUser = async (requestId, userId) => {
  await expireStaleRequests();

  const request = await prisma.workspaceJoinRequest.findUnique({
    where: { id: requestId },
    include: requestInclude,
  });

  if (!request || request.userId !== userId) {
    const err = new Error("Join request not found");
    err.status = 404;
    throw err;
  }

  return request;
};

const acceptJoinRequest = async (requestId, userId, io = null) => {
  await expireStaleRequests();

  const request = await getJoinRequestForUser(requestId, userId);

  if (request.status !== JOIN_STATUS.PENDING) {
    const err = new Error("This invitation is no longer available");
    err.status = 400;
    throw err;
  }

  if (new Date() > request.expiresAt) {
    await prisma.workspaceJoinRequest.update({
      where: { id: requestId },
      data: { status: JOIN_STATUS.EXPIRED },
    });
    const err = new Error("This invitation has expired");
    err.status = 400;
    throw err;
  }

  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: request.workspaceId, userId },
    },
  });
  if (existingMember) {
    const err = new Error("You are already a member of this workspace");
    err.status = 409;
    throw err;
  }

  const [member] = await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: request.workspaceId,
        userId,
        role: request.role,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.workspaceJoinRequest.update({
      where: { id: requestId },
      data: { status: JOIN_STATUS.ACCEPTED, respondedAt: new Date() },
    }),
    prisma.notification.updateMany({
      where: {
        userId,
        type: "WORKSPACE_JOIN_REQUEST",
        payload: { contains: requestId },
      },
      data: { isRead: true },
    }),
  ]);

  if (request.invitedById && request.invitedById !== userId) {
    const userName = request.user?.name || request.user?.email || "A user";
    const workspaceName = request.workspace?.name || "the workspace";
    await notifyAdminUpdate(
      io,
      request.invitedById,
      `${userName} accepted your invitation to "${workspaceName}"`,
      { workspaceId: request.workspaceId, requestId, userId }
    );
  }

  return member;
};

const rejectJoinRequest = async (requestId, userId, io = null) => {
  await expireStaleRequests();

  const request = await getJoinRequestForUser(requestId, userId);

  if (request.status !== JOIN_STATUS.PENDING) {
    const err = new Error("This invitation is no longer available");
    err.status = 400;
    throw err;
  }

  await prisma.$transaction([
    prisma.workspaceJoinRequest.update({
      where: { id: requestId },
      data: { status: JOIN_STATUS.REJECTED, respondedAt: new Date() },
    }),
    prisma.notification.updateMany({
      where: {
        userId,
        type: "WORKSPACE_JOIN_REQUEST",
        payload: { contains: requestId },
      },
      data: { isRead: true },
    }),
  ]);

  if (request.invitedById && request.invitedById !== userId) {
    const userName = request.user?.name || request.user?.email || "A user";
    const workspaceName = request.workspace?.name || "the workspace";
    await notifyAdminUpdate(
      io,
      request.invitedById,
      `${userName} rejected your invitation to "${workspaceName}"`,
      { workspaceId: request.workspaceId, requestId, userId }
    );
  }

  return { id: requestId, status: JOIN_STATUS.REJECTED };
};

const recreateJoinRequest = async (workspaceId, requestId, invitedById, io = null) => {
  await expireStaleRequests();

  const request = await prisma.workspaceJoinRequest.findFirst({
    where: { id: requestId, workspaceId },
    include: { user: true, workspace: true },
  });

  if (!request) {
    const err = new Error("Join request not found");
    err.status = 404;
    throw err;
  }

  if (![JOIN_STATUS.PENDING, JOIN_STATUS.EXPIRED].includes(request.status)) {
    const err = new Error("Only pending or expired invitations can be recreated");
    err.status = 400;
    throw err;
  }

  const expiresAt = getExpiryDate();
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const { updated, notification } = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: request.userId },
      data: buildTempPasswordCreateData(hashedPassword, expiresAt),
    });

    const joinRequest = await tx.workspaceJoinRequest.update({
      where: { id: requestId },
      data: {
        status: JOIN_STATUS.PENDING,
        expiresAt,
        respondedAt: null,
        invitedById,
      },
      include: requestInclude,
    });

    const notif = await createJoinNotification(tx, {
      userId: request.userId,
      workspace: request.workspace,
      role: request.role,
      requestId,
    });

    return { updated: joinRequest, notification: notif };
  });

  await revokeAllUserRefreshTokens(request.userId);
  emitNotification(io, notification);

  await sendWelcomeUserEmail({
    to: request.user.email,
    name: request.user.name,
    emailAddress: request.user.email,
    tempPassword,
    expiresInHours: 24,
  });

  return updated;
};

const cancelJoinRequest = async (workspaceId, requestId) => {
  const request = await prisma.workspaceJoinRequest.findFirst({
    where: { id: requestId, workspaceId },
    include: { user: true },
  });

  if (!request) {
    const err = new Error("Join request not found");
    err.status = 404;
    throw err;
  }

  if (request.status === JOIN_STATUS.ACCEPTED) {
    const err = new Error("Cannot cancel an accepted invitation");
    err.status = 400;
    throw err;
  }

  await prisma.$transaction(async (tx) => {
    await tx.workspaceJoinRequest.update({
      where: { id: requestId },
      data: { status: JOIN_STATUS.CANCELLED, respondedAt: new Date() },
    });

    const memberCount = await tx.workspaceMember.count({ where: { userId: request.userId } });
    const ownedCount = await tx.workspace.count({ where: { ownerId: request.userId } });

    if (memberCount === 0 && ownedCount === 0) {
      await tx.user.delete({ where: { id: request.userId } });
    }
  });

  const stillExists = await prisma.user.findUnique({ where: { id: request.userId } });
  if (stillExists) {
    await revokeAllUserRefreshTokens(request.userId);
  }

  return { id: requestId, status: JOIN_STATUS.CANCELLED };
};

const hasPendingJoinRequests = async (userId) => {
  await expireStaleRequests();
  const count = await prisma.workspaceJoinRequest.count({
    where: { userId, status: JOIN_STATUS.PENDING },
  });
  return count > 0;
};

module.exports = {
  JOIN_STATUS,
  TEMP_PASSWORD_MS,
  expireStaleRequests,
  createPendingWorkspaceUser,
  listWorkspaceJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  recreateJoinRequest,
  cancelJoinRequest,
  hasPendingJoinRequests,
};
