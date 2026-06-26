const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { generateTempPassword } = require("../utils/passwordPolicy");
const {
  buildTempPasswordCreateData,
  needsPasswordChange,
} = require("../utils/userAccountHelper");
const { WORKSPACE_ROLES } = require("../utils/workspaceRoles");
const { PROJECT_ROLES, VALID_PROJECT_ROLES } = require("../utils/projectRoles");
const projectMemberService = require("./projectMemberService");
const { sendProjectMemberAddedEmail, sendProjectCollaboratorInviteEmail } = require("./emailService");
const { revokeAllUserRefreshTokens } = require("./authTokenService");
const { sendNotification } = require("./notificationService");
const { NOTIFICATION_TYPES } = require("../utils/notificationTypes");
const EVENTS = require("../socket/events");

const INVITE_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
};

const TEMP_PASSWORD_MS = 24 * 60 * 60 * 1000;

const getExpiryDate = () => new Date(Date.now() + TEMP_PASSWORD_MS);

const invitationInclude = {
  user: { select: { id: true, name: true, email: true, isTemporaryPassword: true, accountStatus: true } },
  invitedBy: { select: { id: true, name: true, email: true } },
};

const expireStaleInvitations = async () => {
  const now = new Date();
  await prisma.projectInvitation.updateMany({
    where: { status: INVITE_STATUS.PENDING, expiresAt: { lt: now } },
    data: { status: INVITE_STATUS.EXPIRED },
  });
};

const ensureWorkspaceMembership = async (tx, workspaceId, userId) => {
  const existing = await tx.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (existing) return existing;

  return tx.workspaceMember.create({
    data: {
      workspaceId,
      userId,
      role: WORKSPACE_ROLES.COLLABORATOR,
    },
  });
};

const inviteCollaboratorByEmail = async (
  projectId,
  { name, email, role = PROJECT_ROLES.COLLABORATOR },
  invitedById,
  io = null
) => {
  if (!VALID_PROJECT_ROLES.includes(role)) {
    const err = new Error("Invalid project role");
    err.status = 400;
    throw err;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const trimmedName = String(name || normalizedEmail.split("@")[0]).trim();

  if (!normalizedEmail) {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: { select: { id: true, name: true } } },
  });

  if (!project) {
    const err = new Error("Project not found");
    err.status = 404;
    throw err;
  }

  const inviter = await prisma.user.findUnique({
    where: { id: invitedById },
    select: { name: true, email: true },
  });
  const inviterName = inviter?.name || inviter?.email || "A project manager";

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: existingUser.id } },
    });
    if (existingMember) {
      const err = new Error("This user is already a member of the project");
      err.status = 409;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      await ensureWorkspaceMembership(tx, project.workspaceId, existingUser.id);
    });

    const member = await projectMemberService.addProjectMember(
      projectId,
      existingUser.id,
      role
    );

    await sendProjectMemberAddedEmail({
      to: normalizedEmail,
      name: existingUser.name,
      projectName: project.name,
      workspaceName: project.workspace.name,
      inviterName,
    }).catch((mailErr) => {
      console.warn("Project member added email failed:", mailErr.message);
    });

    const notification = await sendNotification(io, {
      userId: existingUser.id,
      type: NOTIFICATION_TYPES.ADMIN_UPDATE,
      message: `${inviterName} added you to the project "${project.name}".`,
      payload: JSON.stringify({ projectId: project.id, workspaceId: project.workspaceId }),
    });
    if (io && notification) {
      io.to(`user:${existingUser.id}`).emit(EVENTS.NEW_NOTIFICATION, notification);
    }

    return {
      scenario: "existing_user",
      member,
      message: "Collaborator added and notified by email",
    };
  }

  const expiresAt = getExpiryDate();
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const { member, invitation } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        role: "COLLABORATOR",
        isActive: true,
        ...buildTempPasswordCreateData(hashedPassword, expiresAt),
      },
    });

    await ensureWorkspaceMembership(tx, project.workspaceId, user.id);

    const projectMember = await tx.projectMember.create({
      data: { projectId, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const invite = await tx.projectInvitation.create({
      data: {
        projectId,
        userId: user.id,
        email: normalizedEmail,
        role,
        status: INVITE_STATUS.PENDING,
        invitedById,
        expiresAt,
      },
      include: invitationInclude,
    });

    return { member: projectMember, invitation: invite };
  });

  await sendProjectCollaboratorInviteEmail({
    to: normalizedEmail,
    name: trimmedName,
    emailAddress: normalizedEmail,
    tempPassword,
    projectName: project.name,
    workspaceName: project.workspace.name,
    inviterName,
    expiresInHours: 24,
  }).catch((mailErr) => {
    console.warn("Project collaborator invite email failed:", mailErr.message);
  });

  return {
    scenario: "new_user",
    member,
    invitation,
    message: "Account created. A temporary password was sent by email.",
  };
};

const listProjectInvitations = async (projectId) => {
  await expireStaleInvitations();
  return prisma.projectInvitation.findMany({
    where: {
      projectId,
      status: { in: [INVITE_STATUS.PENDING, INVITE_STATUS.EXPIRED] },
    },
    include: invitationInclude,
    orderBy: { createdAt: "desc" },
  });
};

const resendProjectInvitation = async (projectId, invitationId, invitedById, io = null) => {
  await expireStaleInvitations();

  const invitation = await prisma.projectInvitation.findFirst({
    where: { id: invitationId, projectId },
    include: {
      user: true,
      project: { include: { workspace: { select: { name: true } } } },
    },
  });

  if (!invitation) {
    const err = new Error("Invitation not found");
    err.status = 404;
    throw err;
  }

  if (![INVITE_STATUS.PENDING, INVITE_STATUS.EXPIRED].includes(invitation.status)) {
    const err = new Error("Only pending or expired invitations can be resent");
    err.status = 400;
    throw err;
  }

  if (!needsPasswordChange(invitation.user)) {
    const err = new Error("This user has already completed password setup");
    err.status = 400;
    throw err;
  }

  const expiresAt = getExpiryDate();
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const inviter = await prisma.user.findUnique({
    where: { id: invitedById },
    select: { name: true, email: true },
  });
  const inviterName = inviter?.name || inviter?.email || "A project manager";

  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: invitation.userId },
      data: buildTempPasswordCreateData(hashedPassword, expiresAt),
    });

    return tx.projectInvitation.update({
      where: { id: invitationId },
      data: {
        status: INVITE_STATUS.PENDING,
        expiresAt,
        invitedById,
      },
      include: invitationInclude,
    });
  });

  await revokeAllUserRefreshTokens(invitation.userId);

  await sendProjectCollaboratorInviteEmail({
    to: invitation.user.email,
    name: invitation.user.name,
    emailAddress: invitation.user.email,
    tempPassword,
    projectName: invitation.project.name,
    workspaceName: invitation.project.workspace.name,
    inviterName,
    expiresInHours: 24,
  }).catch((mailErr) => {
    console.warn("Resend project invitation email failed:", mailErr.message);
  });

  return updated;
};

const markInvitationActiveAfterPasswordChange = async (userId) => {
  await prisma.projectInvitation.updateMany({
    where: { userId, status: INVITE_STATUS.PENDING },
    data: { status: INVITE_STATUS.ACTIVE },
  });
};

module.exports = {
  INVITE_STATUS,
  inviteCollaboratorByEmail,
  listProjectInvitations,
  resendProjectInvitation,
  markInvitationActiveAfterPasswordChange,
};
