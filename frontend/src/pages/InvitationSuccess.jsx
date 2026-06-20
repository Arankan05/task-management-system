import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import BrandLogo, { APP_NAME } from '../components/BrandLogo'
import Footer from '../components/Footer'

function InvitationSuccess() {
  const { token } = useParams()
  const location = useLocation()
  const workspace = location.state?.workspace

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" />
          </div>

          <div className="glass-card p-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-theme mb-2">Welcome to the team!</h1>
            <p className="text-theme-muted mb-6">
              You have successfully joined
              {workspace?.name ? ` "${workspace.name}"` : ' the workspace'} on {APP_NAME}.
            </p>
            <Link
              to={workspace?.id ? `/workspaces/${workspace.id}` : '/workspaces'}
              className="btn-primary inline-flex items-center gap-2"
            >
              Open Workspace <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default InvitationSuccess
