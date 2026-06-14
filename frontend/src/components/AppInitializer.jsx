import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from '../store/slices/authSlice'

function AppInitializer({ children }) {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth?.token)

  useEffect(() => {
    if (token) {
      dispatch(fetchProfile())
    }
  }, [dispatch, token])

  return children
}

export default AppInitializer
