const userService = require("../services/userService");
const workspaceService = require("../services/workspaceService");
const joinRequestService = require("../services/joinRequestService");
const { notifyAdminUpdate } = require("../services/notificationService");
const { successResponse, errorResponse } = require("../utils/response");
const { ROLE_LABELS } = require("../utils/workspaceRoles");

const handleError = (res, error) => {
  console.error(error);
  const status = error.status || 500;
  return errorResponse(res, error.message || "Request failed", status);
};

const listUsers = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const { search, role, status } = req.query;
    const users = await userService.listUsers(workspaceId, { search, role, status });
    return successResponse(res, "Users fetched", users);
  } catch (error) {
    return handleError(res, error);
  }
};

const createUser = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const { name, email, role } = req.body;
    const joinRequest = await joinRequestService.createPendingWorkspaceUser(
      workspaceId,
      { name, email, role, invitedById: req.user.id },
      req.app.get("io")
    );
    return successResponse(
      res,
      "Invitation sent. User must sign in with the temporary password (valid 24 hours) and accept the workspace request.",
      joinRequest,
      201
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const { name, role } = req.body;
    const previous = await userService.getWorkspaceUser(workspaceId, req.params.userId);
    const user = await userService.updateUser(workspaceId, req.params.userId, { name, role });

    const io = req.app.get("io");
    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    if (role && previous?.role !== role) {
      const roleLabel = ROLE_LABELS[role] || role.replace(/_/g, " ");
      await notifyAdminUpdate(
        io,
        req.params.userId,
        `Your role in "${workspace?.name}" was updated to ${roleLabel}`,
        { workspaceId, role }
      );
    }

    return successResponse(res, "User updated", user);
  } catch (error) {
    return handleError(res, error);
  }
};

const deactivateUser = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const user = await userService.setUserActive(workspaceId, req.params.userId, false, req.user.id);
    const io = req.app.get("io");
    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    await notifyAdminUpdate(
      io,
      req.params.userId,
      `Your account was deactivated in workspace "${workspace?.name}"`,
      { workspaceId, isActive: false }
    );
    return successResponse(res, "User deactivated", user);
  } catch (error) {
    return handleError(res, error);
  }
};

const activateUser = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const user = await userService.setUserActive(workspaceId, req.params.userId, true, req.user.id);
    const io = req.app.get("io");
    const workspace = await workspaceService.getWorkspaceById(workspaceId);
    await notifyAdminUpdate(
      io,
      req.params.userId,
      `Your account was reactivated in workspace "${workspace?.name}"`,
      { workspaceId, isActive: true }
    );
    return successResponse(res, "User activated", user);
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
};
