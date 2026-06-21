import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Footer from '../components/Footer'
import BrandLogo, { APP_NAME } from '../components/BrandLogo'

function NotFound() {
  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" />
          </div>
          <p className="text-8xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">404</p>
          <h2 className="text-2xl font-bold text-theme mt-4">Page Not Found</h2>
          <p className="text-theme-muted mt-2 max-w-sm mx-auto">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <Link to="/workspaces" className="btn-primary mt-8 inline-flex">
            <Home size={16} /> Back to {APP_NAME}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default NotFound
