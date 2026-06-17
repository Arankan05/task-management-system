import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null
let storeRef = null
let listenersAttached = false
let connectionWarningShown = false

function attachListeners() {
  if (!socket || !storeRef || listenersAttached) return

  socket.on('connect', () => {
    connectionWarningShown = false
    const user = storeRef.getState().auth?.user
    if (user?.id) {
      socket.emit('join:user', user.id)
    }
  })

  socket.on('connect_error', () => {
    if (!connectionWarningShown) {
      console.warn(
        '[TaskFlow] Real-time connection failed. Start the backend: npm run dev (from project root, port 5000).'
      )
      connectionWarningShown = true
    }
  })

  socket.on('task:created', (payload) => {
    const task = payload.task || payload
    if (task?.id) storeRef.dispatch({ type: 'tasks/upsertTask', payload: task })
  })

  socket.on('task:updated', (payload) => {
    const task = payload.task || payload
    if (task?.id) storeRef.dispatch({ type: 'tasks/upsertTask', payload: task })
  })

  socket.on('task:deleted', (payload) => {
    const id = payload.taskId || payload.id
    if (id) storeRef.dispatch({ type: 'tasks/removeTask', payload: id })
  })

  socket.on('task:assigned', (payload) => {
    const task = payload.task || payload
    if (task?.id) storeRef.dispatch({ type: 'tasks/upsertTask', payload: task })
  })

  listenersAttached = true
}

export function setupSocket(store) {
  storeRef = store
}

export const connectSocket = () => {
  if (!storeRef) return null

  const token = storeRef.getState().auth?.token
  if (!token) {
    disconnectSocket()
    return null
  }

  if (socket) {
    socket.auth = { token }
    if (!socket.connected) socket.connect()
    return socket
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 10000,
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
  }
}

export const getSocket = () => socket
