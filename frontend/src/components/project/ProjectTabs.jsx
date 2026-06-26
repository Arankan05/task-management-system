import { useNavigate, useParams } from 'react-router-dom'
import { ListTodo, Columns3, Users, BarChart3, Settings2 } from 'lucide-react'

const TABS = [
  { id: 'analyze', label: 'Analyze', icon: BarChart3, path: '' },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, path: 'tasks' },
  { id: 'kanban', label: 'Kanban', icon: Columns3, path: 'kanban' },
  { id: 'team', label: 'Team', icon: Users, path: 'team' },
  { id: 'settings', label: 'Settings', icon: Settings2, path: 'settings' },
]

function ProjectTabs({ activeTab }) {
  const { workspaceId, projectId } = useParams()
  const navigate = useNavigate()
  const base = `/workspaces/${workspaceId}/projects/${projectId}`

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-theme-surface border border-theme mb-6 w-fit flex-wrap">
      {TABS.map(({ id, label, icon: Icon, path }) => (
        <button
          key={id}
          type="button"
          onClick={() => navigate(path ? `${base}/${path}` : base)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === id
              ? 'bg-primary text-white shadow-sm'
              : 'text-theme-muted hover:text-theme'
          }`}
        >
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
  )
}

export default ProjectTabs
