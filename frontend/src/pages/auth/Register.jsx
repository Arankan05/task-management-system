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
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <BrandLogo size="lg" lightText className="mb-8" />
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start organizing<br />your work today.
          </h1>
          <p className="text-brand-100 text-lg max-w-md">
            Join {APP_NAME} and take control of your projects with powerful task management tools.
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-surface-muted">
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
            <p className="text-slate-500 text-sm mb-6">Get started with {APP_NAME}</p>

            {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="input-field pl-9" />
                </div>
                <p className="text-xs text-slate-500 mt-1">{PASSWORD_REQUIREMENTS}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                <UserPlus size={16} />
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Already have an account?{' '}
              <Link
                to={redirectTo
                  ? `/login?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirectTo)}`
                  : '/login'}
                className="text-brand-600 font-semibold hover:text-brand-700"
              >
                Sign in
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

export default Register
