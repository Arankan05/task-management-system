const WORKSPACE_ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  COLLABORATOR: 'COLLABORATOR',
}

const PROJECT_ROLES = {
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  COLLABORATOR: 'COLLABORATOR',
}

const WORKSPACE_ROLE_LABELS = {
  ADMINISTRATOR: 'Administrator',
  PROJECT_MANAGER: 'Project Manager',
  COLLABORATOR: 'Collaborator',
}

const PROJECT_ROLE_LABELS = {
  PROJECT_MANAGER: 'Project Manager',
  COLLABORATOR: 'Collaborator',
}

export const TASK_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

export const STATUS_LABELS = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
}

export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const KANBAN_COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', color: 'slate' },
  { id: 'TODO', title: 'To Do', color: 'blue' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'amber' },
  { id: 'REVIEW', title: 'Review', color: 'purple' },
  { id: 'DONE', title: 'Done', color: 'emerald' },
]

export const WORKSPACE_COLORS = ['#7C3AED', '#A855F7', '#6D28D9', '#EC4899', '#3B82F6', '#10B981']

export const PROJECT_COLORS = ['#A855F7', '#7C3AED', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']

export const INVITE_ROLE_OPTIONS = [
  { value: 'ADMINISTRATOR', label: 'Admin' },
  { value: 'PROJECT_MANAGER', label: 'Manager' },
  { value: 'COLLABORATOR', label: 'Member' },
]

export const PROJECT_MEMBER_ROLE_OPTIONS = [
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'COLLABORATOR', label: 'Collaborator' },
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

export { WORKSPACE_ROLES, WORKSPACE_ROLE_LABELS, PROJECT_ROLES, PROJECT_ROLE_LABELS }

export const NOTIFICATION_TYPE_LABELS = {
  TASK_ASSIGNED: 'Task assigned',
  TASK_STATUS_CHANGED: 'Status changed',
  TASK_COMMENT: 'New comment',
  TASK_DEADLINE: 'Deadline reminder',
  ADMIN_UPDATE: 'Admin update',
  WORKSPACE_JOIN_REQUEST: 'Workspace invitation',
}
