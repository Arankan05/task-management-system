import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined

let socket = null
let storeRef = null
let listenersAttached = false
let connectionWarningShown = false
let activeProjectId = null
const notificationListeners = new Set()
const notificationReconnectListeners = new Set()

function attachListeners() {
  if (!socket || !storeRef || listenersAttached) return

  socket.on('connect', () => {
    connectionWarningShown = false
    const user = storeRef.getState().auth?.user
    if (user?.id) socket.emit('join:user', user.id)
    if (activeProjectId) socket.emit('join:project', activeProjectId)
    notificationReconnectListeners.forEach((handler) => handler())
  })

  socket.on('connect_error', () => {
    if (!connectionWarningShown) {
      connectionWarningShown = true
    }
  })

  socket.on('notification:new', (notification) => {
    notificationListeners.forEach((handler) => handler(notification))
  })

  const handleTaskEvent = (type) => (payload) => {
    const task = payload.task || payload
    const projectId = storeRef.getState().tasks?.activeProjectId
    if (task?.id && (!projectId || task.projectId === projectId)) {
      storeRef.dispatch({ type: `tasks/${type}`, payload: type === 'removeTask' ? (payload.taskId || payload.id) : task })
    }
  }

  socket.on('task:created', handleTaskEvent('upsertTask'))
  socket.on('task:updated', handleTaskEvent('upsertTask'))
  socket.on('task:deleted', (payload) => {
    const id = payload.taskId || payload.id
    if (id) storeRef.dispatch({ type: 'tasks/removeTask', payload: id })
  })
  socket.on('task:assigned', handleTaskEvent('upsertTask'))

  listenersAttached = true
}

export function setupSocket(store) {
  storeRef = store
}

/** Subscribe to real-time notifications (dedupe in UI). Returns unsubscribe. */
export function subscribeNotifications({ onNew, onReconnect } = {}) {
  if (onNew) notificationListeners.add(onNew)
  if (onReconnect) notificationReconnectListeners.add(onReconnect)
  return () => {
    if (onNew) notificationListeners.delete(onNew)
    if (onReconnect) notificationReconnectListeners.delete(onReconnect)
  }
}

export const joinProjectRoom = (projectId) => {
  activeProjectId = projectId
  if (socket?.connected) socket.emit('join:project', projectId)
}

export const connectSocket = () => {
  if (!storeRef) return null
  const isAuthenticated = storeRef.getState().auth?.isAuthenticated
  if (!isAuthenticated) {
    disconnectSocket()
    return null
  }

  if (socket) {
    if (!socket.connected) socket.connect()
    return socket
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  })

  attachListeners()
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
    listenersAttached = false
    connectionWarningShown = false
    activeProjectId = null
  }
}

export const getSocket = () => socket
