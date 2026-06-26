import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/ui/Alert'
import Footer from '../../components/Footer'
import BrandLogo, { APP_NAME } from '../../components/BrandLogo'
import { Mail, ArrowLeft, Send } from 'lucide-react'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) return setError('Email is required')

    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      })
      if (data.success) {
        setSuccess(data.message)
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: email.trim().toLowerCase() } })
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code')
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
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:opacity-85 mb-4">
              <ArrowLeft size={14} /> Back to login
            </Link>
            <h2 className="text-2xl font-bold text-theme mb-1">Reset password</h2>
            <p className="text-theme-muted text-sm mb-6">We&apos;ll email a code from {APP_NAME}</p>

            {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
            {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                <Send size={16} />
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ForgotPassword
