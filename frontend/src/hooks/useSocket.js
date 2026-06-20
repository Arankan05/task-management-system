import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { connectSocket, disconnectSocket } from '../services/socket'

export function useSocket() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
    } else {
      disconnectSocket()
    }
    return () => disconnectSocket()
  }, [isAuthenticated])
}

export default useSocket
