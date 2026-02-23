import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/Badge'
import Loading from '../components/Loading'
import { addBookmark, getArticleById, markRead, removeBookmark } from '../services/articleService'
import { getBookmarks } from '../services/userService'

export default function ArticlePage() {
  const { id } = useParams()

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [a, b] = await Promise.all([getArticleById(id), getBookmarks()])
        if (!mounted) return
        setArticle(a.article)
        const set = new Set((b.bookmarks || []).map((x) => x._id))
        setIsBookmarked(set.has(id))

        try {
          await markRead(id)
        } catch {
          // ignore
        }
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load article')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id])

  async function toggleBookmark() {
    setError('')
    try {
      if (isBookmarked) {
        await removeBookmark(id)
        setIsBookmarked(false)
      } else {
        await addBookmark(id)
        setIsBookmarked(true)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Bookmark action failed')
    }
  }

  if (loading) return <Loading label="Loading article…" />

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
        <div className="text-lg font-semibold">{error}</div>
        <div className="mt-4">
          <Link to="/feed" className="text-sm font-semibold text-slate-900 hover:underline dark:text-white">
            Back to feed
          </Link>
        </div>
      </div>
    )
  }

  if (!article) return null

  const sentiment = article.sentimentLabel || 'neutral'
  const bias = article.biasLabel || 'center'
  const fake = Math.round((article.fakeProbability || 0) * 100)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/feed" className="text-sm font-semibold text-slate-700 hover:underline dark:text-slate-200">
          ← Back to feed
        </Link>
        <button
          onClick={toggleBookmark}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            isBookmarked
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-100 dark:hover:bg-indigo-500/20'
              : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900'
          }`}
        >
          {isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-900 dark:bg-slate-900/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
            {article.category || 'unknown'}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">{article.source || 'Unknown source'}</span>
          {article.publishedAt ? (
            <span className="text-xs text-slate-600 dark:text-slate-400">
              • {new Date(article.publishedAt).toLocaleString()}
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 dark:text-white">{article.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone={sentiment}>Sentiment: {sentiment}</Badge>
          <Badge tone={bias}>Bias: {bias}</Badge>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
            Fake probability: {fake}%
          </span>
        </div>

        {article.imageUrl ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-900">
            <img src={article.imageUrl} alt="" className="h-72 w-full object-cover" />
          </div>
        ) : null}

        {article.description ? (
          <p className="mt-6 text-base leading-relaxed text-slate-700 dark:text-slate-200">{article.description}</p>
        ) : null}

        {article.content ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-700 dark:border-slate-900 dark:bg-slate-950/20 dark:text-slate-200">
            {article.content}
          </div>
        ) : (
          <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">No full content available for this article.</div>
        )}

        {article.url ? (
          <div className="mt-6">
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:opacity-95"
            >
              Read original source
            </a>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}
    </div>
  )
}
