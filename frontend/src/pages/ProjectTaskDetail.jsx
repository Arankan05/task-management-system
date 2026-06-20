import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Edit, Trash2, Calendar, User, MessageSquare, Paperclip, Tag } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/ui/Badge'
import Loader from '../components/ui/Loader'
import Alert from '../components/ui/Alert'
import TaskFormModal from '../components/tasks/TaskFormModal'
import { fetchTaskById, deleteTask, clearSelectedTask, addComment, updateTask } from '../store/slices/tasksSlice'
import { addAttachment } from '../services/taskService'
import { formatStatus, formatPriority, formatDate } from '../utils/taskHelpers'

function ProjectTaskDetail() {
  const { workspaceId, projectId, taskId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selected: task, loading, error } = useSelector((s) => s.tasks)
  const [editOpen, setEditOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  const base = `/workspaces/${workspaceId}/projects/${projectId}`

  useEffect(() => {
    dispatch(fetchTaskById(taskId))
    return () => dispatch(clearSelectedTask())
  }, [dispatch, taskId])

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    try {
      await dispatch(deleteTask(taskId)).unwrap()
      navigate(`${base}/tasks`)
    } catch (err) {
      setLocalError(err)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentLoading(true)
    try {
      await dispatch(addComment({ taskId, content: comment.trim() })).unwrap()
      setComment('')
      dispatch(fetchTaskById(taskId))
    } catch (err) {
      setLocalError(err)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleProgress = async (progress) => {
    await dispatch(updateTask({ id: taskId, payload: { progress: Number(progress) } }))
  }

  const handleAttachment = async (e) => {
    const file = e.target.files?.[0]
    if (!file || file.size > 2 * 1024 * 1024) return setLocalError('File must be under 2MB')
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await addAttachment(taskId, { fileName: file.name, fileUrl: reader.result, fileType: file.type })
        dispatch(fetchTaskById(taskId))
      } catch {
        setLocalError('Failed to upload attachment')
      }
    }
    reader.readAsDataURL(file)
  }

  if (loading) return <Layout><Loader fullPage text="Loading task..." /></Layout>
  if (error || !task) {
    return (
      <Layout>
        <div className="page-container">
          <Alert message={error || 'Task not found'} type="error" />
          <Link to={`${base}/tasks`} className="btn-secondary mt-4 inline-flex"><ArrowLeft size={16} /> Back</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page-container max-w-3xl">
        <Link to={`${base}/tasks`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft size={16} /> Back to tasks
        </Link>

        {localError && <div className="mb-4"><Alert message={localError} type="error" onClose={() => setLocalError('')} /></div>}

        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-theme mb-3">{task.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge label={formatStatus(task.status)} variant={task.status} />
                <Badge label={formatPriority(task.priority)} variant={task.priority} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditOpen(true)} className="btn-secondary"><Edit size={16} /> Edit</button>
              <button onClick={handleDelete} className="btn-danger"><Trash2 size={16} /> Delete</button>
            </div>
          </div>

          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-theme mb-2">Description</h3>
              <p className="text-theme-muted leading-relaxed">{task.description}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-theme mb-2 block">Progress: {task.progress}%</label>
            <input type="range" min="0" max="100" value={task.progress} onChange={(e) => handleProgress(e.target.value)} className="w-full accent-primary" />
          </div>

          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.labels.map(({ label }) => (
                <span key={label.id} className="text-xs px-2 py-1 rounded-full text-white" style={{ background: label.color }}>
                  <Tag size={10} className="inline mr-1" />{label.name}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-theme">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-primary" />
              <div><p className="text-xs text-theme-muted">Due Date</p><p className="text-sm font-medium text-theme">{formatDate(task.dueDate)}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <User size={16} className="text-primary" />
              <div><p className="text-xs text-theme-muted">Assignee</p><p className="text-sm font-medium text-theme">{task.assignedTo?.name || 'Unassigned'}</p></div>
            </div>
          </div>

          <div className="pt-4 border-t border-theme">
            <h3 className="text-sm font-semibold text-theme mb-3 flex items-center gap-2"><Paperclip size={16} /> Attachments</h3>
            <input type="file" onChange={handleAttachment} className="text-sm mb-3" />
            <div className="space-y-2">
              {(task.attachments || []).map((a) => (
                <a key={a.id} href={a.fileUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline">{a.fileName}</a>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-theme">
            <h3 className="text-sm font-semibold text-theme mb-3 flex items-center gap-2"><MessageSquare size={16} /> Comments</h3>
            <div className="space-y-3 mb-4">
              {(task.comments || []).map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-theme-surface">
                  <p className="text-xs font-semibold text-theme">{c.user?.name}</p>
                  <p className="text-sm text-theme-muted mt-1">{c.content}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input className="input-field flex-1" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <button type="submit" disabled={commentLoading} className="btn-primary">Post</button>
            </form>
          </div>
        </div>

        <TaskFormModal isOpen={editOpen} onClose={() => setEditOpen(false)} task={task} projectId={projectId} onSuccess={() => dispatch(fetchTaskById(taskId))} />
      </div>
    </Layout>
  )
}

export default ProjectTaskDetail
