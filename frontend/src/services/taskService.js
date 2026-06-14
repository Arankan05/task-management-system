import api from './api'

export const getTasks = async (params = {}) => {
  const { data } = await api.get('/tasks', { params })
  return data.data
}

export const getTaskById = async (id) => {
  const { data } = await api.get(`/tasks/${id}`)
  return data.data
}

export const createTask = async (payload) => {
  const { data } = await api.post('/tasks', payload)
  return data.data
}

export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}`, payload)
  return data.data
}

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`)
}

export const updateTaskStatus = async (id, status) => {
  const { data } = await api.patch(`/tasks/${id}/status`, { status })
  return data.data
}

export const updateTaskPriority = async (id, priority) => {
  const { data } = await api.patch(`/tasks/${id}/priority`, { priority })
  return data.data
}

export const assignTask = async (id, userId) => {
  const { data } = await api.patch(`/tasks/${id}/assign`, { userId })
  return data.data
}

export const unassignTask = async (id) => {
  const { data } = await api.patch(`/tasks/${id}/unassign`)
  return data.data
}
