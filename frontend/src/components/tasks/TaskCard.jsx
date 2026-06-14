import { Link } from 'react-router-dom'
import { Calendar, User } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatStatus, formatPriority, formatDate } from '../../utils/taskHelpers'

function TaskCard({ task, onEdit, showActions = true }) {
  return (
    <div className="glass-card p-4 hover:shadow-elevated transition-shadow duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link to={`/tasks/${task.id}`} className="font-semibold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2">
          {task.title}
        </Link>
        {showActions && onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            Edit
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge label={formatStatus(task.status)} variant={task.status} />
        <Badge label={formatPriority(task.priority)} variant={task.priority} />
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignedTo && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {task.assignedTo.name}
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCard
