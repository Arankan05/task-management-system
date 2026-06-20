import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '../store/slices/authSlice'
import { fetchWorkspaces } from '../store/slices/workspacesSlice'
import { connectSocket, disconnectSocket } from '../services/socket'

function AppInitializer({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated, initialized } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  useEffect(() => {
    if (initialized && isAuthenticated) {
      dispatch(fetchWorkspaces())
      connectSocket()
    } else if (initialized) {
      disconnectSocket()
    }
  }, [dispatch, initialized, isAuthenticated])

  return children
}

export default AppInitializer
