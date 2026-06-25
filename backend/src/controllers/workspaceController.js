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

const listTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await getWorkspaceRole(req.user.id, id);
    if (!role) return errorResponse(res, "Access denied", 403);

    const project = await getDefaultProject(id, req.user.id);
    const { status, priority, assignedToId, search, sort, labelId } = req.query;
    const filters = getTaskListFiltersForRole(role, req.user.id, {
      status,
      priority,
      assignedToId,
      search,
      sort,
      labelId,
    });
    const tasks = await taskService.getTasksByProject(project.id, filters);
    return successResponse(res, "Tasks fetched", tasks);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch tasks", 500);
  }
};

const createTask = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await assertCanManageTasks(req.user.id, id);
    if (!permission.ok) return errorResponse(res, permission.message, 403);

    const { title, description, status, priority, progress, dueDate, assignedToId } = req.body;
    if (!title?.trim()) return errorResponse(res, "Title is required", 400);

    const project = await getDefaultProject(id, req.user.id);
    const task = await taskService.createTask({
      title,
      description,
      status,
      priority,
      progress,
      dueDate,
      assignedToId,
      projectId: project.id,
      createdById: req.user.id,
    });

    const io = req.app.get("io");
    io.to(`workspace:${id}`).emit("task:created", { task });
    await notifyTaskAssigned(io, task, req.user.id, req.user?.name || req.user?.email);

    return successResponse(res, "Task created", task, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to create task", 500);
  }
};

const getStats = async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await isWorkspaceMember(req.user.id, id))) {
      return errorResponse(res, "Access denied", 403);
    }
    const project = await getDefaultProject(id, req.user.id);
    const stats = await projectService.getProjectStats(project.id);
    return successResponse(res, "Stats fetched", stats);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch stats", 500);
  }
};

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
