const { getWorkspaceMembership } = require("../services/accessService");
const { canManageMembers } = require("../utils/workspaceRoles");
const { errorResponse } = require("../utils/response");

const requireWorkspaceAdmin = async (req, res, next) => {
  try {
    const workspaceId = req.params.id || req.params.workspaceId;
    if (!workspaceId) {
      return errorResponse(res, "Workspace ID is required", 400);
    }

    const membership = await getWorkspaceMembership(req.user.id, workspaceId);
    if (!membership || !canManageMembers(membership.role)) {
      return errorResponse(
        res,
        "Access denied",
        403,
        "Only workspace administrators can manage users"
      );
    }

    return next();
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server Error", 500);
  }
};

module.exports = requireWorkspaceAdmin;
