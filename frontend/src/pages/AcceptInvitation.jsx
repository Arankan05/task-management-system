import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CheckCircle2, LogIn, UserPlus, AlertCircle } from 'lucide-react'
import BrandLogo, { APP_NAME } from '../components/BrandLogo'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Footer from '../components/Footer'
import { getInvitationByToken, acceptInvitation } from '../services/invitationService'
import { INVITE_ROLE_OPTIONS } from '../utils/constants'
import { formatDate } from '../utils/taskHelpers'

function AcceptInvitation() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')

  const redirectPath = `/invitations/${token}`

  useEffect(() => {
    getInvitationByToken(token)
      .then(setInvitation)
      .catch((err) => setError(err.response?.data?.message || 'Invalid invitation link'))
      .finally(() => setLoading(false))
  }, [token])

  const roleLabel = INVITE_ROLE_OPTIONS.find((r) => r.value === invitation?.role)?.label || invitation?.role

  const emailMatches = user?.email?.toLowerCase() === invitation?.email?.toLowerCase()

  const canAccept =
    isAuthenticated &&
    emailMatches &&
    invitation?.isPending &&
    !invitation?.isExpired &&
    !invitation?.isCancelled &&
    !invitation?.isAccepted

  const handleAccept = async () => {
    setAccepting(true)
    setError('')
    try {
      const result = await acceptInvitation(token)
      navigate(`/invitations/${token}/success`, {
        state: { workspace: result.workspace },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-up">
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" />
          </div>

          <div className="glass-card p-8">
            {error && !invitation && (
              <Alert message={error} type="error" />
            )}

            {invitation && (
              <>
                <h1 className="text-2xl font-bold text-theme mb-2">Workspace Invitation</h1>
                <p className="text-theme-muted text-sm mb-6">
                  You have been invited to join a workspace on {APP_NAME}
                </p>

                {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}

                <div className="rounded-xl border border-theme p-5 mb-6 space-y-3 bg-theme-surface/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl text-white font-bold flex items-center justify-center"
                      style={{ background: invitation.workspace?.color || '#7C3AED' }}
                    >
                      {invitation.workspace?.name?.charAt(0) || 'W'}
                    </div>
                    <div>
                      <p className="font-bold text-theme">{invitation.workspace?.name}</p>
                      <p className="text-xs text-theme-muted">Invited by {invitation.invitedBy?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-theme">
                    <div>
                      <p className="text-theme-muted text-xs">Email</p>
                      <p className="font-medium text-theme truncate">{invitation.email}</p>
                    </div>
                    <div>
                      <p className="text-theme-muted text-xs">Role</p>
                      <p className="font-medium text-theme">{roleLabel}</p>
                    </div>
                    <div>
                      <p className="text-theme-muted text-xs">Expires</p>
                      <p className="font-medium text-theme">{formatDate(invitation.expiresAt)}</p>
                    </div>
                    <div>
                      <p className="text-theme-muted text-xs">Status</p>
                      <p className="font-medium text-theme capitalize">{invitation.status?.toLowerCase()}</p>
                    </div>
                  </div>
                </div>

                {invitation.isAccepted && (
                  <div className="text-center py-4">
                    <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-theme">This invitation has already been accepted.</p>
                    <Link to="/workspaces" className="btn-primary mt-4 inline-flex">Go to Workspaces</Link>
                  </div>
                )}

                {(invitation.isExpired || invitation.isCancelled) && (
                  <div className="text-center py-4">
                    <AlertCircle size={40} className="mx-auto text-amber-500 mb-2" />
                    <p className="text-theme">This invitation is no longer valid.</p>
                  </div>
                )}

                {invitation.isPending && !invitation.isExpired && (
                  <>
                    {!isAuthenticated && (
                      <div className="space-y-3">
                        <p className="text-sm text-theme-muted text-center">
                          {invitation.userExists
                            ? 'Sign in to accept this invitation.'
                            : 'Create an account to accept this invitation.'}
                        </p>
                        {invitation.userExists ? (
                          <Link
                            to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                          >
                            <LogIn size={16} /> Sign In to Accept
                          </Link>
                        ) : (
                          <Link
                            to={`/register?email=${encodeURIComponent(invitation.email)}&redirect=${encodeURIComponent(redirectPath)}`}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                          >
                            <UserPlus size={16} /> Sign Up to Accept
                          </Link>
                        )}
                        {invitation.userExists && (
                          <p className="text-center text-sm text-theme-muted">
                            New here?{' '}
                            <Link
                              to={`/register?email=${encodeURIComponent(invitation.email)}&redirect=${encodeURIComponent(redirectPath)}`}
                              className="text-primary font-semibold hover:underline"
                            >
                              Create account
                            </Link>
                          </p>
                        )}
                      </div>
                    )}

                    {isAuthenticated && !emailMatches && (
                      <Alert
                        message={`You are signed in as ${user?.email}. This invitation was sent to ${invitation.email}. Please sign in with the correct account.`}
                        type="error"
                      />
                    )}

                    {canAccept && (
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={accepting}
                        className="btn-primary w-full mt-2"
                      >
                        <CheckCircle2 size={16} />
                        {accepting ? 'Accepting...' : 'Accept Invitation'}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AcceptInvitation
