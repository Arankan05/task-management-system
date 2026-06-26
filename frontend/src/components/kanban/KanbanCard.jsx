import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatPriority, formatDate } from '../../utils/taskHelpers'

function KanbanCard({ task, draggable = true }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
    disabled: !draggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-3 transition-all duration-300 ${
        draggable
          ? `cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-2xl ring-2 ring-primary/30 border-primary/40 opacity-70 scale-102' : ''}`
          : 'cursor-default'
      }`}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      <div className="flex items-start gap-2 mb-2">
        <GripVertical size={14} className="text-theme-muted/40 mt-0.5 shrink-0" />
        <p className="text-sm font-semibold text-theme leading-snug">{task.title}</p>
      </div>
      {task.description && (
        <p className="text-xs text-theme-muted line-clamp-2 mb-2 ml-5">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 ml-5 mb-2">
        <Badge label={formatPriority(task.priority)} variant={task.priority} />
      </div>
      <div className="flex items-center gap-3 ml-5 text-xs text-theme-muted">
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignedTo && <span>{task.assignedTo.name}</span>}
      </div>
    </div>
  )
}

export default memo(KanbanCard)
