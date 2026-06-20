import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import Modal from '../ui/Modal'
import Alert from '../ui/Alert'
import { sendInvitation } from '../../services/invitationService'
import { INVITE_ROLE_OPTIONS } from '../../utils/constants'

function InviteMemberModal({ isOpen, onClose, workspaceId, onSuccess }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('COLLABORATOR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return setError('Email is required')

    setLoading(true)
    try {
      await sendInvitation(workspaceId, email.trim(), role)
      setEmail('')
      setRole('COLLABORATOR')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        <p className="text-sm text-theme-muted">
          An invitation email will be sent with a secure link. The invite expires in 7 days.
        </p>
        <div>
          <label className="label-field">Email address</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@email.com"
            required
          />
        </div>
        <div>
          <label className="label-field">Role</label>
          <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
            {INVITE_ROLE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <UserPlus size={16} /> {loading ? 'Sending...' : 'Send Invitation'}
        </button>
      </form>
    </Modal>
  )
}

export default InviteMemberModal
