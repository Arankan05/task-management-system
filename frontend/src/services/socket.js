import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null
let storeRef = null

export function setupSocket(store) {
  storeRef = store
}

export const connectSocket = () => {
  if (!storeRef) return null

  const token = storeRef.getState().auth?.token
  const user = storeRef.getState().auth?.user

  if (!token || socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    if (user?.id) {
      socket.emit('join:user', user.id)
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

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket
