/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { getUnreadCount, subscribeToNotifications } from '../services/notificationService'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { token, isReady } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  async function refreshUnreadCount() {
    if (!token) {
      setUnreadCount(0)
      return
    }
    try {
      const data = await getUnreadCount()
      setUnreadCount(Number(data.unreadCount || 0))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!isReady) return
    if (!token) {
      setUnreadCount(0)
      return
    }

    let unsubscribe = () => {}
    let isMounted = true

    ;(async () => {
      await refreshUnreadCount()
      if (!isMounted) return
      unsubscribe = subscribeToNotifications({
        onNotification: () => {
          setUnreadCount((c) => c + 1)
        },
      })
    })()

    return () => {
      isMounted = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isReady])

  const value = useMemo(
    () => ({ unreadCount, setUnreadCount, refreshUnreadCount }),
    [unreadCount]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
