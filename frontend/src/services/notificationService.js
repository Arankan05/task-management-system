import api from './api'

export const getNotifications = async () => {
  const { data } = await api.get('/notifications')
  return data.data
}

export const acknowledgeNotificationsOpen = async () => {
  const { data } = await api.patch('/notifications/open')
  return data.data
}

export const markNotificationRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`)
  return data.data
}

export const clearAllNotifications = async () => {
  const { data } = await api.delete('/notifications')
  return data
}
