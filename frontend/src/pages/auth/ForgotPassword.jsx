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
              Forgot your<br />password?
            </h1>
            <p className="text-brand-100 text-lg max-w-md">
              Enter your registered email and we&apos;ll send you a 6-digit verification code.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 bg-surface-muted">
          <div className="w-full max-w-md animate-slide-up">
            <div className="glass-card p-8">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mb-4">
                <ArrowLeft size={14} /> Back to login
              </Link>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset password</h2>
              <p className="text-slate-500 text-sm mb-6">We&apos;ll email a code from {APP_NAME}</p>

              {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
              {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
      </div>
      <Footer />
    </div>
  )
}

export default ForgotPassword
