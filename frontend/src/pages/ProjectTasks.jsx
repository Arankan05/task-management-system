import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Plus, Search, ListTodo } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import ProjectTabs from '../components/project/ProjectTabs'
import TaskCard from '../components/tasks/TaskCard'
import TaskFormModal from '../components/tasks/TaskFormModal'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import { fetchTasks, setActiveProjectId } from '../store/slices/tasksSlice'
import { fetchLabels } from '../store/slices/projectsSlice'
import { getMyProjectRole, getProject } from '../services/projectService'
import { canCreateTask } from '../utils/permissions'
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../utils/constants'

function ProjectTasks() {
  const { workspaceId, projectId } = useParams()
  const dispatch = useDispatch()
  const { items: tasks, loading, error } = useSelector((s) => s.tasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('recent')
  const [projectRole, setProjectRole] = useState(null)
  const [project, setProject] = useState(null)

  const base = `/workspaces/${workspaceId}/projects/${projectId}`
  const canCreate = projectRole ? canCreateTask(projectRole.role) : false

  useEffect(() => {
    dispatch(setActiveProjectId(projectId))
    dispatch(fetchLabels(projectId))
    dispatch(fetchTasks({ projectId, search, status, priority, sort }))
    getMyProjectRole(projectId).then(setProjectRole).catch(() => {})
    getProject(projectId).then(setProject).catch(() => {})
  }, [dispatch, projectId, search, status, priority, sort])

  const filtered = useMemo(() => tasks, [tasks])

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: 'Workspace', to: `/workspaces/${workspaceId}` },
            { label: project?.name || 'Project', to: base },
            { label: 'Tasks' },
          ]}
          icon={<ListTodo size={24} />}
          iconColor="#7C3AED"
          title="Tasks"
          subtitle="View and manage all project tasks"
          actions={
            canCreate ? (
              <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus size={16} /> New Task
              </button>
            ) : null
          }
        />

        <ProjectTabs activeTab="tasks" />

        {error && <div className="mb-4"><Alert message={error} type="error" /></div>}

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
            <input className="input-field pl-9" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select className="input-field !w-auto" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
          <select className="input-field !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Recent</option>
            <option value="title">Title</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="progress">Progress</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-theme-muted">No tasks yet. Create your first task!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((task) => (
              <Link key={task.id} to={`${base}/tasks/${task.id}`}>
                <TaskCard task={task} />
              </Link>
            ))}
          </div>
        )}

        <TaskFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} projectId={projectId} />
      </div>
    </Layout>
  )
}

export default ProjectTasks
