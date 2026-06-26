const PROJECT_ROLES = {
  PROJECT_MANAGER: "PROJECT_MANAGER",
  COLLABORATOR: "COLLABORATOR",
};

const PROJECT_ROLE_LABELS = {
  PROJECT_MANAGER: "Project Manager",
  COLLABORATOR: "Collaborator",
};

const VALID_PROJECT_ROLES = Object.values(PROJECT_ROLES);

const normalizeProjectRole = (role) => {
  if (role === "MANAGER") return PROJECT_ROLES.PROJECT_MANAGER;
  if (role === "MEMBER") return PROJECT_ROLES.COLLABORATOR;
  return role;
};

const mapWorkspaceRoleToProjectRole = (workspaceRole) => {
  const normalized = workspaceRole === "OWNER" ? "ADMINISTRATOR" : workspaceRole;
  if (normalized === "ADMINISTRATOR" || normalized === "PROJECT_MANAGER") {
    return PROJECT_ROLES.PROJECT_MANAGER;
  }
  return PROJECT_ROLES.COLLABORATOR;
};

const canManageProjectMembers = (projectRole) =>
  normalizeProjectRole(projectRole) === PROJECT_ROLES.PROJECT_MANAGER;

const canManageProjectTasks = (projectRole) =>
  normalizeProjectRole(projectRole) === PROJECT_ROLES.PROJECT_MANAGER;

module.exports = {
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
  VALID_PROJECT_ROLES,
  normalizeProjectRole,
  mapWorkspaceRoleToProjectRole,
  canManageProjectMembers,
  canManageProjectTasks,
};
