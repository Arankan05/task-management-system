function StatCard({ title, value, icon: Icon, color = 'brand', sub }) {
  const colors = {
    brand: 'from-cyan-400 to-cyan-600 shadow-cyan-500/10',
    amber: 'from-amber-400 to-orange-500 shadow-amber-500/10',
    emerald: 'from-emerald-400 to-teal-500 shadow-emerald-500/10',
    red: 'from-rose-400 to-red-600 shadow-red-500/10',
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
