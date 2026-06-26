import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Modal from '../ui/Modal'
import Alert from '../ui/Alert'
import { createTask, updateTask } from '../../store/slices/tasksSlice'
import { getWorkspaceMembers } from '../../services/workspaceService'
import { validateTaskForm } from '../../utils/taskHelpers'
import api from '../../services/api'
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../../utils/constants'

const emptyForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  assignedToId: '',
}

function TaskFormModal({ isOpen, onClose, task = null, projectId, workspaceId, onSuccess }) {
  const dispatch = useDispatch()
  const { actionLoading, error } = useSelector((state) => state.tasks)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [localError, setLocalError] = useState('')
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (isOpen) {
      api.get('/users')
        .then(({ data }) => {
          const assignable = (data.data || [])
            .filter((u) => u.role !== 'ADMINISTRATOR')
            .map((u) => ({
              userId: u.id,
              user: u,
            }))
          setMembers(assignable)
        })
        .catch(() => setMembers([]))
    }
  }, [isOpen])

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedToId: task.assignedToId || '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
    setLocalError('')
  }, [task, isOpen])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateTaskForm(form, !!task)
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
        dueDate: form.dueDate || undefined,
        assignedToId: form.assignedToId || undefined,
        progress: form.status === 'DONE' ? 100 : form.status === 'IN_PROGRESS' ? 50 : 0,
      }

    try {
      const message = task ? 'Task updated successfully' : 'Task created successfully'
      if (task) {
        await dispatch(updateTask({ id: task.id, payload })).unwrap()
      } else {
        await dispatch(createTask({ workspaceId, projectId, ...payload })).unwrap()
      }
      onSuccess?.(message)
      onClose()
    } catch (err) {
      setLocalError(err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(localError || error) && (
          <Alert message={localError || error} type="error" onClose={() => setLocalError('')} />
        )}

        <div>
          <label className="label-field">Title *</label>
          <input
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`input-field ${errors.title ? 'border-red-400' : ''}`}
            placeholder="Enter task title"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="label-field">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Describe the task..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Status</label>
            <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="input-field">
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Priority</label>
            <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)} className="input-field">
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={`input-field ${errors.dueDate ? 'border-red-400' : ''}`}
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
          </div>
        </div>

        {workspaceId && members.length > 0 && (
          <div>
            <label className="label-field">Assign to</label>
            <select
              value={form.assignedToId}
              onChange={(e) => handleChange('assignedToId', e.target.value)}
              className="input-field"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user?.name || m.user?.email}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={actionLoading} className="btn-primary">
            {actionLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskFormModal
