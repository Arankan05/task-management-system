import { useMemo, useState } from 'react'
import { Search, UserPlus, UserX, UserCheck, Shield, Trash2 } from 'lucide-react'
import Alert from '../ui/Alert'
import Modal from '../ui/Modal'
import {
  deactivateWorkspaceUser,
  activateWorkspaceUser,
} from '../../services/userService'
import { addWorkspaceMember, updateMemberRole, removeWorkspaceMember } from '../../services/workspaceService'
import { WORKSPACE_ROLES, WORKSPACE_ROLE_LABELS } from '../../utils/constants'
import PendingUsersList from './PendingUsersList'

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'ADMINISTRATOR', label: 'Administrator' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
  { value: 'COLLABORATOR', label: 'Collaborator' },
]

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Deactivated' },
]

const ROLE_OPTIONS = ROLE_FILTER_OPTIONS.filter((o) => o.value)

function TeamMembersSection({
  workspaceId,
  workspace,
  members,
  currentUserId,
  canManageTeamMembers,
  onRefresh,
  onError,
}) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'COLLABORATOR' })
  const [saving, setSaving] = useState(false)
  const [pendingRefreshKey, setPendingRefreshKey] = useState(0)

  const normalizeRole = (role) => (role === 'OWNER' ? WORKSPACE_ROLES.ADMINISTRATOR : role)

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((member) => {
      const role = normalizeRole(member.role)
      const name = member.user?.name?.toLowerCase() || ''
      const email = member.user?.email?.toLowerCase() || ''
      const isActive = member.user?.isActive !== false

      if (q && !name.includes(q) && !email.includes(q)) return false
      if (roleFilter && role !== roleFilter) return false
      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'inactive' && isActive) return false
      return true
    })
  }, [members, search, roleFilter, statusFilter])

  const handleRoleChange = async (userId, role) => {
    try {
      await updateMemberRole(workspaceId, userId, role)
      onRefresh()
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the workspace?')) return
    try {
      await removeWorkspaceMember(workspaceId, userId)
      setSuccess('Member removed from workspace')
      onRefresh()
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleToggleActive = async (member) => {
    const user = member.user
    if (user.id === currentUserId) {
      onError('You cannot deactivate your own account')
      return
    }
    const deactivate = user.isActive !== false
    const confirmMsg = deactivate
      ? `Deactivate ${user.name}? They will not be able to sign in.`
      : `Reactivate ${user.name}?`
    if (!window.confirm(confirmMsg)) return

    setActionId(user.id)
    setSuccess('')
    try {
      if (deactivate) {
        await deactivateWorkspaceUser(workspaceId, user.id)
        setSuccess(`${user.name} has been deactivated`)
      } else {
        await activateWorkspaceUser(workspaceId, user.id)
        setSuccess(`${user.name} has been reactivated`)
      }
      onRefresh()
    } catch (err) {
      onError(err.response?.data?.message || 'Action failed')
    } finally {
      setActionId(null)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.role) {
      onError('Email and role are required')
      return
    }
    if (!form.name.trim()) {
      onError('Full name is required')
      return
    }
    setSaving(true)
    try {
      const { message } = await addWorkspaceMember(workspaceId, {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      })
      setSuccess(message || 'Member added successfully')
      setForm({ name: '', email: '', role: 'COLLABORATOR' })
      setAddModalOpen(false)
      onRefresh()
      setPendingRefreshKey((k) => k + 1)
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  const canManageMember = (member) =>
    canManageTeamMembers
    && member.userId !== workspace?.ownerId
    && member.userId !== currentUserId

  return (
    <>
    <div className="section-card">
      <div className="section-card-header flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-theme flex items-center gap-2">
            <Shield size={18} className="text-primary" /> Team Members
          </h2>
          <p className="text-sm text-theme-muted mt-1">Assign roles: Administrator, Project Manager, or Collaborator</p>
        </div>
        {canManageTeamMembers && (
          <button type="button" onClick={() => setAddModalOpen(true)} className="btn-primary shrink-0">
            <UserPlus size={16} /> Add Member
          </button>
        )}
      </div>

      {success && (
        <div className="px-6 pt-4">
          <Alert message={success} type="success" onClose={() => setSuccess('')} />
        </div>
      )}

      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-theme">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            type="search"
            className="input-field pl-9"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="px-6 py-2 text-xs text-theme-muted">
        {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
      </div>

      <div className="divide-y divide-theme">
        {filteredMembers.length === 0 ? (
          <p className="px-6 py-8 text-sm text-theme-muted">No members match your filters.</p>
        ) : (
          filteredMembers.map((member) => {
            const role = normalizeRole(member.role)
            const user = member.user
            const isActive = user?.isActive !== false

            return (
              <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-theme-surface/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center ring-2 ring-primary/10 shrink-0">
                    {user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-theme">{user?.name}</p>
                    <p className="text-xs text-theme-muted truncate">{user?.email}</p>
                    {user?.mustResetPassword && (
                      <p className="text-xs text-amber-600 mt-0.5">Must reset password</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {isActive ? 'Active' : 'Deactivated'}
                  </span>

                  {canManageTeamMembers && member.userId !== workspace?.ownerId ? (
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                      className="input-field !w-auto text-sm min-w-[160px]"
                    >
                      {Object.entries(WORKSPACE_ROLE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-primary px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      {WORKSPACE_ROLE_LABELS[role] || role}
                    </span>
                  )}

                  {canManageMember(member) && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(member)}
                        disabled={actionId === user.id}
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? 'text-red-500 hover:bg-red-500/10'
                            : 'text-emerald-600 hover:bg-emerald-500/10'
                        }`}
                        title={isActive ? 'Deactivate user' : 'Activate user'}
                      >
                        {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Remove member"
                        title="Remove from workspace"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <p className="text-sm text-theme-muted">
            If the email already has an account, they join this workspace immediately.
            If not, an account is created with a 24-hour temporary password. After login and password reset,
            they must accept or reject the workspace invitation from notifications.
          </p>
          <div>
            <label className="label-field">Full name *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label-field">Email *</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="label-field">Workspace role *</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </Modal>
    </div>

      {canManageTeamMembers && (
        <PendingUsersList
          workspaceId={workspaceId}
          refreshKey={pendingRefreshKey}
          onRefresh={() => {
            onRefresh()
            setPendingRefreshKey((k) => k + 1)
          }}
          onError={onError}
          onSuccess={setSuccess}
        />
      )}
    </>
  )
}

export default TeamMembersSection
