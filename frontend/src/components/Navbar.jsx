import { useSelector } from 'react-redux'
import { SidebarToggle } from './Sidebar'
import ProfileAvatar from './ProfileAvatar'
import BrandLogo from './BrandLogo'
import NotificationDropdown from './NotificationDropdown'

function Navbar({ onMenuClick }) {
  const { user } = useSelector((state) => state.auth)

  return (
    <header className="mt-4 md:mt-6 mx-4 md:mx-6 lg:mx-8 max-w-[1600px] w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] self-center rounded-2xl border border-white/5 bg-theme-surface/40 backdrop-blur-lg shadow-lg relative z-40 flex items-center justify-between px-6 h-16 transition-all duration-300">
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
