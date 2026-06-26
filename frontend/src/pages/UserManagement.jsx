import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Search,
  Plus,
  Edit2,
  Power,
  Mail,
  User,
  Key,
  Trash2,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import PageTransition from '../components/ui/PageTransition'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import api from '../services/api'

const ROLE_LABELS = {
  ADMINISTRATOR: 'Administrator',
  PROJECT_MANAGER: 'Project Manager',
  COLLABORATOR: 'Collaborator',
}

const ROLE_COLORS = {
  ADMINISTRATOR: 'text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20',
  PROJECT_MANAGER: 'text-violet-400 bg-violet-500/10 border border-violet-500/20',
  COLLABORATOR: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20',
}

function UserManagement() {
  const { user: currentUser } = useSelector((s) => s.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Forms state
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'COLLABORATOR' })
  const [editForm, setEditForm] = useState({ name: '', role: 'COLLABORATOR' })

  // Onboarding credentials display state
  const [credsDisplay, setCredsDisplay] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter

      const { data } = await api.get('/users', { params })
      setUsers(data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [search, roleFilter, statusFilter])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!addForm.name.trim()) return setError('Name is required')
    if (!addForm.email.trim()) return setError('Email is required')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(addForm.email.trim())) return setError('Please enter a valid email address')
    if (!addForm.role) return setError('Role is required')

    setSubmitting(true)
    setError('')
    setSuccess('')
    setCredsDisplay(null)

    try {
      const { data } = await api.post('/users', {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        role: addForm.role,
      })

      setAddModalOpen(false)
      setAddForm({ name: '', email: '', role: 'COLLABORATOR' })

      const payload = data.data
      if (payload.emailSent) {
        setSuccess(`User ${payload.user.name} created successfully. A welcome email was sent to ${payload.user.email}.`)
      } else {
        setCredsDisplay({
          name: payload.user.name,
          email: payload.user.email,
          tempPassword: payload.tempPassword,
        })
      }
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditOpen = (u) => {
    setSelectedUser(u)
    setEditForm({ name: u.name, role: u.role })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editForm.name.trim()) return setError('Name is required')
    if (!editForm.role) return setError('Role is required')

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await api.patch(`/users/${selectedUser.id}`, {
        name: editForm.name.trim(),
        role: editForm.role,
      })
      setEditModalOpen(false)
      setSuccess(`User ${selectedUser.name} updated successfully.`)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (u) => {
    const action = u.isActive ? 'deactivate' : 'activate'
    if (u.id === currentUser?.id) {
      setError('You cannot deactivate your own account.')
      return
    }
    if (!window.confirm(`Are you sure you want to ${action} user ${u.name}?`)) return

    setError('')
    setSuccess('')
    try {
      await api.patch(`/users/${u.id}/${action}`)
      setSuccess(`User ${u.name} has been ${action}d successfully.`)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`)
    }
  }

  const handleDeleteUser = async (u) => {
    if (u.id === currentUser?.id) {
      setError('You cannot delete your own account.')
      return
    }
    if (
      !window.confirm(
        `Are you sure you want to permanently delete user ${u.name}? All tasks and projects created by this user will be reassigned, and workspaces they own will be deleted. This action cannot be undone.`
      )
    ) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await api.delete(`/users/${u.id}`)
      setSuccess(`User ${u.name} has been deleted successfully.`)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  return (
    <Layout>
      <PageTransition className="page-container">
        <PageHeader
          title="User Management"
          subtitle="System-wide user administration, role assignment, and access control"
          actions={
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="btn-primary flex items-center gap-2 animate-fade-in"
            >
              <Plus size={16} /> Add User
            </button>
          }
        />

        {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

        {credsDisplay && (
          <div className="mb-6 glass-card border border-amber-500/30 p-6 relative overflow-hidden bg-amber-500/5 animate-slide-up">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Key className="text-amber-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-amber-200">User Onboarded (Credentials Offline)</h3>
                <p className="text-xs text-theme-muted mt-1">
                  User <strong>{credsDisplay.name}</strong> was created successfully, but the automatic welcome email could not be sent. Please share these temporary credentials manually:
                </p>
                <div className="mt-3 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-sm space-y-1.5 select-all">
                  <div><span className="text-theme-muted font-sans text-xs inline-block w-28">Username/Email:</span> {credsDisplay.email}</div>
                  <div><span className="text-theme-muted font-sans text-xs inline-block w-28">Temp Password:</span> {credsDisplay.tempPassword}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCredsDisplay(null)}
                  className="mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Dismiss Credentials Box
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="filter-bar flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field max-w-[200px]"
            >
              <option value="">All Roles</option>
              <option value="ADMINISTRATOR">Administrator</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="COLLABORATOR">Collaborator</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field max-w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-theme-muted">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-theme-muted">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-theme-muted">System Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-theme-muted">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-theme-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-theme-muted">
                        No users matching the filters found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-theme whitespace-nowrap">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-theme-muted whitespace-nowrap">{u.email}</td>
                        <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] || ''}`}>
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">
                          {u.isActive ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full w-max border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-slate-400 bg-slate-500/10 px-2.5 py-0.5 rounded-full w-max border border-slate-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.id !== currentUser?.id && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditOpen(u)}
                                  className="p-2 rounded-xl hover:bg-white/5 text-theme-muted hover:text-theme transition-all duration-200 hover:scale-105"
                                  title="Edit User"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(u)}
                                  className={`p-2 rounded-xl hover:bg-white/5 transition-all duration-200 hover:scale-105 ${
                                    u.isActive ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                                  }`}
                                  title={u.isActive ? 'Deactivate User' : 'Activate User'}
                                >
                                  <Power size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-2 rounded-xl hover:bg-white/5 text-rose-500 hover:text-rose-400 transition-all duration-200 hover:scale-105"
                                  title="Delete User"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add User">
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="label-field">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                <input
                  type="email"
                  placeholder="john.doe@company.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-field">System Role</label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="input-field"
              >
                <option value="COLLABORATOR">Collaborator (Standard Team Member)</option>
                <option value="PROJECT_MANAGER">Project Manager (Workspace Planner)</option>
                <option value="ADMINISTRATOR">Administrator (System configuration & Users)</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit User">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="label-field">Full Name</label>
              <input
                type="text"
                placeholder="Full name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-field">System Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="input-field"
              >
                <option value="COLLABORATOR">Collaborator</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      </PageTransition>
    </Layout>
  )
}

export default UserManagement
