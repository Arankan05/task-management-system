import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Edit, Trash2, Calendar, User, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/ui/Badge'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import TaskFormModal from '../components/tasks/TaskFormModal'
import { fetchTaskById, deleteTask, clearSelectedTask } from '../store/slices/tasksSlice'
import { formatStatus, formatPriority, formatDate } from '../utils/taskHelpers'

function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selected: task, loading, error } = useSelector((state) => state.tasks)
  const { user } = useSelector((state) => state.auth)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    dispatch(fetchTaskById(id))
    return () => dispatch(clearSelectedTask())
  }, [dispatch, id])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await dispatch(deleteTask(id)).unwrap()
      navigate('/tasks')
    } catch (err) {
      setDeleteError(err)
    }
  }

  if (loading) {
    return <Layout><Loader fullPage text="Loading task..." /></Layout>
  }

  if (error || !task) {
    return (
      <Layout>
        <div className="page-container">
          <Alert message={error || 'Task not found'} type="error" />
          <Link to="/tasks" className="btn-secondary mt-4 inline-flex">
            <ArrowLeft size={16} /> Back to Tasks
          </Link>
        </div>
      </Layout>
    )
  }

  const canDelete = user?.role === 'ADMIN'

  return (
    <Layout>
      <div className="page-container max-w-3xl">
        <Link to="/tasks" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Tasks
        </Link>

        {deleteError && <div className="mb-4"><Alert message={deleteError} type="error" onClose={() => setDeleteError('')} /></div>}

        <div className="glass-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">{task.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge label={formatStatus(task.status)} variant={task.status} />
                <Badge label={formatPriority(task.priority)} variant={task.priority} />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditOpen(true)} className="btn-secondary">
                <Edit size={16} /> Edit
              </button>
              {canDelete && (
                <button onClick={handleDelete} className="btn-danger">
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>

          {task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-surface-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                <Calendar size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Due Date</p>
                <p className="text-sm font-medium text-slate-800">{formatDate(task.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Assigned To</p>
                <p className="text-sm font-medium text-slate-800">{task.assignedTo?.name || 'Unassigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <User size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Created By</p>
                <p className="text-sm font-medium text-slate-800">{task.createdBy?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-sm font-medium text-slate-800">{formatDate(task.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <TaskFormModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          task={task}
        />
      </div>
    </Layout>
  )
}

export default TaskDetail
