function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-surface-border border-t-4 border-t-slate-300 min-h-[400px] animate-pulse">
      <div className="px-4 py-3 border-b border-surface-border/60">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      </div>
      <div className="flex-1 p-3 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-3 space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

function KanbanBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-8">
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
    </div>
  )
}

export default KanbanBoardSkeleton
