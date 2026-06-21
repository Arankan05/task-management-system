import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/ui/Alert'
import Footer from '../../components/Footer'
import BrandLogo from '../../components/BrandLogo'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { PASSWORD_REQUIREMENTS, validatePasswordClient } from '../../utils/passwordPolicy'

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const resetToken = location.state?.resetToken || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password', { replace: true })
    }
  }, [resetToken, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!password) return setError('Password is required')
    const passwordCheck = validatePasswordClient(password)
    if (!passwordCheck.valid) return setError(passwordCheck.message)
    if (password !== confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', {
        resetToken,
        newPassword: password,
      })
      if (data.success) {
        setSuccess(data.message)
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <BrandLogo size="lg" lightText className="mb-8" />
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Create a new<br />password
            </h1>
            <p className="text-brand-100 text-lg max-w-md">
              {PASSWORD_REQUIREMENTS}
            </p>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 bg-surface-muted">
          <div className="w-full max-w-md animate-slide-up">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Set new password</h2>
              <p className="text-slate-500 text-sm mb-6">Almost done — enter your new password below</p>

              {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
              {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-9"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{PASSWORD_REQUIREMENTS}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading || !!success} className="btn-primary w-full mt-2">
                  <CheckCircle size={16} />
                  {loading ? 'Updating...' : 'Reset password'}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                <Link to="/login" className="inline-flex items-center gap-1 text-brand-600 font-semibold hover:text-brand-700">
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ResetPassword
