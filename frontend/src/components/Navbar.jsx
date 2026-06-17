import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LogOut, Bell } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { disconnectSocket } from '../services/socket'
import { SidebarToggle } from './Sidebar'

function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    disconnectSocket()
    dispatch(logout())
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-30 bg-theme-surface/80 backdrop-blur-md border-b border-theme px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SidebarToggle onClick={onMenuClick} />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">TF</span>
          </div>
          <span className="text-lg font-bold text-theme hidden sm:block">TaskFlow</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400">{user?.role || 'Member'}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-secondary !py-2 !px-3 text-red-600 hover:bg-red-50 hover:border-red-200">
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
