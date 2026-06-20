import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Plus, Search, ListTodo, UserPlus, Trash2, Shield } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import TaskCard from '../components/tasks/TaskCard'
import TaskFormModal from '../components/tasks/TaskFormModal'
import { APP_NAME } from '../components/BrandLogo'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import { fetchTasks, setActiveProjectId } from '../store/slices/tasksSlice'
import { setActiveWorkspace } from '../store/slices/workspacesSlice'
import { getWorkspace, getWorkspaceMembers, getWorkspaceStats, addWorkspaceMember, updateMemberRole, removeWorkspaceMember } from '../services/workspaceService'
import { getSocket } from '../services/socket'
import WorkspaceTabs from '../components/workspace/WorkspaceTabs'
import WorkspaceAnalyzeTab from '../components/workspace/WorkspaceAnalyzeTab'
import {
  TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS,
  WORKSPACE_ROLES, WORKSPACE_ROLE_LABELS,
} from '../utils/constants'

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
  const [memberModal, setMemberModal] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('recent')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState(WORKSPACE_ROLES.COLLABORATOR)
  const [localError, setLocalError] = useState('')
  const [localSuccess, setLocalSuccess] = useState('')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const myMembership = members.find((m) => m.userId === user?.id)
  const myRole = myMembership?.role === 'OWNER' ? WORKSPACE_ROLES.ADMINISTRATOR : myMembership?.role
  const canManageTeam = myRole === WORKSPACE_ROLES.ADMINISTRATOR

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

  const handleInvite = async (e) => {
    e.preventDefault()
    setLocalError('')
    try {
      await addWorkspaceMember(workspaceId, inviteEmail.trim(), inviteRole)
      setInviteEmail('')
      setMemberModal(false)
      setLocalSuccess('Member added successfully')
      loadWorkspace()
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to add member')
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await updateMemberRole(workspaceId, userId, role)
      loadWorkspace()
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the workspace?')) return
    try {
      await removeWorkspaceMember(workspaceId, userId)
      loadWorkspace()
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to remove member')
    }
  }

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
              {tab === 'tasks' && (
                <button type="button" onClick={() => setTaskModal(true)} className="btn-primary">
                  <Plus size={16} /> New Task
                </button>
              )}
              {tab === 'team' && canManageTeam && (
                <button type="button" onClick={() => setMemberModal(true)} className="btn-primary">
                  <UserPlus size={16} /> Add Member
                </button>
              )}
            </>
          }
        />

        {(localError || error) && <div className="mb-4"><Alert message={localError || error} type="error" onClose={() => setLocalError('')} /></div>}
        {localSuccess && <div className="mb-4"><Alert message={localSuccess} type="success" onClose={() => setLocalSuccess('')} /></div>}

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
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="font-bold text-theme flex items-center gap-2"><Shield size={18} className="text-primary" /> Team Members</h2>
              <p className="text-sm text-theme-muted mt-1">Assign roles: Administrator, Project Manager, or Collaborator</p>
            </div>
            <div className="divide-y divide-theme">
              {members.map((member) => {
                const role = member.role === 'OWNER' ? WORKSPACE_ROLES.ADMINISTRATOR : member.role
                return (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-theme-surface/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center ring-2 ring-primary/10">
                        {member.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-theme">{member.user?.name}</p>
                        <p className="text-xs text-theme-muted">{member.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canManageTeam && member.userId !== workspace?.ownerId ? (
                        <select
                          value={role}
                          onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                          className="input-field !w-auto text-sm min-w-[160px]"
                        >
                          {Object.entries(WORKSPACE_ROLE_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm font-medium text-primary px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                          {WORKSPACE_ROLE_LABELS[role] || role}
                        </span>
                      )}
                      {canManageTeam && member.userId !== workspace?.ownerId && member.userId !== user?.id && (
                        <button type="button" onClick={() => handleRemoveMember(member.userId)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" aria-label="Remove member">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <TaskFormModal isOpen={taskModal} onClose={() => setTaskModal(false)} workspaceId={workspaceId} onSuccess={() => dispatch(fetchTasks({ workspaceId }))} />

        <Modal isOpen={memberModal} onClose={() => setMemberModal(false)} title="Add Team Member">
          <form onSubmit={handleInvite} className="space-y-4">
            <p className="text-sm text-theme-muted">The user must already be registered on {APP_NAME}.</p>
            <div>
              <label className="label-field">Email address</label>
              <input type="email" className="input-field" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@email.com" required />
            </div>
            <div>
              <label className="label-field">Role</label>
              <select className="input-field" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                {Object.entries(WORKSPACE_ROLE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full"><UserPlus size={16} /> Add to Team</button>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default WorkspaceDetail
