const projectMemberService = require("../services/projectMemberService");
const {
  canAccessProject,
  assertCanManageProject,
} = require("../services/accessService");
const { canManageProjectMembers } = require("../utils/projectRoles");
const { successResponse, errorResponse } = require("../utils/response");

const listMembers = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { allowed, project } = await canAccessProject(req.user.id, projectId);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const members = await projectMemberService.getProjectMembers(projectId);
    return successResponse(res, "Project members fetched", members);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch project members", 500);
  }
};

const addMember = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const permission = await assertCanManageProject(req.user.id, projectId);
    if (!permission.ok) {
      return errorResponse(res, permission.message, permission.project ? 403 : 404);
    }

    const { userId, role } = req.body;
    if (!userId) return errorResponse(res, "User ID is required", 400);

    const member = await projectMemberService.addProjectMember(projectId, userId, role);
    return successResponse(res, "Member added to project", member, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, error.message || "Failed to add member", error.status || 500);
  }
};

const removeMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;
    const permission = await assertCanManageProject(req.user.id, projectId);
    if (!permission.ok) {
      return errorResponse(res, permission.message, permission.project ? 403 : 404);
    }

    await projectMemberService.removeProjectMember(projectId, userId);
    return successResponse(res, "Member removed from project");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to remove member", 500);
  }
};

const getMyProjectRole = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { allowed, project, role } = await canAccessProject(req.user.id, projectId);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    return successResponse(res, "Project role fetched", {
      role,
      canManageMembers: canManageProjectMembers(role),
      canManageTasks: canManageProjectMembers(role),
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch project role", 500);
  }
};

module.exports = {
  listMembers,
  addMember,
  removeMember,
  getMyProjectRole,
};
