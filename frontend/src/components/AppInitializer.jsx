import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '../store/slices/authSlice'
import { connectSocket, disconnectSocket } from '../services/socket'

function AppInitializer({ children }) {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth?.token)

  useEffect(() => {
    if (token) {
      dispatch(fetchProfile())
      connectSocket()
    } else {
      disconnectSocket()
    }
  }, [dispatch, token])

  return children
}

export default AppInitializer
