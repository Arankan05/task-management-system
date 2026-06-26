const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { generateTempPassword } = require("../utils/passwordPolicy");
const { sendWelcomeUserEmail } = require("./emailService");
const { revokeAllUserRefreshTokens } = require("./authTokenService");
const { VALID_ROLES } = require("../utils/workspaceRoles");

const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  mustResetPassword: true,
  createdAt: true,
  updatedAt: true,
};

const assertWorkspaceMember = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    include: { user: { select: USER_PUBLIC_SELECT } },
  });
  if (!member) {
    const err = new Error("User is not a member of this workspace");
    err.status = 404;
    throw err;
  }
  return member;
};

const getWorkspaceUser = async (workspaceId, userId) => {
  const member = await assertWorkspaceMember(workspaceId, userId);
  return { ...member.user, role: member.role };
};

const listUsers = async (workspaceId, { search, role, status }) => {
  const where = { workspaceId };

  if (role) {
    where.role = role;
  }

  const userFilter = {};
  if (search?.trim()) {
    const q = search.trim();
    userFilter.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (status === "active") {
    userFilter.isActive = true;
  } else if (status === "inactive") {
    userFilter.isActive = false;
  }
  if (Object.keys(userFilter).length > 0) {
    where.user = userFilter;
  }

  const members = await prisma.workspaceMember.findMany({
    where,
    include: { user: { select: USER_PUBLIC_SELECT } },
    orderBy: { joinedAt: "desc" },
  });

  return members.map((member) => ({
    ...member.user,
    role: member.role,
  }));
};

const createUser = async (workspaceId, { name, email, role }) => {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error("Invalid role");
    err.status = 400;
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: existing.id } },
    });
    if (existingMember) {
      const err = new Error("This user is already a member of this workspace");
      err.status = 409;
      throw err;
    }
    const err = new Error("A user with this email already exists");
    err.status = 409;
    throw err;
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        mustResetPassword: true,
        isActive: true,
      },
      select: USER_PUBLIC_SELECT,
    });

    await tx.workspaceMember.create({
      data: { workspaceId, userId: created.id, role },
    });

    return created;
  });

  await sendWelcomeUserEmail({
    to: email,
    name,
    emailAddress: email,
    tempPassword,
  });

  return { ...user, role };
};

const updateUser = async (workspaceId, userId, { name, role }) => {
  await assertWorkspaceMember(workspaceId, userId);

  const data = {};
  if (name) data.name = name.trim();
  if (role) {
    if (!VALID_ROLES.includes(role)) {
      const err = new Error("Invalid role");
      err.status = 400;
      throw err;
    }
    data.role = role;
    await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role },
    });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: USER_PUBLIC_SELECT,
  });

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  return { ...user, role: member.role };
};

const setUserActive = async (workspaceId, userId, isActive, actorId) => {
  await assertWorkspaceMember(workspaceId, userId);

  if (userId === actorId) {
    const err = new Error("You cannot deactivate your own account");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: USER_PUBLIC_SELECT,
  });

  if (!isActive) {
    await revokeAllUserRefreshTokens(userId);
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  return { ...user, role: member.role };
};

const listAllUsers = async ({ search, role, status }) => {
  const where = {};
  if (role) {
    where.role = role;
  }
  const userFilter = {};
  if (search?.trim()) {
    const q = search.trim();
    userFilter.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (status === "active") {
    userFilter.isActive = true;
  } else if (status === "inactive") {
    userFilter.isActive = false;
  }
  if (Object.keys(userFilter).length > 0) {
    Object.assign(where, userFilter);
  }

  return prisma.user.findMany({
    where,
    select: USER_PUBLIC_SELECT,
    orderBy: { createdAt: "desc" },
  });
};

const createGlobalUser = async ({ name, email, role }) => {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error("Invalid role");
    err.status = 400;
    throw err;
  }

  const normalized = String(email).trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    const err = new Error("A user with this email already exists");
    err.status = 409;
    throw err;
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const created = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalized,
      role,
      password: hashedPassword,
      mustResetPassword: true,
      isActive: true,
      tempPasswordExpiresAt: expiresAt,
    },
    select: USER_PUBLIC_SELECT,
  });

  let emailSent = false;
  try {
    await sendWelcomeUserEmail({
      to: normalized,
      name: created.name,
      emailAddress: normalized,
      tempPassword,
      expiresInHours: 24,
    });
    emailSent = true;
  } catch (emailErr) {
    console.warn("Could not send welcome email:", emailErr.message);
  }

  return { user: created, tempPassword: emailSent ? undefined : tempPassword, emailSent };
};

const updateGlobalUser = async (userId, { name, role }) => {
  const data = {};
  if (name) data.name = name.trim();
  if (role) {
    if (!VALID_ROLES.includes(role)) {
      const err = new Error("Invalid role");
      err.status = 400;
      throw err;
    }
    data.role = role;
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: USER_PUBLIC_SELECT,
  });
};

const setGlobalUserActive = async (userId, isActive, actorId) => {
  if (userId === actorId) {
    const err = new Error("You cannot change your own activation status");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: USER_PUBLIC_SELECT,
  });

  if (!isActive) {
    await revokeAllUserRefreshTokens(userId);
  }

  return user;
};

const deleteGlobalUser = async (userId, actorId) => {
  if (userId === actorId) {
    const err = new Error("You cannot delete your own account");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete workspace invitations sent by this user
    await tx.workspaceInvitation.deleteMany({
      where: { invitedById: userId },
    });

    // 2. Delete workspace join requests where user is the subject or the inviter
    await tx.workspaceJoinRequest.deleteMany({
      where: {
        OR: [
          { userId },
          { invitedById: userId },
        ],
      },
    });

    // 3. Set assignedToId to null for all tasks assigned to this user
    await tx.task.updateMany({
      where: { assignedToId: userId },
      data: { assignedToId: null },
    });

    // 4. Delete all comments made by this user
    await tx.comment.deleteMany({
      where: { userId },
    });

    // 5. Delete all attachments uploaded by this user
    await tx.attachment.deleteMany({
      where: { userId },
    });

    // 6. Reassign createdById on tasks created by this user to actorId
    await tx.task.updateMany({
      where: { createdById: userId },
      data: { createdById: actorId },
    });

    // 7. Reassign createdById on projects created by this user to actorId
    await tx.project.updateMany({
      where: { createdById: userId },
      data: { createdById: actorId },
    });

    // 8. Delete workspaces owned by this user (cascades to their items)
    const ownedWorkspaces = await tx.workspace.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    for (const ws of ownedWorkspaces) {
      await tx.workspace.delete({
        where: { id: ws.id },
      });
    }

    // 9. Delete workspace memberships for this user
    await tx.workspaceMember.deleteMany({
      where: { userId },
    });

    // 10. Delete the user record itself
    await tx.user.delete({
      where: { id: userId },
    });
  });

  await revokeAllUserRefreshTokens(userId);
  return user;
};

module.exports = {
  USER_PUBLIC_SELECT,
  listUsers,
  createUser,
  getWorkspaceUser,
  updateUser,
  setUserActive,
  listAllUsers,
  createGlobalUser,
  updateGlobalUser,
  setGlobalUserActive,
  deleteGlobalUser,
};
