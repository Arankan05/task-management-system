import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { ListTodo, Columns3, Users, BarChart3, Settings2 } from 'lucide-react'

const TABS = [
  { id: 'analyze', label: 'Analyze', icon: BarChart3 },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'kanban', label: 'Kanban', icon: Columns3 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings2, path: 'settings' },
]

function WorkspaceTabs({ activeTab, onTabChange }) {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (id) => {
    if (id === 'settings') {
      navigate(`/workspaces/${workspaceId}/settings`)
      return
    }
    if (id === 'kanban') {
      navigate(`/workspaces/${workspaceId}/kanban`)
      return
    }
    if (location.pathname.endsWith('/kanban') || location.pathname.endsWith('/settings')) {
      navigate(`/workspaces/${workspaceId}`, { state: { tab: id } })
      return
    }
    onTabChange?.(id)
  }

  const isActive = (id) => {
    if (id === 'settings') return location.pathname.endsWith('/settings')
    if (id === 'kanban') return location.pathname.endsWith('/kanban')
    if (location.pathname.endsWith('/kanban') || location.pathname.endsWith('/settings')) return false
    return activeTab === id
  }

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-theme-surface border border-theme mb-6 w-fit flex-wrap">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(id)
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

export default WorkspaceTabs
