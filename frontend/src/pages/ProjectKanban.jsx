import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { Plus, ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import KanbanColumn from '../components/kanban/KanbanColumn'
import TaskFormModal from '../components/tasks/TaskFormModal'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import { fetchTasks, updateTaskStatus, setActiveProjectId } from '../store/slices/tasksSlice'
import { getSocket } from '../services/socket'
import { KANBAN_COLUMNS } from '../utils/constants'

function ProjectKanban() {
  const { workspaceId, projectId } = useParams()
  const dispatch = useDispatch()
  const { items: tasks, loading, error } = useSelector((s) => s.tasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [statusError, setStatusError] = useState('')

  const base = `/workspaces/${workspaceId}/projects/${projectId}`

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    dispatch(setActiveProjectId(projectId))
    dispatch(fetchTasks({ projectId }))
    const socket = getSocket()
    socket?.emit('join:project', projectId)
  }, [dispatch, projectId])

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
        <Link to={base} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft size={14} /> Project dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-theme">Kanban Board</h1>
          <div className="flex gap-2">
            <Link to={`${base}/tasks`} className="btn-secondary">List view</Link>
            <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> Add Task</button>
          </div>
        </div>

        {(error || statusError) && <div className="mb-4"><Alert message={error || statusError} type="error" onClose={() => setStatusError('')} /></div>}

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={(e) => setActiveTask(e.active.data.current?.task)} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
              {columns.map((col) => (
                <KanbanColumn key={col.id} column={col} tasks={col.tasks} />
              ))}
            </div>
            <DragOverlay>{activeTask ? <div className="glass-card p-4 opacity-90 shadow-elevated">{activeTask.title}</div> : null}</DragOverlay>
          </DndContext>
        )}

        <TaskFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} projectId={projectId} />
      </div>
    </Layout>
  )
}

export default ProjectKanban
