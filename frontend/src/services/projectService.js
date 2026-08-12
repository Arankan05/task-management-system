import api from './api'

export const getProjects = async (workspaceId, params = {}) => {
  const { data } = await api.get(`/workspaces/${workspaceId}/projects`, { params })
  return data.data
}

export const createProject = async (workspaceId, payload) => {
  const { data } = await api.post(`/workspaces/${workspaceId}/projects`, payload)
  return data.data
}

export const getProject = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}`)
  return data.data
}

export const updateProject = async (projectId, payload) => {
  const { data } = await api.put(`/projects/${projectId}`, payload)
  return data.data
}

export const deleteProject = async (projectId) => {
  await api.delete(`/projects/${projectId}`)
}

export const getProjectStats = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/stats`)
  return data.data
}

export const getProjectMembers = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/members`)
  return data.data
}

export const addProjectMember = async (projectId, payload) => {
  const { data } = await api.post(`/projects/${projectId}/members`, payload)
  return data
}

export const getProjectInvitations = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/invitations`)
  return data.data
}

export const resendProjectInvitation = async (projectId, invitationId) => {
  const { data } = await api.post(`/projects/${projectId}/invitations/${invitationId}/resend`)
  return data
}

export const removeProjectMember = async (projectId, userId) => {
  await api.delete(`/projects/${projectId}/members/${userId}`)
}

export const getMyProjectRole = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/my-role`)
  return data.data
}

export const getLabels = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/labels`)
  return data.data
}

export const createLabel = async (projectId, payload) => {
  const { data } = await api.post(`/projects/${projectId}/labels`, payload)
  return data.data
}
