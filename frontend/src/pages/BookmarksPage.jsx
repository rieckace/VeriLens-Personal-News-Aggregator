import { useEffect, useMemo, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import Loading from '../components/Loading'
import { removeBookmark } from '../services/articleService'
import { getBookmarks } from '../services/userService'

export default function BookmarksPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const bookmarkedIds = useMemo(() => new Set(items.map((b) => b._id)), [items])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getBookmarks()
        if (!mounted) return
        setItems(data.bookmarks || [])
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load bookmarks')
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
    try {
      await removeBookmark(article._id)
      setItems((prev) => prev.filter((x) => x._id !== article._id))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update bookmark')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-900/30">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Bookmarks</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Your saved articles for later reading.</p>
        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      {loading ? (
        <Loading label="Loading bookmarks…" />
      ) : items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((a) => (
            <ArticleCard
              key={a._id}
              article={a}
              isBookmarked={bookmarkedIds.has(a._id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-900 dark:bg-slate-900/30">
          <div className="text-lg font-semibold text-slate-900 dark:text-white">No bookmarks yet</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">Bookmark articles from your feed to see them here.</div>
        </div>
      )}
    </div>
  )
}
