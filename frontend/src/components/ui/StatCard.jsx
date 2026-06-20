function StatCard({ title, value, icon: Icon, color = 'brand', sub }) {
  const colors = {
    brand: 'from-brand-500 to-brand-700',
    amber: 'from-amber-400 to-orange-500',
    emerald: 'from-emerald-400 to-green-600',
    red: 'from-red-400 to-rose-600',
  }

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-theme-muted mb-1">{title}</p>
          <p className="text-3xl font-bold text-theme tracking-tight">{value}</p>
          {sub && <p className="text-xs text-theme-muted mt-1.5">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg shrink-0`}>
          <Icon className="text-white" size={22} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
