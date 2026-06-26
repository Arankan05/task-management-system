import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import ProjectTabs from '../components/project/ProjectTabs'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import {
  getProject,
  updateProject,
  deleteProject,
  getMyProjectRole,
} from '../services/projectService'
import { PROJECT_COLORS } from '../utils/constants'

function ProjectSettings() {
  const { workspaceId, projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] })
  const [myRole, setMyRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canManage = myRole?.canManageTasks

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [proj, role] = await Promise.all([
          getProject(projectId),
          getMyProjectRole(projectId),
        ])
        setProject(proj)
        setMyRole(role)
        setForm({
          name: proj.name || '',
          description: proj.description || '',
          color: proj.color || PROJECT_COLORS[0],
        })
      } catch {
        setError('Failed to load project settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!canManage) return
    setSaving(true)
    setError('')
    try {
      const updated = await updateProject(projectId, form)
      setProject(updated)
      setSuccess('Project updated')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!canManage || !window.confirm('Delete this project and all its tasks?')) return
    try {
      await deleteProject(projectId)
      navigate(`/workspaces/${workspaceId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
    }
  }

  if (loading) {
    return <Layout><div className="flex justify-center py-20"><Loader /></div></Layout>
  }

  if (!canManage) {
    return (
      <Layout>
        <div className="page-container">
          <PageHeader
            breadcrumb={[
              { label: 'Workspaces', to: '/workspaces' },
              { label: 'Workspace', to: `/workspaces/${workspaceId}` },
              { label: project?.name || 'Project', to: `/workspaces/${workspaceId}/projects/${projectId}` },
              { label: 'Settings' },
            ]}
            title="Project Settings"
            subtitle="Update project details and configuration"
          />
          <ProjectTabs activeTab="settings" />
          <Alert message="Only project managers can access project settings." type="error" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page-container max-w-2xl">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: 'Workspace', to: `/workspaces/${workspaceId}` },
            { label: project?.name || 'Project', to: `/workspaces/${workspaceId}/projects/${projectId}` },
            { label: 'Settings' },
          ]}
          title="Project Settings"
          subtitle="Update project details and configuration"
        />

        <ProjectTabs activeTab="settings" />

        {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

        <form onSubmit={handleSave} className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Project name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Description</label>
            <textarea className="input-field" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`w-8 h-8 rounded-full ${form.color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                style={{ background: c }}
                onClick={() => setForm({ ...form, color: c })}
              />
            ))}
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <div className="glass-card p-6 mt-6 border border-rose-500/20">
          <h3 className="font-semibold text-rose-400 mb-2">Danger zone</h3>
          <p className="text-sm text-theme-muted mb-4">Deleting a project removes all tasks permanently.</p>
          <button type="button" onClick={handleDelete} className="btn-danger">
            <Trash2 size={16} /> Delete project
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default ProjectSettings
