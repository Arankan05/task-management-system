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
  });
  if (!member) {
    const err = new Error("User is not a member of this workspace");
    err.status = 404;
    throw err;
  }
  return member;
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

module.exports = {
  USER_PUBLIC_SELECT,
  listUsers,
  createUser,
  updateUser,
  setUserActive,
};
