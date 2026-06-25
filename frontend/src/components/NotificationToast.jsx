import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { subscribeNotifications } from '../services/socket'
import { NOTIFICATION_TYPE_LABELS } from '../utils/constants'

function NotificationToast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let timer
    const unsub = subscribeNotifications({
      onNew: (notification) => {
        if (!notification?.message) return
        setToast(notification)
        clearTimeout(timer)
        timer = setTimeout(() => setToast(null), 5000)
      },
    })
    return () => {
      clearTimeout(timer)
      unsub()
    }
  }, [])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 48, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 48 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-[100] max-w-sm"
        >
          <div className="flex items-start gap-3 bg-theme-surface border border-theme rounded-xl shadow-elevated px-4 py-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Bell size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide">
                {NOTIFICATION_TYPE_LABELS[toast.type] || 'New notification'}
              </p>
              <p className="text-sm text-theme mt-0.5 leading-snug">{toast.message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationToast
