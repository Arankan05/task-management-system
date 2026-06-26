import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, SortAsc, FolderKanban, Users, Layers } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import PageTransition from '../components/ui/PageTransition'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'
import { fetchProjects, createProject } from '../store/slices/projectsSlice'
import { setActiveWorkspace } from '../store/slices/workspacesSlice'
import { setActiveProjectId } from '../store/slices/tasksSlice'
import { getWorkspace, getWorkspaceMembers } from '../services/workspaceService'
import { PROJECT_COLORS } from '../utils/constants'
import { canCreateProject, getMyWorkspaceRole } from '../utils/permissions'

function WorkspaceDetail() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const { items: projects, loading, error } = useSelector((s) => s.projects)

  const [workspace, setWorkspace] = useState(null)
  const [members, setMembers] = useState([])
  const [loadingWs, setLoadingWs] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] })
  const [creating, setCreating] = useState(false)
  const [localError, setLocalError] = useState('')

  const myRole = getMyWorkspaceRole(members, user?.id)
  const canCreate = canCreateProject(myRole)

  useEffect(() => {
    dispatch(setActiveProjectId(null))
    const load = async () => {
      setLoadingWs(true)
      try {
        const ws = await getWorkspace(workspaceId)
        setWorkspace(ws)
        dispatch(setActiveWorkspace(ws))
        const mem = await getWorkspaceMembers(workspaceId)
        setMembers(mem)
      } catch {
        setLocalError('Failed to load workspace')
      } finally {
        setLoadingWs(false)
      }
    }
    load()
  }, [workspaceId, dispatch])

  useEffect(() => {
    dispatch(fetchProjects({ workspaceId, search, sort }))
  }, [dispatch, workspaceId, search, sort])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const project = await dispatch(createProject({ workspaceId, ...form })).unwrap()
      setModalOpen(false)
      setForm({ name: '', description: '', color: PROJECT_COLORS[0] })
      dispatch(fetchProjects({ workspaceId, search, sort }))
      navigate(`/workspaces/${workspaceId}/projects/${project.id}`)
    } catch (err) {
      setLocalError(err || 'Failed to create project')
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

  if (loadingWs) {
    return <Layout><div className="flex justify-center py-20"><Loader /></div></Layout>
  }

  return (
    <Layout>
      <PageTransition>
        <div className="page-container">
          <PageHeader
            breadcrumb={[{ label: 'Workspaces', to: '/workspaces' }, { label: workspace?.name || 'Workspace' }]}
            icon={workspace?.name?.charAt(0) || 'W'}
            iconColor={workspace?.color || '#7C3AED'}
            title={workspace?.name || 'Workspace'}
            subtitle={workspace?.description || 'Workspace overview and projects'}
            actions={
              canCreate ? (
                <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
                  <Plus size={16} /> New Project
                </button>
              ) : null
            }
          />

          {(localError || error) && (
            <div className="mb-4"><Alert message={localError || error} type="error" onClose={() => setLocalError('')} /></div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard title="Project" value={projects.length} icon={FolderKanban} />
            <StatCard title="Members" value={members.length} icon={Users} />
            <StatCard title="Status" value="Active" icon={Layers} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
              <input
                className="input-field pl-9"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <SortAsc size={16} className="text-theme-muted" />
              <select className="input-field !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recent">Recent</option>
                <option value="name">Name</option>
                <option value="tasks">Most tasks</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader /></div>
          ) : projects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FolderKanban className="mx-auto text-theme-muted mb-4" size={40} />
              <h3 className="text-lg font-semibold text-theme mb-2">No projects yet</h3>
              <p className="text-theme-muted text-sm mb-4">Create a project to manage tasks, kanban, and team.</p>
              {canCreate && (
                <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
                  <Plus size={16} /> Create first project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => {
                const progress = getProgress(project)
                const base = `/workspaces/${workspaceId}/projects/${project.id}`
                return (
                  <Link
                    key={project.id}
                    to={base}
                    className="glass-card p-5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shrink-0"
                        style={{ background: project.color || '#A855F7' }}
                      >
                        {project.name?.charAt(0) || 'P'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-theme truncate group-hover:text-primary">{project.name}</h3>
                        <p className="text-xs text-theme-muted line-clamp-2">{project.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-theme-muted">
                      <span>{project._count?.tasks ?? project.tasks?.length ?? 0} tasks</span>
                      <span>{progress}% done</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </PageTransition>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-muted mb-1">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? 'Creating...' : 'Create project'}
          </button>
        </form>
      </Modal>
    </Layout>
  )
}

export default WorkspaceDetail
