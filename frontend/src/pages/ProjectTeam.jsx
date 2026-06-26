import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { UserPlus, Trash2 } from 'lucide-react'
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
} from '../services/projectService'
import { getWorkspaceMembers } from '../services/workspaceService'
import { PROJECT_MEMBER_ROLE_OPTIONS, PROJECT_ROLE_LABELS } from '../utils/constants'

function ProjectTeam() {
  const { workspaceId, projectId } = useParams()
  const { user } = useSelector((s) => s.auth)
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [workspaceMembers, setWorkspaceMembers] = useState([])
  const [myRole, setMyRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ userId: '', role: 'COLLABORATOR' })

  const canManage = myRole?.canManageMembers

  const load = async () => {
    setLoading(true)
    try {
      const [proj, projectMembers, wsMembers, role] = await Promise.all([
        getProject(projectId),
        getProjectMembers(projectId),
        getWorkspaceMembers(workspaceId),
        getMyProjectRole(projectId),
      ])
      setProject(proj)
      setMembers(projectMembers)
      setWorkspaceMembers(wsMembers)
      setMyRole(role)
    } catch {
      setError('Failed to load project team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [projectId, workspaceId])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await addProjectMember(projectId, form)
      setModalOpen(false)
      setForm({ userId: '', role: 'COLLABORATOR' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member')
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

  const availableToAdd = workspaceMembers.filter(
    (wm) => !members.some((m) => m.userId === wm.userId)
  )

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
          subtitle="Members who can access this project"
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add project member">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Workspace member</label>
            <select className="input-field" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} required>
              <option value="">Select member</option>
              {availableToAdd.map((wm) => (
                <option key={wm.userId} value={wm.userId}>{wm.user?.name} ({wm.user?.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Project role</label>
            <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {PROJECT_MEMBER_ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Add to project</button>
        </form>
      </Modal>
    </Layout>
  )
}

export default ProjectTeam
