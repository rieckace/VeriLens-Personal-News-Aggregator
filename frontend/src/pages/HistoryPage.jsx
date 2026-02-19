import { useEffect, useMemo, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import Loading from '../components/Loading'
import { addBookmark, removeBookmark } from '../services/articleService'
import { getBookmarks, getHistory } from '../services/userService'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((b) => b._id)), [bookmarks])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [h, b] = await Promise.all([getHistory(), getBookmarks()])
        if (!mounted) return
        setHistory(h.readingHistory || [])
        setBookmarks(b.bookmarks || [])
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load history')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  async function toggleBookmark(article) {
    setError('')
    const id = article._id
    try {
      if (bookmarkedIds.has(id)) {
        await removeBookmark(id)
        setBookmarks((prev) => prev.filter((x) => x._id !== id))
      } else {
        await addBookmark(id)
        setBookmarks((prev) => [...prev, article])
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Bookmark action failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-6">
        <h1 className="text-3xl font-semibold text-white">Reading history</h1>
        <p className="mt-1 text-sm text-slate-300">Articles you opened (tracked automatically).</p>
        {error ? (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      {loading ? (
        <Loading label="Loading history…" />
      ) : history.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {history.map((a) => (
            <ArticleCard
              key={a._id}
              article={a}
              isBookmarked={bookmarkedIds.has(a._id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-10 text-center">
          <div className="text-lg font-semibold text-white">No history yet</div>
          <div className="mt-2 text-sm text-slate-400">Open an article from the feed to start tracking.</div>
        </div>
      )}
    </div>
  )
}
