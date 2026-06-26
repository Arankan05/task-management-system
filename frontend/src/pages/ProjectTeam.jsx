import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { UserPlus, Trash2, Mail, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import ProjectTabs from '../components/project/ProjectTabs'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import ProfileAvatar from '../components/ProfileAvatar'
import {
  getProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  getMyProjectRole,
  getProjectInvitations,
  resendProjectInvitation,
} from '../services/projectService'
import { PROJECT_MEMBER_ROLE_OPTIONS, PROJECT_ROLE_LABELS } from '../utils/constants'

function ProjectTeam() {
  const { workspaceId, projectId } = useParams()
  const { user } = useSelector((s) => s.auth)
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [myRole, setMyRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resendingId, setResendingId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'COLLABORATOR' })

  const canManage = myRole?.canManageMembers

  const load = async () => {
    setLoading(true)
    try {
      const [proj, projectMembers, role] = await Promise.all([
        getProject(projectId),
        getProjectMembers(projectId),
        getMyProjectRole(projectId),
      ])
      setProject(proj)
      setMembers(projectMembers)
      setMyRole(role)

      if (role?.canManageMembers) {
        const pending = await getProjectInvitations(projectId)
        setInvitations(pending)
      } else {
        setInvitations([])
      }
    } catch {
      setError('Failed to load project team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [projectId, workspaceId])

  const handleInvite = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const result = await addProjectMember(projectId, form)
      setSuccess(result?.message || 'Collaborator invited successfully')
      setModalOpen(false)
      setForm({ name: '', email: '', role: 'COLLABORATOR' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite collaborator')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async (invitationId) => {
    setResendingId(invitationId)
    setError('')
    setSuccess('')
    try {
      await resendProjectInvitation(projectId, invitationId)
      setSuccess('Invitation resent with a new temporary password')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend invitation')
    } finally {
      setResendingId(null)
    }
  }

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return
    try {
      await removeProjectMember(projectId, userId)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member')
    }
  }

  if (loading) {
    return <Layout><div className="flex justify-center py-20"><Loader /></div></Layout>
  }

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: 'Workspace', to: `/workspaces/${workspaceId}` },
            { label: project?.name || 'Project', to: `/workspaces/${workspaceId}/projects/${projectId}` },
            { label: 'Team' },
          ]}
          title="Project Team"
          subtitle="Invite collaborators by name and email"
          actions={
            canManage ? (
              <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
                <UserPlus size={16} /> Add member
              </button>
            ) : null
          }
        />

        <ProjectTabs activeTab="team" />

        {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

        {canManage && invitations.length > 0 && (
          <div className="glass-card mb-6 divide-y divide-white/5">
            <div className="px-6 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-theme">Pending invitations</h3>
              <p className="text-xs text-theme-muted mt-0.5">New users must sign in and change their temporary password</p>
            </div>
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-theme truncate">{inv.user?.name || inv.email}</p>
                  <p className="text-xs text-theme-muted flex items-center gap-1">
                    <Mail size={12} /> {inv.email}
                  </p>
                  <p className="text-xs text-theme-muted mt-1">
                    Status: <span className={inv.status === 'EXPIRED' ? 'text-rose-400' : 'text-amber-400'}>{inv.status}</span>
                    {' · '}
                    Expires: {new Date(inv.expiresAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResend(inv.id)}
                  disabled={resendingId === inv.id}
                  className="btn-secondary shrink-0"
                >
                  <RefreshCw size={14} className={resendingId === inv.id ? 'animate-spin' : ''} />
                  Resend
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card divide-y divide-white/5">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <ProfileAvatar user={m.user} size="sm" />
                <div>
                  <p className="font-medium text-theme">{m.user?.name}</p>
                  <p className="text-xs text-theme-muted">{m.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {PROJECT_ROLE_LABELS[m.role] || m.role}
                </span>
                {canManage && m.userId !== user?.id && (
                  <button type="button" onClick={() => handleRemove(m.userId)} className="text-rose-400 hover:text-rose-300">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="px-6 py-8 text-center text-theme-muted text-sm">No project members yet.</p>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add project member">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Full name</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Email address</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="collaborator@example.com"
              required
            />
            <p className="text-xs text-theme-muted mt-1">
              Existing users are added automatically. New users receive a temporary password by email.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Project role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {PROJECT_MEMBER_ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Sending...' : 'Add to project'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}

export default ProjectTeam
