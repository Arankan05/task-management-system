import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOtp from './pages/auth/VerifyOtp'
import ResetPassword from './pages/auth/ResetPassword'
import Workspaces from './pages/Workspaces'
import WorkspaceDetail from './pages/WorkspaceDetail'
import WorkspaceKanban from './pages/WorkspaceKanban'
import WorkspaceTaskDetail from './pages/WorkspaceTaskDetail'
import WorkspaceSettings from './pages/WorkspaceSettings'
import ProjectDashboard from './pages/ProjectDashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import AcceptInvitation from './pages/AcceptInvitation'
import InvitationSuccess from './pages/InvitationSuccess'
import ProtectedRoute from './components/ProtectedRoute'

function PublicRoute({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth)
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')
  if (initialized && isAuthenticated) {
    return <Navigate to={redirect || '/workspaces'} replace />
  }
  return children
}

function LegacyProjectRedirect() {
  const { workspaceId } = useParams()
  return <Navigate to={`/workspaces/${workspaceId}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        <Route path="/invitations/:token" element={<AcceptInvitation />} />
        <Route path="/invitations/:token/success" element={<InvitationSuccess />} />

        <Route path="/workspaces" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
        <Route path="/workspaces/:workspaceId" element={<ProtectedRoute><WorkspaceDetail /></ProtectedRoute>} />
        <Route path="/workspaces/:workspaceId/kanban" element={<ProtectedRoute><WorkspaceKanban /></ProtectedRoute>} />
        <Route path="/workspaces/:workspaceId/settings" element={<ProtectedRoute><WorkspaceSettings /></ProtectedRoute>} />
        <Route path="/workspaces/:workspaceId/tasks/:taskId" element={<ProtectedRoute><WorkspaceTaskDetail /></ProtectedRoute>} />
        <Route path="/workspaces/:workspaceId/projects/:projectId" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/*" element={<ProtectedRoute><LegacyProjectRedirect /></ProtectedRoute>} />

        <Route path="/dashboard" element={<Navigate to="/workspaces" replace />} />
        <Route path="/tasks" element={<Navigate to="/workspaces" replace />} />
        <Route path="/kanban" element={<Navigate to="/workspaces" replace />} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
