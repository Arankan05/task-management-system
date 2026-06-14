import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Plus, ListTodo } from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import KanbanColumn from '../components/kanban/KanbanColumn'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskFormModal from '../components/tasks/TaskFormModal'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import { fetchTasks, updateTaskStatus } from '../store/slices/tasksSlice'
import { filterTasks } from '../utils/taskHelpers'
import { KANBAN_COLUMNS } from '../utils/constants'

function Kanban() {
  const dispatch = useDispatch()
  const { items: tasks, loading, error } = useSelector((state) => state.tasks)
  const filters = useSelector((state) => state.filters)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [statusError, setStatusError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters])

  const columns = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      ...col,
      tasks: filteredTasks.filter((t) => t.status === col.id),
    }))
  }, [filteredTasks])

  const assignees = useMemo(() => {
    const map = new Map()
    tasks.forEach((t) => {
      if (t.assignedTo) map.set(t.assignedTo.id, t.assignedTo)
    })
    return Array.from(map.values())
  }, [tasks])

  const handleDragStart = (event) => {
    const task = event.active.data.current?.task
    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const task = active.data.current?.task
    if (!task) return

    let newStatus = over.id
    if (!KANBAN_COLUMNS.find((c) => c.id === newStatus)) {
      const overTask = over.data.current?.task
      if (overTask) newStatus = overTask.status
    }

    if (task.status === newStatus) return

    try {
      await dispatch(updateTaskStatus({ id: task.id, status: newStatus })).unwrap()
    } catch (err) {
      setStatusError(err)
    }
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Kanban Board</h1>
            <p className="text-slate-500 mt-1">Drag tasks to update their status</p>
          </div>
          <div className="flex gap-2">
            <Link to="/tasks" className="btn-secondary">
              <ListTodo size={16} /> List View
            </Link>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {statusError && <div className="mb-4"><Alert message={statusError} type="error" onClose={() => setStatusError('')} /></div>}
        {error && <div className="mb-4"><Alert message={error} type="error" /></div>}

        <TaskFilters assignees={assignees} />

        {loading && tasks.length === 0 ? (
          <Loader fullPage text="Loading board..." />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {columns.map((col) => (
                <KanbanColumn key={col.id} column={col} tasks={col.tasks} />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="glass-card p-3 shadow-elevated rotate-2 opacity-90">
                  <p className="text-sm font-semibold">{activeTask.title}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <TaskFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </Layout>
  )
}

export default Kanban
