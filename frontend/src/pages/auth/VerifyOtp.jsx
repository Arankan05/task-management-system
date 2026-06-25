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
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/auth-hero.png')" }}
        >
          <div className="absolute inset-0 bg-brand-900/65" />
          <div className="relative z-10">
            <BrandLogo size="lg" lightText className="mb-8" />
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Verify your<br />identity
            </h1>
            <p className="text-brand-100 text-lg max-w-md">
              Check your inbox for the 6-digit code we sent. It expires in 10 minutes.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 bg-surface-muted">
          <div className="w-full max-w-md animate-slide-up">
            <div className="glass-card p-8">
              <Link to="/forgot-password" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mb-4">
                <ArrowLeft size={14} /> Change email
              </Link>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Enter verification code</h2>
              <p className="text-slate-500 text-sm mb-6">
                Code sent to <span className="font-medium text-slate-700">{email}</span>
              </p>

              {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">6-digit OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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

              <p className="text-center text-slate-500 text-sm mt-6">
                Didn&apos;t receive it?{' '}
                <Link to="/forgot-password" state={{ email }} className="text-brand-600 font-semibold hover:text-brand-700">
                  Resend code
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

export default VerifyOtp
