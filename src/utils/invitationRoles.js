const { WORKSPACE_ROLES, VALID_ROLES } = require("./workspaceRoles");

const INVITATION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
};

const INVITE_ROLE_ALIASES = {
  ADMIN: WORKSPACE_ROLES.ADMINISTRATOR,
  ADMINISTRATOR: WORKSPACE_ROLES.ADMINISTRATOR,
  MANAGER: WORKSPACE_ROLES.PROJECT_MANAGER,
  PROJECT_MANAGER: WORKSPACE_ROLES.PROJECT_MANAGER,
  MEMBER: WORKSPACE_ROLES.COLLABORATOR,
  COLLABORATOR: WORKSPACE_ROLES.COLLABORATOR,
};

const INVITE_ROLE_LABELS = {
  [WORKSPACE_ROLES.ADMINISTRATOR]: "Admin",
  [WORKSPACE_ROLES.PROJECT_MANAGER]: "Manager",
  [WORKSPACE_ROLES.COLLABORATOR]: "Member",
};

const parseInviteRole = (role) => {
  if (!role) return null;
  const key = String(role).trim().toUpperCase().replace(/\s+/g, "_");
  const mapped = INVITE_ROLE_ALIASES[key];
  if (mapped && VALID_ROLES.includes(mapped)) return mapped;
  return VALID_ROLES.includes(key) ? key : null;
};

module.exports = {
  INVITATION_STATUS,
  INVITE_ROLE_LABELS,
  parseInviteRole,
};
