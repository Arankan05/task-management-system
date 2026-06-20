import { ListTodo, Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import Loader from '../ui/Loader'
import Badge from '../ui/Badge'
import StatCard from '../ui/StatCard'
import { formatStatus, formatPriority, formatDate } from '../../utils/taskHelpers'

const PIE_COLORS = ['#94a3b8', '#f59e0b', '#10b981']

function WorkspaceAnalyzeTab({ workspaceId, stats, loading }) {
  const statusData = stats ? [
    { name: 'To Do', value: stats.todo, fill: PIE_COLORS[0] },
    { name: 'In Progress', value: stats.inProgress, fill: PIE_COLORS[1] },
    { name: 'Done', value: stats.done, fill: PIE_COLORS[2] },
  ] : []

  const priorityData = stats ? [
    { name: 'Low', value: stats.byPriority?.LOW || 0, fill: '#6366f1' },
    { name: 'Medium', value: stats.byPriority?.MEDIUM || 0, fill: '#8b5cf6' },
    { name: 'High', value: stats.byPriority?.HIGH || 0, fill: '#ef4444' },
  ] : []

  if (loading) {
    return <div className="flex justify-center py-16"><Loader /></div>
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Tasks" value={stats?.total || 0} icon={ListTodo} color="brand" sub="All tasks in workspace" />
        <StatCard title="In Progress" value={stats?.inProgress || 0} icon={Clock} color="amber" sub="Currently active" />
        <StatCard title="Completed" value={stats?.done || 0} icon={CheckCircle2} color="emerald" sub={`${stats?.completionRate || 0}% completion rate`} />
        <StatCard title="High Priority" value={stats?.byPriority?.HIGH || 0} icon={AlertTriangle} color="red" sub={`${stats?.overdue || 0} overdue`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="font-bold text-theme mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Overall Progress
          </h3>
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
          <h2 className="text-base font-bold text-theme mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center flex-wrap gap-4 mt-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-theme-muted">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-bold text-theme mb-4">Tasks by Priority</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <h2 className="text-base font-bold text-theme">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-theme-muted border-b border-theme bg-theme-surface/50">
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Status</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Priority</th>
                <th className="px-6 py-3 font-medium hidden lg:table-cell">Due Date</th>
                <th className="px-6 py-3 font-medium hidden lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.recentTasks?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-theme-muted">No tasks yet. Create your first task!</td>
                </tr>
              ) : (
                stats.recentTasks.map((task) => (
                  <tr key={task.id} className="border-b border-theme/60 hover:bg-theme-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/workspaces/${workspaceId}/tasks/${task.id}`} className="font-medium text-theme hover:text-primary transition-colors">
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge label={formatStatus(task.status)} variant={task.status} />
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Badge label={formatPriority(task.priority)} variant={task.priority} />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-theme-muted">{formatDate(task.dueDate)}</td>
                    <td className="px-6 py-4 hidden lg:table-cell text-theme-muted">{formatDate(task.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceAnalyzeTab
