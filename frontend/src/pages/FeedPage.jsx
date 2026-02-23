import { useEffect, useMemo, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import Loading from '../components/Loading'
import { addBookmark, getFeed, refreshArticles, removeBookmark } from '../services/articleService'
import { getBookmarks } from '../services/userService'

const SENTIMENTS = ['', 'positive', 'neutral', 'negative']

export default function FeedPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(12)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sentiment, setSentiment] = useState('')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [bookmarks, setBookmarks] = useState([])
  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((b) => b._id)), [bookmarks])

  async function loadBookmarks() {
    const data = await getBookmarks()
    setBookmarks(data.bookmarks || [])
  }

  async function loadFeed(nextPage = 1) {
    setError('')
    setLoading(true)
    try {
      const data = await getFeed({ page: nextPage, limit, search: search || undefined, category: category || undefined, sentiment: sentiment || undefined })
      setItems(data.articles || [])
      setTotal(data.total || 0)
      setPage(data.page || nextPage)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    async function boot() {
      try {
        await loadBookmarks()
      } catch {
        // ignore
      }
      if (mounted) await loadFeed(1)
    }
    boot()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onRefresh() {
    setRefreshing(true)
    try {
      await refreshArticles()
      await loadFeed(1)
    } catch (err) {
      setError(err?.response?.data?.message || 'Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  async function toggleBookmark(article) {
    const id = article._id
    const isMarked = bookmarkedIds.has(id)

    try {
      if (isMarked) {
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

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-900 dark:bg-slate-900/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Your feed</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Search, filter and bookmark articles. Sentiment and bias are pre-scored.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            data-testid="feed-refresh"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 disabled:opacity-60"
          >
            {refreshing ? 'Refreshing…' : 'Fetch latest news'}
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Search</div>
            <input
              data-testid="feed-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Try: AI, Olympics, vaccine…"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Category</div>
            <input
              data-testid="feed-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="technology, sports…"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Sentiment</div>
            <select
              data-testid="feed-sentiment"
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-indigo-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
            >
              {SENTIMENTS.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s ? s : 'all'}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadFeed(1)}
            data-testid="feed-apply"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Apply filters
          </button>
          <button
            onClick={() => {
              setSearch('')
              setCategory('')
              setSentiment('')
              loadFeed(1)
            }}
            data-testid="feed-reset"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Reset
          </button>
          <div className="ml-auto text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-slate-200">{items.length}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-200">{total}</span>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      {loading ? (
        <Loading label="Loading feed…" />
      ) : (
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
      )}

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row dark:border-slate-900 dark:bg-slate-900/30">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => loadFeed(page - 1)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => loadFeed(page + 1)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
