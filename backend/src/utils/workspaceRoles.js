const WORKSPACE_ROLES = {
  ADMINISTRATOR: "ADMINISTRATOR",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  COLLABORATOR: "COLLABORATOR",
};

const ROLE_LABELS = {
  ADMINISTRATOR: "Administrator",
  PROJECT_MANAGER: "Project Manager",
  COLLABORATOR: "Collaborator",
};

const VALID_ROLES = Object.values(WORKSPACE_ROLES);

const normalizeRole = (role) => {
  if (role === "OWNER") return WORKSPACE_ROLES.ADMINISTRATOR;
  if (role === "MEMBER") return WORKSPACE_ROLES.COLLABORATOR;
  return role;
};

const canManageMembers = (role) => normalizeRole(role) === WORKSPACE_ROLES.ADMINISTRATOR;

const canManageWorkspace = (role) => normalizeRole(role) === WORKSPACE_ROLES.ADMINISTRATOR;

const canManageAllTasks = (role) =>
  [WORKSPACE_ROLES.ADMINISTRATOR, WORKSPACE_ROLES.PROJECT_MANAGER].includes(normalizeRole(role));

const canManageProjects = (role) => canManageAllTasks(role);

const isCollaborator = (role) => normalizeRole(role) === WORKSPACE_ROLES.COLLABORATOR;

const canCollaboratorAccessTask = (task, userId) =>
  task?.assignedToId === userId;

module.exports = {
  WORKSPACE_ROLES,
  ROLE_LABELS,
  VALID_ROLES,
  normalizeRole,
  canManageMembers,
  canManageWorkspace,
  canManageAllTasks,
  canManageProjects,
  isCollaborator,
  canCollaboratorAccessTask,
};
