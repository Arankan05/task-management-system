import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ListTodo,
  Columns3,
  UserCircle,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/kanban', label: 'Kanban', icon: Columns3 },
  { to: '/profile', label: 'Profile', icon: UserCircle },
]

function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation()

  const NavContent = () => (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to || location.pathname.startsWith(`${to}/`)
        return (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-brand-900 min-h-[calc(100vh-64px)] flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
        </div>
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-brand-900 shadow-elevated animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <span className="text-white font-bold">TaskFlow</span>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}

export function SidebarToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
      aria-label="Open menu"
    >
      <Menu size={22} />
    </button>
  )
}

export default Sidebar
