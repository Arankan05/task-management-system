import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import BootScreen from './components/BootScreen'
import ProtectedRoute from './components/ProtectedRoute'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
// [FORGOT PASSWORD] lazy-loaded auth pages for the 3-step reset flow
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const MandatoryResetPassword = lazy(() => import('./pages/MandatoryResetPassword'))
const Workspaces = lazy(() => import('./pages/Workspaces'))
const WorkspaceDetail = lazy(() => import('./pages/WorkspaceDetail'))
const WorkspaceKanban = lazy(() => import('./pages/WorkspaceKanban'))
const WorkspaceTaskDetail = lazy(() => import('./pages/WorkspaceTaskDetail'))
const WorkspaceSettings = lazy(() => import('./pages/WorkspaceSettings'))
const ProjectDashboard = lazy(() => import('./pages/ProjectDashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function MandatoryResetRoute({ children }) {
  const { isAuthenticated, initialized, mustResetPassword } = useSelector((state) => state.auth)
  if (!initialized) return <BootScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!mustResetPassword) return <Navigate to="/workspaces" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, initialized, mustResetPassword } = useSelector((state) => state.auth)
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')
  if (initialized && isAuthenticated) {
    if (mustResetPassword) return <Navigate to="/mandatory-reset" replace />
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
      <Suspense fallback={<BootScreen />}>
        <Routes>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          {/* [FORGOT PASSWORD] public routes — /forgot-password → /verify-otp → /reset-password */}
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path="/mandatory-reset" element={<MandatoryResetRoute><MandatoryResetPassword /></MandatoryResetRoute>} />

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
      </Suspense>
    </BrowserRouter>
  )
}

export default App
