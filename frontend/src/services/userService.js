import api from './api'

export const getWorkspaceUsers = async (workspaceId, params = {}) => {
  const { data } = await api.get(`/workspaces/${workspaceId}/users`, { params })
  return data.data
}

export const createWorkspaceUser = async (workspaceId, payload) => {
  const { data } = await api.post(`/workspaces/${workspaceId}/users`, payload)
  return data.data
}

export const updateWorkspaceUser = async (workspaceId, userId, payload) => {
  const { data } = await api.patch(`/workspaces/${workspaceId}/users/${userId}`, payload)
  return data.data
}

export const deactivateWorkspaceUser = async (workspaceId, userId) => {
  const { data } = await api.patch(`/workspaces/${workspaceId}/users/${userId}/deactivate`)
  return data.data
}

export const activateWorkspaceUser = async (workspaceId, userId) => {
  const { data } = await api.patch(`/workspaces/${workspaceId}/users/${userId}/activate`)
  return data.data
}

export const forceResetPassword = async (newPassword, confirmPassword) => {
  const { data } = await api.post('/auth/force-reset-password', { newPassword, confirmPassword })
  return data.data
}
