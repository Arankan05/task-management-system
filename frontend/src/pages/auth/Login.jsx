import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearAuthError } from '../../store/slices/authSlice'
import Alert from '../../components/ui/Alert'
import Footer from '../../components/Footer'
import BrandLogo, { APP_NAME } from '../../components/BrandLogo'
import { LogIn, Mail, Lock } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth ?? {})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    dispatch(clearAuthError())
    setValidationError('')

    if (!email) return setValidationError('Email is required')
    if (!password) return setValidationError('Password is required')
    if (password.length < 6) return setValidationError('Password must be at least 6 characters')

    try {
      await dispatch(loginUser({ email, password })).unwrap()
      navigate('/workspaces')
    } catch {
      // error handled in slice
    }
  }

  const displayError = validationError || error

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <BrandLogo size="lg" lightText className="mb-8" />
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage tasks<br />with clarity.
          </h1>
          <p className="text-brand-100 text-lg max-w-md">
            Sign in to {APP_NAME} and take control of your team&apos;s work.
          </p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-20 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-surface-muted">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex justify-center mb-8">
            <BrandLogo size="md" />
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

            {displayError && <div className="mb-4"><Alert message={displayError} type="error" onClose={() => { setValidationError(''); dispatch(clearAuthError()) }} /></div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brand-600 font-semibold hover:text-brand-700">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-9" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                <LogIn size={16} />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">Create one</Link>
            </p>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login
