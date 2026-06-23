import { useEffect, useState } from 'react'
import { Clock, RefreshCw, Users, X } from 'lucide-react'
import {
  getWorkspaceJoinRequests,
  recreateJoinRequest,
  cancelJoinRequest,
} from '../../services/joinRequestService'
import { WORKSPACE_ROLE_LABELS } from '../../utils/constants'

const STATUS_STYLES = {
  PENDING: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  EXPIRED: 'bg-red-500/10 text-red-600 border-red-500/20',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PendingUsersList({ workspaceId, refreshKey, onRefresh, onError, onSuccess }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const list = await getWorkspaceJoinRequests(workspaceId)
      setRequests(list)
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to load pending users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [workspaceId, refreshKey])

  if (loading) {
    return (
      <div className="section-card mt-6 px-6 py-8">
        <p className="text-sm text-theme-muted">Loading pending users...</p>
      </div>
    )
  }

  if (!requests.length) return null

  const handleRecreate = async (requestId) => {
    if (!window.confirm('Send a new temporary password? The previous one will no longer work.')) return
    setActionId(requestId)
    try {
      await recreateJoinRequest(workspaceId, requestId)
      onSuccess('User recreated. A new temporary password was emailed (valid 24 hours).')
      load()
      onRefresh()
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to recreate user')
    } finally {
      setActionId(null)
    }
  }

  const handleCancel = async (requestId) => {
    if (!window.confirm('Cancel this invitation? The user account may be removed if they never joined a workspace.')) return
    setActionId(requestId)
    try {
      await cancelJoinRequest(workspaceId, requestId)
      onSuccess('Invitation cancelled')
      load()
      onRefresh()
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to cancel invitation')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="section-card mt-6">
      <div className="section-card-header">
        <h2 className="font-bold text-theme flex items-center gap-2">
          <Users size={18} className="text-primary" /> Pending Users
        </h2>
        <p className="text-sm text-theme-muted mt-1">
          Users who must sign in, reset their password, and accept the workspace invitation
        </p>
      </div>
      <div className="divide-y divide-theme">
        {requests.map((request) => (
          <div key={request.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-6 py-4">
            <div className="min-w-0">
              <p className="font-semibold text-theme">{request.user?.name}</p>
              <p className="text-xs text-theme-muted truncate">{request.user?.email}</p>
              <p className="text-xs text-theme-muted mt-1">
                Role: {WORKSPACE_ROLE_LABELS[request.role] || request.role}
                {' · '}
                <Clock size={12} className="inline -mt-0.5" /> Expires {formatDate(request.expiresAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[request.status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                {request.status === 'EXPIRED' ? 'Expired' : 'Pending'}
              </span>
              {request.status === 'EXPIRED' && (
                <button
                  type="button"
                  onClick={() => handleRecreate(request.id)}
                  disabled={actionId === request.id}
                  className="btn-primary !py-1.5 !text-xs"
                  title="Recreate user and send new temporary password"
                >
                  <RefreshCw size={14} /> Recreate
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCancel(request.id)}
                disabled={actionId === request.id}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                title="Cancel invitation"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingUsersList
