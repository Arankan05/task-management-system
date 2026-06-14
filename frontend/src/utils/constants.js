export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED']

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

export const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}

export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const KANBAN_COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'slate' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'amber' },
  { id: 'COMPLETED', title: 'Done', color: 'emerald' },
]
