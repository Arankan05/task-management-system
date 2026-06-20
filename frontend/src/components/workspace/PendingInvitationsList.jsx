import { Mail, RefreshCw, XCircle } from 'lucide-react'
import {
  INVITATION_STATUS,
  INVITATION_STATUS_LABELS,
  INVITE_ROLE_OPTIONS,
} from '../../utils/constants'
import { formatDate } from '../../utils/taskHelpers'

const statusStyles = {
  PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  EXPIRED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-500/20',
}

function PendingInvitationsList({ invitations, onResend, onCancel, loadingId }) {
  if (!invitations?.length) return null

  const roleLabel = (role) =>
    INVITE_ROLE_OPTIONS.find((r) => r.value === role)?.label || role

  return (
    <div className="section-card mt-6">
      <div className="section-card-header">
        <h2 className="font-bold text-theme flex items-center gap-2">
          <Mail size={18} className="text-primary" /> Pending Invitations
        </h2>
        <p className="text-sm text-theme-muted mt-1">Track sent invitations and their status</p>
      </div>
      <div className="divide-y divide-theme">
        {invitations.map((inv) => (
          <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
            <div className="min-w-0">
              <p className="font-medium text-theme truncate">{inv.email}</p>
              <p className="text-xs text-theme-muted mt-0.5">
                Role: {roleLabel(inv.role)} · Sent {formatDate(inv.createdAt)}
                {inv.expiresAt && ` · Expires ${formatDate(inv.expiresAt)}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyles[inv.status] || statusStyles.PENDING}`}>
                {INVITATION_STATUS_LABELS[inv.status] || inv.status}
              </span>
              {inv.status === INVITATION_STATUS.PENDING && (
                <>
                  <button
                    type="button"
                    onClick={() => onResend(inv.id)}
                    disabled={loadingId === inv.id}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Resend invitation"
                  >
                    <RefreshCw size={16} className={loadingId === inv.id ? 'animate-spin' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(inv.id)}
                    disabled={loadingId === inv.id}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Cancel invitation"
                  >
                    <XCircle size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingInvitationsList
