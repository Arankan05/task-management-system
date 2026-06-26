import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import { ListTodo, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import Layout from '../components/Layout'
import Loader from '../components/ui/Loader'
import Badge from '../components/ui/Badge'
import { fetchTasks } from '../store/slices/tasksSlice'
import { getTaskStats, getChartData, getPriorityChartData, formatStatus, formatPriority, formatDate } from '../utils/taskHelpers'
import { APP_NAME } from '../components/BrandLogo'
import { useSocket } from '../context/SocketContext'

function StatCard({ title, value, icon: Icon, color, sub }) {
  const colors = {
    brand: 'from-brand-500 to-brand-700',
    amber: 'from-amber-400 to-orange-500',
    emerald: 'from-emerald-400 to-green-600',
    red: 'from-red-400 to-rose-600',
  }

  return (
    <div className="glass-card p-5 hover:shadow-elevated transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const dispatch = useDispatch()
  const socket = useSocket()

  const { items: tasks, loading } = useSelector((state) => state.tasks)
  const user = useSelector((state) => state.auth?.user)

  const [notifications, setNotifications] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUser, setTypingUser] = useState("")

  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  useEffect(() => {
    if (!socket) return

    // Join the default workspace room
    socket.emit("join-room", "project-room")

    const handleRealtimeTask = (messagePrefix) => (payload) => {
      const task = payload?.task || payload
      if (!task) return
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `🔔 ${messagePrefix}: ${task.title || task.id || 'Task change'}`,
        },
        ...prev,
      ])
    }

    const handleRealtimeDelete = (payload) => {
      const taskId = payload?.taskId || payload?.id || payload
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `🗑️ Task deleted: ${taskId}`,
        },
        ...prev,
      ])
    }

    // Register event listeners
    socket.on("task-created", handleRealtimeTask("New Task"))
    socket.on("task:created", handleRealtimeTask("New Task"))

    socket.on("task-updated", handleRealtimeTask("Task updated"))
    socket.on("task:updated", handleRealtimeTask("Task updated"))

    socket.on("task-deleted", handleRealtimeDelete)
    socket.on("task:deleted", handleRealtimeDelete)

    socket.on("online-users", (users) => {
      setOnlineUsers(users)
    })

    socket.on("user-typing", (username) => {
      setTypingUser(`${username} is typing...`)
      setTimeout(() => {
        setTypingUser("")
      }, 2000)
    })

    return () => {
      socket.off("task-created")
      socket.off("task:created")
      socket.off("task-updated")
      socket.off("task:updated")
      socket.off("task-deleted")
      socket.off("task:deleted")
      socket.off("online-users")
      socket.off("user-typing")
    }
  }, [socket])

  const stats = useMemo(() => getTaskStats(tasks), [tasks])
  const statusChart = useMemo(() => getChartData(tasks), [tasks])
  const priorityChart = useMemo(() => getPriorityChartData(tasks), [tasks])
  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 8),
    [tasks]
  )

  if (loading && tasks.length === 0) {
    return <Layout><Loader fullPage text="Loading dashboard..." /></Layout>
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your {APP_NAME} workspace</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Tasks" value={stats.total} icon={ListTodo} color="brand" sub="All tasks in system" />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="amber" sub="Currently active" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" sub={`${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate`} />
          <StatCard title="High Priority" value={stats.highPriority} icon={AlertTriangle} color="red" sub="Needs attention" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Tasks by Status</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {statusChart.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusChart.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                  {s.name}: {s.value}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Tasks by Priority</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityChart}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityChart.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Collaboration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Online Users */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Active Collaborators</h2>
              <p className="text-xs text-slate-500 mb-4">Users currently connected to the workspace</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg border border-emerald-100 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">{onlineUsers.length} User(s) Online</span>
            </div>
          </div>

          {/* Typing indicator */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-2">Typing Broadcast</h2>
              <p className="text-xs text-slate-500 mb-4">Type to broadcast a typing indicator to others</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Type something to broadcast..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-300"
                onChange={() => {
                  const username = user?.name || "Someone"
                  socket?.emit("typing", username)
                }}
              />
              <div className="h-6 mt-2">
                {typingUser && (
                  <p className="text-xs text-brand-600 font-medium animate-pulse">
                    💬 {typingUser}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notifications feed */}
          <div className="glass-card p-6 flex flex-col">
            <h2 className="text-base font-bold text-slate-900 mb-2">Live Activity Feed</h2>
            <p className="text-xs text-slate-500 mb-3">Real-time task modifications log</p>
            <div className="flex-1 max-h-36 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity detected.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="bg-slate-50 text-slate-700 text-xs p-2.5 rounded-lg border border-slate-100 shadow-sm flex items-start gap-1.5 animate-fadeIn">
                    <span>{n.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks Card */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <Link to="/tasks" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-surface-border bg-slate-50/50">
                  <th className="px-6 py-3 font-medium">Task</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">Status</th>
                  <th className="px-6 py-3 font-medium hidden md:table-cell">Priority</th>
                  <th className="px-6 py-3 font-medium hidden lg:table-cell">Due Date</th>
                  <th className="px-6 py-3 font-medium hidden lg:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No tasks yet. Create your first task!</td>
                  </tr>
                ) : (
                  recentTasks.map((task) => (
                    <tr key={task.id} className="border-b border-surface-border/60 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/tasks/${task.id}`} className="font-medium text-slate-800 hover:text-brand-600">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <Badge label={formatStatus(task.status)} variant={task.status} />
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <Badge label={formatPriority(task.priority)} variant={task.priority} />
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-slate-500">{formatDate(task.dueDate)}</td>
                      <td className="px-6 py-4 hidden lg:table-cell text-slate-400">{formatDate(task.updatedAt || task.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
