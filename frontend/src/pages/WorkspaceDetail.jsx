import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Plus, Search, ListTodo } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import TaskCard from '../components/tasks/TaskCard'
import TaskFormModal from '../components/tasks/TaskFormModal'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import { fetchTasks, setActiveProjectId } from '../store/slices/tasksSlice'
import { setActiveWorkspace } from '../store/slices/workspacesSlice'
import { getWorkspace, getWorkspaceMembers, getWorkspaceStats } from '../services/workspaceService'
import { getSocket } from '../services/socket'
import WorkspaceTabs from '../components/workspace/WorkspaceTabs'
import WorkspaceAnalyzeTab from '../components/workspace/WorkspaceAnalyzeTab'
import TeamMembersSection from '../components/workspace/TeamMembersSection'
import {
  TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS,
} from '../utils/constants'
import { canManageTeam, canManageProjectsAndTasks, getMyWorkspaceRole } from '../utils/permissions'

const TABS = ['analyze', 'tasks', 'team']

function WorkspaceDetail() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const location = useLocation()
  const { items: tasks, loading, error } = useSelector((s) => s.tasks)
  const { user } = useSelector((s) => s.auth)

  const [tab, setTab] = useState('tasks')
  const [workspace, setWorkspace] = useState(null)
  const [members, setMembers] = useState([])
  const [loadingWs, setLoadingWs] = useState(true)
  const [taskModal, setTaskModal] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('recent')
  const [localError, setLocalError] = useState('')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const myRole = getMyWorkspaceRole(members, user?.id)
  const canManageTeamMembers = canManageTeam(myRole)
  const canManageTasks = canManageProjectsAndTasks(myRole)

  const loadWorkspace = async () => {
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

  useEffect(() => {
    loadWorkspace()
    dispatch(setActiveProjectId(null))
    getSocket()?.emit('join:workspace', workspaceId)
  }, [workspaceId])

  useEffect(() => {
    if (location.state?.tab && TABS.includes(location.state.tab)) {
      setTab(location.state.tab)
    }
  }, [location.state?.tab])

  useEffect(() => {
    if (tab === 'tasks') {
      dispatch(fetchTasks({ workspaceId, search, status, priority, sort }))
    }
  }, [dispatch, workspaceId, tab, search, status, priority, sort])

  useEffect(() => {
    if (tab === 'analyze') {
      setStatsLoading(true)
      getWorkspaceStats(workspaceId)
        .then(setStats)
        .catch(() => setLocalError('Failed to load analytics'))
        .finally(() => setStatsLoading(false))
    }
  }, [tab, workspaceId])

  if (loadingWs) {
    return <Layout><div className="flex justify-center py-20"><Loader /></div></Layout>
  }

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: workspace?.name || 'Workspace' },
          ]}
          icon={workspace?.name?.charAt(0) || 'W'}
          iconColor={workspace?.color || '#7C3AED'}
          title={workspace?.name}
          subtitle={`${members.length} team member${members.length !== 1 ? 's' : ''} · Manage tasks, analytics, and collaboration`}
          actions={
            <>
              {tab === 'tasks' && canManageTasks && (
                <button type="button" onClick={() => setTaskModal(true)} className="btn-primary">
                  <Plus size={16} /> New Task
                </button>
              )}
            </>
          }
        />

        {(localError || error) && <div className="mb-4"><Alert message={localError || error} type="error" onClose={() => setLocalError('')} /></div>}

        <WorkspaceTabs activeTab={tab} onTabChange={setTab} />

        {tab === 'analyze' && (
          <WorkspaceAnalyzeTab workspaceId={workspaceId} stats={stats} loading={statsLoading} />
        )}

        {tab === 'tasks' && (
          <>
            <div className="filter-bar">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" size={16} />
                <input className="input-field pl-9" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="input-field !w-auto min-w-[130px]" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <select className="input-field !w-auto min-w-[130px]" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">All priorities</option>
                {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
              <select className="input-field !w-auto min-w-[120px]" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recent">Recent</option>
                <option value="title">Title</option>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader /></div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No tasks yet"
                description="Create your first task to start tracking work in this workspace."
                action={<button type="button" onClick={() => setTaskModal(true)} className="btn-primary"><Plus size={16} /> Create Task</button>}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <Link key={task.id} to={`/workspaces/${workspaceId}/tasks/${task.id}`} className="block h-full">
                    <TaskCard task={task} />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'team' && (
          <TeamMembersSection
            workspaceId={workspaceId}
            workspace={workspace}
            members={members}
            currentUserId={user?.id}
            canManageTeamMembers={canManageTeamMembers}
            onRefresh={loadWorkspace}
            onError={setLocalError}
          />
        )}

        <TaskFormModal isOpen={taskModal} onClose={() => setTaskModal(false)} workspaceId={workspaceId} onSuccess={() => dispatch(fetchTasks({ workspaceId }))} />
      </div>
    </Layout>
  )
}

export default WorkspaceDetail
