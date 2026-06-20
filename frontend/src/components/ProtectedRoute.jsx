import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from './ui/Loader'

function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth)

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
