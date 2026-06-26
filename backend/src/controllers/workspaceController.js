const workspaceService = require("../services/workspaceService");
const projectService = require("../services/projectService");
const taskService = require("../services/taskService");
const { isWorkspaceMember, getWorkspaceMembership, assertCanManageTasks, getWorkspaceRole, getTaskListFiltersForRole } = require("../services/accessService");
const {
  notifyTaskAssigned,
  notifyAdminUpdate,
} = require("../services/notificationService");
const { successResponse, errorResponse } = require("../utils/response");
const {
  WORKSPACE_ROLES,
  VALID_ROLES,
  canManageMembers,
  canManageWorkspace,
} = require("../utils/workspaceRoles");

const getDefaultProject = async (workspaceId, userId) =>
  projectService.getOrCreateDefaultProject(workspaceId, userId);

const listWorkspaces = async (req, res) => {
  try {
    const workspaces = await workspaceService.getWorkspacesForUser(req.user.id);
    return successResponse(res, "Workspaces fetched", workspaces);
  } catch (error) {
    console.error("listWorkspaces error:", error);
    if (error.code === "P2021" || error.message?.includes("does not exist")) {
      return errorResponse(
        res,
        "Database schema outdated. Run: npm run db:setup",
        503
      );
    }
    return errorResponse(res, "Failed to fetch workspaces", 500);
  }
};

const createWorkspace = async (req, res) => {
  try {
    if (req.user?.role === "ADMINISTRATOR") {
      return errorResponse(res, "Administrators cannot create workspaces", 403);
    }
    const { name, description, color } = req.body;
    if (!name?.trim()) return errorResponse(res, "Workspace name is required", 400);

    const workspace = await workspaceService.createWorkspace(req.user.id, {
      name,
      description,
      color,
    });
    return successResponse(res, "Workspace created", workspace, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to create workspace", 500);
  }
};

const getWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await isWorkspaceMember(req.user.id, id))) {
      return errorResponse(res, "Access denied", 403);
    }
    const workspace = await workspaceService.getWorkspaceById(id);
    if (!workspace) return errorResponse(res, "Workspace not found", 404);
    return successResponse(res, "Workspace fetched", workspace);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch workspace", 500);
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await getWorkspaceMembership(req.user.id, id);
    if (!membership || !canManageWorkspace(membership.role)) {
      return errorResponse(res, "Access denied", 403);
    }
    const workspace = await workspaceService.updateWorkspace(id, req.body);
    return successResponse(res, "Workspace updated", workspace);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update workspace", 500);
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await getWorkspaceMembership(req.user.id, id);
    if (!membership || !canManageWorkspace(membership.role)) {
      return errorResponse(res, "Only administrators can delete a workspace", 403);
    }
    await workspaceService.deleteWorkspace(id);
    return successResponse(res, "Workspace deleted");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete workspace", 500);
  }
};

const listMembers = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await isWorkspaceMember(req.user.id, id))) {
      return errorResponse(res, "Access denied", 403);
    }
    const members = await workspaceService.getMembers(id);
    return successResponse(res, "Members fetched", members);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch members", 500);
  }
};

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = WORKSPACE_ROLES.COLLABORATOR, name } = req.body;
    const membership = await getWorkspaceMembership(req.user.id, id);
    if (!membership || !canManageMembers(membership.role)) {
      return errorResponse(res, "Only administrators can add members", 403);
    }
    if (!email) return errorResponse(res, "Email is required", 400);
    if (!VALID_ROLES.includes(role)) {
      return errorResponse(res, "Invalid role", 400);
    }

    const { member, created, pending, joinRequest } = await workspaceService.addMember(
      id,
      { email, role, name, invitedById: req.user.id },
      req.app.get("io")
    );
    let message = "Member added to workspace";
    if (created && pending) {
      message = "Invitation sent. User must sign in with the temporary password (valid 24 hours) and accept the workspace request.";
    } else if (created) {
      message = "User created and welcome email sent";
    }
    return successResponse(res, message, pending ? joinRequest : member, 201);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    return errorResponse(res, error.message || "Failed to add member", status);
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    const membership = await getWorkspaceMembership(req.user.id, id);
    if (!membership || !canManageMembers(membership.role)) {
      return errorResponse(res, "Only administrators can change roles", 403);
    }
    if (!VALID_ROLES.includes(role)) {
      return errorResponse(res, "Invalid role", 400);
    }

    const workspace = await workspaceService.getWorkspaceById(id);
    if (workspace?.ownerId === userId && role !== WORKSPACE_ROLES.ADMINISTRATOR) {
      return errorResponse(res, "Workspace owner must remain an administrator", 400);
    }

    const member = await workspaceService.updateMemberRole(id, userId, role);
    const io = req.app.get("io");
    await notifyAdminUpdate(
      io,
      userId,
      `Your role in "${workspace?.name}" was updated to ${role.replace(/_/g, " ")}`,
      { workspaceId: id, role }
    );
    return successResponse(res, "Role updated", member);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update role", 500);
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const membership = await getWorkspaceMembership(req.user.id, id);
    if (!membership || !canManageMembers(membership.role)) {
      return errorResponse(res, "Only administrators can remove members", 403);
    }

    const workspace = await workspaceService.getWorkspaceById(id);
    if (workspace?.ownerId === userId) {
      return errorResponse(res, "Cannot remove the workspace owner", 400);
    }

    await workspaceService.removeMember(id, userId);
    const io = req.app.get("io");
    await notifyAdminUpdate(
      io,
      userId,
      `You were removed from workspace "${workspace?.name}"`,
      { workspaceId: id }
    );
    return successResponse(res, "Member removed");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to remove member", 500);
  }
};

const listTasks = async (req, res) =>
  errorResponse(
    res,
    "Tasks are managed at the project level. Use GET /api/projects/:projectId/tasks",
    410
  );

const createTask = async (req, res) =>
  errorResponse(
    res,
    "Tasks are managed at the project level. Use POST /api/projects/:projectId/tasks",
    410
  );

const getStats = async (req, res) =>
  errorResponse(
    res,
    "Analytics are available per project. Use GET /api/projects/:projectId/stats",
    410
  );

module.exports = {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
  listTasks,
  createTask,
  getStats,
};
