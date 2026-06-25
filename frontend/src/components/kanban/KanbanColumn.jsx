import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

const columnStyles = {
  TODO: 'border-t-slate-400 bg-slate-50/50',
  IN_PROGRESS: 'border-t-amber-400 bg-amber-50/30',
  DONE: 'border-t-emerald-400 bg-emerald-50/30',
}

function KanbanColumn({ column, tasks, canDragTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      className={`flex flex-col rounded-2xl border border-surface-border border-t-4 ${columnStyles[column.id]} min-h-[400px] transition-colors ${isOver ? 'ring-2 ring-brand-500/30' : ''}`}
    >
      <div className="px-4 py-3 border-b border-surface-border/60">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{column.title}</h3>
          <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full">
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
          <p className="text-xs text-slate-400 text-center py-8">Drop tasks here</p>
        )}
      </div>
    </div>
  )
}

export default memo(KanbanColumn)
