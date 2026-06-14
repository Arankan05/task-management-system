const styles = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-brand-50 text-brand-700 border-brand-200',
}

function Alert({ message, type = 'error', onClose }) {
  if (!message) return null

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 opacity-60 hover:opacity-100 text-xs font-medium">
          Dismiss
        </button>
      )}
    </div>
  )
}

export default Alert
