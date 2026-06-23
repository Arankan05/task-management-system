import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Lock, Shield } from 'lucide-react'
import BrandLogo, { APP_NAME } from '../components/BrandLogo'
import Alert from '../components/ui/Alert'
import Footer from '../components/Footer'
import { forceResetPassword } from '../services/userService'
import { fetchProfile } from '../store/slices/authSlice'
import { PASSWORD_REQUIREMENTS, validatePasswordClient } from '../utils/passwordPolicy'

function MandatoryResetPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const check = validatePasswordClient(form.newPassword)
    if (!check.valid) return setError(check.message)
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    try {
      await forceResetPassword(form.newPassword, form.confirmPassword)
      await dispatch(fetchProfile()).unwrap()
      navigate('/workspaces')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" />
          </div>
          <div className="glass-card p-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} className="text-primary" />
              <h1 className="text-2xl font-bold text-theme">Set your password</h1>
            </div>
            <p className="text-sm text-theme-muted mb-6">
              For security, you must choose a new password before using {APP_NAME}.
            </p>

            {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="label-field">Confirm password</label>
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
              <button type="submit" disabled={loading} className="btn-primary w-full">
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
