import { WORKSPACE_ROLES, PROJECT_ROLES } from './constants'

export const normalizeWorkspaceRole = (role) => {
  if (role === 'OWNER') return WORKSPACE_ROLES.ADMINISTRATOR
  if (role === 'MEMBER') return WORKSPACE_ROLES.COLLABORATOR
  return role
}

export const normalizeProjectRole = (role) => {
  if (role === 'MANAGER') return PROJECT_ROLES.PROJECT_MANAGER
  if (role === 'MEMBER') return PROJECT_ROLES.COLLABORATOR
  return role
}

export const canManageWorkspace = (role) =>
  normalizeWorkspaceRole(role) === WORKSPACE_ROLES.ADMINISTRATOR

export const canManageTeam = (role) =>
  normalizeWorkspaceRole(role) === WORKSPACE_ROLES.ADMINISTRATOR

export const canCreateProject = (workspaceRole) =>
  [WORKSPACE_ROLES.ADMINISTRATOR, WORKSPACE_ROLES.PROJECT_MANAGER].includes(
    normalizeWorkspaceRole(workspaceRole)
  )

export const canManageProject = (projectRole) =>
  normalizeProjectRole(projectRole) === PROJECT_ROLES.PROJECT_MANAGER

export const canManageProjectsAndTasks = (role) => canManageProject(role)

export const canCreateTask = (projectRole) => canManageProject(projectRole)

export const canDeleteTask = (projectRole) => canManageProject(projectRole)

export const canEditTaskDetails = (projectRole) => canManageProject(projectRole)

export const canUpdateTaskStatus = (projectRole, task, userId) => {
  const normalized = normalizeProjectRole(projectRole)
  if (canManageProject(normalized)) return true
  return normalized === PROJECT_ROLES.COLLABORATOR && task?.assignedToId === userId
}

export const canInteractWithTask = (projectRole, task, userId) =>
  canUpdateTaskStatus(projectRole, task, userId)

export const getMyWorkspaceRole = (members, userId) => {
  const membership = members?.find((m) => m.userId === userId)
  return membership ? normalizeWorkspaceRole(membership.role) : null
}

export const getMyProjectRole = (members, userId) => {
  const membership = members?.find((m) => m.userId === userId)
  return membership ? normalizeProjectRole(membership.role) : null
}
