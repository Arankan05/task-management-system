import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, ArrowLeft, Search, LayoutGrid, SortAsc } from 'lucide-react'
import Layout from '../components/Layout'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import { fetchProjects, createProject } from '../store/slices/projectsSlice'
import { setActiveWorkspace } from '../store/slices/workspacesSlice'
import { PROJECT_COLORS } from '../utils/constants'

function WorkspaceProjects() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const workspace = useSelector((s) => s.workspaces.items.find((w) => w.id === workspaceId))
  const { items: projects, loading, error } = useSelector((s) => s.projects)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (workspace) dispatch(setActiveWorkspace(workspace))
    dispatch(fetchProjects({ workspaceId, search, sort }))
  }, [dispatch, workspaceId, search, sort, workspace])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const project = await dispatch(createProject({ workspaceId, ...form })).unwrap()
      setModalOpen(false)
      navigate(`/workspaces/${workspaceId}/projects/${project.id}`)
    } catch {
      // error in slice
    } finally {
      setCreating(false)
    }
  }

  const getProgress = (project) => {
    const tasks = project.tasks || []
    if (!tasks.length) return 0
    const done = tasks.filter((t) => t.status === 'DONE').length
    return Math.round((done / tasks.length) * 100)
  }

  return (
    <Layout>
      <div className="page-container">
        <Link to="/workspaces" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft size={14} /> All workspaces
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center" style={{ background: workspace?.color || '#7C3AED' }}>
              {workspace?.name?.charAt(0) || 'W'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-theme">{workspace?.name || 'Workspace'}</h1>
              <p className="text-sm text-theme-muted">Projects & boards</p>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> New Project</button>
        </div>

        {error && <div className="mb-4"><Alert message={error} type="error" /></div>}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
            <input className="input-field pl-9" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <SortAsc size={16} className="text-theme-muted" />
            <select className="input-field !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Recently active</option>
              <option value="name">Name</option>
              <option value="tasks">Most tasks</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-2xl border-2 border-dashed border-theme min-h-[120px] flex flex-col items-center justify-center gap-2 text-theme-muted hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Create new project</span>
            </button>

            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/workspaces/${workspaceId}/projects/${project.id}`}
                className="rounded-2xl overflow-hidden glass-card hover:shadow-elevated transition-all group"
              >
                <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${project.color || '#A855F7'}, ${project.color || '#7C3AED'}99)` }}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-theme truncate">{project.name}</h3>
                  <p className="text-xs text-theme-muted mt-1">{project._count?.tasks || 0} tasks</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-theme-muted mb-1">
                      <span>Progress</span>
                      <span>{getProgress(project)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-theme-surface overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${getProgress(project)}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme mb-1.5">Project name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme mb-1.5">Description</label>
              <textarea className="input-field resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-full border-2 ${form.color === c ? 'border-theme' : 'border-transparent'}`} style={{ background: c }} />
              ))}
            </div>
            <button type="submit" disabled={creating} className="btn-primary w-full">{creating ? 'Creating...' : 'Create Project'}</button>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default WorkspaceProjects
