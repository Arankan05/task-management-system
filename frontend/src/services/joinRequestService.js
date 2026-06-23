import api from './api'

export const getWorkspaceJoinRequests = async (workspaceId) => {
  const { data } = await api.get(`/workspaces/${workspaceId}/join-requests`)
  return data.data
}

export const acceptJoinRequest = async (requestId) => {
  const { data } = await api.post(`/join-requests/${requestId}/accept`)
  return data
}

export const rejectJoinRequest = async (requestId) => {
  const { data } = await api.post(`/join-requests/${requestId}/reject`)
  return data
}

export const recreateJoinRequest = async (workspaceId, requestId) => {
  const { data } = await api.post(`/workspaces/${workspaceId}/join-requests/${requestId}/recreate`)
  return data
}

export const cancelJoinRequest = async (workspaceId, requestId) => {
  const { data } = await api.delete(`/workspaces/${workspaceId}/join-requests/${requestId}`)
  return data
}
