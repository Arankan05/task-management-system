import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'

function getInitials(name) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ProfileAvatar({ user, size = 'md', onClick, className = '' }) {
  const navigate = useNavigate()

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-28 h-28 text-3xl',
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate('/profile')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="My Profile"
      className={`${sizes[size]} rounded-full overflow-hidden shrink-0 ring-2 ring-primary/30 hover:ring-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
    >
      {user?.profilePhoto ? (
        <img
          src={user.profilePhoto}
          alt={user?.name || 'Profile'}
          loading="lazy"
          decoding="async"
          width={size === 'xl' ? 112 : size === 'lg' ? 80 : size === 'md' ? 40 : 32}
          height={size === 'xl' ? 112 : size === 'lg' ? 80 : size === 'md' ? 40 : 32}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white font-bold">
          {user?.name ? getInitials(user.name) : <User size={size === 'sm' ? 14 : size === 'md' ? 16 : 24} />}
        </span>
      )}
    </button>
  )
}

export { getInitials }
export default ProfileAvatar
