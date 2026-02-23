import { api } from './api'
import { getToken } from './storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export async function listNotifications(params) {
  const { data } = await api.get('/notifications', { params })
  return data
}

export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count')
  return data
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await api.post('/notifications/read-all')
  return data
}

// Streaming subscription using fetch so we can attach Authorization header.
// Returns an unsubscribe function.
export function subscribeToNotifications({
  onNotification,
  onError,
  signal,
} = {}) {
  const token = getToken()
  if (!token) return () => {}

  const abortController = new AbortController()
  const combinedSignal = signal
  if (combinedSignal) {
    combinedSignal.addEventListener('abort', () => abortController.abort(), { once: true })
  }

  let cancelled = false

  async function run() {
    try {
      const resp = await fetch(`${baseURL}/notifications/stream`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        signal: abortController.signal,
      })

      if (!resp.ok) throw new Error(`Stream failed (${resp.status})`)
      if (!resp.body) throw new Error('Stream not supported by browser')

      const reader = resp.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let buffer = ''
      let currentEvent = null
      let dataLines = []

      const dispatch = () => {
        if (!dataLines.length) {
          currentEvent = null
          return
        }
        const raw = dataLines.join('\n')
        dataLines = []
        const evt = currentEvent || 'message'
        currentEvent = null

        if (evt === 'notification') {
          try {
            const parsed = JSON.parse(raw)
            onNotification?.(parsed)
          } catch {
            // ignore malformed
          }
        }
      }

      while (!cancelled) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let idx
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).replace(/\r$/, '')
          buffer = buffer.slice(idx + 1)

          if (!line) {
            dispatch()
            continue
          }

          if (line.startsWith('event:')) {
            currentEvent = line.slice('event:'.length).trim()
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice('data:'.length).trimStart())
          }
        }
      }
    } catch (err) {
      if (!cancelled && err?.name !== 'AbortError') {
        onError?.(err)
      }
    }
  }

  run()

  return () => {
    cancelled = true
    abortController.abort()
  }
}
