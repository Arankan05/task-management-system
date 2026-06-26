import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import Alert from '../../components/ui/Alert'
import Footer from '../../components/Footer'
import BrandLogo, { APP_NAME } from '../../components/BrandLogo'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import { PASSWORD_REQUIREMENTS, validatePasswordClient } from '../../utils/passwordPolicy'

function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ''
  const [form, setForm] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const prefill = searchParams.get('email')
    if (prefill) setForm((prev) => ({ ...prev, email: prefill }))
  }, [searchParams])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Name is required')
    if (!form.email) return setError('Email is required')
    if (!form.password) return setError('Password is required')
    const passwordCheck = validatePasswordClient(form.password)
    if (!passwordCheck.valid) return setError(passwordCheck.message)
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      })
      if (data.success) {
        const loginParams = new URLSearchParams()
        if (form.email) loginParams.set('email', form.email)
        if (redirectTo) loginParams.set('redirect', redirectTo)
        const qs = loginParams.toString()
        navigate(qs ? `/login?${qs}` : '/login')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
            <h2 className="text-2xl font-bold text-theme mb-1">Create account</h2>
            <p className="text-theme-muted text-sm mb-6">Get started with {APP_NAME}</p>

            {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="input-field pl-9" />
                </div>
                <p className="text-xs text-theme-muted mt-1">{PASSWORD_REQUIREMENTS}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-muted mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                  <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                <UserPlus size={16} />
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-theme-muted text-sm mt-6">
              Already have an account?{' '}
              <Link
                to={redirectTo
                  ? `/login?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirectTo)}`
                  : '/login'}
                className="text-primary font-semibold hover:opacity-85"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Register
