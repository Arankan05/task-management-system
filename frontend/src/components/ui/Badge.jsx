const variants = {
  TODO: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  DONE: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  LOW: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  HIGH: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
}

function Badge({ label, variant = 'TODO', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${variants[variant] || variants.TODO} ${className}`}
    >
      {label}
    </span>
  )
}

export default Badge
