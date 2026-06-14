import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Plus, LayoutGrid } from 'lucide-react'
import Layout from '../components/Layout'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskCard from '../components/tasks/TaskCard'
import TaskFormModal from '../components/tasks/TaskFormModal'
import Loader from '../components/ui/Loader'
import EmptyState from '../components/ui/EmptyState'
import Alert from '../components/ui/Alert'
import { fetchTasks } from '../store/slices/tasksSlice'
import { filterTasks } from '../utils/taskHelpers'

function Tasks() {
  const dispatch = useDispatch()
  const { items: tasks, loading, error } = useSelector((state) => state.tasks)
  const filters = useSelector((state) => state.filters)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)

  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters])

  const assignees = useMemo(() => {
    const map = new Map()
    tasks.forEach((t) => {
      if (t.assignedTo) map.set(t.assignedTo.id, t.assignedTo)
      if (t.createdBy) map.set(t.createdBy.id, t.createdBy)
    })
    return Array.from(map.values())
  }, [tasks])

  const handleEdit = (task) => {
    setEditTask(task)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditTask(null)
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tasks</h1>
            <p className="text-slate-500 mt-1">{filteredTasks.length} of {tasks.length} tasks</p>
          </div>
          <div className="flex gap-2">
            <Link to="/kanban" className="btn-secondary">
              <LayoutGrid size={16} />
              Kanban
            </Link>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>

        {error && <div className="mb-4"><Alert message={error} type="error" /></div>}

        <TaskFilters assignees={assignees} />

        {loading && tasks.length === 0 ? (
          <Loader fullPage text="Loading tasks..." />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={tasks.length === 0 ? 'Create your first task to get started.' : 'Try adjusting your filters.'}
            action={
              tasks.length === 0 && (
                <button onClick={() => setModalOpen(true)} className="btn-primary">
                  <Plus size={16} /> Create Task
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        )}

        <TaskFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          task={editTask}
        />
      </div>
    </Layout>
  )
}

export default Tasks
