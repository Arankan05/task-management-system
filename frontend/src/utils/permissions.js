import { WORKSPACE_ROLES } from './constants'

export const normalizeWorkspaceRole = (role) => {
  if (role === 'OWNER') return WORKSPACE_ROLES.ADMINISTRATOR
  if (role === 'MEMBER') return WORKSPACE_ROLES.COLLABORATOR
  return role
}

export const canManageWorkspace = (role) =>
  normalizeWorkspaceRole(role) === WORKSPACE_ROLES.ADMINISTRATOR

export const canManageTeam = (role) =>
  normalizeWorkspaceRole(role) === WORKSPACE_ROLES.ADMINISTRATOR

export const canManageProjectsAndTasks = (role) =>
  [WORKSPACE_ROLES.ADMINISTRATOR, WORKSPACE_ROLES.PROJECT_MANAGER].includes(
    normalizeWorkspaceRole(role)
  )

export const canCreateTask = (role) => canManageProjectsAndTasks(role)

export const canDeleteTask = (role) => canManageProjectsAndTasks(role)

export const canEditTaskDetails = (role) => canManageProjectsAndTasks(role)

export const canUpdateTaskStatus = (role, task, userId) => {
  const normalized = normalizeWorkspaceRole(role)
  if (canManageProjectsAndTasks(normalized)) return true
  return normalized === WORKSPACE_ROLES.COLLABORATOR && task?.assignedToId === userId
}

export const canInteractWithTask = (role, task, userId) =>
  canUpdateTaskStatus(role, task, userId)

export const getMyWorkspaceRole = (members, userId) => {
  const membership = members?.find((m) => m.userId === userId)
  return membership ? normalizeWorkspaceRole(membership.role) : null
}
