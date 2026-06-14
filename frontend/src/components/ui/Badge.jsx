const variants = {
  TODO: 'bg-slate-100 text-slate-700 ring-slate-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  LOW: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  MEDIUM: 'bg-violet-50 text-violet-700 ring-violet-200',
  HIGH: 'bg-red-50 text-red-700 ring-red-200',
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
