import { Calendar, User } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatStatus, formatPriority, formatDate } from '../../utils/taskHelpers'

function TaskCard({ task, onEdit, showActions = true }) {
  return (
    <div className="glass-card p-5 hover:shadow-elevated transition-all duration-200 group h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-theme group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h3>
        {showActions && onEdit && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onEdit(task) }}
            className="text-xs text-theme-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            Edit
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-theme-muted line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge label={formatStatus(task.status)} variant={task.status} />
        <Badge label={formatPriority(task.priority)} variant={task.priority} />
      </div>

      <div className="flex items-center gap-4 text-xs text-theme-muted pt-3 border-t border-theme/60">
        {task.dueDate && (
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-primary/70" />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignedTo && (
          <span className="flex items-center gap-1.5 truncate">
            <User size={12} className="text-primary/70 shrink-0" />
            <span className="truncate">{task.assignedTo.name}</span>
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCard
