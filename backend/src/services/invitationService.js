const crypto = require("crypto");
const prisma = require("../config/db");
const { sendWorkspaceInvitation } = require("./emailService");
const { getWorkspaceMembership } = require("./accessService");
const { canManageMembers } = require("../utils/workspaceRoles");
const { INVITATION_STATUS, parseInviteRole } = require("../utils/invitationRoles");

const INVITATION_EXPIRY_DAYS = 7;

const generateToken = () => crypto.randomBytes(32).toString("hex");

const getExpiryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + INVITATION_EXPIRY_DAYS);
  return d;
};

const markExpiredIfNeeded = async (invitation) => {
  if (
    invitation.status === INVITATION_STATUS.PENDING &&
    new Date(invitation.expiresAt) < new Date()
  ) {
    return prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: INVITATION_STATUS.EXPIRED },
    });
  }
  return invitation;
};

const invitationInclude = {
  workspace: { select: { id: true, name: true, color: true } },
  invitedBy: { select: { id: true, name: true, email: true } },
};

const assertCanManageInvitations = async (userId, workspaceId) => {
  const membership = await getWorkspaceMembership(userId, workspaceId);
  if (!membership || !canManageMembers(membership.role)) {
    const err = new Error("Only administrators can manage invitations");
    err.status = 403;
    throw err;
  }
};

const createInvitation = async ({ workspaceId, email, role, invitedById }) => {
  const parsedRole = parseInviteRole(role);
  if (!parsedRole) {
    const err = new Error("Invalid role. Use Admin, Manager, or Member");
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  await assertCanManageInvitations(invitedById, workspaceId);

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { owner: { select: { email: true } } },
  });
  if (!workspace) {
    const err = new Error("Workspace not found");
    err.status = 404;
    throw err;
  }

  if (workspace.owner.email.toLowerCase() === normalizedEmail) {
    const err = new Error("Workspace owner is already a member");
    err.status = 400;
    throw err;
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: existingUser.id } },
    });
    if (existingMember) {
      const err = new Error("User is already a member of this workspace");
      err.status = 400;
      throw err;
    }
  }

  const pendingInvite = await prisma.workspaceInvitation.findFirst({
    where: {
      workspaceId,
      email: normalizedEmail,
      status: INVITATION_STATUS.PENDING,
      expiresAt: { gt: new Date() },
    },
  });
  if (pendingInvite) {
    const err = new Error("A pending invitation already exists for this email");
    err.status = 409;
    throw err;
  }

  const token = generateToken();
  const invitation = await prisma.workspaceInvitation.create({
    data: {
      workspaceId,
      email: normalizedEmail,
      role: parsedRole,
      token,
      status: INVITATION_STATUS.PENDING,
      expiresAt: getExpiryDate(),
      invitedById,
    },
    include: invitationInclude,
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const inviteLink = `${clientUrl}/invitations/${token}`;

  await sendWorkspaceInvitation({
    to: normalizedEmail,
    workspaceName: workspace.name,
    inviterName: invitation.invitedBy.name,
    role: parsedRole,
    inviteLink,
  });

  return invitation;
};

const listInvitationsByWorkspace = async (workspaceId, userId) => {
  await assertCanManageInvitations(userId, workspaceId);

  const invitations = await prisma.workspaceInvitation.findMany({
    where: { workspaceId },
    include: invitationInclude,
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(invitations.map(markExpiredIfNeeded));
};

const getInvitationByToken = async (token) => {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: invitationInclude,
  });

  if (!invitation) {
    const err = new Error("Invitation not found");
    err.status = 404;
    throw err;
  }

  const updated = await markExpiredIfNeeded(invitation);
  const user = await prisma.user.findUnique({
    where: { email: updated.email },
    select: { id: true, name: true, email: true },
  });

  return {
    ...updated,
    userExists: !!user,
    isExpired: updated.status === INVITATION_STATUS.EXPIRED,
    isCancelled: updated.status === INVITATION_STATUS.CANCELLED,
    isAccepted: updated.status === INVITATION_STATUS.ACCEPTED,
    isPending: updated.status === INVITATION_STATUS.PENDING,
  };
};

const acceptInvitation = async (token, userId) => {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: invitationInclude,
  });

  if (!invitation) {
    const err = new Error("Invitation not found");
    err.status = 404;
    throw err;
  }

  await markExpiredIfNeeded(invitation);

  if (invitation.status === INVITATION_STATUS.ACCEPTED) {
    const err = new Error("This invitation has already been accepted");
    err.status = 400;
    throw err;
  }

  if (invitation.status === INVITATION_STATUS.CANCELLED) {
    const err = new Error("This invitation has been cancelled");
    err.status = 400;
    throw err;
  }

  if (invitation.status === INVITATION_STATUS.EXPIRED || new Date(invitation.expiresAt) < new Date()) {
    if (invitation.status === INVITATION_STATUS.PENDING) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: INVITATION_STATUS.EXPIRED },
      });
    }
    const err = new Error("This invitation has expired");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    const err = new Error("This invitation was sent to a different email address");
    err.status = 403;
    throw err;
  }

  const existingMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId } },
  });
  if (existingMember) {
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: INVITATION_STATUS.ACCEPTED, acceptedAt: new Date() },
    });
    const err = new Error("You are already a member of this workspace");
    err.status = 409;
    throw err;
  }

  const [member] = await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: INVITATION_STATUS.ACCEPTED, acceptedAt: new Date() },
      include: invitationInclude,
    }),
  ]);

  return { member, workspace: invitation.workspace, invitation };
};

const resendInvitation = async (invitationId, userId) => {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { id: invitationId },
    include: invitationInclude,
  });

  if (!invitation) {
    const err = new Error("Invitation not found");
    err.status = 404;
    throw err;
  }

  await assertCanManageInvitations(userId, invitation.workspaceId);

  if (invitation.status === INVITATION_STATUS.ACCEPTED) {
    const err = new Error("Cannot resend an accepted invitation");
    err.status = 400;
    throw err;
  }

  if (invitation.status === INVITATION_STATUS.CANCELLED) {
    const err = new Error("Cannot resend a cancelled invitation");
    err.status = 400;
    throw err;
  }

  const newToken = generateToken();
  const updated = await prisma.workspaceInvitation.update({
    where: { id: invitationId },
    data: {
      token: newToken,
      status: INVITATION_STATUS.PENDING,
      expiresAt: getExpiryDate(),
    },
    include: invitationInclude,
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  await sendWorkspaceInvitation({
    to: updated.email,
    workspaceName: updated.workspace.name,
    inviterName: updated.invitedBy.name,
    role: updated.role,
    inviteLink: `${clientUrl}/invitations/${newToken}`,
  });

  return updated;
};

const cancelInvitation = async (invitationId, userId) => {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    const err = new Error("Invitation not found");
    err.status = 404;
    throw err;
  }

  await assertCanManageInvitations(userId, invitation.workspaceId);

  if (invitation.status === INVITATION_STATUS.ACCEPTED) {
    const err = new Error("Cannot cancel an accepted invitation");
    err.status = 400;
    throw err;
  }

  return prisma.workspaceInvitation.update({
    where: { id: invitationId },
    data: { status: INVITATION_STATUS.CANCELLED },
    include: invitationInclude,
  });
};

module.exports = {
  INVITATION_EXPIRY_DAYS,
  createInvitation,
  listInvitationsByWorkspace,
  getInvitationByToken,
  acceptInvitation,
  resendInvitation,
  cancelInvitation,
};
