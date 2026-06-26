const prisma = require("../config/db");
const {
  VALID_PROJECT_ROLES,
  mapWorkspaceRoleToProjectRole,
  PROJECT_ROLES,
} = require("../utils/projectRoles");
const { WORKSPACE_ROLES } = require("../utils/workspaceRoles");

const memberUserSelect = {
  id: true,
  name: true,
  email: true,
  profilePhoto: true,
  isActive: true,
};

const getProjectMembers = async (projectId) =>
  prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: memberUserSelect } },
    orderBy: { joinedAt: "asc" },
  });

const getProjectMembership = async (userId, projectId) =>
  prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

const addProjectMember = async (projectId, userId, role = PROJECT_ROLES.COLLABORATOR) => {
  if (!VALID_PROJECT_ROLES.includes(role)) {
    const err = new Error("Invalid project role");
    err.status = 400;
    throw err;
  }

  return prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: { projectId, userId, role },
    update: { role },
    include: { user: { select: memberUserSelect } },
  });
};

const removeProjectMember = async (projectId, userId) =>
  prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });

const syncWorkspaceMemberToProjects = async (workspaceId, userId, workspaceRole) => {
  const projectRole = mapWorkspaceRoleToProjectRole(workspaceRole);
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    select: { id: true },
  });

  await Promise.all(
    projects.map((p) => addProjectMember(p.id, userId, projectRole))
  );
};

const seedProjectMembersFromWorkspace = async (projectId, workspaceId, creatorId) => {
  const workspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId },
  });

  await Promise.all(
    workspaceMembers.map((wm) =>
      addProjectMember(
        projectId,
        wm.userId,
        wm.userId === creatorId || wm.role === WORKSPACE_ROLES.ADMINISTRATOR
          ? PROJECT_ROLES.PROJECT_MANAGER
          : mapWorkspaceRoleToProjectRole(wm.role)
      )
    )
  );
};

module.exports = {
  getProjectMembers,
  getProjectMembership,
  addProjectMember,
  removeProjectMember,
  syncWorkspaceMemberToProjects,
  seedProjectMembersFromWorkspace,
};
