import api from './api'

export const getWorkspaces = async () => {
  const { data } = await api.get('/workspaces')
  return data.data
}

export const createWorkspace = async (payload) => {
  const { data } = await api.post('/workspaces', payload)
  return data.data
}

export const getWorkspace = async (id) => {
  const { data } = await api.get(`/workspaces/${id}`)
  return data.data
}

export const getWorkspaceStats = async (workspaceId) => {
  const { data } = await api.get(`/workspaces/${workspaceId}/stats`)
  return data.data
}

export const getWorkspaceTasks = async (workspaceId, params = {}) => {
  const { data } = await api.get(`/workspaces/${workspaceId}/tasks`, { params })
  return data.data
}

export const createWorkspaceTask = async (workspaceId, payload) => {
  const { data } = await api.post(`/workspaces/${workspaceId}/tasks`, payload)
  return data.data
}

export const getWorkspaceMembers = async (workspaceId) => {
  const { data } = await api.get(`/workspaces/${workspaceId}/members`)
  return data.data
}

export const addWorkspaceMember = async (workspaceId, email, role) => {
  const { data } = await api.post(`/workspaces/${workspaceId}/members`, { email, role })
  return data.data
}

export const updateMemberRole = async (workspaceId, userId, role) => {
  const { data } = await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role })
  return data.data
}

export const removeWorkspaceMember = async (workspaceId, userId) => {
  await api.delete(`/workspaces/${workspaceId}/members/${userId}`)
}

export const updateWorkspace = async (workspaceId, payload) => {
  const { data } = await api.put(`/workspaces/${workspaceId}`, payload)
  return data.data
}

export const deleteWorkspace = async (workspaceId) => {
  await api.delete(`/workspaces/${workspaceId}`)
}
