import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Lock, Shield, KeyRound } from 'lucide-react'
import BrandLogo, { APP_NAME } from '../components/BrandLogo'
import Alert from '../components/ui/Alert'
import Footer from '../components/Footer'
import { forceResetPassword } from '../services/userService'
import { fetchProfile } from '../store/slices/authSlice'
import { PASSWORD_REQUIREMENTS, validatePasswordClient } from '../utils/passwordPolicy'

function MandatoryResetPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.currentPassword) return setError('Temporary password is required')
    const check = validatePasswordClient(form.newPassword)
    if (!check.valid) return setError(check.message)
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match')
    if (form.currentPassword === form.newPassword) {
      return setError('New password must be different from the temporary password')
    }

    setLoading(true)
    try {
      await forceResetPassword(form.currentPassword, form.newPassword, form.confirmPassword)
      await dispatch(fetchProfile()).unwrap()
      navigate('/workspaces')
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message
      setError(detail || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: "url('/auth-hero.png')" }}>
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-25%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex justify-center mb-8">
            <BrandLogo size="lg" />
          </div>

          <div className="glass-card p-8 bg-theme-surface/40 backdrop-blur-xl border border-white/5 shadow-2xl hover:translate-y-0">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} className="text-primary" />
              <h1 className="text-2xl font-bold text-theme">Change temporary password</h1>
            </div>
            <p className="text-sm text-theme-muted mb-6">
              Your account uses a temporary password. You must set a permanent password before using {APP_NAME}.
              Temporary passwords expire after 24 hours.
            </p>

            {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Temporary password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input
                    type="password"
                    className="input-field pl-9"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label-field">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input
                    type="password"
                    className="input-field pl-9"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required
                  />
                </div>
                <p className="text-xs text-theme-muted mt-1">{PASSWORD_REQUIREMENTS}</p>
              </div>
              <div>
                <label className="label-field">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input
                    type="password"
                    className="input-field pl-9"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Saving...' : 'Update Password & Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default MandatoryResetPassword
