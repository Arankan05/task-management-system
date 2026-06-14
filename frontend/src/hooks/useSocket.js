import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { connectSocket, disconnectSocket } from '../services/socket'

export function useSocket() {
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) {
      connectSocket()
    } else {
      disconnectSocket()
    }
    return () => disconnectSocket()
  }, [token])
}

export default useSocket
