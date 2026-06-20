import { Link } from 'react-router-dom'
import { LayoutDashboard, ListTodo, Columns3, Settings, Mail, Globe, Share2 } from 'lucide-react'

const APP_VERSION = '1.0.0'
const CURRENT_YEAR = new Date().getFullYear()

const quickLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/kanban', label: 'Kanban', icon: Columns3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function Footer() {
  return (
    <footer className="mt-auto border-t border-theme bg-theme-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
                <span className="text-white text-sm font-bold">TF</span>
              </div>
              <span className="text-lg font-bold text-theme">TaskFlow</span>
            </div>
            <p className="text-sm text-theme-muted leading-relaxed max-w-xs">
              A modern task management platform to plan, organize, and deliver work with clarity and confidence.
            </p>
            <p className="text-xs text-theme-muted mt-3">Version {APP_VERSION}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-theme uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-2 text-sm text-theme-muted hover:text-primary transition-colors"
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-theme uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm text-theme-muted">
              <li>
                <a href="mailto:support@taskflow.app" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail size={14} />
                  support@taskflow.app
                </a>
              </li>
              <li>
                <Link to="/settings" className="hover:text-primary transition-colors">
                  Help &amp; Settings
                </Link>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-default">Documentation</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-theme uppercase tracking-wider mb-4">Connect</h3>
            <p className="text-sm text-theme-muted mb-4">
              Stay updated with product news and releases.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="w-9 h-9 rounded-lg border border-theme flex items-center justify-center text-theme-muted hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Globe size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share"
                className="w-9 h-9 rounded-lg border border-theme flex items-center justify-center text-theme-muted hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Share2 size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-theme-muted text-center sm:text-left">
            &copy; {CURRENT_YEAR} TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-theme-muted">
            <Link to="/settings" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span className="text-theme-muted/50">|</span>
            <Link to="/settings" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
