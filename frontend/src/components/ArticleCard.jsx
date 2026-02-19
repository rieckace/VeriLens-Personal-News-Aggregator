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
      className="group rounded-2xl border border-slate-900 bg-slate-900/30 p-5 shadow-sm transition hover:bg-slate-900/40"
      data-testid="article-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/articles/${article._id}`}
            className="block text-lg font-semibold leading-snug text-white hover:underline"
          >
            {article.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-slate-800 bg-slate-950/30 px-2 py-1">
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
              ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-100 hover:bg-indigo-500/20'
              : 'border-slate-800 bg-slate-950/30 text-slate-200 hover:bg-slate-900'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      {article.description ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-200/90">{article.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={sentiment}>Sentiment: {sentiment}</Badge>
        <Badge tone={bias}>Bias: {bias}</Badge>
        <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-950/30 px-2.5 py-1 text-xs font-semibold text-slate-200">
          Fake probability: {fake}%
        </span>
      </div>

      {article.imageUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-900">
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
