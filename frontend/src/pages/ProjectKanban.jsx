import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { Plus, Columns3 } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import PageTransition from '../components/ui/PageTransition'
import KanbanBoardSkeleton from '../components/ui/KanbanBoardSkeleton'
import KanbanColumn from '../components/kanban/KanbanColumn'
import TaskFormModal from '../components/tasks/TaskFormModal'
import Alert from '../components/ui/Alert'
import ProjectTabs from '../components/project/ProjectTabs'
import { fetchTasks, updateTaskStatus, setActiveProjectId } from '../store/slices/tasksSlice'
import { getSocket } from '../services/socket'
import { getMyProjectRole, getProject } from '../services/projectService'
import { canCreateTask, canUpdateTaskStatus } from '../utils/permissions'
import { KANBAN_COLUMNS } from '../utils/constants'

const BOARD_COLUMNS = KANBAN_COLUMNS.filter((c) =>
  ['TODO', 'IN_PROGRESS', 'DONE'].includes(c.id)
)

function ProjectKanban() {
  const { workspaceId, projectId } = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { items: tasks, loading, error } = useSelector((s) => s.tasks)
  const { active: activeWorkspace, items: workspaces } = useSelector((s) => s.workspaces)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [success, setSuccess] = useState('')
  const [projectRole, setProjectRole] = useState(null)
  const [project, setProject] = useState(null)

  const base = `/workspaces/${workspaceId}/projects/${projectId}`
  const role = projectRole?.role
  const canCreate = role ? canCreateTask(role) : false

  const workspaceName =
    (activeWorkspace?.id === workspaceId ? activeWorkspace.name : null)
    || workspaces.find((w) => w.id === workspaceId)?.name
    || 'Workspace'

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    dispatch(setActiveProjectId(projectId))
    dispatch(fetchTasks({ projectId }))
    getMyProjectRole(projectId).then(setProjectRole).catch(() => {})
    getProject(projectId).then(setProject).catch(() => {})
    getSocket()?.emit('join:project', projectId)
  }, [dispatch, projectId])

  const columns = useMemo(() =>
    BOARD_COLUMNS.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.status === col.id),
    })), [tasks])

  const canDragTask = (task) => canUpdateTaskStatus(role, task, user?.id)

  const handleDragEnd = async (event) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return
    const task = active.data.current?.task
    if (!task) return
    if (!canUpdateTaskStatus(role, task, user?.id)) {
      setStatusError('You can only update status on tasks assigned to you')
      return
    }
    let newStatus = over.id
    if (!BOARD_COLUMNS.find((c) => c.id === newStatus)) {
      newStatus = over.data.current?.task?.status
    }
    if (!newStatus || task.status === newStatus) return
    try {
      await dispatch(updateTaskStatus({ id: task.id, status: newStatus })).unwrap()
    } catch (err) {
      setStatusError(err)
    }
  }

  return (
    <Layout>
      <PageTransition className="page-container">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: workspaceName, to: `/workspaces/${workspaceId}` },
            { label: project?.name || 'Project', to: base },
            { label: 'Kanban' },
          ]}
          icon={<Columns3 size={24} />}
          iconColor="#7C3AED"
          title="Kanban Board"
          subtitle={
            canCreate
              ? 'Drag and drop tasks to update their status'
              : 'View and update status on tasks assigned to you'
          }
          actions={
            canCreate ? (
              <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus size={16} /> Add Task
              </button>
            ) : null
          }
        />

        {(error || statusError) && (
          <div className="mb-4">
            <Alert message={error || statusError} type="error" onClose={() => setStatusError('')} />
          </div>
        )}
        {success && (
          <div className="mb-4">
            <Alert message={success} type="success" onClose={() => setSuccess('')} />
          </div>
        )}

        <ProjectTabs activeTab="kanban" />

        {loading ? (
          <KanbanBoardSkeleton />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => setActiveTask(e.active.data.current?.task)}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={col.tasks}
                  canDragTask={canDragTask}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="glass-card p-4 shadow-elevated ring-2 ring-primary/20 scale-105">
                  {activeTask.title}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {canCreate && (
          <TaskFormModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            projectId={projectId}
            onSuccess={(message) => {
              if (message) setSuccess(message)
              dispatch(fetchTasks({ projectId }))
            }}
          />
        )}
      </PageTransition>
    </Layout>
  )
}

export default ProjectKanban
