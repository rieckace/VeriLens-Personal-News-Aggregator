import Badge from './Badge'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return ''
  }
}

export default function CommunitySubmissionCard({ submission }) {
  const who = submission?.submittedBy?.name || submission?.submittedBy?.email || 'User'

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-900 dark:bg-slate-900/30"
      data-testid="community-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold leading-snug text-slate-900 dark:text-white">
            {submission.title}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Badge tone="center">Community • Admin approved</Badge>
            {submission.category ? (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 dark:border-slate-800 dark:bg-slate-950/30">
                {submission.category}
              </span>
            ) : null}
            <span>By {who}</span>
            {submission.approvedAt ? <span>• {formatDate(submission.approvedAt)}</span> : null}
          </div>
        </div>

        {submission.url ? (
          <a
            href={submission.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Open
          </a>
        ) : null}
      </div>

      {submission.description ? (
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
          {submission.description}
        </p>
      ) : null}

      {submission.imageUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-900">
          <img src={submission.imageUrl} alt="" className="h-56 w-full object-cover" loading="lazy" />
        </div>
      ) : null}
    </div>
  )
}
