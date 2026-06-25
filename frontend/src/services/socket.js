import { io } from 'socket.io-client'

let SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'
if (SOCKET_URL && SOCKET_URL.endsWith('/api')) {
  SOCKET_URL = SOCKET_URL.slice(0, -4)
}

let socket = null
let storeRef = null
let listenersAttached = false
let connectionWarningShown = false
let activeProjectId = null

function attachListeners() {
  if (!socket || !storeRef || listenersAttached) return

  socket.on('connect', () => {
    connectionWarningShown = false
    const user = storeRef.getState().auth?.user
    if (user?.id) socket.emit('join:user', user.id)
    if (activeProjectId) socket.emit('join:project', activeProjectId)
  })

  socket.on('connect_error', () => {
    if (!connectionWarningShown) {
      console.warn('[TASKPULSE] Real-time connection failed. Start backend: npm run dev')
      connectionWarningShown = true
    }
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
