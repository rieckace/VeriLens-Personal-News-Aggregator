import { Link } from 'react-router-dom'
import Badge from './Badge'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return ''
  }
}

export default function ArticleCard({ article, isBookmarked, onToggleBookmark }) {
  const sentiment = article.sentimentLabel || 'neutral'
  const bias = article.biasLabel || 'center'
  const fake = Math.round((article.fakeProbability || 0) * 100)

  return (
    <div
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-slate-50 dark:border-slate-900 dark:bg-slate-900/30 dark:hover:bg-slate-900/40"
      data-testid="article-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/articles/${article._id}`}
            className="block text-lg font-semibold leading-snug text-slate-900 hover:underline dark:text-white"
          >
            {article.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 dark:border-slate-800 dark:bg-slate-950/30">
              {article.category || 'unknown'}
            </span>
            <span>{article.source || 'Unknown source'}</span>
            {article.publishedAt ? <span>• {formatDate(article.publishedAt)}</span> : null}
          </div>
        </div>

        <button
          onClick={() => onToggleBookmark?.(article)}
          data-testid={`bookmark-${article._id}`}
          className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            isBookmarked
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-100 dark:hover:bg-indigo-500/20'
              : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      {article.description ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">{article.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={sentiment}>Sentiment: {sentiment}</Badge>
        <Badge tone={bias}>Bias: {bias}</Badge>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
          Fake probability: {fake}%
        </span>
      </div>

      {article.imageUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-900">
          <img
            src={article.imageUrl}
            alt=""
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  )
}
