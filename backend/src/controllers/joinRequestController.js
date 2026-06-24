const joinRequestService = require("../services/joinRequestService");
const { getWorkspaceMembership } = require("../services/accessService");
const { canManageMembers } = require("../utils/workspaceRoles");
const { successResponse, errorResponse } = require("../utils/response");

const handleError = (res, error) => {
  console.error(error);
  const status = error.status || 500;
  return errorResponse(res, error.message || "Request failed", status);
};

const listWorkspaceRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await getWorkspaceMembership(req.user.id, id);
    if (!membership || !canManageMembers(membership.role)) {
      return errorResponse(res, "Only administrators can view pending users", 403);
    }

    const requests = await joinRequestService.listWorkspaceJoinRequests(id);
    return successResponse(res, "Pending users fetched", requests);
  } catch (error) {
    return handleError(res, error);
  }
};

const acceptRequest = async (req, res) => {
  try {
    const member = await joinRequestService.acceptJoinRequest(req.params.id, req.user.id);
    return successResponse(res, "Workspace invitation accepted", member);
  } catch (error) {
    return handleError(res, error);
  }
};

const rejectRequest = async (req, res) => {
  try {
    const result = await joinRequestService.rejectJoinRequest(req.params.id, req.user.id);
    return successResponse(res, "Workspace invitation rejected", result);
  } catch (error) {
    return handleError(res, error);
  }
};

const recreateRequest = async (req, res) => {
  try {
    const { id: workspaceId, requestId } = req.params;
    const membership = await getWorkspaceMembership(req.user.id, workspaceId);
    if (!membership || !canManageMembers(membership.role)) {
      return errorResponse(res, "Only administrators can recreate users", 403);
    }

    const io = req.app.get("io");
    const request = await joinRequestService.recreateJoinRequest(
      workspaceId,
      requestId,
      req.user.id,
      io
    );
    return successResponse(res, "User recreated and new temporary password sent", request);
  } catch (error) {
    return handleError(res, error);
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { id: workspaceId, requestId } = req.params;
    const membership = await getWorkspaceMembership(req.user.id, workspaceId);
    if (!membership || !canManageMembers(membership.role)) {
      return errorResponse(res, "Only administrators can cancel invitations", 403);
    }

    const result = await joinRequestService.cancelJoinRequest(workspaceId, requestId);
    return successResponse(res, "Invitation cancelled", result);
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listWorkspaceRequests,
  acceptRequest,
  rejectRequest,
  recreateRequest,
  cancelRequest,
};
