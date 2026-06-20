import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { ListTodo, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Loader from '../components/ui/Loader'
import { fetchProjectStats, setActiveProject } from '../store/slices/projectsSlice'
import { getProject } from '../services/projectService'
import { setActiveProjectId } from '../store/slices/tasksSlice'

const PIE_COLORS = ['#94a3b8', '#f59e0b', '#10b981']

function ProjectDashboard() {
  const { workspaceId, projectId } = useParams()
  const dispatch = useDispatch()
  const { stats, loading } = useSelector((s) => s.projects)
  const [project, setProject] = useState(null)

  useEffect(() => {
    dispatch(setActiveProjectId(projectId))
    dispatch(fetchProjectStats(projectId))
    getProject(projectId).then(setProject).catch(() => {})
    dispatch(setActiveProject({ id: projectId }))
  }, [dispatch, projectId])

  const statusData = stats ? [
    { name: 'To Do', value: stats.todo },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Done', value: stats.done },
  ] : []

  const priorityData = stats ? [
    { name: 'Low', value: stats.byPriority.LOW },
    { name: 'Medium', value: stats.byPriority.MEDIUM },
    { name: 'High', value: stats.byPriority.HIGH },
  ] : []

  if (loading && !stats) {
    return <Layout><div className="flex justify-center py-20"><Loader /></div></Layout>
  }

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: 'Workspace', to: `/workspaces/${workspaceId}` },
            { label: project?.name || 'Project' },
          ]}
          icon={project?.name?.charAt(0) || 'P'}
          iconColor={project?.color || '#A855F7'}
          title={project?.name || 'Project Overview'}
          subtitle={project?.description || 'Project statistics and recent activity'}
          actions={
            <Link to={`/workspaces/${workspaceId}`} className="btn-secondary">
              <ListTodo size={16} /> Workspace Tasks
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Tasks" value={stats?.total || 0} icon={ListTodo} color="brand" sub="All project tasks" />
          <StatCard title="In Progress" value={stats?.inProgress || 0} icon={Clock} color="amber" sub="Currently active" />
          <StatCard title="Completed" value={stats?.done || 0} icon={CheckCircle2} color="emerald" sub={`${stats?.completionRate || 0}% done`} />
          <StatCard title="Overdue" value={stats?.overdue || 0} icon={AlertTriangle} color="red" sub="Needs attention" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 lg:col-span-1">
            <h3 className="font-bold text-theme mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Overall Progress</h3>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-primary">{stats?.completionRate || 0}%</p>
              <p className="text-sm text-theme-muted mt-2">Completion rate</p>
              <div className="mt-4 h-2.5 rounded-full bg-theme-surface overflow-hidden border border-theme">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats?.avgProgress || 0}%` }} />
              </div>
              <p className="text-xs text-theme-muted mt-2">Avg progress: {stats?.avgProgress || 0}%</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-theme mb-4">By Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-theme mb-4">By Priority</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {stats?.recentTasks?.length > 0 && (
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="font-bold text-theme">Recent Activity</h3>
            </div>
            <div className="divide-y divide-theme">
              {stats.recentTasks.map((t) => (
                <Link
                  key={t.id}
                  to={`/workspaces/${workspaceId}/tasks/${t.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-theme-surface/50 transition-colors"
                >
                  <span className="text-sm font-medium text-theme">{t.title}</span>
                  <span className="text-xs text-theme-muted px-2 py-1 rounded-full bg-theme-surface border border-theme">{t.status.replace('_', ' ')}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ProjectDashboard
