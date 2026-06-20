const WORKSPACE_ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  COLLABORATOR: 'COLLABORATOR',
}

const WORKSPACE_ROLE_LABELS = {
  ADMINISTRATOR: 'Administrator',
  PROJECT_MANAGER: 'Project Manager',
  COLLABORATOR: 'Collaborator',
}

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

export const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const KANBAN_COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'slate' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'amber' },
  { id: 'DONE', title: 'Done', color: 'emerald' },
]

export const WORKSPACE_COLORS = ['#7C3AED', '#A855F7', '#6D28D9', '#EC4899', '#3B82F6', '#10B981']

export const PROJECT_COLORS = ['#A855F7', '#7C3AED', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']

export const INVITE_ROLE_OPTIONS = [
  { value: 'ADMINISTRATOR', label: 'Admin' },
  { value: 'PROJECT_MANAGER', label: 'Manager' },
  { value: 'COLLABORATOR', label: 'Member' },
]

export const INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
}

export const INVITATION_STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
}

export { WORKSPACE_ROLES, WORKSPACE_ROLE_LABELS }
