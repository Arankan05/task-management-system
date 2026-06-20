import api from './api'

export const getTasks = async (projectId, params = {}) => {
  const { data } = await api.get(`/projects/${projectId}/tasks`, { params })
  return data.data
}

export const getTaskById = async (id) => {
  const { data } = await api.get(`/projects/tasks/${id}`)
  return data.data
}

export const createTask = async (projectId, payload) => {
  const { data } = await api.post(`/projects/${projectId}/tasks`, payload)
  return data.data
}

export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/projects/tasks/${id}`, payload)
  return data.data
}

export const deleteTask = async (id) => {
  await api.delete(`/projects/tasks/${id}`)
}

export const updateTaskStatus = async (id, status) => {
  const { data } = await api.patch(`/projects/tasks/${id}/status`, { status })
  return data.data
}

export const addTaskLabel = async (taskId, labelId) => {
  const { data } = await api.post(`/projects/tasks/${taskId}/labels/${labelId}`)
  return data.data
}

export const removeTaskLabel = async (taskId, labelId) => {
  const { data } = await api.delete(`/projects/tasks/${taskId}/labels/${labelId}`)
  return data.data
}

export const addComment = async (taskId, content) => {
  const { data } = await api.post(`/projects/tasks/${taskId}/comments`, { content })
  return data.data
}

export const addAttachment = async (taskId, payload) => {
  const { data } = await api.post(`/projects/tasks/${taskId}/attachments`, payload)
  return data.data
}
