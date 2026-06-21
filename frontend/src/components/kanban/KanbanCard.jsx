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
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-3 transition-shadow ${draggable ? 'cursor-grab active:cursor-grabbing hover:shadow-elevated' : 'cursor-default'}`}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      <div className="flex items-start gap-2 mb-2">
        <GripVertical size={14} className="text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</p>
      </div>
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2 ml-5">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 ml-5 mb-2">
        <Badge label={formatPriority(task.priority)} variant={task.priority} />
      </div>
      <div className="flex items-center gap-3 ml-5 text-xs text-slate-400">
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

export default KanbanCard
