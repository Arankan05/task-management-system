import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { getNotifications, markNotificationRead } from '../services/notificationService'
import { acceptJoinRequest, rejectJoinRequest } from '../services/joinRequestService'
import { getSocket } from '../services/socket'
import { WORKSPACE_ROLE_LABELS } from '../utils/constants'

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
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const panelRef = useRef(null)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getNotifications()
      setNotifications(list)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return undefined

    const onNew = (notification) => {
      setNotifications((prev) => [notification, ...prev])
    }

    socket.on('notification:new', onNew)
    return () => socket.off('notification:new', onNew)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleAccept = async (notification) => {
    const payload = parsePayload(notification)
    if (!payload?.requestId) return
    setActionId(notification.id)
    try {
      await acceptJoinRequest(payload.requestId)
      await markNotificationRead(notification.id)
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
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
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
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
        onClick={() => {
          setOpen((v) => !v)
          if (!open) loadNotifications()
        }}
        className="relative p-2 rounded-lg text-theme-muted hover:text-theme hover:bg-theme-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-theme-surface border border-theme rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-theme">
            <h3 className="font-semibold text-theme text-sm">Notifications</h3>
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
