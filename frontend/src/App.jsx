import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import BootScreen from './components/BootScreen'
import ProtectedRoute from './components/ProtectedRoute'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const MandatoryResetPassword = lazy(() => import('./pages/MandatoryResetPassword'))
const Workspaces = lazy(() => import('./pages/Workspaces'))
const WorkspaceDetail = lazy(() => import('./pages/WorkspaceDetail'))
const ProjectDashboard = lazy(() => import('./pages/ProjectDashboard'))
const ProjectKanban = lazy(() => import('./pages/ProjectKanban'))
const ProjectTasks = lazy(() => import('./pages/ProjectTasks'))
const ProjectTaskDetail = lazy(() => import('./pages/ProjectTaskDetail'))
const ProjectTeam = lazy(() => import('./pages/ProjectTeam'))
const ProjectAnalytics = lazy(() => import('./pages/ProjectAnalytics'))
const ProjectSettings = lazy(() => import('./pages/ProjectSettings'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))
const UserManagement = lazy(() => import('./pages/UserManagement'))

function MandatoryResetRoute({ children }) {
  const { isAuthenticated, initialized, mustResetPassword, user } = useSelector((state) => state.auth)
  if (!initialized) return <BootScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!mustResetPassword) {
    const target = user?.role === 'ADMINISTRATOR' ? '/users' : '/workspaces'
    return <Navigate to={target} replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, initialized, mustResetPassword, user } = useSelector((state) => state.auth)
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')
  if (initialized && isAuthenticated) {
    if (mustResetPassword) return <Navigate to="/mandatory-reset" replace />
    const target = user?.role === 'ADMINISTRATOR' ? '/users' : '/workspaces'
    return <Navigate to={redirect || target} replace />
  }
  return children
}

function LegacyWorkspaceRedirect() {
  const { workspaceId } = useParams()
  return <Navigate to={`/workspaces/${workspaceId}`} replace />
}

function DynamicDashboardRedirect() {
  const { user } = useSelector((state) => state.auth)
  const target = user?.role === 'ADMINISTRATOR' ? '/users' : '/workspaces'
  return <Navigate to={target} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<BootScreen />}>
        <Routes>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path="/mandatory-reset" element={<MandatoryResetRoute><MandatoryResetPassword /></MandatoryResetRoute>} />

          <Route path="/workspaces" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId" element={<ProtectedRoute><WorkspaceDetail /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/kanban" element={<ProtectedRoute><LegacyWorkspaceRedirect /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/settings" element={<ProtectedRoute><LegacyWorkspaceRedirect /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/tasks/:taskId" element={<ProtectedRoute><ProjectTaskDetail /></ProtectedRoute>} />

          <Route path="/workspaces/:workspaceId/projects/:projectId" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/projects/:projectId/kanban" element={<ProtectedRoute><ProjectKanban /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/projects/:projectId/tasks" element={<ProtectedRoute><ProjectTasks /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/projects/:projectId/tasks/:taskId" element={<ProtectedRoute><ProjectTaskDetail /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/projects/:projectId/team" element={<ProtectedRoute><ProjectTeam /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/projects/:projectId/analytics" element={<ProtectedRoute><ProjectAnalytics /></ProtectedRoute>} />
          <Route path="/workspaces/:workspaceId/projects/:projectId/settings" element={<ProtectedRoute><ProjectSettings /></ProtectedRoute>} />

          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><DynamicDashboardRedirect /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><DynamicDashboardRedirect /></ProtectedRoute>} />
          <Route path="/kanban" element={<ProtectedRoute><DynamicDashboardRedirect /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
