import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Plus, Columns3 } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/ui/PageHeader'
import KanbanColumn from '../components/kanban/KanbanColumn'
import TaskFormModal from '../components/tasks/TaskFormModal'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import WorkspaceTabs from '../components/workspace/WorkspaceTabs'
import { fetchTasks, updateTaskStatus } from '../store/slices/tasksSlice'
import { getSocket } from '../services/socket'
import { KANBAN_COLUMNS } from '../utils/constants'

function WorkspaceKanban() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const { items: tasks, loading, error } = useSelector((s) => s.tasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [statusError, setStatusError] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    dispatch(fetchTasks({ workspaceId }))
    getSocket()?.emit('join:workspace', workspaceId)
  }, [dispatch, workspaceId])

  const columns = useMemo(() =>
    KANBAN_COLUMNS.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.status === col.id),
    })), [tasks])

  const handleDragEnd = async (event) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return
    const task = active.data.current?.task
    if (!task) return
    let newStatus = over.id
    if (!KANBAN_COLUMNS.find((c) => c.id === newStatus)) {
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
      <div className="page-container">
        <PageHeader
          breadcrumb={[
            { label: 'Workspaces', to: '/workspaces' },
            { label: 'Workspace', to: `/workspaces/${workspaceId}` },
            { label: 'Kanban' },
          ]}
          icon={<Columns3 size={24} />}
          iconColor="#7C3AED"
          title="Kanban Board"
          subtitle="Drag and drop tasks to update their status"
          actions={
            <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={16} /> Add Task
            </button>
          }
        />

        {(error || statusError) && <div className="mb-4"><Alert message={error || statusError} type="error" onClose={() => setStatusError('')} /></div>}

        <WorkspaceTabs activeTab="kanban" />

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={(e) => setActiveTask(e.active.data.current?.task)} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
              {columns.map((col) => (
                <KanbanColumn key={col.id} column={col} tasks={col.tasks} />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="glass-card p-4 opacity-90 shadow-elevated">{activeTask.title}</div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <TaskFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} workspaceId={workspaceId} onSuccess={() => dispatch(fetchTasks({ workspaceId }))} />
      </div>
    </Layout>
  )
}

export default WorkspaceKanban
