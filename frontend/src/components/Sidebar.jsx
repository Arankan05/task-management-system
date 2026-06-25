import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Layers, Settings as SettingsIcon, ChevronDown, ChevronRight, Menu, X,
  FolderKanban, BarChart3, ListTodo, Columns3, Users, Settings2,
} from 'lucide-react'
import { fetchWorkspaces } from '../store/slices/workspacesSlice'
import { getProjects } from '../services/projectService'
import BrandLogo from './BrandLogo'

const HIDDEN_PROJECT = '__workspace_default__'

const workspaceLinks = (workspaceId) => [
  { to: `/workspaces/${workspaceId}`, state: { tab: 'analyze' }, label: 'Analyze', icon: BarChart3, tab: 'analyze' },
  { to: `/workspaces/${workspaceId}`, state: { tab: 'tasks' }, label: 'Tasks', icon: ListTodo, tab: 'tasks' },
  { to: `/workspaces/${workspaceId}/kanban`, label: 'Kanban', icon: Columns3, tab: 'kanban' },
  { to: `/workspaces/${workspaceId}`, state: { tab: 'team' }, label: 'Team', icon: Users, tab: 'team' },
  { to: `/workspaces/${workspaceId}/settings`, label: 'Settings', icon: Settings2, tab: 'settings' },
]

function Sidebar({ mobileOpen, onClose }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const { items: workspaces } = useSelector((s) => s.workspaces)

  const [expanded, setExpanded] = useState({})
  const [projectsMap, setProjectsMap] = useState({})
  const [wsDropdownOpen, setWsDropdownOpen] = useState(true)

  useEffect(() => {
    dispatch(fetchWorkspaces())
  }, [dispatch])

  const loadProjects = useCallback(async (workspaceId) => {
    try {
      const projects = await getProjects(workspaceId)
      setProjectsMap((prev) => ({
        ...prev,
        [workspaceId]: projects.filter((p) => p.name !== HIDDEN_PROJECT),
      }))
    } catch {
      setProjectsMap((prev) => ({ ...prev, [workspaceId]: [] }))
    }
  }, [])

  useEffect(() => {
    const match = location.pathname.match(/\/workspaces\/([^/]+)/)
    if (match) {
      const wsId = match[1]
      setExpanded((prev) => ({ ...prev, [wsId]: true }))
      loadProjects(wsId)
    }
  }, [location.pathname, loadProjects])

  const toggleWorkspace = (workspaceId) => {
    const next = !expanded[workspaceId]
    setExpanded((prev) => ({ ...prev, [workspaceId]: next }))
    if (next) loadProjects(workspaceId)
  }

  const isGlobalActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`)

  const isLinkActive = (wsId, link) => {
    const base = `/workspaces/${wsId}`
    if (link.tab === 'settings') return location.pathname === `${base}/settings`
    if (link.tab === 'kanban') return location.pathname === `${base}/kanban`
    if (location.pathname.startsWith(`${base}/tasks/`)) return link.tab === 'tasks'
    if (location.pathname === base) {
      const currentTab = location.state?.tab || 'tasks'
      return link.tab === currentTab
    }
    return false
  }

  const navLinkClass = (active) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`

  const subLinkClass = (active) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-brand-600 text-white'
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`

  const NavMenu = () => (
    <nav className="flex flex-col gap-1 p-4 flex-1 min-h-0 overflow-y-auto">
      <Link
        to="/workspaces"
        onClick={onClose}
        className={navLinkClass(location.pathname === '/workspaces')}
      >
        <Layers size={18} />
        All Workspaces
      </Link>

      <div className="mt-4 mb-1">
        <button
          type="button"
          onClick={() => setWsDropdownOpen((o) => !o)}
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300"
        >
          <span>Your Workspaces</span>
          {wsDropdownOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {wsDropdownOpen && workspaces.length === 0 && (
        <p className="px-4 py-2 text-xs text-slate-500">No workspaces yet</p>
      )}

      {wsDropdownOpen && workspaces.map((ws) => {
        const isOpen = expanded[ws.id]
        const projects = projectsMap[ws.id] || []
        const wsActive = location.pathname.includes(`/workspaces/${ws.id}`)

        return (
          <div key={ws.id} className="mb-0.5">
            <button
              type="button"
              onClick={() => toggleWorkspace(ws.id)}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                wsActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
              <span
                className="w-6 h-6 rounded-md text-white text-xs font-bold flex items-center justify-center shrink-0"
                style={{ background: ws.color || '#7C3AED' }}
              >
                {ws.name?.charAt(0)?.toUpperCase() || 'W'}
              </span>
              <span className="truncate text-left">{ws.name}</span>
            </button>

            {isOpen && (
              <div className="ml-3 mt-1 pl-3 border-l border-white/10 space-y-0.5">
                {projects.length > 0 && (
                  <>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Projects</p>
                    {projects.map((project) => {
                      const projectPath = `/workspaces/${ws.id}/projects/${project.id}`
                      const projectActive = location.pathname === projectPath
                      return (
                        <Link
                          key={project.id}
                          to={projectPath}
                          onClick={onClose}
                          className={subLinkClass(projectActive)}
                        >
                          <FolderKanban size={14} className="shrink-0" />
                          <span className="truncate">{project.name}</span>
                        </Link>
                      )
                    })}
                  </>
                )}

                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Workspace</p>
                {workspaceLinks(ws.id).map(({ to, state, label, icon: Icon, tab }) => {
                  const active = isLinkActive(ws.id, { tab })
                  return (
                    <Link
                      key={label}
                      to={to}
                      state={state}
                      onClick={onClose}
                      className={subLinkClass(active)}
                    >
                      <Icon size={14} className="shrink-0" />
                      {label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )

  const SettingsLink = () => (
    <div className="shrink-0 p-4 border-t border-white/10">
      <Link
        to="/settings"
        onClick={onClose}
        className={navLinkClass(isGlobalActive('/settings'))}
      >
        <SettingsIcon size={18} />
        Settings
      </Link>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-brand-900 sticky top-16 self-start h-[calc(100vh-4rem)] flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10 shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
        </div>
        <NavMenu />
        <SettingsLink />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-brand-900 shadow-elevated animate-slide-up flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <BrandLogo size="sm" lightText showName />
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <NavMenu />
            <SettingsLink />
          </aside>
        </div>
      )}
    </>
  )
}

export function SidebarToggle({ onClick }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Open menu">
      <Menu size={22} />
    </button>
  )
}

export default Sidebar
