import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import ProjectTabs from '../components/project/ProjectTabs'
import StatCard from '../components/ui/StatCard'
import Loader from '../components/ui/Loader'
import { fetchProjectStats } from '../store/slices/projectsSlice'
import { getProject } from '../services/projectService'
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

const STATUS_COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#a855f7', '#10b981']

function ProjectAnalytics() {
  const { workspaceId, projectId } = useParams()
  const dispatch = useDispatch()
  const { stats, loading } = useSelector((s) => s.projects)
  const [project, setProject] = useState(null)

  useEffect(() => {
    dispatch(fetchProjectStats(projectId))
    getProject(projectId).then(setProject).catch(() => {})
  }, [dispatch, projectId])

  const statusData = stats ? [
    { name: 'Backlog', value: stats.backlog || 0 },
    { name: 'To Do', value: stats.todo },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Review', value: stats.review || 0 },
    { name: 'Done', value: stats.done },
  ] : []

  const priorityData = stats ? [
    { name: 'Low', value: stats.byPriority.LOW },
    { name: 'Medium', value: stats.byPriority.MEDIUM },
    { name: 'High', value: stats.byPriority.HIGH },
  ] : []

  const progressData = stats ? [
    { name: 'Completion', value: stats.completionRate },
    { name: 'Avg Progress', value: stats.avgProgress },
    { name: 'Assigned', value: stats.assignedCount || 0 },
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
            { label: project?.name || 'Project', to: `/workspaces/${workspaceId}/projects/${projectId}` },
            { label: 'Analytics' },
          ]}
          title="Project Analytics"
          subtitle="Task completion, team performance, and progress reports"
        />

        <ProjectTabs activeTab="analyze" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Tasks" value={stats?.total || 0} icon={ListTodo} color="brand" />
          <StatCard title="In Progress" value={stats?.inProgress || 0} icon={Clock} color="amber" />
          <StatCard title="Completed" value={stats?.done || 0} icon={CheckCircle2} color="emerald" />
          <StatCard title="Overdue" value={stats?.overdue || 0} icon={AlertTriangle} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-theme mb-4">Task completion by status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-theme mb-4">Tasks by priority</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="font-bold text-theme mb-4">Team performance overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-theme-muted mt-4 text-center">
              Completion rate: <strong className="text-primary">{stats?.completionRate || 0}%</strong>
              {' · '}
              Average progress: <strong>{stats?.avgProgress || 0}%</strong>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProjectAnalytics
