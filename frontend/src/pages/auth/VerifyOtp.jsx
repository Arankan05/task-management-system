import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/ui/Alert'
import Footer from '../../components/Footer'
import BrandLogo from '../../components/BrandLogo'
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react'

function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = location.state?.email || ''

  const [email, setEmail] = useState(emailFromState)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password', { replace: true })
    }
  }, [emailFromState, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      return setError('Please enter the 6-digit code from your email')
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-reset-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      })
      if (data.success) {
        navigate('/reset-password', {
          state: {
            email: email.trim().toLowerCase(),
            resetToken: data.data.resetToken,
          },
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setOtp(digits)
    setError('')
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
            <Link to="/forgot-password" className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:opacity-85 mb-4">
              <ArrowLeft size={14} /> Change email
            </Link>
            <h2 className="text-2xl font-bold text-theme mb-1">Enter verification code</h2>
            <p className="text-theme-muted text-sm mb-6">
              Code sent to <span className="font-medium text-theme">{email}</span>
            </p>

            {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">6-digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    className="input-field pl-9 text-center text-lg tracking-[0.4em] font-semibold"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                <ShieldCheck size={16} />
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
            </form>

            <p className="text-center text-theme-muted text-sm mt-6">
              Didn&apos;t receive it?{' '}
              <Link to="/forgot-password" state={{ email }} className="text-primary font-semibold hover:opacity-85">
                Resend code
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default VerifyOtp
