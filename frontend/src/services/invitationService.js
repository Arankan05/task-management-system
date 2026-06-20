import api from './api'

export const sendInvitation = async (workspaceId, email, role) => {
  const { data } = await api.post('/invitations', { workspaceId, email, role })
  return data.data
}

export const getWorkspaceInvitations = async (workspaceId) => {
  const { data } = await api.get(`/invitations/workspace/${workspaceId}`)
  return data.data
}

export const getInvitationByToken = async (token) => {
  const { data } = await api.get(`/invitations/${token}`)
  return data.data
}

export const acceptInvitation = async (token) => {
  const { data } = await api.post(`/invitations/${token}/accept`)
  return data.data
}

export const resendInvitation = async (invitationId) => {
  const { data } = await api.post(`/invitations/${invitationId}/resend`)
  return data.data
}

export const cancelInvitation = async (invitationId) => {
  const { data } = await api.delete(`/invitations/${invitationId}/cancel`)
  return data.data
}
