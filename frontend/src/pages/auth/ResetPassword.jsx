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
    <div className="min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: "url('/auth-hero.png')" }}>
      {/* Overlay for depth and contrast */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none" />
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-25%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex justify-center mb-8">
            <BrandLogo size="lg" />
          </div>

          <div className="glass-card p-8 bg-theme-surface/40 backdrop-blur-xl border border-white/5 shadow-2xl hover:translate-y-0">
            <h2 className="text-2xl font-bold text-theme mb-1">Set new password</h2>
            <p className="text-theme-muted text-sm mb-6">Almost done — enter your new password below</p>

            {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
            {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-theme-muted mt-1">{PASSWORD_REQUIREMENTS}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
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

            <p className="text-center text-theme-muted text-sm mt-6">
              <Link to="/login" className="inline-flex items-center gap-1 text-primary font-semibold hover:opacity-85">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ResetPassword
