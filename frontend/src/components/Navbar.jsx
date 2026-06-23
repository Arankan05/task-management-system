import { useSelector } from 'react-redux'
import { SidebarToggle } from './Sidebar'
import ProfileAvatar from './ProfileAvatar'
import BrandLogo from './BrandLogo'
import NotificationDropdown from './NotificationDropdown'

function Navbar({ onMenuClick }) {
  const { user } = useSelector((state) => state.auth)

  return (
    <header className="sticky top-0 z-30 bg-theme-surface/80 backdrop-blur-md border-b border-theme px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SidebarToggle onClick={onMenuClick} />
        <BrandLogo size="nav" />
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <ProfileAvatar user={user} size="md" />
      </div>
    </header>
  )
}

export default Navbar
