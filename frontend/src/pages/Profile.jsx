import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Mail, Shield, Calendar, Settings } from 'lucide-react'
import Layout from '../components/Layout'

function Profile() {
  const { user } = useSelector((state) => state.auth)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <Layout>
      <div className="page-container max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-theme">Profile</h1>
          <p className="text-theme-muted mt-1">Your account information</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
                <p className="text-brand-100 text-sm">{user?.email || '—'}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Mail size={18} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-slate-800">{user?.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Shield size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Role</p>
                <p className="text-sm font-semibold text-slate-800">{user?.role || 'COLLABORATOR'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Calendar size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Member Since</p>
                <p className="text-sm font-semibold text-slate-800">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <Link
              to="/settings"
              className="flex items-center justify-between w-full p-4 rounded-xl border border-theme bg-theme-surface hover:border-primary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme">Settings</p>
                  <p className="text-xs text-theme-muted">Appearance, notifications, security</p>
                </div>
              </div>
              <span className="text-primary text-sm font-medium group-hover:underline">Open →</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
