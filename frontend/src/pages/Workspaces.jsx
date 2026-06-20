import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Layers, Users, Search } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import { fetchWorkspaces, createWorkspace } from '../store/slices/workspacesSlice'
import { WORKSPACE_COLORS } from '../utils/constants'

function Workspaces() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: workspaces, loading, error } = useSelector((s) => s.workspaces)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', description: '', color: WORKSPACE_COLORS[0] })
  const [creating, setCreating] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    dispatch(fetchWorkspaces())
  }, [dispatch])

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setLocalError('Workspace name is required')
    setCreating(true)
    setLocalError('')
    try {
      const ws = await dispatch(createWorkspace(form)).unwrap()
      setModalOpen(false)
      setForm({ name: '', description: '', color: WORKSPACE_COLORS[0] })
      navigate(`/workspaces/${ws.id}`)
    } catch (err) {
      setLocalError(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Workspaces"
          subtitle="Organize your team, tasks, and projects in dedicated workspaces"
          actions={
            <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={16} /> New Workspace
            </button>
          }
        />

        {(error || localError) && (
          <div className="mb-4"><Alert message={error || localError} type="error" onClose={() => setLocalError('')} /></div>
        )}

        <div className="filter-bar">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <span className="text-sm text-theme-muted self-center">{filtered.length} workspace{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ws) => (
              <Link
                key={ws.id}
                to={`/workspaces/${ws.id}`}
                className="glass-card p-6 hover:shadow-elevated hover:border-primary/25 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-md"
                    style={{ background: ws.color || '#7C3AED' }}
                  >
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-theme group-hover:text-primary transition-colors truncate">{ws.name}</h3>
                    <p className="text-sm text-theme-muted mt-1 line-clamp-2">{ws.description || 'No description'}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-theme-muted">
                      <Users size={12} />
                      {ws._count?.members || 0} team member{ws._count?.members !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="glass-card p-6 border-2 border-dashed border-theme flex flex-col items-center justify-center gap-2 text-theme-muted hover:text-primary hover:border-primary/40 transition-colors min-h-[148px]"
            >
              <Layers size={28} />
              <span className="text-sm font-medium">Create workspace</span>
            </button>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Workspace">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label-field">Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Team Workspace" required />
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea className="input-field resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this workspace for?" />
            </div>
            <div>
              <label className="label-field">Color</label>
              <div className="flex gap-2 flex-wrap">
                {WORKSPACE_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-9 h-9 rounded-full border-2 transition-transform ${form.color === c ? 'border-theme scale-110 ring-2 ring-primary/30' : 'border-transparent'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <button type="submit" disabled={creating} className="btn-primary w-full">{creating ? 'Creating...' : 'Create Workspace'}</button>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default Workspaces
