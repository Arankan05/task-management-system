import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

const columnStyles = {
  BACKLOG: 'border-t-slate-500/60 bg-slate-500/5',
  TODO: 'border-t-blue-500/60 bg-blue-500/5',
  IN_PROGRESS: 'border-t-amber-500/60 bg-amber-500/5',
  REVIEW: 'border-t-purple-500/60 bg-purple-500/5',
  DONE: 'border-t-emerald-500/60 bg-emerald-500/5',
}

function KanbanColumn({ column, tasks, canDragTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      className={`flex flex-col rounded-2xl border border-white/5 border-t-4 backdrop-blur-sm ${columnStyles[column.id]} min-h-[400px] transition-all duration-200 ${isOver ? 'ring-2 ring-primary/45 bg-primary/10' : ''}`}
    >
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-theme">{column.title}</h3>
          <span className="text-xs font-semibold text-theme-muted bg-theme-surface/50 border border-white/5 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} draggable={canDragTask ? canDragTask(task) : true} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="text-xs text-theme-muted text-center py-8">Drop tasks here</p>
        )}
      </div>
    </div>
  )
}

export default memo(KanbanColumn)
