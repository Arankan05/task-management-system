function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon size={32} className="text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-theme mb-2">{title}</h3>
      {description && <p className="text-theme-muted text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}

export default EmptyState
