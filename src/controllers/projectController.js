const projectService = require("../services/projectService");
const {
  isWorkspaceMember,
  canAccessProject,
  assertCanManageTasks,
} = require("../services/accessService");
const { successResponse, errorResponse } = require("../utils/response");

const listProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!(await isWorkspaceMember(req.user.id, workspaceId))) {
      return errorResponse(res, "Access denied", 403);
    }
    const { search, sort } = req.query;
    const projects = await projectService.getProjectsByWorkspace(workspaceId, { search, sort });
    return successResponse(res, "Projects fetched", projects);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch projects", 500);
  }
};

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const permission = await assertCanManageTasks(req.user.id, workspaceId);
    if (!permission.ok) return errorResponse(res, permission.message, 403);

    const { name, description, color } = req.body;
    if (!name?.trim()) return errorResponse(res, "Project name is required", 400);

    const project = await projectService.createProject({
      name,
      description,
      color,
      workspaceId,
      createdById: req.user.id,
    });
    return successResponse(res, "Project created", project, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to create project", 500);
  }
};

const getProject = async (req, res) => {
  try {
    const { allowed, project } = await canAccessProject(req.user.id, req.params.id);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);
    return successResponse(res, "Project fetched", project);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch project", 500);
  }
};

const updateProject = async (req, res) => {
  try {
    const { allowed, project } = await canAccessProject(req.user.id, req.params.id);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const permission = await assertCanManageTasks(req.user.id, project.workspaceId);
    if (!permission.ok) return errorResponse(res, permission.message, 403);

    const updated = await projectService.updateProject(req.params.id, req.body);
    return successResponse(res, "Project updated", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to update project", 500);
  }
};

const deleteProject = async (req, res) => {
  try {
    const { allowed, project } = await canAccessProject(req.user.id, req.params.id);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const permission = await assertCanManageTasks(req.user.id, project.workspaceId);
    if (!permission.ok) return errorResponse(res, permission.message, 403);

    await projectService.deleteProject(req.params.id);
    return successResponse(res, "Project deleted");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to delete project", 500);
  }
};

const getProjectStats = async (req, res) => {
  try {
    const { allowed, project } = await canAccessProject(req.user.id, req.params.id);
    if (!project) return errorResponse(res, "Project not found", 404);
    if (!allowed) return errorResponse(res, "Access denied", 403);

    const stats = await projectService.getProjectStats(req.params.id);
    return successResponse(res, "Project stats fetched", stats);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch stats", 500);
  }
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
};
