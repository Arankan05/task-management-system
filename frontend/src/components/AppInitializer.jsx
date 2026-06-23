import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { initializeAuth } from '../store/slices/authSlice'
import { fetchWorkspaces } from '../store/slices/workspacesSlice'
import { connectSocket, disconnectSocket } from '../services/socket'

function AppInitializer({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated, initialized } = useSelector((state) => state.auth)
  const initStarted = useRef(false)

  useEffect(() => {
    if (initStarted.current) return
    initStarted.current = true
    dispatch(initializeAuth())
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
