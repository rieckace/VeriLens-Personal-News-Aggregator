const map = {
  positive:
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30',
  negative:
    'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/30',
  neutral:
    'bg-slate-500/10 text-slate-700 border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-200 dark:border-slate-500/30',
  left:
    'bg-purple-500/10 text-purple-700 border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-200 dark:border-purple-500/30',
  right:
    'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30',
  center:
    'bg-slate-500/10 text-slate-700 border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-200 dark:border-slate-500/30',
}

export default function Badge({ tone = 'neutral', children }) {
  const cls = map[tone] || map.neutral
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  )
}
