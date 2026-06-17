import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LogOut, Bell } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { disconnectSocket } from '../services/socket'
import { SidebarToggle } from './Sidebar'
import ProfileAvatar from './ProfileAvatar'

function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    disconnectSocket()
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-theme-surface/80 backdrop-blur-md border-b border-theme px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ProfileAvatar user={user} size="md" />
        <SidebarToggle onClick={onMenuClick} />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">TF</span>
          </div>
          <span className="text-lg font-bold text-theme hidden sm:block">TaskFlow</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 rounded-lg text-theme-muted hover:text-theme hover:bg-theme-surface transition-colors" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-theme leading-tight">{user?.name || 'User'}</p>
          <p className="text-xs text-theme-muted">{user?.role || 'Member'}</p>
        </div>

        <button onClick={handleLogout} className="btn-secondary !py-2 !px-3 text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30">
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
