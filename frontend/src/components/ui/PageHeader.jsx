import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

function PageHeader({
  breadcrumb,
  icon,
  iconColor = '#7C3AED',
  title,
  subtitle,
  actions,
  banner,
}) {
  return (
    <div className="mb-8">
      {breadcrumb?.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-theme-muted mb-4 flex-wrap">
          {breadcrumb.map((item, i) => (
            <span key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="opacity-50" />}
              {item.to ? (
                <Link to={item.to} className="hover:text-primary transition-colors">{item.label}</Link>
              ) : (
                <span className="text-theme font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {banner}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {icon && (
            <div
              className="w-14 h-14 rounded-2xl text-white font-bold flex items-center justify-center text-xl shrink-0"
              style={{ background: iconColor }}
            >
              {typeof icon === 'string' ? icon : icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-theme tracking-tight">{title}</h1>
            {subtitle && <p className="text-theme-muted mt-1.5 text-sm sm:text-base">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

export default PageHeader
