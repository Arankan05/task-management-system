import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from './ui/Loader'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, initialized, mustResetPassword, user } = useSelector((state) => state.auth)

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

  if (mustResetPassword && location.pathname !== '/mandatory-reset') {
    return <Navigate to="/mandatory-reset" replace />
  }

  // Enforce global RBAC client-side route restrictions
  if (user?.role === 'ADMINISTRATOR') {
    if (location.pathname.startsWith('/workspaces')) {
      return <Navigate to="/users" replace />
    }
  } else {
    if (location.pathname.startsWith('/users')) {
      return <Navigate to="/workspaces" replace />
    }
  }

  return children
}

export default ProtectedRoute
