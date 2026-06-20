import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, Settings2, Palette, Type, AlertTriangle } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import { getWorkspace, updateWorkspace, deleteWorkspace } from '../services/workspaceService'
import { fetchWorkspaces } from '../store/slices/workspacesSlice'
import { WORKSPACE_COLORS } from '../utils/constants'

function WorkspaceSettings() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const [workspace, setWorkspace] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', color: WORKSPACE_COLORS[0] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getWorkspace(workspaceId)
      .then((ws) => {
        setWorkspace(ws)
        setForm({
          name: ws.name || '',
          description: ws.description || '',
          color: ws.color || WORKSPACE_COLORS[0],
        })
      })
      .catch(() => setError('Failed to load workspace settings'))
      .finally(() => setLoading(false))
  }, [workspaceId])

  const isOwner = workspace?.ownerId === user?.id

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Workspace name is required')
    setSaving(true)
    setError('')
    try {
      const updated = await updateWorkspace(workspaceId, form)
      setWorkspace(updated)
      setSuccess('Workspace settings saved successfully')
      dispatch(fetchWorkspaces())
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this workspace and all its data? This cannot be undone.')) return
    try {
      await deleteWorkspace(workspaceId)
      dispatch(fetchWorkspaces())
      navigate('/workspaces')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workspace')
    }
  }

  if (loading) {
    return <Layout><div className="flex justify-center py-20"><Loader /></div></Layout>
  }

  return (
    <Layout>
      <div className="page-container max-w-3xl">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: workspace?.name || 'Workspace', to: `/workspaces/${workspaceId}` },
            { label: 'Settings' },
          ]}
          icon={<Settings2 size={24} />}
          iconColor={workspace?.color || '#7C3AED'}
          title="Workspace Settings"
          subtitle="Manage workspace profile, appearance, and permissions"
        />

        {error && <div className="mb-4"><Alert message={error} type="error" onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert message={success} type="success" onClose={() => setSuccess('')} /></div>}

        <form onSubmit={handleSave} className="settings-panel space-y-8 mb-6">
          <section>
            <div className="flex items-center gap-2 mb-1">
              <Type size={18} className="text-primary" />
              <h2 className="settings-section-title">General</h2>
            </div>
            <p className="settings-section-desc">Basic information about your workspace</p>
            <div className="space-y-4">
              <div>
                <label className="label-field">Workspace name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label-field">Description</label>
                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the purpose of this workspace" />
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-theme">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={18} className="text-primary" />
              <h2 className="settings-section-title">Appearance</h2>
            </div>
            <p className="settings-section-desc">Choose a color to identify this workspace</p>
            <div className="flex gap-2 flex-wrap">
              {WORKSPACE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-10 h-10 rounded-xl border-2 transition-all ${form.color === c ? 'border-theme scale-110 ring-2 ring-primary/30' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </section>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {isOwner && (
          <div className="settings-panel mt-6 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="settings-section-title">Danger Zone</h2>
            </div>
            <p className="settings-section-desc">Permanently delete this workspace and all projects and tasks inside it.</p>
            <button type="button" onClick={handleDelete} className="btn-danger">
              <Trash2 size={16} /> Delete Workspace
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default WorkspaceSettings
