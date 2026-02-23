import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import { useNotifications } from '../context/NotificationsContext'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { refreshUnreadCount, setUnreadCount } = useNotifications()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await listNotifications({ page: 1, limit: 50 })
      setItems(data.notifications || [])
      setUnreadCount(Number(data.unreadCount || 0))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onOpen(n) {
    try {
      if (!n.isRead) {
        await markNotificationRead(n._id)
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)))
        await refreshUnreadCount()
      }
    } catch {
      // ignore
    }

    const articleId = n?.data?.articleId
    if (articleId) navigate(`/articles/${articleId}`)
  }

  async function onMarkAll() {
    setError('')
    try {
      await markAllNotificationsRead()
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark all as read')
    }
  }

  if (loading) return <Loading label="Loading notifications…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notifications</h1>
          <div className="mt-1 text-sm text-slate-400">Updates based on your preferences.</div>
        </div>

        <button
          onClick={onMarkAll}
          className="rounded-xl border border-slate-300 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          Mark all read
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-700 dark:border-slate-900 dark:bg-slate-900/30 dark:text-slate-300">
          No notifications yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-900/20">
          <ul className="divide-y divide-slate-200 dark:divide-slate-900">
            {items.map((n) => (
              <li key={n._id}>
                <button
                  onClick={() => onOpen(n)}
                  className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                    n.isRead ? 'opacity-80' : 'bg-slate-100/50 dark:bg-slate-950/20'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.isRead ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                      ) : (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-slate-700" />
                      )}
                      <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {n.title || 'Notification'}
                      </div>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">{n.message}</div>
                    {n.createdAt ? (
                      <div className="mt-2 text-xs text-slate-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-xs text-slate-400">Open</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
