const userService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/response");

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
    const user = await userService.createUser(workspaceId, { name, email, role });
    return successResponse(res, "User created and welcome email sent", user, 201);
  } catch (error) {
    return handleError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const { name, role } = req.body;
    const user = await userService.updateUser(workspaceId, req.params.userId, { name, role });
    return successResponse(res, "User updated", user);
  } catch (error) {
    return handleError(res, error);
  }
};

const deactivateUser = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const user = await userService.setUserActive(workspaceId, req.params.userId, false, req.user.id);
    return successResponse(res, "User deactivated", user);
  } catch (error) {
    return handleError(res, error);
  }
};

const activateUser = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const user = await userService.setUserActive(workspaceId, req.params.userId, true, req.user.id);
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
