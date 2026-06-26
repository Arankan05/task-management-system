import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Layers, Settings as SettingsIcon, ChevronDown, ChevronRight, Menu, X,
  FolderKanban, BarChart3, ListTodo, Columns3, Users, Settings2, LayoutDashboard,
} from 'lucide-react'
import { fetchWorkspaces } from '../store/slices/workspacesSlice'
import { getProjects } from '../services/projectService'
import BrandLogo from './BrandLogo'

const projectLinks = (workspaceId, projectId) => [
  { to: `/workspaces/${workspaceId}/projects/${projectId}`, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: `/workspaces/${workspaceId}/projects/${projectId}/kanban`, label: 'Kanban', icon: Columns3 },
  { to: `/workspaces/${workspaceId}/projects/${projectId}/tasks`, label: 'Tasks', icon: ListTodo },
  { to: `/workspaces/${workspaceId}/projects/${projectId}/team`, label: 'Team', icon: Users },
  { to: `/workspaces/${workspaceId}/projects/${projectId}/analytics`, label: 'Analytics', icon: BarChart3 },
  { to: `/workspaces/${workspaceId}/projects/${projectId}/settings`, label: 'Settings', icon: Settings2 },
]

function Sidebar({ mobileOpen, onClose }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const { items: workspaces } = useSelector((s) => s.workspaces)

  const [expanded, setExpanded] = useState({})
  const [expandedProjects, setExpandedProjects] = useState({})
  const [projectsMap, setProjectsMap] = useState({})
  const [wsDropdownOpen, setWsDropdownOpen] = useState(true)

  useEffect(() => {
    dispatch(fetchWorkspaces())
  }, [dispatch])

  const loadProjects = useCallback(async (workspaceId) => {
    try {
      const projects = await getProjects(workspaceId)
      setProjectsMap((prev) => ({ ...prev, [workspaceId]: projects }))
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

      const projectMatch = location.pathname.match(/\/projects\/([^/]+)/)
      if (projectMatch) {
        setExpandedProjects((prev) => ({ ...prev, [projectMatch[1]]: true }))
      }
    }
  }, [location.pathname, loadProjects])

  const toggleWorkspace = (workspaceId) => {
    const next = !expanded[workspaceId]
    setExpanded((prev) => ({ ...prev, [workspaceId]: next }))
    if (next) loadProjects(workspaceId)
  }

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  const isGlobalActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`)

  const isProjectLinkActive = (link) => {
    if (link.end) return location.pathname === link.to
    return location.pathname === link.to || location.pathname.startsWith(`${link.to}/`)
  }

  const navLinkClass = (active) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-cyan-500/80 to-emerald-500/80 text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
        : 'text-theme-muted hover:text-theme hover:bg-white/5'
    }`

  const subLinkClass = (active) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-gradient-to-r from-cyan-500/80 to-emerald-500/80 text-white shadow-sm'
        : 'text-theme-muted hover:text-theme hover:bg-white/5'
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
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-theme-muted uppercase tracking-wider hover:text-theme"
        >
          <span>Your Workspaces</span>
          {wsDropdownOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {wsDropdownOpen && workspaces.length === 0 && (
        <p className="px-4 py-2 text-xs text-theme-muted">No workspaces yet</p>
      )}

      {wsDropdownOpen && workspaces.map((ws) => {
        const isOpen = expanded[ws.id]
        const projects = projectsMap[ws.id] || []
        const wsBase = `/workspaces/${ws.id}`
        const wsOverviewActive = location.pathname === wsBase

        return (
          <div key={ws.id} className="mb-0.5">
            <button
              type="button"
              onClick={() => toggleWorkspace(ws.id)}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname.includes(wsBase) ? 'text-theme bg-white/5 shadow-sm border border-white/5' : 'text-theme-muted hover:text-theme hover:bg-white/5'
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
              <div className="ml-3 mt-1 pl-3 border-l border-white/5 space-y-0.5">
                <Link
                  to={wsBase}
                  onClick={onClose}
                  className={subLinkClass(wsOverviewActive)}
                >
                  <LayoutDashboard size={14} className="shrink-0" />
                  Overview
                </Link>

                {projects.map((project) => {
                  const projectOpen = expandedProjects[project.id]
                  const projectBase = `${wsBase}/projects/${project.id}`
                  const inProject = location.pathname.startsWith(projectBase)

                  return (
                    <div key={project.id}>
                      <button
                        type="button"
                        onClick={() => toggleProject(project.id)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          inProject ? 'text-theme bg-white/5' : 'text-theme-muted hover:text-theme hover:bg-white/5'
                        }`}
                      >
                        {projectOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <FolderKanban size={14} className="shrink-0" />
                        <span className="truncate text-left">{project.name}</span>
                      </button>

                      {projectOpen && (
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          {projectLinks(ws.id, project.id).map((link) => (
                            <Link
                              key={link.label}
                              to={link.to}
                              onClick={onClose}
                              className={subLinkClass(isProjectLinkActive(link))}
                            >
                              <link.icon size={13} className="shrink-0" />
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
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
    <div className="shrink-0 p-4 border-t border-white/5">
      <Link to="/settings" onClick={onClose} className={navLinkClass(isGlobalActive('/settings'))}>
        <SettingsIcon size={18} />
        Settings
      </Link>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-theme-surface/20 backdrop-blur-lg border border-white/5 rounded-3xl shadow-xl sticky top-28 self-start shrink-0 h-[calc(100vh-9.5rem)] flex-col transition-all duration-300">
        <div className="px-6 py-5 border-b border-white/5 shrink-0">
          <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">Navigation</p>
        </div>
        <NavMenu />
        <SettingsLink />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-4 top-4 bottom-4 w-72 bg-theme-surface/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-slide-up flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <BrandLogo size="sm" lightText showName />
              <button type="button" onClick={onClose} className="text-theme-muted hover:text-theme"><X size={20} /></button>
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
