import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import Kanban from './pages/Kanban'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function PublicRoute({ children }) {
  const token = useSelector((state) => state.auth?.token)
  if (token) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
        <Route path="/kanban" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
