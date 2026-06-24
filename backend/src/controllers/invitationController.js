const invitationService = require("../services/invitationService");
const { successResponse, errorResponse } = require("../utils/response");

const handleError = (res, error) => {
  console.error(error);
  const status = error.status || 500;
  return errorResponse(res, error.message || "Request failed", status);
};

const createInvitation = async (req, res) => {
  try {
    const { workspaceId, email, role } = req.body;
    if (!workspaceId) return errorResponse(res, "workspaceId is required", 400);
    if (!email) return errorResponse(res, "Email is required", 400);

    const invitation = await invitationService.createInvitation({
      workspaceId,
      email,
      role,
      invitedById: req.user.id,
    });

    return successResponse(res, "Invitation sent", invitation, 201);
  } catch (error) {
    return handleError(res, error);
  }
};

const listByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const invitations = await invitationService.listInvitationsByWorkspace(
      workspaceId,
      req.user.id
    );
    return successResponse(res, "Invitations fetched", invitations);
  } catch (error) {
    return handleError(res, error);
  }
};

const getByToken = async (req, res) => {
  try {
    const invitation = await invitationService.getInvitationByToken(req.params.token);
    return successResponse(res, "Invitation fetched", invitation);
  } catch (error) {
    return handleError(res, error);
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const result = await invitationService.acceptInvitation(
      req.params.token,
      req.user.id
    );
    return successResponse(res, "Invitation accepted", result);
  } catch (error) {
    return handleError(res, error);
  }
};

const resendInvitation = async (req, res) => {
  try {
    const invitation = await invitationService.resendInvitation(
      req.params.id,
      req.user.id
    );
    return successResponse(res, "Invitation resent", invitation);
  } catch (error) {
    return handleError(res, error);
  }
};

const cancelInvitation = async (req, res) => {
  try {
    const invitation = await invitationService.cancelInvitation(
      req.params.id,
      req.user.id
    );
    return successResponse(res, "Invitation cancelled", invitation);
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createInvitation,
  listByWorkspace,
  getByToken,
  acceptInvitation,
  resendInvitation,
  cancelInvitation,
};
