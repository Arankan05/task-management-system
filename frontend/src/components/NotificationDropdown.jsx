import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import {
  getNotifications,
  markNotificationRead,
  acknowledgeNotificationsOpen,
  clearAllNotifications,
} from '../services/notificationService'
import { acceptJoinRequest, rejectJoinRequest } from '../services/joinRequestService'
import { subscribeNotifications } from '../services/socket'
import { WORKSPACE_ROLE_LABELS, NOTIFICATION_TYPE_LABELS } from '../utils/constants'

function dedupeNotifications(list) {
  const seen = new Set()
  return list.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function parsePayload(notification) {
  if (!notification?.payload) return null
  try {
    return JSON.parse(notification.payload)
  } catch {
    return null
  }
}

function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [badgeCount, setBadgeCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [actionId, setActionId] = useState(null)
  const panelRef = useRef(null)
  const openRef = useRef(false)

  useEffect(() => {
    openRef.current = open
  }, [open])

  const loadNotifications = useCallback(async ({ preserveOnError = false } = {}) => {
    setLoading(true)
    try {
      const result = await getNotifications()
      setNotifications(dedupeNotifications(result?.notifications ?? []))
      setBadgeCount(result?.badgeCount ?? 0)
    } catch {
      if (!preserveOnError) {
        setNotifications([])
        setBadgeCount(0)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    return subscribeNotifications({
      onNew: (notification) => {
        setNotifications((prev) => dedupeNotifications([notification, ...prev]))
        if (!openRef.current) {
          setBadgeCount((count) => count + 1)
        }
      },
      onReconnect: () => {
        loadNotifications()
      },
    })
  }, [loadNotifications])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleOpen = async () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      setBadgeCount(0)
      try {
        await acknowledgeNotificationsOpen()
      } catch {
        // Badge cleared locally; notifications stay in the list
      }
      loadNotifications({ preserveOnError: true })
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    try {
      await clearAllNotifications()
      setNotifications([])
      setBadgeCount(0)
    } catch {
      loadNotifications()
    } finally {
      setClearing(false)
    }
  }

  const handleAccept = async (notification) => {
    const payload = parsePayload(notification)
    if (!payload?.requestId) return
    setActionId(notification.id)
    try {
      await acceptJoinRequest(payload.requestId)
      await markNotificationRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )
      setOpen(false)
      window.location.href = `/workspaces/${payload.workspaceId}`
    } catch {
      loadNotifications()
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (notification) => {
    const payload = parsePayload(notification)
    if (!payload?.requestId) return
    setActionId(notification.id)
    try {
      await rejectJoinRequest(payload.requestId)
      await markNotificationRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )
    } catch {
      loadNotifications()
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-theme-muted hover:text-theme hover:bg-theme-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-theme-surface border border-theme rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-theme flex items-center justify-between gap-2">
            <h3 className="font-semibold text-theme text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearing}
                className="text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-theme-muted text-center">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-theme-muted text-center">No notifications</p>
            ) : (
              notifications.map((notification) => {
                const payload = parsePayload(notification)
                const isJoinRequest = notification.type === 'WORKSPACE_JOIN_REQUEST' && payload?.requestId

                return (
                  <div key={notification.id} className="px-4 py-3 border-b border-theme last:border-0">
                    {NOTIFICATION_TYPE_LABELS[notification.type] && (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary mb-1">
                        {NOTIFICATION_TYPE_LABELS[notification.type]}
                      </p>
                    )}
                    <p className="text-sm text-theme leading-snug">{notification.message}</p>
                    {payload?.role && (
                      <p className="text-xs text-theme-muted mt-1">
                        Role: {WORKSPACE_ROLE_LABELS[payload.role] || payload.role}
                      </p>
                    )}
                    {isJoinRequest && !notification.isRead && (
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          disabled={actionId === notification.id}
                          onClick={() => handleAccept(notification)}
                          className="btn-primary flex-1 !py-1.5 !text-xs"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          type="button"
                          disabled={actionId === notification.id}
                          onClick={() => handleReject(notification)}
                          className="btn-secondary flex-1 !py-1.5 !text-xs"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
