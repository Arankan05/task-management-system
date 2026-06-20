import { useSelector } from 'react-redux'
import { Bell } from 'lucide-react'
import { SidebarToggle } from './Sidebar'
import ProfileAvatar from './ProfileAvatar'

function Navbar({ onMenuClick }) {
  const { user } = useSelector((state) => state.auth)

  return (
    <header className="sticky top-0 z-30 bg-theme-surface/80 backdrop-blur-md border-b border-theme px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SidebarToggle onClick={onMenuClick} />
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 shrink-0 bg-theme-surface">
            <img
              src="/taskpulse-logo.png"
              alt="TASKPULSE"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-lg font-bold text-theme">TASKPULSE</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-theme-muted hover:text-theme hover:bg-theme-surface transition-colors" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <ProfileAvatar user={user} size="md" />
      </div>
    </header>
  )
}

export default Navbar
