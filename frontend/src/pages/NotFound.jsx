import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">404</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-4">Page Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="btn-primary mt-8 inline-flex">
          <Home size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
