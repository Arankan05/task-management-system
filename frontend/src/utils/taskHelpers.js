import { STATUS_LABELS, PRIORITY_LABELS } from './constants'

export const formatStatus = (status) => STATUS_LABELS[status] || status

export const formatPriority = (priority) => PRIORITY_LABELS[priority] || priority

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getTaskStats = (tasks = []) => ({
  total: tasks.length,
  todo: tasks.filter((t) => t.status === 'TODO').length,
  inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
  done: tasks.filter((t) => t.status === 'DONE').length,
  highPriority: tasks.filter((t) => t.priority === 'HIGH').length,
})

export const filterTasks = (tasks, filters) => {
  let result = [...tasks]

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    )
  }

  if (filters.status) {
    result = result.filter((t) => t.status === filters.status)
  }

  if (filters.priority) {
    result = result.filter((t) => t.priority === filters.priority)
  }

  if (filters.assigneeId) {
    result = result.filter((t) => t.assignedToId === filters.assigneeId)
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    result = result.filter((t) => t.dueDate && new Date(t.dueDate) >= from)
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo)
    to.setHours(23, 59, 59, 999)
    result = result.filter((t) => t.dueDate && new Date(t.dueDate) <= to)
  }

  return result
}

export const getChartData = (tasks = []) => [
  { name: 'To Do', value: tasks.filter((t) => t.status === 'TODO').length, fill: '#64748b' },
  { name: 'In Progress', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length, fill: '#f59e0b' },
  { name: 'Done', value: tasks.filter((t) => t.status === 'DONE').length, fill: '#10b981' },
]

export const getPriorityChartData = (tasks = []) => [
  { name: 'Low', value: tasks.filter((t) => t.priority === 'LOW').length, fill: '#6366f1' },
  { name: 'Medium', value: tasks.filter((t) => t.priority === 'MEDIUM').length, fill: '#8b5cf6' },
  { name: 'High', value: tasks.filter((t) => t.priority === 'HIGH').length, fill: '#ef4444' },
]

export const validateTaskForm = (form, isEdit = false) => {
  const errors = {}

  if (!form.title?.trim()) {
    errors.title = 'Title is required'
  } else if (form.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters'
  } else if (form.title.trim().length > 100) {
    errors.title = 'Title cannot exceed 100 characters'
  }

  if (form.dueDate && !isEdit) {
    const date = new Date(form.dueDate)
    if (isNaN(date.getTime())) {
      errors.dueDate = 'Invalid date'
    } else if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      errors.dueDate = 'Due date cannot be in the past'
    }
  }

  return errors
}
